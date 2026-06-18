import type { Metadata } from 'next'

import JsonLd from '@/components/common/json-ld'
import { buildPersonGraph } from '@/lib/seo/structured-data'
import { TextReveal } from '@/components/animations/text/reveal.text'
import { Experience } from '@/module/about/views/experience.view'
import { HeroImage, HeroSection } from '@/module/about/views/hero.view'

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Yovi Zulkarnaen — a frontend developer specializing in web animation, micro-interactions, and performant interfaces built with Motion.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About — yovizn',
    description:
      'About Yovi Zulkarnaen — a frontend developer specializing in web animation, micro-interactions, and performant interfaces built with Motion.',
  },
}

export default function AboutPage() {
  return (
    <main style={{ perspective: '1000px', perspectiveOrigin: 'center' }}>
      <JsonLd data={buildPersonGraph()} />

      <HeroImage />

      <section className="text-background bg-foreground flex items-center justify-center py-40">
        <h1 className="text-fixed font-helvetica flex flex-col items-end uppercase">
          <span className="sr-only">Hello I&apos;m Yovi, and this is about me.</span>
          <TextReveal text="About" />
          <TextReveal text="Me?" />
        </h1>
      </section>

      <HeroSection />

      <Experience />
    </main>
  )
}
