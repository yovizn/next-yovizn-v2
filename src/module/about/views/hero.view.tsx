'use client'

/**
 * CUE · PROFILE
 *
 * Text block + a full-contrast framed portrait (parallax) in the case-study
 * hairline grid — the portrait is no longer a murky opacity-30 wash behind the
 * copy. Carries the single <h1> for /about (server-rendered); KineticText is
 * aria-hidden with an sr-only companion per convention. COPY is a proposal.
 */

import Image from 'next/image'
import { motion } from 'motion/react'

import { Cue } from '@/components/common/cue'
import { KineticText } from '@/components/animations/text/kinetic.text'
import { TextReveal } from '@/components/animations/text/reveal.text'
import { useParallax } from '@/components/animations/scroll'
import { CoverDisplace } from '@/components/webgl/cover-displace'

import profileBlur from '@public/images/profile-blur.webp'

const ABOUT_BODY =
  'Front-end developer focused on web interactions, responsive layout, and precise animation — building interfaces where type, scroll, and shader move as one instrument.'

export function AboutProfile() {
  const { ref, value, enabled } = useParallax({
    offset: ['start end', 'end start'],
    range: ['-8%', '8%'],
    axis: 'y',
    disabledOnMobile: false,
  })

  return (
    <section
      ref={ref as React.Ref<HTMLElement>}
      aria-labelledby="profile-heading"
      className="col-span-full grid grid-cols-subgrid gap-px"
    >
      {/* Text block */}
      <div className="bg-graphite col-span-full flex flex-col justify-end gap-6 px-6 pt-32 pb-12 lg:col-span-4 lg:px-10 lg:pt-40">
        <Cue aria-hidden className="leading-none">
          CUE &nbsp;·&nbsp; PROFILE
        </Cue>

        <h1 id="profile-heading" className="sr-only">
          Yovi Zulkarnaen — Frontend &amp; Motion Engineer
        </h1>

        <div aria-hidden>
          <KineticText
            text="Yovi Zulkarnaen"
            by="char"
            stagger={0.03}
            className="font-nohemi text-paper text-display-lg leading-none font-bold uppercase tracking-tight"
          />
        </div>

        <div aria-hidden>
          <KineticText
            text="Frontend · Motion Engineer"
            by="word"
            stagger={0.06}
            delay={0.2}
            className="font-data text-paper-dim text-sm tracking-[0.18em] uppercase"
          />
        </div>

        <p className="sr-only">{ABOUT_BODY}</p>

        <div aria-hidden className="font-sans text-paper clamp-[text,base,xl] max-w-2xl font-medium">
          <TextReveal
            text={ABOUT_BODY}
            highlight={['one instrument.']}
            amount={[42, 55]}
            delay={0.3}
            scrollReveal
          />
        </div>
      </div>

      {/* Framed portrait — full contrast, parallax within the clip */}
      <div
        className="bg-graphite-2 relative col-span-full min-h-[50svh] overflow-clip lg:col-span-2 lg:min-h-full"
        aria-hidden
      >
        <motion.div style={enabled ? { y: value } : undefined} className="absolute inset-0 scale-110">
          <CoverDisplace src={profileBlur.src} className="size-full">
            <Image
              src={profileBlur}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          </CoverDisplace>
        </motion.div>
      </div>
    </section>
  )
}
