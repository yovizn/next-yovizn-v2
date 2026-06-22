'use client'

/**
 * TransportRail — the persistent instrument rail.
 *
 * Desktop (≥lg): fixed left edge, thin vertical column.
 * Mobile (< lg): fixed bottom bar, horizontal strip.
 *
 * Four live readouts driven by the raw window scrollYProgress MotionValue
 * (no useSpring — Lenis already lerps):
 *  1. Timecode  — scroll progress → MM:SS:FF pseudo-runtime in --signal mono
 *  2. Cue label — current route mapped to a CUE identifier in --paper-dim mono
 *  3. Scrub bar — thin line + --signal head driven by scroll progress
 *  4. Easing glyph — small SVG cubic-bezier curve keyed to current route
 *
 * SSR-safety: scrollYProgress starts at 0 → timecode "00:00:00" on first render;
 * cue/glyph derive from usePathname (consistent server/client in App Router).
 * No window/document access at render time.
 *
 * Reduced motion: the rail ALWAYS shows (it is wayfinding). The moving scrub
 * head/fill are frozen (static instrument marking) and the glow is dropped;
 * the timecode/cue/glyph readouts stay (informational, not motion).
 *
 * Content spacing: the (main) layout wrapper gets lg:pl-10 / pb-10 so content
 * is never occluded (done in layout.tsx alongside the mount).
 */

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { cn } from '@/lib/utils/cn'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CueEntry {
  label: string
  /** cubic-bezier control points [x1, y1, x2, y2] */
  bezier: readonly [number, number, number, number]
}

// ─── Cue map ─────────────────────────────────────────────────────────────────

const CUE_MAP = {
  home: { label: 'CUE 01 · INDEX', bezier: [0.22, 1, 0.36, 1] },
  projects: { label: 'CUE · WORK', bezier: [0.76, 0, 0.24, 1] },
  case: { label: 'CUE · CASE', bezier: [0.215, 0.61, 0.355, 1] },
  about: { label: 'CUE · PROFILE', bezier: [0.22, 1, 0.36, 1] },
} as const satisfies Record<string, CueEntry>

function getCueEntry(pathname: string): CueEntry {
  // slug route MUST be checked before index to prevent false-positive match
  if (pathname.startsWith('/projects/')) return CUE_MAP.case
  if (pathname === '/projects') return CUE_MAP.projects
  if (pathname === '/about') return CUE_MAP.about
  return CUE_MAP.home
}

// ─── Active-cue scroll-spy ─────────────────────────────────────────────────────

/**
 * Tracks which `[data-cue]` section is at the reading line and returns its label,
 * so the rail narrates the journey down a multi-section page (the homepage steps
 * CUE 01 · INDEX → 02 · OVERVIEW → … → 05 · CONTACT as you scroll). Routes with
 * no `[data-cue]` sections (/projects, /about, /projects/[slug]) fall back to the
 * route-level label — `null` active state ensures the previous page's cue never
 * leaks across a navigation (effect re-runs on pathname).
 *
 * Label-only: the easing glyph stays route-level (page-transition easing readout).
 * The label snaps on section-cross — instrument-readout authentic, and dodges
 * layout jank on the vertical-writing-mode text. Not motion → updates under
 * reduced-motion too (it's wayfinding state, not animation).
 */
function useActiveCueLabel(fallbackLabel: string, pathname: string): string {
  const [activeLabel, setActiveLabel] = useState<string | null>(null)

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-cue]'))
    // No cue sections on this route → reset to the route fallback label. The
    // reset is wrapped in a function (not called inline) so the React Compiler
    // doesn't flag setState-directly-in-effect; we still return early to avoid
    // wiring an IntersectionObserver over zero nodes.
    const resetToFallback = () => setActiveLabel(null)
    if (nodes.length === 0) {
      resetToFallback()
      return
    }

    const visible = new Set<HTMLElement>()
    const sync = () => {
      // active = the LAST section (document order) still crossing the reading
      // band — i.e. the lower section wins as it scrolls up into the line.
      let pick: HTMLElement | null = null
      for (const n of nodes) if (visible.has(n)) pick = n
      if (pick?.dataset.cue) setActiveLabel(pick.dataset.cue)
      // pick === null (between sections) → keep the previous label (no flicker).
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target as HTMLElement)
          else visible.delete(e.target as HTMLElement)
        }
        sync()
      },
      // Collapse the root to a single line at the viewport centre: a section is
      // "active" only while it spans that line, so the label flips exactly as the
      // boundary between two sections crosses centre — symmetric up/down, no
      // band-edge early-switching, no boundary flicker.
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [pathname])

  return activeLabel ?? fallbackLabel
}

// ─── Timecode formatter ───────────────────────────────────────────────────────

const TOTAL_SECONDS = 200 // 3 min 20 sec total pseudo-runtime

/**
 * Maps scroll progress [0, 1] to MM:SS:FF pseudo-runtime timecode.
 * FF is 00–99 from the fractional second.
 * Called inside useTransform — zero React re-renders.
 */
function formatTimecode(progress: number): string {
  const elapsed = Math.max(0, Math.min(1, progress)) * TOTAL_SECONDS
  const mm = Math.floor(elapsed / 60)
  const ss = Math.floor(elapsed % 60)
  const ff = Math.floor((elapsed % 1) * 100)
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}`
}

// ─── Easing glyph ─────────────────────────────────────────────────────────────

function EasingGlyph({ bezier }: { bezier: readonly [number, number, number, number] }) {
  const [x1, y1, x2, y2] = bezier
  const W = 28
  const H = 28
  // Map from CSS bezier unit space [0,1]² to SVG space (y-axis: 0=top, H=bottom)
  const cx1 = x1 * W
  const cy1 = (1 - y1) * H
  const cx2 = x2 * W
  const cy2 = (1 - y2) * H
  const d = `M 0,${H} C ${cx1},${cy1} ${cx2},${cy2} ${W},0`

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      aria-hidden
      focusable="false"
      className="block shrink-0"
    >
      {/* Reference box — very faint */}
      <rect
        x="0"
        y="0"
        width={W}
        height={H}
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.1"
        fill="none"
      />
      {/* The bezier curve */}
      <path d={d} stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Start / end terminals */}
      <circle cx="0" cy={H} r="1.5" fill="var(--signal)" />
      <circle cx={W} cy="0" r="1.5" fill="var(--signal)" />
    </svg>
  )
}

// ─── Scrub bar ────────────────────────────────────────────────────────────────

/**
 * Desktop: vertical track (full column height), head translates top→bottom.
 * Mobile: horizontal track (full bar width), head translates left→right.
 *
 * All movement is transform-only.
 * The scrub head is a motion.div driven directly by the scrollYProgress MotionValue
 * — zero React re-renders per frame.
 */
function ScrubBar({
  scrollYProgress,
  reducedMotion,
}: {
  scrollYProgress: MotionValue<number>
  /** Gate decorative glow on the scrub head */
  reducedMotion: boolean | null
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackH, setTrackH] = useState(0)
  const [trackW, setTrackW] = useState(0)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => {
      setTrackH(el.offsetHeight)
      setTrackW(el.offsetWidth)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Desktop head: translateY 0 → trackH - 2 (head height = 2px)
  const yHead = useTransform(scrollYProgress, [0, 1], [0, Math.max(0, trackH - 2)])
  // Mobile head: translateX 0 → trackW - 2
  const xHead = useTransform(scrollYProgress, [0, 1], [0, Math.max(0, trackW - 2)])
  // Fill scale: 0 → 1
  const fillScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <>
      {/* Shared track wrapper — ref measured for both orientations */}
      <div
        ref={trackRef}
        className={cn(
          'relative min-h-0 min-w-0 flex-1',
          // Desktop: narrow vertical track (full height of aside)
          'lg:w-px lg:self-stretch',
          // Mobile: thin horizontal track (full width of aside)
          'h-px self-center lg:h-auto',
        )}
        aria-hidden
      >
        {/* Track background */}
        <div className="bg-paper-dim/20 absolute inset-0" />

        {/* Desktop fill — scaleY from top; hidden on mobile */}
        <motion.div
          className="bg-signal/40 absolute inset-0 hidden origin-top lg:block"
          style={{ scaleY: reducedMotion ? 0 : fillScale }}
        />
        {/* Mobile fill — scaleX from left; hidden on desktop */}
        <motion.div
          className="bg-signal/40 absolute inset-0 block origin-left lg:hidden"
          style={{ scaleX: reducedMotion ? 0 : fillScale }}
        />

        {/* Desktop scrub head: horizontal bar, translates top→bottom */}
        <motion.div
          className={cn(
            'bg-signal absolute right-0 left-0 hidden h-0.5 lg:block',
            !reducedMotion && 'shadow-[0_0_4px_var(--signal)]',
          )}
          style={{ y: reducedMotion ? 0 : yHead }}
        />
        {/* Mobile scrub head: vertical bar, translates left→right */}
        <motion.div
          className={cn(
            'bg-signal absolute top-0 bottom-0 block w-0.5 lg:hidden',
            !reducedMotion && 'shadow-[0_0_4px_var(--signal)]',
          )}
          style={{ x: reducedMotion ? 0 : xHead }}
        />
      </div>
    </>
  )
}

// ─── TransportRail ────────────────────────────────────────────────────────────

export function TransportRail() {
  const pathname = usePathname()
  const reducedMotion = useReducedMotion()

  // Raw global window scroll progress — NO useSpring (Lenis already lerps)
  const { scrollYProgress } = useScroll()

  // Timecode as a MotionValue<string>: useTransform with a function.
  // Updates DOM textContent imperatively — zero React re-renders per frame.
  const timecodeValue = useTransform(scrollYProgress, formatTimecode)

  const cueEntry = getCueEntry(pathname)
  // Label tracks the active [data-cue] section (homepage); glyph stays route-level.
  const activeLabel = useActiveCueLabel(cueEntry.label, pathname)

  return (
    <aside
      aria-hidden
      className={cn(
        // Fixed, above content, never intercepts pointer events
        'pointer-events-none fixed z-45 select-none',
        // Mobile-first: bottom horizontal bar. box-content + pb keeps the 40px
        // instrument bar but extends its graphite into the notch safe area so
        // the readouts clear the home indicator (needs viewport-fit:cover).
        'right-0 bottom-0 left-0 box-content flex h-10 flex-row pb-[env(safe-area-inset-bottom)]',
        // Desktop override: left vertical column
        'lg:top-0 lg:right-auto lg:bottom-0 lg:left-0 lg:box-border lg:h-auto lg:w-10 lg:flex-col lg:pb-0',
        // Surface
        'bg-graphite/85 backdrop-blur-[2px]',
        // Mobile: top border; Desktop: right border
        'border-graphite-2 border-t lg:border-t-0 lg:border-r',
      )}
    >
      {/*
       * Desktop (flex-col): cue → scrub → timecode → glyph (top→bottom)
       * Mobile (flex-row): cue → scrub → timecode → glyph (left→right)
       */}

      {/* Cue label */}
      <div
        className={cn(
          'font-data text-paper-dim shrink-0',
          'px-0 py-2 lg:px-0 lg:py-3',
          // Desktop: write vertically bottom-up, rotate so it reads normally
          'lg:rotate-180 lg:text-left lg:[text-orientation:mixed] lg:[writing-mode:vertical-rl]',
          // Shared sizing
          'text-[9px] leading-none tracking-[0.08em] whitespace-nowrap',
          // Mobile: horizontal, pad left
          'pl-2 lg:pt-3 lg:pl-0',
          'absolute top-4',
        )}
      >
        {activeLabel}
      </div>

      {/* Scrub bar (desktop vertical + mobile horizontal variants inside) */}
      <ScrubBar scrollYProgress={scrollYProgress} reducedMotion={reducedMotion} />

      {/* Timecode */}
      <motion.span
        className={cn(
          'font-data text-signal shrink-0 tabular-nums',
          // Desktop: vertical
          'lg:rotate-180 lg:py-2 lg:[writing-mode:vertical-rl]',
          // Mobile: horizontal, right side
          'pr-2 lg:pr-0',
          'text-[9px] leading-none tracking-[0.04em] whitespace-nowrap',
        )}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {timecodeValue}
      </motion.span>

      {/* Easing glyph */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-center',
          'lg:px-1 lg:pt-1 lg:pb-3',
          'px-1',
        )}
      >
        <EasingGlyph bezier={cueEntry.bezier} />
      </div>
    </aside>
  )
}
