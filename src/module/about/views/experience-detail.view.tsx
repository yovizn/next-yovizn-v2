'use client'

/**
 * ExperienceList
 *
 * Honest timeline from experience.constant.ts (React/Next/TS/CMS/Three/WebGL).
 * Ordinal indices (01..N) reflect real ordering — oldest exposure first — per brief.
 * Float values (e.g. 3.2) + "year"/"years" suffix in font-data mono readout.
 * Each row scrollReveal-s in via Li stagger (no fabricated dates — the constant
 * has no dates, only years-of-experience floats; index IS the ordering info).
 *
 * Signal line separates rows. Active state = --signal border-left accent (line only).
 */

import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'

import { cn } from '@/lib/utils/cn'
import { duration, easing } from '@/lib/constants/animation.constant'
import { experiences } from '@/lib/constants/experience.constant'

function ExperienceRow({
  index,
  label,
  value,
}: {
  index: number
  label: string
  value: number
}) {
  const ref = useRef<HTMLLIElement>(null)
  const isInView = useInView(ref, { amount: 0.5, once: true })
  const prefersReduced = useReducedMotion()

  const ordinal = String(index + 1).padStart(2, '0')
  const suffix = value > 1 ? 'years' : 'year'

  return (
    <li
      ref={ref}
      className="border-hairline group relative flex items-center justify-between gap-6 border-t py-5 first:border-t-0"
    >
      {/* Signal left-edge accent line — appears on viewport entry */}
      <motion.div
        aria-hidden
        className="bg-signal absolute left-0 top-0 h-full w-px"
        initial={{ scaleY: 0, transformOrigin: 'top' }}
        animate={
          isInView && !prefersReduced
            ? { scaleY: 1, transition: { duration: duration.long, ease: easing.out } }
            : prefersReduced
              ? { scaleY: 1 }
              : { scaleY: 0 }
        }
      />

      {/* Row content */}
      <motion.div
        className="flex items-baseline gap-5"
        initial={{ opacity: prefersReduced ? 1 : 0, x: prefersReduced ? 0 : 24 }}
        animate={
          isInView
            ? {
                opacity: 1,
                x: 0,
                transition: {
                  opacity: { duration: duration.medium, delay: 0.08, ease: easing.out },
                  x: { duration: duration.long, delay: 0.08, ease: easing.out },
                },
              }
            : prefersReduced
              ? { opacity: 1, x: 0 }
              : { opacity: 0, x: 24 }
        }
      >
        {/* Ordinal index — honest sequence, not decoration */}
        <span
          className="font-data text-paper-dim w-7 shrink-0 text-[11px] tracking-[0.1em]"
          aria-hidden
        >
          {ordinal}
        </span>

        {/* Skill label */}
        <span className="font-nohemi text-paper text-display-md leading-none font-bold uppercase">
          {label}
        </span>
      </motion.div>

      {/* Duration readout — mono, right-aligned */}
      <motion.div
        className="font-data text-paper-dim flex shrink-0 items-baseline gap-1 text-right"
        initial={{ opacity: prefersReduced ? 1 : 0 }}
        animate={
          isInView
            ? {
                opacity: 1,
                transition: { duration: duration.medium, delay: 0.15, ease: easing.out },
              }
            : prefersReduced
              ? { opacity: 1 }
              : { opacity: 0 }
        }
        aria-label={`${value} ${suffix}`}
      >
        <span className="text-paper clamp-[text,base,xl] font-semibold">{value}</span>
        <span className="text-[11px] tracking-[0.1em] uppercase">{suffix}</span>
      </motion.div>
    </li>
  )
}

export function ExperienceList() {
  return (
    <ul className={cn('w-full')} aria-label="Skills and experience timeline">
      {experiences.map((exp, idx) => (
        <ExperienceRow key={exp.label} index={idx} label={exp.label} value={exp.value} />
      ))}
    </ul>
  )
}
