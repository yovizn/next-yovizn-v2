import { notFound } from 'next/navigation'
import { Metadata } from 'next'

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

  return {
    title: project?.title,
    description: project?.description,
    openGraph: {
      title: project?.title,
      description: project?.description,
      images: [urlFor(project?.cover || '').url()],
    },
    twitter: {
      title: project?.title,
      description: project?.description,
      images: [urlFor(project?.cover || '').url()],
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
      <Header1 />

      <Hero projects={project} />

      <ProjectDetailContent content={project?.content} />

      <ProjectGallery projects={project} />
    </main>
  )
}
