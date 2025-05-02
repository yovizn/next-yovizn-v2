'use client'

import { motion, useScroll, useTransform } from 'motion/react'

import { Logo } from '@/components/common/icon'

export function HeroImage() {
  const { scrollYProgress } = useScroll({
    offset: ['start start', 'end start'],
  })

  const transform = useTransform(
    scrollYProgress,
    [0, 1],
    ['translate3d(0px, 0vh, 0px)', 'translate3d(0px, 80vh, 10vh)'],
  )

  return (
    <section
      className="h-screen overflow-clip"
      style={{ perspective: '1000px', perspectiveOrigin: 'center' }}
    >
      <motion.div
        style={{ transform }}
        className="bg-foreground text-background relative flex h-full items-center justify-center"
      >
        <Logo className="clamp-[size,300px,500px]" />
      </motion.div>
    </section>
  )
}
