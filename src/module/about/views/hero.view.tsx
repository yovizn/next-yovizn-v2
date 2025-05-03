'use client'

import { RevealText } from '@/components/animations/text/reveal.text'
import dynamic from 'next/dynamic'

const HeroImage = dynamic(() => import('./hero-image.view').then((mod) => mod.HeroImage))
const HeroSection = dynamic(() => import('./hero-section.view').then((mod) => mod.HeroSection))

export function Hero() {
  return (
    <>
      <HeroImage />

      <section className="text-background bg-foreground flex items-center justify-center py-40">
        <h1 className="text-fixed font-helvetica flex flex-col items-end uppercase">
          <span className="sr-only">Hello I&apos;m Yovi, and this is about me.</span>
          <RevealText text="About" />
          <RevealText text="Me?" />
        </h1>
      </section>

      <HeroSection />
    </>
  )
}
