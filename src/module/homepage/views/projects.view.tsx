'use client'

/**
 * CUE 04 — Selected Work
 *
 * ProjectCard: each card is its own component so CoverDisplace's useMotionValue
 * calls happen at component mount (one per card), not inside a map callback.
 * This satisfies the "create MotionValues at component mount, NOT inside a map"
 * requirement.
 *
 * Grayscale decision: REMOVED from the Image className.
 * Rationale: The WebGLIsland canvas is always opaque and full-color at idle
 * (uHover=0). Keeping grayscale-100 only affects the no-JS / coarse-pointer /
 * reduced-motion fallback image — it would create a visual inconsistency where
 * capable devices see color and fallback devices see grayscale. Removing it
 * makes both paths consistent: full-color static cover everywhere.
 */

import Image from 'next/image'
import { CoverDisplace } from '@/components/webgl/cover-displace'
import { KineticText } from '@/components/animations/text/kinetic.text'
import { TLink } from '@/components/common/transitionLink'
import { urlFor } from '@/sanity/lib/image'
import { QueryProjectsOverviewResult } from '@/types/sanity.types'

interface ProjectCardProps {
  project: QueryProjectsOverviewResult[number]
}

function ProjectCard({ project }: ProjectCardProps) {
  const src = urlFor(project.cover).width(1200).auto('format').url()
  // The card is an image-only link; name it by the project (derived from the
  // slug — the overview query omits `title`) so its accessible name announces
  // the destination, not the cover's image description. (WCAG 2.4.4)
  const name = project.slug.current.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <li className="bg-graphite-2 relative aspect-video overflow-clip">
      <TLink
        href={`/projects/${project.slug.current}`}
        aria-label={`${name} — view project`}
        className="group block size-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal"
      >
        <CoverDisplace src={src} className="size-full">
          <Image
            fill
            src={src}
            alt={project.cover.alt}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
          />
        </CoverDisplace>
      </TLink>
    </li>
  )
}

export function Projects({ data }: { data: QueryProjectsOverviewResult }) {
  return (
    <section aria-labelledby="projects-heading" className="col-span-full">
      {/* CUE 04 eyebrow */}
      <p
        className="font-data text-paper-dim px-6 pt-16 pb-4 text-[11px] tracking-[0.12em] uppercase lg:px-10"
        aria-hidden
      >
        CUE 04 &nbsp;·&nbsp; SELECTED WORK
      </p>

      {/* Section header: sr-only first, KineticText second (a11y requirement) */}
      <h2 id="projects-heading" className="sr-only">
        Selected Work
      </h2>
      <div aria-hidden className="px-6 pb-8 lg:px-10">
        <KineticText
          text="Selected Work"
          by="word"
          stagger={0.06}
          className="font-nohemi text-paper clamp-[text,3xl,7xl] leading-none font-bold uppercase"
        />
      </div>

      {/* Project grid */}
      <ul className="border-graphite-2 grid gap-px border-t lg:grid-cols-2">
        {data.length > 0 ? (
          data.map((project) => <ProjectCard key={project.slug.current} project={project} />)
        ) : (
          // Empty-state: never leave the heading dangling over a bare border.
          <li className="bg-graphite-2 text-paper-dim font-data flex aspect-video items-center justify-center px-6 text-center text-sm tracking-[0.12em] uppercase lg:col-span-2">
            Selected work coming soon.
          </li>
        )}
      </ul>
    </section>
  )
}
