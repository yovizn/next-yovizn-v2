'use client'

/**
 * hero-shear-canvas.tsx — OGL hero wordmark shear effect.
 *
 * EFFECT TECHNIQUE
 * ────────────────────────────────────────────────────────
 * 1. Rasterize the wordmark text to an offscreen Canvas2D texture at device-
 *    pixel scale (capped at 2×). The graphite background is painted opaque so
 *    the canvas fully covers the DOM <h1> beneath.
 * 2. Upload the rasterized bitmap as an OGL Texture on a fullscreen Triangle
 *    (covers clip-space with a single draw call — no overdraw).
 * 3. Fragment shader:
 *    - Reads `uVelocity` (normalized scroll velocity, clamped ±1).
 *    - Applies a horizontal shear: shifts UVs by `u * uVelocity * uShear`.
 *    - Splits RGB channels by `±uVelocity * uChroma` (chromatic aberration).
 *    - Edges toward --phosphor (#C7F7E9) tinted on the chromatic fringe.
 *    - At idle (velocity → 0) the texture resolves to the crisp wordmark.
 * 4. Velocity lerp: `uVelocity` is smoothly interpolated toward the live
 *    MotionValue in each frame callback — no `useSpring`, just manual lerp.
 *
 * ISLAND CONTRACTS
 * ────────────────────────────────────────────────────────
 * ✓ frame.render (from 'motion') — NO requestAnimationFrame.
 * ✓ MotionValues sampled via .get() inside the frame callback.
 * ✓ DPR capped at Math.min(devicePixelRatio, 2).
 * ✓ webglcontextlost → preventDefault + stop rendering.
 * ✓ Dispose on unmount: cancelFrame + program/geometry/texture removal.
 *   NEVER loseContext() — React Strict Mode reuses the canvas (see cleanup note).
 * ✓ Canvas fills parent aria-hidden span (absolute inset-0, 100% w/h).
 * ✓ ResizeObserver re-rasterizes and re-uploads texture on size changes.
 */

import { useEffect, useRef } from 'react'
import { cancelFrame, frame } from 'motion'
import type { MotionValue } from 'motion/react'
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl'

// ── CSS color tokens (static, not reactive) ───────────────────────────
const GRAPHITE = '#17151A'
const PAPER = '#F2EDE4'
const PHOSPHOR_R = 199 / 255
const PHOSPHOR_G = 247 / 255
const PHOSPHOR_B = 233 / 255

// ── Shader sources ─────────────────────────────────────────────────────
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
  uniform float     uVelocity;   // normalized, clamped ±1; lerped, not raw
  uniform float     uShear;      // max shear amount in UV units
  uniform float     uChroma;     // max chroma-split in UV units
  uniform float     uPhosphorR;
  uniform float     uPhosphorG;
  uniform float     uPhosphorB;
  varying vec2 vUv;

  void main() {
    float vel = uVelocity;

    // Horizontal shear: shift by v-coordinate * velocity
    float shiftX = (vUv.y - 0.5) * vel * uShear;

    // Chromatic split: R left, B right, G neutral
    vec2 uvR = vec2(vUv.x + shiftX - abs(vel) * uChroma, vUv.y);
    vec2 uvG = vec2(vUv.x + shiftX, vUv.y);
    vec2 uvB = vec2(vUv.x + shiftX + abs(vel) * uChroma, vUv.y);

    float r = texture2D(uTexture, clamp(uvR, 0.0, 1.0)).r;
    float g = texture2D(uTexture, clamp(uvG, 0.0, 1.0)).g;
    float b = texture2D(uTexture, clamp(uvB, 0.0, 1.0)).b;

    // Phosphor tint on the fringe edge proportional to velocity magnitude
    float fringe = abs(vel) * smoothstep(0.0, 0.05, abs(vUv.x - 0.5 + shiftX));
    r = mix(r, uPhosphorR * r, fringe);
    g = mix(g, uPhosphorG * g, fringe);
    b = mix(b, uPhosphorB * b, fringe);

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`

// ── Props ───────────────────────────────────────────────────────────────
export interface HeroShearCanvasProps {
  /** Live scroll velocity MotionValue (px/s). Sampled in frame.render. */
  scrollVelocity: MotionValue<number>
  /** Ref to the <h1> wordmark element for font + text extraction. */
  wordmarkRef: React.RefObject<HTMLElement | null>
}

// ── Subtle shear constants (developer portfolio — not demo reel) ────────
const MAX_SHEAR = 0.04   // fraction of UV range; keep subtle
const MAX_CHROMA = 0.006 // fraction of UV range; keep subtle
const VEL_SCALE = 0.0003 // px/s → normalized (clamp ±1 after)
const LERP_FACTOR = 0.08 // velocity smoothing per frame

// ── Off-screen canvas rasterizer ────────────────────────────────────────
function rasterizeWordmark(
  wordmarkEl: HTMLElement,
  width: number,
  height: number,
  dpr: number,
): HTMLCanvasElement {
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const ctx = offscreen.getContext('2d')!

  // Opaque graphite background — covers DOM <h1> beneath the canvas
  ctx.fillStyle = GRAPHITE
  ctx.fillRect(0, 0, width, height)

  // Derive font from the live element (gets the hashed next/font family)
  const computed = getComputedStyle(wordmarkEl)
  const fontFamily = computed.fontFamily
  const fontWeight = computed.fontWeight
  const cssSize = wordmarkEl.getBoundingClientRect()

  // Scale to DPR
  ctx.scale(dpr, dpr)

  // Font size: fill the logical height with some padding
  const logicalH = cssSize.height || height / dpr
  const fontSize = Math.round(logicalH * 0.72)
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.fillStyle = PAPER
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'

  const text = wordmarkEl.textContent?.trim() ?? 'YOVI ZULKARNAEN'
  const logicalW = cssSize.width || width / dpr
  ctx.fillText(text, logicalW / 2, logicalH / 2)

  return offscreen
}

// ── Default export — the OGL effect component ───────────────────────────
export default function HeroShearCanvas({ scrollVelocity, wordmarkRef }: HeroShearCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ── DPR cap ─────────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio, 2)

    // ── OGL Renderer ─────────────────────────────────────────────────
    const renderer = new Renderer({
      canvas,
      dpr, // backing store at device DPR — without this OGL defaults to 1× and the
      // 2× rasterized wordmark texture is downsampled into a 1× framebuffer (blurry
      // on retina). setSize(w,h) stays in CSS px; OGL applies the dpr multiply.
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    })
    const gl = renderer.gl

    // ── Context-loss handler ─────────────────────────────────────────
    let contextLost = false
    const onContextLost = (e: Event) => {
      e.preventDefault()
      contextLost = true
    }
    const onContextRestored = () => {
      contextLost = false
      // Re-upload texture after restore
      uploadTexture()
    }
    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestored)

    // ── Geometry: fullscreen Triangle ────────────────────────────────
    const geometry = new Triangle(gl)

    // ── Texture ─────────────────────────────────────────────────────
    const texture = new Texture(gl, {
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
      generateMipmaps: false,
    })

    // ── Program (shaders) ────────────────────────────────────────────
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTexture:   { value: texture },
        uVelocity:  { value: 0 },
        uShear:     { value: MAX_SHEAR },
        uChroma:    { value: MAX_CHROMA },
        uPhosphorR: { value: PHOSPHOR_R },
        uPhosphorG: { value: PHOSPHOR_G },
        uPhosphorB: { value: PHOSPHOR_B },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    // ── Size + rasterize ─────────────────────────────────────────────
    let currentWidth = 0
    let currentHeight = 0

    function uploadTexture() {
      if (!wordmarkRef.current) return
      const rect = wordmarkRef.current.getBoundingClientRect()
      const w = Math.round(rect.width * dpr)
      const h = Math.round(rect.height * dpr)
      if (w === 0 || h === 0) return

      const offscreen = rasterizeWordmark(wordmarkRef.current, w, h, dpr)
      texture.image = offscreen
      texture.needsUpdate = true
    }

    function resize() {
      const el = canvasRef.current
      if (!el || !el.parentElement) return
      const rect = el.parentElement.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      if (w === currentWidth && h === currentHeight) return
      currentWidth = w
      currentHeight = h
      renderer.setSize(w, h)
      // Re-rasterize at new size
      uploadTexture()
    }

    // Initial size
    resize()

    // ── ResizeObserver ───────────────────────────────────────────────
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    // ── Wait for fonts then re-rasterize ─────────────────────────────
    document.fonts.ready.then(() => {
      uploadTexture()
    })

    // ── Frame loop ───────────────────────────────────────────────────
    let currentVelocity = 0

    const draw = () => {
      if (contextLost) return

      // Sample live MotionValue inside frame callback — never close over
      const rawVel = scrollVelocity.get()
      // Normalize: px/s → ±1 range, then lerp for smooth decay
      const targetVel = Math.max(-1, Math.min(1, rawVel * VEL_SCALE))
      currentVelocity += (targetVel - currentVelocity) * LERP_FACTOR

      program.uniforms.uVelocity.value = currentVelocity

      renderer.render({ scene: mesh })
    }

    frame.render(draw, true)

    // ── Cleanup ──────────────────────────────────────────────────────
    return () => {
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
  }, [scrollVelocity, wordmarkRef])

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
