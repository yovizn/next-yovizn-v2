'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

import { TextReveal } from '@/components/animations/text/reveal.text'
import { PortableText } from '@/components/common/portableText'
import { BlockContent } from '@/types/sanity.types'
import { duration, easing } from '@/lib/constants/animation.constant'

export function ProjectDetailContent({ content }: { content: BlockContent | undefined }) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(bodyRef, { amount: 0.1, once: true })
  const prefersReduced = useReducedMotion()

  return (
    <article
      aria-labelledby="overview-heading"
      className="col-span-full grid grid-cols-subgrid gap-px"
    >
      <div className="bg-graphite col-span-1 hidden lg:block" />

      <div className="bg-graphite clamp-[p,4,10] clamp-[py,6,12] col-span-full lg:col-span-4">
        {/* CUE eyebrow */}
        <p
          className="font-data text-paper-dim mb-4 text-[11px] tracking-[0.12em] uppercase"
          aria-hidden
        >
          CUE &nbsp;·&nbsp; OVERVIEW
        </p>

        {/* Accessible h2 companion */}
        <h2 id="overview-heading" className="sr-only">
          Project Overview
        </h2>

        {/* Decorative heading via TextReveal — scrollReveal (string, not rich blocks) */}
        <div aria-hidden className="mb-8">
          <TextReveal
            text="Overview"
            scrollReveal
            className={{
              text: 'font-nohemi text-paper clamp-[text,2xl,5xl] leading-none font-bold uppercase tracking-tight',
            }}
          />
        </div>

        {/*
         * Body copy — PortableText is rich blocks (not a plain string) so it
         * cannot be piped through TextReveal/TextBlur. Instead, a block-level
         * motion.div scroll reveal is used: opacity + translateY, useInView-gated,
         * reduced-motion-safe (no animation when prefersReduced). This satisfies
         * the "scrollReveal" brief intent while respecting the PortableText structure.
         */}
        <motion.div
          ref={bodyRef}
          initial={{
            opacity: prefersReduced ? 1 : 0,
            translateY: prefersReduced ? '0px' : '20px',
          }}
          animate={{
            opacity: isInView || prefersReduced ? 1 : 0,
            translateY: isInView || prefersReduced ? '0px' : '20px',
            transition: {
              opacity: { duration: duration.long, ease: easing.out },
              translateY: { duration: duration.long * 1.2, ease: easing.out },
            },
          }}
          className="prose-sm text-paper-dim lg:prose-xl"
        >
          {content && <PortableText content={content} />}
        </motion.div>
      </div>

      <div className="bg-graphite col-span-1 hidden lg:block" />
    </article>
  )
}
