'use client'

/**
 * displacement-canvas.tsx — OGL cover hover-displacement effect.
 *
 * EFFECT TECHNIQUE
 * ────────────────────────────────────────────────────────
 * 1. Load the cover image URL as an OGL Texture (crossOrigin='anonymous'
 *    set BEFORE src, required for Sanity CDN / any cross-origin image).
 * 2. Render on a fullscreen Triangle (single draw call, no overdraw).
 * 3. Fragment shader:
 *    - UV cover-fit: scales UVs so the texture fills the plane like
 *      CSS object-cover (aspect-ratio-correct, no stretch at idle).
 *    - uHover (0→1, lerped): drives displacement strength.
 *    - uMouse (normalized 0–1 pointer within the element): localizes
 *      the ripple epicenter.
 *    - Radial ripple offset: UV shift based on distance from mouse with
 *      a wave pattern modulated by uHover.
 *    - RGB-channel split (chromatic aberration): small lateral offset
 *      proportional to uHover, toward --phosphor (#C7F7E9) at the edges.
 *    - Scale: slight UV zoom proportional to uHover.
 *    - At idle (uHover → 0): crisp, undistorted cover — perfectly matches
 *      the next/image fallback.
 * 4. Hover lerp: `currentHover` is interpolated toward the live MotionValue
 *    in each frame callback — no useSpring, just manual lerp.
 *
 * ISLAND CONTRACTS
 * ────────────────────────────────────────────────────────
 * ✓ frame.render (from 'motion') — NO requestAnimationFrame.
 * ✓ MotionValues (hover, mouseX, mouseY) sampled via .get() inside frame callback.
 * ✓ DPR capped at Math.min(devicePixelRatio, 2).
 * ✓ webglcontextlost → preventDefault; webglcontextrestored → re-upload.
 * ✓ Dispose on unmount: cancelFrame + program.remove() + geometry.remove() +
 *   gl.deleteTexture(). NEVER loseContext() — it kills the canvas's only context,
 *   which a React-Strict-Mode remount then reuses dead; GC reclaims it on unmount.
 * ✓ disposed flag guards img.onload (async, can fire after unmount).
 * ✓ Canvas fills parent aria-hidden span (absolute inset-0, 100% w/h).
 * ✓ ResizeObserver re-syncs plane aspect on size changes.
 * ✓ Cover-fit UV: uImageAspect + uPlaneAspect uniforms correct distortion.
 * ✓ CORS: img.crossOrigin = 'anonymous' set BEFORE img.src.
 */

import { useEffect, useRef, useState } from 'react'
import { cancelFrame, frame } from 'motion'
import type { MotionValue } from 'motion/react'
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl'

// ── CSS color tokens (static) ─────────────────────────────────────────────
const PHOSPHOR_R = 199 / 255
const PHOSPHOR_G = 247 / 255
const PHOSPHOR_B = 233 / 255

// ── Shader sources ─────────────────────────────────────────────────────────
const VERT = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float     uHover;        // 0..1, lerped; 0 = idle, 1 = fully hovered
  uniform vec2      uMouse;        // normalized pointer in element (0..1 each axis)
  uniform float     uImageAspect;  // naturalWidth / naturalHeight of cover
  uniform float     uPlaneAspect;  // plane width / height (CSS pixels)

  uniform float     uRippleStrength;
  uniform float     uChroma;
  uniform float     uScale;
  uniform float     uPhosphorR;
  uniform float     uPhosphorG;
  uniform float     uPhosphorB;

  uniform float     uTime;         // monotonic seconds, for wave animation

  varying vec2      vUv;

  // Object-cover UV mapping: scale texture to fill plane without distortion.
  // Multiplying by scale (<= 1 on the cropped axis) keeps vUv [0,1] mapped to a
  // CENTERED SUBSET of the texture — i.e. a cover crop that stays inside [0,1].
  // (Dividing here would invert it to object-CONTAIN: UVs overflow [0,1] and
  // CLAMP_TO_EDGE smears the boundary row across the overflow — visible as
  // static bands on high-frequency edge content. Stay multiplicative.)
  vec2 coverFit(vec2 uv, float imageAspect, float planeAspect) {
    vec2 scale = vec2(1.0);
    if (planeAspect > imageAspect) {
      // Plane wider than image: fit width, crop height
      scale.y = imageAspect / planeAspect;
    } else {
      // Plane taller than image: fit height, crop width
      scale.x = planeAspect / imageAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    // Cover-fit the base UV
    vec2 uv = coverFit(vUv, uImageAspect, uPlaneAspect);

    // UV-space mouse position (also cover-fit to match the texture coords)
    vec2 mouse = coverFit(uMouse, uImageAspect, uPlaneAspect);

    // Distance from mouse — the ripple epicenter
    vec2 delta = uv - mouse;
    float dist = length(delta);

    // Slight UV zoom centered on mouse (scale toward mouse)
    float zoom = 1.0 - uHover * uScale;
    vec2 zoomedUv = mouse + (uv - mouse) * zoom;

    // Radial ripple: sine wave on distance, animated with uTime
    float wave = sin(dist * 20.0 - uTime * 4.0) * 0.5 + 0.5;
    float falloff = 1.0 - smoothstep(0.0, 0.6, dist);
    vec2 ripple = normalize(delta + vec2(0.0001)) * wave * falloff * uHover * uRippleStrength;

    // RGB split: chroma aberration radiating from mouse, proportional to hover
    float chromaAmt = uHover * uChroma;
    vec2 chromaDir = normalize(delta + vec2(0.0001));

    vec2 uvR = clamp(zoomedUv + ripple + chromaDir * chromaAmt, 0.0, 1.0);
    vec2 uvG = clamp(zoomedUv + ripple,                         0.0, 1.0);
    vec2 uvB = clamp(zoomedUv + ripple - chromaDir * chromaAmt, 0.0, 1.0);

    float r = texture2D(uTexture, uvR).r;
    float g = texture2D(uTexture, uvG).g;
    float b = texture2D(uTexture, uvB).b;

    // Phosphor tint on chromatic fringe, proportional to hover + edge distance
    float fringe = uHover * smoothstep(0.0, 0.2, dist) * falloff;
    r = mix(r, uPhosphorR * r + uPhosphorR * 0.12, fringe);
    g = mix(g, uPhosphorG * g + uPhosphorG * 0.08, fringe);
    b = mix(b, uPhosphorB * b + uPhosphorB * 0.15, fringe);

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`

// ── Props ──────────────────────────────────────────────────────────────────
export interface DisplacementCanvasProps {
  /** Cover image URL (Sanity CDN or any cross-origin URL). */
  src: string
  /** Live hover MotionValue: 0 (idle) → 1 (hovered). Sampled in frame.render. */
  hover: MotionValue<number>
  /** Normalized horizontal mouse position within the element (0..1). */
  mouseX: MotionValue<number>
  /** Normalized vertical mouse position within the element (0..1). */
  mouseY: MotionValue<number>
}

// ── Effect constants ───────────────────────────────────────────────────────
const HOVER_LERP   = 0.07  // how fast uHover tracks the target (slow = smoother)
const MOUSE_LERP   = 0.1   // how fast the ripple epicenter trails the pointer (lower = smoother / less stiff)
const RIPPLE_STR   = 0.025 // max UV ripple displacement
const MAX_CHROMA   = 0.008 // max RGB-split in UV units
const SCALE_AMOUNT = 0.04   // max zoom-in at full hover (4%)
const IDLE_EPS     = 0.0005 // below this (hover + per-frame motion) the effect is at rest → skip GPU render

// ── Default export — the OGL effect component ──────────────────────────────
export default function DisplacementCanvas({
  src,
  hover,
  mouseX,
  mouseY,
}: DisplacementCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Canvas stays hidden (fallback <Image> visible) until a real texture uploads.
  // State-driven (not imperative style writes) so a re-render can't clobber it back.
  const [textureReady, setTextureReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let disposed = false

    // Render-on-demand flag. The draw loop skips renderer.render() once the
    // effect settles at rest (idle-skip below) — but a one-shot paint is still
    // required after the texture uploads and after any resize (the GPU upload /
    // plane-aspect change must reach the framebuffer). Set true now for the
    // initial paint; re-armed in img.onload and resize().
    let needsRender = true

    // ── DPR cap ──────────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio, 2)

    // ── OGL Renderer ─────────────────────────────────────────────────
    const renderer = new Renderer({
      canvas,
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    })
    const gl = renderer.gl

    // ── Context-loss handlers ─────────────────────────────────────────
    let contextLost = false
    const onContextLost = (e: Event) => {
      e.preventDefault()
      contextLost = true
    }
    const onContextRestored = () => {
      contextLost = false
      loadTexture()
    }
    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestored)

    // ── Geometry: fullscreen Triangle ─────────────────────────────────
    const geometry = new Triangle(gl)

    // ── Texture ───────────────────────────────────────────────────────
    const texture = new Texture(gl, {
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
      generateMipmaps: false,
    })

    // ── Program (shaders) ─────────────────────────────────────────────
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTexture:        { value: texture },
        uHover:          { value: 0 },
        uMouse:          { value: [0.5, 0.5] },
        uImageAspect:    { value: 1 },
        uPlaneAspect:    { value: 1 },
        uRippleStrength: { value: RIPPLE_STR },
        uChroma:         { value: MAX_CHROMA },
        uScale:          { value: SCALE_AMOUNT },
        uTime:           { value: 0 },
        uPhosphorR:      { value: PHOSPHOR_R },
        uPhosphorG:      { value: PHOSPHOR_G },
        uPhosphorB:      { value: PHOSPHOR_B },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    // ── Texture load (cross-origin) ───────────────────────────────────
    function loadTexture() {
      const img = new window.Image()
      // CORS only for cross-origin sources (Sanity CDN covers). For a same-origin
      // local asset, requesting CORS mode would key a SEPARATE cache entry from the
      // next/image <Image> fallback (which fetches without crossorigin) — forcing a
      // duplicate download of the same file. Same-origin reads never taint the
      // canvas, so plain mode is safe AND lets both share one fetch. Set before src.
      let crossOrigin = true
      try {
        crossOrigin = new URL(src, window.location.href).origin !== window.location.origin
      } catch {
        crossOrigin = true // malformed/relative edge — default to the safe CORS path
      }
      if (crossOrigin) img.crossOrigin = 'anonymous'
      img.onload = () => {
        if (disposed) return
        // Store natural aspect for cover-fit uniform
        program.uniforms.uImageAspect.value = img.naturalWidth / img.naturalHeight
        texture.image = img
        texture.needsUpdate = true
        // Force one render so the freshly-uploaded texture actually reaches the
        // framebuffer — without this the idle-skip would leave the canvas on its
        // cleared (black) buffer, since at mount hover/pointer are both at rest.
        needsRender = true
        // Reveal the canvas ONLY now that a real texture is uploaded. The renderer
        // is alpha:false (opaque) and the empty texture is black, so before this the
        // canvas would paint a solid black rectangle OVER the next/image fallback.
        // It starts hidden (fallback visible) and fades in once a texture is ready.
        setTextureReady(true)
      }
      img.onerror = () => {
        // Load failed (e.g. Sanity CDN / NAT64 flake): keep the canvas HIDDEN so the
        // next/image fallback stays visible instead of a permanent black cell. (This
        // was previously a no-op whose comment wrongly assumed the fallback showed
        // through — it can't, the opaque canvas covers it. Hiding it is the real fix.)
        if (disposed) return
        setTextureReady(false)
      }
      img.src = src
    }

    loadTexture()

    // ── Size / plane aspect ───────────────────────────────────────────
    let currentWidth = 0
    let currentHeight = 0

    function resize() {
      const el = canvasRef.current
      if (!el || !el.parentElement) return
      const rect = el.parentElement.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      if (w === currentWidth && h === currentHeight) return
      currentWidth = w
      currentHeight = h
      renderer.setSize(w * dpr, h * dpr)
      el.style.width = `${w}px`
      el.style.height = `${h}px`
      program.uniforms.uPlaneAspect.value = w / Math.max(h, 1)
      // Plane aspect / framebuffer size changed — repaint even if at rest.
      needsRender = true
    }

    resize()

    // ── ResizeObserver ────────────────────────────────────────────────
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    // ── Frame loop ────────────────────────────────────────────────────
    let currentHover = 0
    // Smoothed pointer (init to center — matches the mouseX/mouseY MotionValue
    // defaults of 0.5). The ripple epicenter trails the cursor via MOUSE_LERP
    // instead of snapping to it 1:1 — that 1:1 tracking is what read as "stiff".
    let currentMouseX = 0.5
    let currentMouseY = 0.5
    let elapsed = 0
    let lastTimestamp = performance.now()

    const draw = () => {
      if (contextLost || disposed) return

      const now = performance.now()
      const dt = (now - lastTimestamp) / 1000
      lastTimestamp = now

      // Sample live MotionValues inside frame callback — never close over
      const targetHover = hover.get()
      const mx = mouseX.get()
      const my = mouseY.get()

      // Lerp hover AND pointer toward target (smooth ease in/out — no useSpring)
      const prevHover = currentHover
      const prevMouseX = currentMouseX
      const prevMouseY = currentMouseY
      currentHover += (targetHover - currentHover) * HOVER_LERP
      currentMouseX += (mx - currentMouseX) * MOUSE_LERP
      currentMouseY += (my - currentMouseY) * MOUSE_LERP

      // ── Idle-skip ───────────────────────────────────────────────────
      // Every distortion term in the shader (ripple, chroma, zoom, fringe) is
      // multiplied by uHover, so at uHover≈0 the output is just the static
      // cover texture — byte-identical every frame, and uTime no longer
      // matters. When hover is at rest AND the lerps have converged (pointer
      // settled, hover not mid-fade), there's nothing new to draw: skip the
      // fullscreen GPU render + buffer swap entirely. The frame callback stays
      // registered (keepAlive) so the cheap .get() sampling keeps watching and
      // rendering resumes the instant hover rises again. needsRender forces the
      // one-shot paints that texture-upload / resize require.
      const active =
        needsRender ||
        currentHover > IDLE_EPS ||
        targetHover > IDLE_EPS ||
        Math.abs(currentHover - prevHover) > IDLE_EPS ||
        Math.abs(currentMouseX - prevMouseX) > IDLE_EPS ||
        Math.abs(currentMouseY - prevMouseY) > IDLE_EPS

      if (!active) return // at rest — the last painted frame is already correct
      needsRender = false

      // Advance wave time only while active — a frozen clock at idle is
      // invisible (uHover gates the wave) and avoids a time jump on resume.
      elapsed += dt

      // Update uniforms
      program.uniforms.uHover.value = currentHover
      program.uniforms.uMouse.value = [currentMouseX, 1.0 - currentMouseY] // flip Y: WebGL v=0 at bottom
      program.uniforms.uTime.value = elapsed

      renderer.render({ scene: mesh })
    }

    frame.render(draw, true)

    // ── Cleanup ───────────────────────────────────────────────────────
    return () => {
      disposed = true
      cancelFrame(draw)
      ro.disconnect()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)

      // Free GPU resources explicitly. Do NOT call WEBGL_lose_context.loseContext():
      // React Strict Mode (dev) re-runs this effect on the SAME canvas, and a canvas
      // only ever hands back ONE context — losing it here gives the next mount a dead
      // context (linkProgram fails → uniformLocations undefined → forEach crash). The
      // context is reclaimed by GC when the canvas element unmounts for real.
      program.remove()
      geometry.remove()
      gl.deleteTexture(texture.texture)
    }
  }, [src, hover, mouseX, mouseY])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        // Hidden until a texture uploads (textureReady) — prevents the opaque canvas
        // flashing black over the next/image fallback during/after texture load.
        opacity: textureReady ? 1 : 0,
        transition: 'opacity 400ms ease-out',
      }}
    />
  )
}
