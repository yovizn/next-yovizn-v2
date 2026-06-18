import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import JsonLd from '@/components/common/json-ld'
import { buildBreadcrumbList } from '@/lib/seo/structured-data'
import { tryCatch } from '@/lib/utils/tryCatch'
import { Hero } from '@/module/projects/view/hero.view'
import { ProjectsList } from '@/module/projects/view/project-list.view'
import { client } from '@/sanity/lib/client'
import { queryProjectsAll } from '@/sanity/queries'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Selected work by Yovi Zulkarnaen — frontend projects featuring web animation, motion design, and interaction craft.',
  alternates: {
    canonical: '/projects',
  },
  openGraph: {
    title: 'Projects — yovizn',
    description:
      'Selected work by Yovi Zulkarnaen — frontend projects featuring web animation, motion design, and interaction craft.',
  },
}

export default async function ProjectPage() {
  const [data, error] = await tryCatch(client.fetch(queryProjectsAll))

  if (error || !data) notFound()

  return (
    <main className="bg-graphite text-paper min-h-screen">
      {/* Phase 0 SEO — BreadcrumbList JSON-LD (must-preserve) */}
      <JsonLd
        data={buildBreadcrumbList([
          { name: 'Home', url: 'https://yovizn.com/' },
          { name: 'Projects', url: 'https://yovizn.com/projects' },
        ])}
      />

      {/* CUE · INDEX — hero header: sr-only h1 + KineticText */}
      <Hero />

      {/* CUE · REEL — vertical project rows */}
      <ProjectsList data={data} />
    </main>
  )
}
