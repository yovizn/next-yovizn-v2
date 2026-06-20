'use client'

import Image from 'next/image'
import { motion } from 'motion/react'

import { useParallax } from '@/components/animations/scroll'

import WhiteOne from '@public/images/white-one.jpg'

// NOTE: `white-one.jpg` is a TEMPORARY stock flat-lay standing in for Yovi's
// portrait. Until the real portrait lands it's treated as a monochrome editorial
// panel — grayscale + tone-mapped into the graphite palette and cropped to the
// subject (`object-left-top`) — so the stock white desk doesn't read as a jarring
// bright block on the dark theme. While it's a placeholder the image is decorative
// (the adjacent bio carries the meaning), so it's `alt=""` + aria-hidden rather
// than the previous false "Portrait of Yovi Zulkarnaen". Swap in the real portrait
// → drop the filters + restore the descriptive alt.
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
          src={WhiteOne}
          alt=""
          aria-hidden
          fill
          className="origin-top-left scale-[1.7] object-cover object-top-left grayscale brightness-[0.6] contrast-[1.1]"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </motion.div>

      {/* Tone the placeholder into the page: a warm signal whisper in the mids,
          then graphite scrims that ground the panel into the gap-px grid seams —
          vertical fades it under the header / into the next section, horizontal
          dims the bright desk sweep into the panel's right edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-signal/10 mix-blend-soft-light"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-graphite-2/70 via-transparent to-graphite-2/80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-l from-graphite-2/65 via-graphite-2/10 to-transparent"
      />
    </div>
  )
}
