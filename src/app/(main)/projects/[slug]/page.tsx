import { notFound } from 'next/navigation'
import { Metadata } from 'next'

import JsonLd from '@/components/common/json-ld'
import { buildBreadcrumbList, buildCreativeWork, SITE_URL } from '@/lib/seo/structured-data'
import { Hero } from '@/module/projects/view/detail/hero.view'
import { ProjectDetailContent } from '@/module/projects/view/detail/content.view'
import { ProjectGallery } from '@/module/projects/view/detail/gallery.view'
import { NextCase } from '@/module/projects/view/detail/next-case.view'

import { urlFor } from '@/sanity/lib/image'
import { getProjectsAll, getProjectsBySlug } from '@/services/getProjects.service'

// ISR: prerendered per-slug (generateStaticParams) + hourly regeneration so
// Sanity edits to a case study go live without a redeploy. See page.tsx.
export const revalidate = 3600

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

  // Both fetches are needed: slug fetch for this project, all fetch for index + next-case
  const [[project, error], [allProjects]] = await Promise.all([
    getProjectsBySlug(slug),
    getProjectsAll(),
  ])

  if (error || !project) notFound()

  // Derive 1-based index in date-ordered reel (matches the projects index reel)
  const currentIndex = allProjects?.findIndex((p) => p.slug.current === slug) ?? -1
  const projectIndex = currentIndex >= 0 ? currentIndex + 1 : 1

  // Next project in reel (no wrap-around — last project hides the affordance)
  const nextProject =
    allProjects && currentIndex >= 0 && currentIndex < allProjects.length - 1
      ? allProjects[currentIndex + 1]
      : undefined

  return (
    <main className="bg-graphite text-paper grid min-h-screen grid-cols-4 gap-px lg:grid-cols-6">
      {/* Phase 0 SEO — MUST-PRESERVE: two JSON-LD scripts */}
      <JsonLd
        data={buildBreadcrumbList([
          { name: 'Home', url: `${SITE_URL}/` },
          { name: 'Projects', url: `${SITE_URL}/projects` },
          { name: project.title, url: `${SITE_URL}/projects/${slug}` },
        ])}
      />
      <JsonLd data={buildCreativeWork(project)} />

      {/* CUE · CASE — hero: index cue + KineticText title + meta row + CoverDisplace */}
      <Hero projects={project} index={projectIndex} />

      {/* CUE · OVERVIEW — TextReveal body copy */}
      <ProjectDetailContent content={project?.content} />

      {/* CUE · GALLERY — existing subgrid gallery (DOM; subgrid intact) */}
      <ProjectGallery projects={project} />

      {/* CUE · NEXT — next case TLink, advances the transport reel */}
      <NextCase title={nextProject?.title} slug={nextProject?.slug.current} />
    </main>
  )
}
