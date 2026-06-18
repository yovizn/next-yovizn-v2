'use client'

import Image from 'next/image'
import { motion } from 'motion/react'

import { useParallax } from '@/components/animations/scroll'

import WhiteOne from '@public/images/white-one.jpg'

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
      className="bg-graphite-2 aspect-video h-auto overflow-clip lg:aspect-auto lg:min-h-120"
    >
      <motion.div
        style={enabled ? { y: value } : undefined}
        className="relative h-[calc(100%+100px)] w-full"
      >
        <Image
          src={WhiteOne}
          alt="Portrait of Yovi Zulkarnaen"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </motion.div>
    </div>
  )
}
