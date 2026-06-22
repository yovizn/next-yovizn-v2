'use client'

/**
 * cover-displace.tsx — <CoverDisplace> wrapper component.
 *
 * Wraps <WebGLIsland> + the displacement-canvas effect around a cover image.
 * The `children` prop (the caller's fully-configured <Image fill .../>) is
 * ALWAYS rendered — it is the SSR HTML, a11y anchor, and static fallback for:
 *   • no-WebGL / SSR
 *   • reduced-motion / coarse-pointer (island's capability gate)
 *   • image texture load failure
 *
 * Hover / mouse plumbing:
 *   • Pointer handlers live on the outer wrapper div (pointer-events-auto).
 *   • The island's inner span is pointer-events-none (per WebGLIsland contract).
 *   • hover: useMotionValue(0) → pointerenter sets 1, pointerleave sets 0.
 *   • mouseX/mouseY: useMotionValue(0.5) → pointermove normalizes to [0,1].
 *   • All three are stable MotionValue refs — the canvas effect samples them
 *     via .get() inside frame.render (no React re-renders, no useSpring).
 *   • The canvas lerps currentHover internally (HOVER_LERP = 0.07) for smooth
 *     ease-in/out — this is the "easing" referred to in the build spec.
 *
 * Prop API (for re-lay tasks):
 *   src       — texture URL (Sanity CDN: urlFor(...).width(1200).auto('format').url())
 *   children  — fully-configured <Image fill alt={...} sizes={...} .../> (required)
 *   className — applied to the outer wrapper div
 *
 * Usage:
 *   <CoverDisplace
 *     src={urlFor(project.cover).width(1200).auto('format').url()}
 *     className="relative aspect-video overflow-clip"
 *   >
 *     <Image
 *       fill
 *       src={urlFor(project.cover).width(1200).auto('format').url()}
 *       alt={project.cover.alt}
 *       sizes="(max-width: 640px) 640px, 100vw"
 *       className="size-full object-cover"
 *     />
 *   </CoverDisplace>
 *
 * The src appears twice (once for the texture, once for the Image). This is
 * intentional and explicit — the caller controls both URLs independently.
 *
 * FUTURE CONCERN (flagged for re-lay):
 * The /projects monitor panel drives a changing src per hovered row. If the
 * canvas useEffect keys on src, changing src tears down + rebuilds the full
 * renderer. For the monitor-panel pattern, a texture-swap variant (keeping
 * the renderer alive, only re-uploading texture on src change) would be more
 * efficient. That's a re-lay task concern — out of scope here.
 */

import { useMotionValue } from 'motion/react'
import type { PointerEvent } from 'react'

import { WebGLIsland } from '@/components/webgl/webgl-island'
import type { DisplacementCanvasProps } from '@/components/webgl/displacement-canvas'
import { cn } from '@/lib/utils/cn'

// Stable module-scope load fn — required by WebGLIsland contract.
// Defined at module scope so identity is stable across renders.
// This is the ONLY reference pulling OGL into the module graph for this effect.
const loadDisplacementCanvas = () =>
  import('@/components/webgl/displacement-canvas') as Promise<{
    default: React.ComponentType<DisplacementCanvasProps>
  }>

export interface CoverDisplaceProps {
  /**
   * Cover image URL for the WebGL texture.
   * Use the Sanity CDN URL: `urlFor(project.cover).width(1200).auto('format').url()`
   * Do NOT pass a full-res URL — use the same bounded URL as the next/image src.
   */
  src: string
  /**
   * The cover image element — ALWAYS rendered as SSR HTML + a11y + static fallback.
   * Typically: <Image fill alt={...} sizes={...} className="size-full object-cover" />
   */
  children: React.ReactNode
  /** Applied to the outer wrapper div. Include aspect ratio + overflow-clip here. */
  className?: string
}

export function CoverDisplace({ src, children, className }: CoverDisplaceProps) {
  // ── MotionValues for live hover + mouse (stable refs, no re-renders) ──
  const hover  = useMotionValue(0)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  // ── Pointer handlers (on the outer div — pointer-events-auto) ─────────
  const onPointerEnter = () => hover.set(1)
  const onPointerLeave = () => {
    hover.set(0)
    // Reset mouse to center so next hover doesn't start from a stale position
    mouseX.set(0.5)
    mouseY.set(0.5)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top)  / rect.height)
  }

  // effectProps: STATIC config (src) + stable MotionValue refs for live values.
  const effectProps: DisplacementCanvasProps = { src, hover, mouseX, mouseY }

  return (
    <div
      className={cn('relative', className)}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
    >
      {/*
       * WebGLIsland: absolute inset-0 so the canvas fills the outer div.
       * The island's children (next/image) are the static fallback — always
       * visible to SSR/bots/no-WebGL/reduced-motion clients.
       * The canvas overlays children only when the island is active.
       */}
      <WebGLIsland<DisplacementCanvasProps>
        load={loadDisplacementCanvas}
        effectProps={effectProps}
        rootMargin="200px"
        className="absolute inset-0"
      >
        {children}
      </WebGLIsland>
    </div>
  )
}
