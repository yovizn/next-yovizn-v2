import type { Metadata } from 'next'

import JsonLd from '@/components/common/json-ld'
import { buildPersonGraph } from '@/lib/seo/structured-data'
import { Contact } from '@/module/homepage/views/contact.view'
import { CompanyList } from '@/module/homepage/views/company-list.view'
import { Hero } from '@/module/homepage/views/hero.view'
import { Overview } from '@/module/homepage/views/overview.view'
import { Projects } from '@/module/homepage/views/projects.view'
import { getProjectsOverview } from '@/services/getProjects.service'
import { notFound } from 'next/navigation'

// ISR: regenerate this static page at most once an hour so Sanity edits go live
// without a redeploy (content was previously frozen to build time). For instant
// updates, add a Sanity webhook → an on-demand revalidate route.
export const revalidate = 3600

export const metadata: Metadata = {
  title: {
    absolute: 'Yovi Zulkarnaen — Frontend Developer & Motion Specialist',
  },
  description:
    'Frontend developer crafting performant web animations and micro-interactions with Motion. Explore selected projects by Yovi Zulkarnaen.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Yovi Zulkarnaen — Frontend Developer & Motion Specialist',
    description:
      'Frontend developer crafting performant web animations and micro-interactions with Motion. Explore selected projects by Yovi Zulkarnaen.',
  },
}

export default async function HomePage() {
  const [data, error] = await getProjectsOverview()

  if (error || !data) notFound()

  return (
    <main className="bg-graphite text-paper min-h-screen">
      <JsonLd data={buildPersonGraph()} />

      {/* CUE 01 — Hero: HeroShear wordmark (OGL island) + mono subtitle */}
      <Hero />

      {/* CUE 02 — Overview: TextReveal(scrollReveal) intro copy + parallax portrait */}
      <Overview />

      {/* CUE 03 — Clients: SVG logo wall, staggered reveal */}
      <CompanyList />

      {/* CUE 04 — Selected Work: project cards with CoverDisplace WebGL islands */}
      <Projects data={data} />

      {/* CUE 05 — Contact: large mono CTA */}
      <Contact />
    </main>
  )
}
