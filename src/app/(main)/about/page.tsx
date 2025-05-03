import { Experience } from '@/module/about/views/experience.view'
import { Hero } from '@/module/about/views/hero.view'

export default function AboutPage() {
  return (
    <main style={{ perspective: '1000px', perspectiveOrigin: 'center' }}>
      <Hero />

      <Experience />
    </main>
  )
}
