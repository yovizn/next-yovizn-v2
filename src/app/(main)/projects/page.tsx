import type { Metadata } from 'next'

import JsonLd from '@/components/common/json-ld'
import { buildBreadcrumbList } from '@/lib/seo/structured-data'
import { Header1 } from '@/components/ui/header-1'
import { tryCatch } from '@/lib/utils/tryCatch'
import { Hero } from '@/module/projects/view/hero.view'
import { ProjectsList } from '@/module/projects/view/project-list.view'
import { client } from '@/sanity/lib/client'
import { queryProjectsAll } from '@/sanity/queries'
import { Pin } from '@/components/animations/scroll'
import { ArrowDownRight } from 'lucide-react'
import { notFound } from 'next/navigation'

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
    <main className="grid grid-cols-4 gap-px lg:grid-cols-6 xl:grid-cols-8">
      <JsonLd
        data={buildBreadcrumbList([
          { name: 'Home', url: 'https://yovizn.com/' },
          { name: 'Projects', url: 'https://yovizn.com/projects' },
        ])}
      />

      <Header1 />

      <Pin zIndex={20} className="col-span-full h-24 bg-foreground" />

      <Hero />
      <div className="col-span-full grid grid-cols-6 gap-px">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-background grid place-content-end">
            {index === 0 && <ArrowDownRight className="clamp-[size,4.25rem,7rem] justify-self-end" />}
          </div>
        ))}
      </div>
      <ProjectsList data={data} />
    </main>
  )
}
