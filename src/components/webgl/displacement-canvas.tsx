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
 *   loseContext(). (Texture has no .remove() in OGL — intentionally omitted.)
 * ✓ disposed flag guards img.onload (async, can fire after unmount).
 * ✓ Canvas fills parent aria-hidden span (absolute inset-0, 100% w/h).
 * ✓ ResizeObserver re-syncs plane aspect on size changes.
 * ✓ Cover-fit UV: uImageAspect + uPlaneAspect uniforms correct distortion.
 * ✓ CORS: img.crossOrigin = 'anonymous' set BEFORE img.src.
 */

import { useEffect, useRef } from 'react'
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
  // Returns remapped UV (may go outside 0..1 — caller clamps).
  vec2 coverFit(vec2 uv, float imageAspect, float planeAspect) {
    vec2 scale = vec2(1.0);
    if (planeAspect > imageAspect) {
      // Plane wider than image: fit width, crop height
      scale.y = imageAspect / planeAspect;
    } else {
      // Plane taller than image: fit height, crop width
      scale.x = planeAspect / imageAspect;
    }
    return (uv - 0.5) / scale + 0.5;
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
const RIPPLE_STR   = 0.025 // max UV ripple displacement
const MAX_CHROMA   = 0.008 // max RGB-split in UV units
const SCALE_AMOUNT = 0.04  // max zoom-in at full hover (4%)

// ── Default export — the OGL effect component ──────────────────────────────
export default function DisplacementCanvas({
  src,
  hover,
  mouseX,
  mouseY,
}: DisplacementCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let disposed = false

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
      img.crossOrigin = 'anonymous' // MUST be set before src
      img.onload = () => {
        if (disposed) return
        // Store natural aspect for cover-fit uniform
        program.uniforms.uImageAspect.value = img.naturalWidth / img.naturalHeight
        texture.image = img
        texture.needsUpdate = true
      }
      img.onerror = () => {
        // Silent failure: canvas stays black, next/image fallback is still visible
        // behind the canvas (children always rendered), so UX is unharmed.
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
    }

    resize()

    // ── ResizeObserver ────────────────────────────────────────────────
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    // ── Frame loop ────────────────────────────────────────────────────
    let currentHover = 0
    let elapsed = 0
    let lastTimestamp = performance.now()

    const draw = () => {
      if (contextLost || disposed) return

      // Delta time for wave animation
      const now = performance.now()
      elapsed += (now - lastTimestamp) / 1000
      lastTimestamp = now

      // Sample live MotionValues inside frame callback — never close over
      const targetHover = hover.get()
      const mx = mouseX.get()
      const my = mouseY.get()

      // Lerp hover toward target (smooth ease in/out — no useSpring)
      currentHover += (targetHover - currentHover) * HOVER_LERP

      // Update uniforms
      program.uniforms.uHover.value = currentHover
      program.uniforms.uMouse.value = [mx, 1.0 - my] // flip Y: WebGL v=0 at bottom
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

      // Free GPU resources (canonical disposal from Build-4 fix)
      program.remove()
      geometry.remove()
      const ext = gl.getExtension('WEBGL_lose_context')
      ext?.loseContext()
      // Note: Texture has no .remove() in OGL — intentionally omitted.
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
      }}
    />
  )
}
