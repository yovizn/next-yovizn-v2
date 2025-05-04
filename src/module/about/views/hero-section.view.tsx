'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

import { TextReveal } from '@/components/animations/text/reveal.text'

import whiteOne from '@public/images/profile-blur.png'

export function HeroSection() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  return (
    <section
      ref={containerRef}
      id="about"
      className="relative mb-px flex h-screen w-full flex-col items-center justify-center overflow-clip"
      style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
    >
      <div className="bg-foreground sticky top-0 z-20 h-24 w-full" />

      <div className="text-foreground clamp-[px,4,20] @container relative z-10 flex h-screen w-full flex-col justify-between py-20">
        <h2 className="clamp-[text,sm,4xl,@sm,@5xl] font-helvetica text-neutral-900 w-fit self-end text-justify font-medium uppercase">
          <span className="sr-only">
            Frontend Developer enthusiast, super into crafting dope web animations, clean AF
            designs, and smooth SEO vibes!
          </span>

          <TextReveal
            text="Frontend Developer enthusiast, super into crafting dope web animations, clean AF designs, and smooth SEO vibes!"
            highlight={['Frontend Developer', 'dope', 'clean AF', 'smooth SEO']}
            className={{ highlight: 'text-background italic' }}
            amount={[30, 40]}
          />
        </h2>

        <p className="clamp-[text,base,2xl,@sm,@5xl] text-neutral-900 w-fit font-medium">
          <span className="sr-only">
            I&apos;m a Frontend Developer, obsessed with creating websites with sick animations,
            awesome designs, and SEO that actually works. Creativity + tech = Google-approved magic!
          </span>

          <TextReveal
            highlight={['Frontend Developer', 'clean code', 'pixel-perfect design', 'SEO']}
            className={{ highlight: 'text-background italic' }}
            text="I'm a Frontend Developer who lives and breathes clean code and pixel-perfect design. Obsessed with crafting websites that pop with sick animations, slick UI vibes, and SEO that actually gets you noticed. I mix creativity and tech to cook up some serious Google-approved magic—because good design shouldn't just look awesome, it should work awesome too."
            amount={[40, 60]}
          />
        </p>
      </div>

      <div className="absolute top-[-10vh] left-0 h-[110vh] w-full">
        <motion.div style={{ y }} className="relative size-full">
          <Image
            src={whiteOne}
            alt="Image White One"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 640px,(max-width: 1024px) 1024px,(max-width: 1280px) 1280px, 100vw"
          />
        </motion.div>
      </div>
    </section>
  )
}
