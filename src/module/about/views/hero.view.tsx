'use client'

/**
 * CUE · PROFILE
 *
 * Portrait (useParallax — Phase 3 Task 9, must-keep) + kinetic intro.
 * Carries the single <h1> for /about — rendered server-side (no ssr:false).
 * KineticText is aria-hidden; the real h1 text is sr-only per convention.
 */

import Image from 'next/image'
import { motion } from 'motion/react'

import { KineticText } from '@/components/animations/text/kinetic.text'
import { TextReveal } from '@/components/animations/text/reveal.text'
import { useParallax } from '@/components/animations/scroll'

import profileBlur from '@public/images/profile-blur.png'

export function AboutProfile() {
  const { ref, value, enabled } = useParallax({
    offset: ['start end', 'end start'],
    range: ['-10%', '10%'],
    axis: 'y',
    disabledOnMobile: false,
  })

  return (
    <section
      ref={ref as React.Ref<HTMLElement>}
      aria-labelledby="profile-heading"
      className="relative min-h-[80svh] overflow-clip"
      style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
    >
      {/* CUE · PROFILE eyebrow */}
      <p
        className="font-data text-paper-dim relative z-10 px-6 pt-32 pb-4 text-[11px] tracking-[0.12em] uppercase lg:px-10 lg:pt-40"
        aria-hidden
      >
        CUE &nbsp;·&nbsp; PROFILE
      </p>

      {/* Kinetic intro — sr-only h1 companion required (a11y rule for KineticText) */}
      <div className="relative z-10 px-6 lg:px-10">
        <h1 id="profile-heading" className="sr-only">
          Yovi Zulkarnaen — Frontend Developer
        </h1>

        <div aria-hidden className="mb-6">
          <KineticText
            text="Yovi Zulkarnaen"
            by="char"
            stagger={0.03}
            className="font-nohemi text-paper clamp-[text,3xl,8xl] leading-none font-bold tracking-tight"
          />
        </div>

        <div aria-hidden className="mb-12">
          <KineticText
            text="Frontend · Motion Engineer"
            by="word"
            stagger={0.06}
            delay={0.2}
            className="font-data text-paper-dim text-sm tracking-[0.18em] uppercase"
          />
        </div>

        {/* sr-only companion for the body copy */}
        <p className="sr-only">
          I&apos;m a front-end developer who loves working on web interactions, responsive design,
          and slick animations. Still got a lot to learn, but hey — we all start somewhere.
        </p>

        <div
          aria-hidden
          className="font-helvetica text-paper clamp-[text,base,xl] max-w-2xl font-medium"
        >
          <TextReveal
            text="I'm a front-end developer who loves working on web interactions, responsive design, and slick animations. Still got a lot to learn, but hey — we all start somewhere."
            highlight={['start somewhere.']}
            amount={[40, 50]}
            delay={0.3}
            scrollReveal
          />
        </div>
      </div>

      {/* Parallax portrait — useParallax (Phase 3 Task 9 — KEEP) */}
      <div className="absolute top-[-10vh] left-0 h-[110vh] w-full" aria-hidden>
        <motion.div style={enabled ? { y: value } : undefined} className="relative size-full">
          <Image
            src={profileBlur}
            alt=""
            fill
            className="object-cover opacity-30"
            sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 100vw"
            priority
          />
        </motion.div>
      </div>

      {/* Signal line at bottom */}
      <div className="bg-signal relative z-10 mt-16 h-px w-full" aria-hidden />
    </section>
  )
}
