'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'

import { duration, easing } from '@/lib/constants/animation.constant'
import { cn } from '@/lib/utils/cn'

interface KineticTextProps {
  text: string
  /** Split granularity. Default 'char'. */
  by?: 'char' | 'word'
  /** Per-unit stagger seconds. Default 0.04. */
  stagger?: number
  /** Base delay seconds. Default 0. */
  delay?: number
  /** Animate once. Default true. */
  once?: boolean
  /** useInView amount (0–1) to trigger. Default 0.6. */
  amount?: number
  className?: string
}

/**
 * Kinetic char/word stagger reveal. Scroll/viewport triggered (NOT gated on
 * page transition). transform + opacity only (Rule 1). Hand-rolled split —
 * Motion v12.40 has no splitText. Pair with an sr-only companion for a11y
 * (same convention as TextReveal/TextBlur).
 */
export function KineticText({
  text,
  by = 'char',
  stagger = 0.04,
  delay = 0,
  once = true,
  amount = 0.6,
  className,
}: KineticTextProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount, once })
  const prefersReduced = useReducedMotion()

  const units = by === 'word' ? text.split(' ') : text.split('')
  const ease = easing.out

  return (
    <span ref={ref} aria-hidden tabIndex={-1} className={cn('inline-flex flex-wrap', className)}>
      {units.map((unit, idx) => (
        <span key={idx} className="inline-block overflow-clip" style={{ whiteSpace: 'pre' }}>
          <motion.span
            className="inline-block"
            initial={{
              translateY: !prefersReduced ? '110%' : '0%',
              opacity: !prefersReduced ? 0 : 1,
            }}
            animate={{
              translateY: isInView && !prefersReduced ? '0%' : !prefersReduced ? '110%' : '0%',
              opacity: isInView || prefersReduced ? 1 : 0,
              transition: {
                translateY: { duration: duration.long, delay: delay + idx * stagger, ease },
                opacity: { duration: duration.medium, delay: delay + idx * stagger, ease },
              },
            }}
          >
            {by === 'word' ? `${unit} ` : unit === ' ' ? ' ' : unit}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
