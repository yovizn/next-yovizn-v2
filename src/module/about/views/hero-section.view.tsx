'use client'

import Image from 'next/image'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

import { RevealText } from '@/components/animations/text/reveal.text'

import whiteOne from '@public/images/black-two.jpg'

export function HeroSection() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  useMotionValueEvent(y, 'change', (latest) => {
    console.log(latest)
  })

  return (
    <section
      ref={containerRef}
      id="about"
      className="relative flex h-screen w-full items-center flex-col justify-center overflow-clip mb-px"
      style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
    >
      <div className='h-24 bg-foreground z-20 w-full sticky top-0' />
      
      <div className="text-foreground clamp-[px,4,20] @container relative z-10 flex h-screen w-full flex-col justify-between py-20">
        <h2 className="clamp-[text,sm,4xl,@sm,@5xl] font-helvetica w-fit self-end text-justify font-medium uppercase">
          <span className="sr-only">
            Frontend Developer enthusiast, obsessed with creating stunning web animations, sleek
            designs, and seamless SEO!
          </span>

          <RevealText
            text="Frontend Developer enthusiast, obsessed with creating stunning web animations, sleek designs, and seamless SEO!"
            highlight={['obsessed', 'stunning', 'sleek', 'seamless']}
            amount={[30, 40]}
          />
        </h2>

        <p className="clamp-[text,base,2xl,@sm,@5xl] w-fit font-light">
          <span className="sr-only">
            I&apos;m a Frontend Developer, obsessed with creating websites with sick animations,
            awesome designs, and SEO that actually works. Creativity + tech = Google-approved magic!
          </span>

          <RevealText
            highlight={['obsessed', 'sick', 'awesome', 'SEO', 'Google-approved']}
            text="I'm a Frontend Developer, obsessed with creating websites with sick animations, awesome designs, and SEO that actually works. Creativity + Tech = Google-approved magic!"
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
