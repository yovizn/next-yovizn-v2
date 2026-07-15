'use client'

/**
 * CUE 04 — Selected Work
 *
 * ProjectCard: each card is its own component so CoverDisplace's useMotionValue
 * calls happen at component mount (one per card), not inside a map callback.
 *
 * The cover is now captioned — an ordinal, the real project title (Nohemi), and
 * a mono service · year meta line — over a graphite scrim, matching the
 * studio.freight "work index is type + image" pattern. The accessible name uses
 * the real title (the query now selects it) instead of a slug-derived string.
 */

import Image from 'next/image'
import { CoverDisplace } from '@/components/webgl/cover-displace'
import { KineticText } from '@/components/animations/text/kinetic.text'
import { Cue } from '@/components/common/cue'
import { TLink } from '@/components/common/transitionLink'
import { urlFor } from '@/sanity/lib/image'
import { QueryProjectsOverviewResult } from '@/types/sanity.types'

interface ProjectCardProps {
  project: QueryProjectsOverviewResult[number]
  index: number
}

function ProjectCard({ project, index }: ProjectCardProps) {
  const src = urlFor(project.cover).width(1200).auto('format').url()
  const ordinal = String(index + 1).padStart(2, '0')
  // Slice the year straight off the ISO string. new Date(...).getFullYear() reads
  // the LOCAL timezone, so a date near a year boundary yields a different year on
  // the server (UTC) than the client → hydration mismatch in this 'use client' card.
  const year = project.date.slice(0, 4)

  return (
    <li className="bg-graphite-2 relative aspect-video overflow-clip lg:last:odd:col-span-2 lg:last:odd:aspect-21/9">
      <TLink
        href={`/projects/${project.slug.current}`}
        aria-label={`${project.title} — view project`}
        className="group focus-visible:ring-signal block size-full focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
      >
        <CoverDisplace src={src} className="size-full">
          <Image
            fill
            src={src}
            alt={project.cover.alt}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="size-full object-cover grayscale-100 transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] hover:grayscale-0 motion-reduce:transform-none motion-reduce:transition-none"
          />
        </CoverDisplace>

        {/* Caption overlay — a scrim carries the type so it reads over any cover */}
        <div className="from-graphite/85 to-graphite/10 pointer-events-none absolute inset-0 flex flex-col justify-between bg-linear-to-t via-transparent p-5 lg:p-6">
          <span className="font-data text-paper/80 text-[11px] tracking-[0.12em] tabular-nums">
            {ordinal}
          </span>
          <div className="flex items-end justify-between gap-4">
            <p className="font-nohemi text-paper text-2xl leading-none font-bold uppercase md:text-4xl">
              {project.title}
            </p>
            <p className="font-data text-paper/70 shrink-0 text-[11px] tracking-[0.12em] uppercase">
              {project.service}&nbsp;·&nbsp;{year}
            </p>
          </div>
        </div>
      </TLink>
    </li>
  )
}

export function Projects({ data }: { data: QueryProjectsOverviewResult }) {
  return (
    <section
      aria-labelledby="projects-heading"
      // KEEP IN SYNC with the eyebrow below — TransportRail scroll-spies data-cue.
      data-cue="CUE 04 · SELECTED WORK"
      className="col-span-full"
    >
      {/* CUE 04 eyebrow — mirrors data-cue on the <section> (TransportRail reads it) */}
      <Cue aria-hidden className="px-6 pt-16 pb-4 lg:px-10">
        CUE 04 &nbsp;·&nbsp; SELECTED WORK
      </Cue>

      {/* Section header: sr-only first, KineticText second (a11y requirement) */}
      <h2 id="projects-heading" className="sr-only">
        Selected Work
      </h2>
      <div aria-hidden className="px-6 pb-8 lg:px-10">
        <KineticText
          text="Selected Work"
          by="word"
          stagger={0.06}
          className="font-nohemi text-paper text-display-lg leading-none font-bold uppercase"
        />
      </div>

      {/* Project grid */}
      <ul className="border-hairline grid gap-px border-t lg:grid-cols-2">
        {data.length > 0 ? (
          data.map((project, index) => (
            <ProjectCard key={project.slug.current} project={project} index={index} />
          ))
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
