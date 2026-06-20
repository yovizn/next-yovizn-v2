'use client'

import Image from 'next/image'
import { motion } from 'motion/react'

import { useParallax } from '@/components/animations/scroll'

import ProfileBlur from '@public/images/profile-blur.png'

// CUE 02 portrait column. Uses Yovi's real motion-blurred portrait — the same
// asset the /about hero uses — instead of the old stock succulent placeholder.
// It's on-brand twice over: an actual portrait for "Hello, I'm Yovi", and the
// motion blur literally embodies "Frontend · Motion Engineer". Already B&W, so
// it sits in the graphite palette with only a light contrast lift + a graphite
// scrim grounding the panel edge into the gap-px grid seam. Meaningful content
// now (a portrait), so it carries a descriptive alt rather than being decorative.
export function OverviewImage() {
  const { ref, value, enabled } = useParallax({
    offset: ['start start', 'end start'],
    range: ['-50px', '50px'],
    axis: 'y',
    disabledOnMobile: true,
  })

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className="bg-graphite-2 relative aspect-video h-auto overflow-clip lg:aspect-auto lg:min-h-120"
    >
      <motion.div
        style={enabled ? { y: value } : undefined}
        className="relative h-[calc(100%+100px)] w-full"
      >
        <Image
          src={ProfileBlur}
          alt="Motion-blurred portrait of Yovi Zulkarnaen"
          fill
          className="object-cover object-center brightness-90 contrast-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </motion.div>

      {/* Graphite scrims ground the portrait into the dark theme + the gap-px
          grid seams without hiding the figure — vertical fades the edges, a
          softer right-edge wash ties the panel into its neighbour. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-graphite-2/60 via-transparent to-graphite-2/70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-l from-graphite-2/40 to-transparent"
      />
    </div>
  )
}
