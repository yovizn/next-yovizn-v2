'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'

import { usePageTransition } from '@/hooks/stores/usePage.hook'

import { duration, easing } from '@/lib/constants/animation.constant'
import { cn } from '@/lib/utils/cn'

export function TextBlur({
  text,
  delay = 0,
  direction = 'right',
  distance = 0.25,
  className,
  once = true,
  scrollReveal = false,
}: {
  text: string
  delay?: number
  direction?: 'right' | 'left'
  distance?: number
  className?: string
  once?: boolean
  /** Fire on viewport entry alone, skipping the page-transition gate. Default false. */
  scrollReveal?: boolean
}) {
  const textRef = useRef(null)
  const isInView = useInView(textRef, { amount: 'all', once })
  const isReduceMotion = useReducedMotion()
  const {
    page: { isTransitionComplete },
  } = usePageTransition()

  const triggered = isInView && (scrollReveal || isTransitionComplete)

  const splitText = text.split('')
  const getDelay = (idx: number) => {
    if (direction === 'left') return delay + (splitText.length - 1 - idx) * 0.075
    return delay + idx * 0.075
  }

  const ease = easing.inOut

  return (
    <span
      ref={textRef}
      aria-hidden
      tabIndex={-1}
      className={cn('inline-flex', className)}
      style={{ perspective: '120px', perspectiveOrigin: 'bottom' }}
    >
      {splitText.map((char, idx) => {
        return (
          <motion.span
            key={idx}
            className="block"
            initial={{
              filter: !isReduceMotion ? 'blur(2px)' : 'blur(0px)',
              opacity: !isReduceMotion ? 0 : 1,
              translateZ: !isReduceMotion ? '-10px' : '0px',
              translateX: !isReduceMotion
                ? '0em'
                : `${distance * (direction === 'left' ? -1 : 1)}em`,
            }}
            animate={{
              filter: triggered ? 'blur(0px)' : 'blur(2px)',
              opacity: triggered ? 1 : 0,
              translateZ: triggered ? '0px' : '-10px',
              translateX: triggered ? '0em' : `${distance * (direction === 'left' ? -1 : 1)}em`,
              transition: {
                translateX: { duration: duration.medium + 0.45, delay: getDelay(idx), ease },
                translateZ: { duration: duration.long + 0.45, delay: getDelay(idx), ease },
                opacity: { duration: 1.5, delay: getDelay(idx), ease: easing.out },
                filter: { duration: 1, delay: getDelay(idx), ease: easing.out },
              },
            }}
          >
            {char}
          </motion.span>
        )
      })}
    </span>
  )
}
