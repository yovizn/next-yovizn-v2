'use client'

import { useEffect, useState } from 'react'
import { useScroll, motion } from 'motion/react'
import { cn } from '@/lib/utils/cn'

interface ScrollProgressBarProps {
  className?: string
}

const supportsScrollTimeline = () =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('animation-timeline: scroll()')

/**
 * Top-fixed scroll progress bar (scaleX). Prefers pure-CSS animation-timeline
 * (no JS, no RAF); progressively upgrades to a raw Lenis-driven MotionValue
 * (no useSpring — Rule 4) only where scroll-timeline is unsupported.
 * Reduced-motion handled by the CSS `display:none` rule (NOT a conditional
 * return — the element stays mounted so SSR and hydration trees match).
 */
export function ScrollProgressBar({ className }: ScrollProgressBarProps) {
  const [mounted, setMounted] = useState(false)
  // Hooks run unconditionally / in stable order.
  const { scrollYProgress } = useScroll()
  useEffect(() => setMounted(true), [])

  const base = cn(
    'scroll-progress-bar bg-primary pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] origin-left',
    className,
  )

  // SSR + first client render are byte-identical: the CSS-class div.
  // It is inert where scroll() is unsupported (scaleX stays 0 via base CSS).
  if (!mounted || supportsScrollTimeline()) {
    return <div aria-hidden className={cn(base, 'scroll-progress-bar--css')} />
  }

  // Post-mount, unsupported browsers only: drive scaleX with the raw MotionValue.
  return <motion.div aria-hidden style={{ scaleX: scrollYProgress }} className={base} />
}
