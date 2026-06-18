'use client'

import { useRef } from 'react'
import { useScroll } from 'motion/react'

// Derive the offset type from useScroll's own signature — `UseScrollOptions`
// is NOT verified to be a named type export of motion/react v12.40, and a
// missing type import silently breaks `tsc`. The function value IS verified.
type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>['offset']

interface UseScrollProgressOptions {
  /** Motion scroll offsets. Default tracks element entering to leaving viewport. */
  offset?: ScrollOffset
}

/**
 * Reads scroll progress (0→1) of a target element through the viewport.
 * Returns the RAW Lenis-driven MotionValue — DO NOT wrap in useSpring (double-lerp).
 * Feed `scrollYProgress` directly into useTransform.
 */
export function useScrollProgress({ offset = ['start end', 'end start'] }: UseScrollProgressOptions = {}) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset })
  return { ref, scrollYProgress }
}
