'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'

import { cn } from '@/lib/utils/cn'
import { transform } from '@/lib/utils/format'
import { clipPath, duration, easing } from '@/lib/constants/animation.constant'
import { useMatchMedia } from '@/hooks/useMedia.hook'
import { usePageTransition } from '@/hooks/stores/usePage.hook'

interface TextRevealProps {
  text?: string
  delay?: number
  className?: {
    text?: string
    highlight?: string
  }
  highlight?: string[]
  amount?: [number, number]
  once?: boolean
}

export function TextReveal({
  text = '',
  amount = [40, 60],
  className,
  delay = 0,
  highlight = [],
  once = true,
}: TextRevealProps) {
  const isDesktop = useMatchMedia(640, 'min')
  const textRef = useRef(null)
  const isInView = useInView(textRef, { amount: 'all', once })
  const isReduceMotion = useReducedMotion()
  const {
    page: { isTransitionComplete },
  } = usePageTransition()

  const splitByLine = transform.textByLine(text, isDesktop ? amount[1] : amount[0])
  const processText = (lineText: string) => {
    if (!highlight.length) return lineText
    const sortedHighlights = highlight.sort((a, b) => b.length - a.length)
    const result = lineText
    let segments: { text: string; highlighted: boolean }[] = [{ text: result, highlighted: false }]

    sortedHighlights.forEach((highlightText) => {
      const newSegments: { text: string; highlighted: boolean }[] = []
      segments.forEach((segment) => {
        if (segment.highlighted) {
          newSegments.push(segment)
          return
        }
        const parts = segment.text.split(highlightText)
        parts.forEach((part, index) => {
          if (part) {
            newSegments.push({ text: part, highlighted: false })
          }
          if (index < parts.length - 1) {
            newSegments.push({ text: highlightText, highlighted: true })
          }
        })
      })
      segments = newSegments
    })

    return (
      <>
        {segments.map((segment, index) =>
          segment.highlighted ? (
            <span key={index} className={cn('text-primary font-bold', className?.highlight)}>
              {segment.text}
            </span>
          ) : (
            segment.text
          ),
        )}
      </>
    )
  }

  const y = '25%'
  const ease = easing.out

  return (
    <span ref={textRef} aria-hidden tabIndex={-1} className={className?.text}>
      {splitByLine?.map((words, idx) => {
        return (
          <span
            key={idx}
            className="block overflow-clip"
            style={{ perspective: '120px', perspectiveOrigin: 'bottom' }}
          >
            <motion.span
              initial={{
                transformStyle: 'preserve-3d',
                clipPath: !isReduceMotion ? clipPath.close : clipPath.open,
                translateY: !isReduceMotion ? y : '0%',
                translateZ: !isReduceMotion ? '-10px' : '0px',
              }}
              animate={{
                transformStyle: 'preserve-3d',
                clipPath: isInView && isTransitionComplete ? clipPath.open : clipPath.close,
                translateY: isInView && isTransitionComplete ? '0%' : y,
                translateZ: isInView && isTransitionComplete ? '0px' : '-10px',
                transition: {
                  clipPath: { duration: duration.long * 1.2, delay: delay + idx * 0.075, ease },
                  translateY: { duration: duration.long * 1.25, delay: delay + idx * 0.05, ease },
                  translateZ: { duration: duration.long * 1.2, delay: delay + idx * 0.05, ease },
                },
              }}
              className="block text-nowrap"
            >
              {processText(words)}
            </motion.span>
          </span>
        )
      })}
    </span>
  )
}
