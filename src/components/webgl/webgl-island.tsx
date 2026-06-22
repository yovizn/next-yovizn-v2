'use client'

/**
 * WebGLIsland — design-agnostic lazy WebGL island wrapper.
 *
 * ARCHITECTURE
 * ─────────────────────────────────────────────────────────
 * • `'use client'` — required for `dynamic(ssr:false)` (Next 16 rule: must be
 *   inside a Client Component).
 * • Capability gate: `(pointer:fine)` + `(hover:hover)` + !reduced-motion.
 *   Uses `useMediaQuery` (width-agnostic, from useMedia.hook.ts) and
 *   `useReducedMotion` (from motion/react, the same hook used in useParallax).
 * • `near` (IntersectionObserver) starts `false` → first client render ===
 *   SSR output (children-only). No hydration mismatch possible.
 * • IO mount/unmount: the effect component is mounted only when near viewport
 *   AND enabled AND not hidden. Unmounting removes the canvas offscreen; its GL
 *   context is reclaimed by GC (NOT via loseContext — see EFFECT CONTRACT below).
 * • Hidden-tab pause: `visibilitychange` flips `hidden` state → unmounts
 *   the effect (stops RAF *and* frees context, simplest correct pause).
 * • `children` is ALWAYS rendered — it is the SSR HTML / static fallback
 *   (e.g. a `next/image`). The canvas only draws on top of it.
 *
 * EFFECT CONTRACT (for hero-shear, cover-displace, and any future effect)
 * ─────────────────────────────────────────────────────────
 * • `load` must be a stable module-scope import fn: `() => import('./my-effect')`.
 *   The dynamic chunk is requested lazily, only when `enabled && near && !hidden`.
 * • `effectProps: P` carries STATIC config + any MotionValues/refs for live values.
 *   Effects must sample live values (scroll, hover) inside their own `frame.render`
 *   callback via `.get()` — never as per-frame React state (Animation Rule 3).
 * • Effects must use Motion's `frame.render` (single-RAF rule) — never a new
 *   `requestAnimationFrame`. They must also:
 *   - Cap DPR: `Math.min(window.devicePixelRatio, 2)`
 *   - Handle context loss: `addEventListener('webglcontextlost', e => e.preventDefault())`
 *   - Dispose on unmount: free GL resources (`program.remove()` + `geometry.remove()`
 *     + `gl.deleteTexture()`) + `cancelFrame(draw)`. Do NOT call
 *     `WEBGL_lose_context.loseContext()` — React Strict Mode re-runs the effect on the
 *     SAME canvas, and losing the context hands the remount a dead context → the OGL
 *     program fails to link → `uniformLocations` is undefined → `forEach` crash.
 *   - Cancel `frame.render(draw)` when this component unmounts (via useEffect cleanup).
 *
 * RAF DECISION
 * ─────────────────────────────────────────────────────────
 * The island itself runs NO rAF. All animation is delegated to `frame.render`
 * (Motion's shared tick, which already drives Lenis via `frame.update`).
 * The island's mount/unmount (via IO + visibility) stops any effect's rAF by
 * unmounting the React component → triggering its useEffect cleanup → `cancelFrame`.
 */

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils/cn'
import { useMediaQuery } from '@/hooks/useMedia.hook'

export type WebGLIslandProps<P extends object = object> = {
  /** Static fallback — always rendered (SSR HTML / no-WebGL / a11y). E.g. a `next/image`. */
  children: React.ReactNode
  /**
   * Stable module-scope import fn for the OGL effect (default export).
   * E.g. `() => import('@/components/webgl/displacement-canvas')`
   * Keep it stable (define at module scope or wrap in `useCallback`) so the
   * dynamic chunk is NOT re-requested on re-render.
   */
  load: () => Promise<{ default: React.ComponentType<P> }>
  /**
   * Props forwarded to the lazy effect.
   * Carry STATIC config + any MotionValues/refs needed for live values.
   * Effects must NOT rely on per-frame React state — they sample live values
   * in their `frame.render` callback via `.get()`.
   */
  effectProps: P
  /**
   * IntersectionObserver rootMargin — how far off-screen to pre-mount the
   * effect. Default '200px'. Set to '0px' for strict on-screen-only.
   */
  rootMargin?: string
  className?: string
}

/**
 * Generic lazy WebGL island.
 *
 * @example
 * // Cover hover displacement (cover-displace effect):
 * <WebGLIsland
 *   load={() => import('@/components/webgl/displacement-canvas')}
 *   effectProps={{ src: urlFor(project.cover).url() }}
 * >
 *   <Image src={...} alt={...} ... />
 * </WebGLIsland>
 *
 * @example
 * // Hero wordmark shear-field (hero-shear effect):
 * <WebGLIsland
 *   load={() => import('@/components/webgl/hero-shear-canvas')}
 *   effectProps={{ scrollVelocity }}
 * >
 *   <span className="sr-only">Yovi Zulkarnaen</span>
 * </WebGLIsland>
 */
export function WebGLIsland<P extends object = object>({
  children,
  load,
  effectProps,
  rootMargin = '200px',
  className,
}: WebGLIslandProps<P>) {
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Capability gate ──────────────────────────────────────────────
  // `useMediaQuery` is SSR-safe (returns false until mounted).
  // `useReducedMotion` mirrors the pattern in useParallax.ts.
  const isFinePointer = useMediaQuery('(pointer: fine)')
  const isHoverHover = useMediaQuery('(hover: hover)')
  const prefersReduced = useReducedMotion()
  const enabled = isFinePointer && isHoverHover && !prefersReduced

  // ── IntersectionObserver ─────────────────────────────────────────
  // `near` starts false → SSR render === first client render (no hydration mismatch).
  const [near, setNear] = useState(false)

  useEffect(() => {
    if (!enabled || !containerRef.current) return
    const el = containerRef.current
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin,
    })
    io.observe(el)
    return () => {
      io.disconnect()
      setNear(false)
    }
  }, [enabled, rootMargin])

  // ── Hidden-tab pause ─────────────────────────────────────────────
  // Unmounting the effect stops `frame.render(draw)` + frees the GL context.
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [enabled])

  // ── Lazy dynamic import ──────────────────────────────────────────
  // Memoized so the chunk is only requested once (stable on `load` identity).
  // ssr:false is legal here because this file is 'use client'.
  const Effect = useMemo(
    () =>
      dynamic<P>(load as () => Promise<{ default: React.ComponentType<P> }>, {
        ssr: false,
        loading: () => null,
      }),
    // `load` should be a stable module-scope fn; exhaustive-deps would fire on
    // every render if callers pass inline arrows — intentionally one-shot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const showEffect = enabled && near && !hidden

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {children}
      {showEffect && (
        <span aria-hidden className="pointer-events-none absolute inset-0">
          <Effect {...(effectProps as P)} />
        </span>
      )}
    </div>
  )
}
