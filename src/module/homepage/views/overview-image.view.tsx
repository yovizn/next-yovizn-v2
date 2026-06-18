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
      className="bg-background col-span-4 aspect-video h-auto overflow-clip lg:row-span-2 lg:aspect-auto"
    >
      <motion.div
        style={enabled ? { y: value } : undefined}
        className="relative h-[calc(100%+100px)] w-full"
      >
        <Image
          src={WhiteOne}
          alt="Image White One"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 640px,(max-width: 1024px) 1024px,(max-width: 1280px) 1280px, 100vw"
        />
      </motion.div>
    </div>
  )
}
