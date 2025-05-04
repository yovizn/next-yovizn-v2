import { TextReveal } from '@/components/animations/text/reveal.text'
import { Experience } from '@/module/about/views/experience.view'
import { HeroImage, HeroSection } from '@/module/about/views/hero.view'

export default function AboutPage() {
  return (
    <main style={{ perspective: '1000px', perspectiveOrigin: 'center' }}>
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
