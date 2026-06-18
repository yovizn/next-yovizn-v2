import { notFound } from 'next/navigation'
import { Metadata } from 'next'

import JsonLd from '@/components/common/json-ld'
import { buildBreadcrumbList, buildCreativeWork } from '@/lib/seo/structured-data'
import { Hero } from '@/module/projects/view/detail/hero.view'
import { ProjectDetailContent } from '@/module/projects/view/detail/content.view'
import { ProjectGallery } from '@/module/projects/view/detail/gallery.view'
import { Header1 } from '@/components/ui/header-1'

import { urlFor } from '@/sanity/lib/image'
import { getProjectsAll, getProjectsBySlug } from '@/services/getProjects.service'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const [data] = await getProjectsAll()

  return data?.map((project) => ({ slug: project.slug.current })) || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [project, error] = await getProjectsBySlug(slug)

  if (error || !project) notFound()

  const ogImage = {
    url: urlFor(project.cover).width(1200).height(630).url(),
    width: 1200,
    height: 630,
    alt: project.cover.alt,
  }

  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: `/projects/${slug}`,
    },
    openGraph: {
      type: 'article',
      title: project.title,
      description: project.description,
      url: `/projects/${slug}`,
      images: [ogImage],
    },
    twitter: {
      title: project.title,
      description: project.description,
      images: [ogImage],
      card: 'summary_large_image',
    },
  }
}

export default async function ProjectsDetailPage({ params }: Props) {
  const { slug } = await params
  const [project, error] = await getProjectsBySlug(slug)

  if (error || !project) notFound()

  return (
    <main className="grid grid-cols-4 gap-px lg:grid-cols-6">
      <JsonLd
        data={buildBreadcrumbList([
          { name: 'Home', url: 'https://yovizn.com/' },
          { name: 'Projects', url: 'https://yovizn.com/projects' },
          { name: project.title, url: `https://yovizn.com/projects/${slug}` },
        ])}
      />
      <JsonLd data={buildCreativeWork(project)} />

      <Header1 />

      <Hero projects={project} />

      <ProjectDetailContent content={project?.content} />

      <ProjectGallery projects={project} />
    </main>
  )
}
