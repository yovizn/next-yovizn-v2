'use client'

import Image from 'next/image'

import WhiteOne from '@public/images/white-one.jpg'
import { motion, useScroll, useTransform } from 'motion/react'

export function HeroImage() {
  const { scrollYProgress } = useScroll({
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['-50px', '50px'])

  return (
    <div className="bg-background col-span-4 aspect-video h-auto overflow-clip lg:row-span-2 lg:aspect-auto">
      <motion.div style={{ y }} className="relative w-full h-[calc(100%+100px)]">
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
