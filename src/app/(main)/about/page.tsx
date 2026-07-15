import type { Metadata } from 'next'

import JsonLd from '@/components/common/json-ld'
import { buildPersonGraph } from '@/lib/seo/structured-data'
import { AboutContact } from '@/module/about/views/contact.view'
import { Experience } from '@/module/about/views/experience.view'
import { AboutProfile } from '@/module/about/views/hero.view'

// ISR: hourly regeneration so Sanity edits go live without a redeploy. See page.tsx.
export const revalidate = 3600

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
    <main className="bg-graphite text-paper grid min-h-screen grid-cols-4 gap-px lg:grid-cols-6">
      {/* Phase 0 SEO — MUST-PRESERVE: Person + WebSite @graph JSON-LD */}
      <JsonLd data={buildPersonGraph()} />

      {/* CUE · PROFILE — portrait (useParallax) + kinetic intro */}
      <AboutProfile />

      {/* CUE · EXPERIENCE — typed timeline, honest chronological sequence */}
      <Experience />

      {/* CUE · CONTACT — mono mailto CTA */}
      <AboutContact />
    </main>
  )
}
