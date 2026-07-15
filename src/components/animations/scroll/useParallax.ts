'use client'

import { useRef } from 'react'
import { useScroll, useTransform, useReducedMotion } from 'motion/react'

import { useMatchMedia } from '@/hooks/useMedia.hook'

// Derive the offset type from useScroll's own signature so it stays in lockstep.
type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>['offset']

interface UseParallaxOptions {
  /** Motion scroll offsets. Default: element crosses the viewport. */
  offset?: ScrollOffset
  /** Output range start→end. Default ±10% (spec: 5–15%). Use % or px strings. */
  range?: [string, string]
  /** Translate axis. Default 'y'. */
  axis?: 'x' | 'y'
  /** Disable parallax on mobile (native scroll, no Lenis). Default true. */
  disabledOnMobile?: boolean
}

/**
 * Parallax translate driven by Lenis-smoothed scroll. transform-only (Rule 1).
 * Returns RAW useTransform output (no useSpring — Rule 4).
 * Apply: <motion.div style={enabled ? { [axis]: value } : undefined} />
 */
export function useParallax({
  offset = ['start end', 'end start'],
  range = ['-10%', '10%'],
  axis = 'y',
  disabledOnMobile = true,
}: UseParallaxOptions = {}) {
  const ref = useRef<HTMLElement>(null)
  const isDesktop = useMatchMedia(640, 'min')
  const prefersReduced = useReducedMotion()

  const { scrollYProgress } = useScroll({ target: ref, offset })
  const value = useTransform(scrollYProgress, [0, 1], range)

  const enabled = !prefersReduced && (!disabledOnMobile || isDesktop)
  return { ref, value, enabled, axis }
}
