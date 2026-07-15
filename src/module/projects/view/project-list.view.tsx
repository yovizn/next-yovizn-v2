'use client'

/**
 * CUE · INDEX — Projects reel
 *
 * Per-row CoverDisplace (option b) — each ProjectRow is its own component
 * so CoverDisplace's useMotionValue calls happen at component mount
 * (one per row), never inside a .map() callback.
 *
 * Cover-hover approach chosen: per-row <CoverDisplace> (option b).
 * Rationale: reuses the shipped primitive as-is; no new swap-renderer code
 * needed (cover-displace.tsx's own note flags that changing src on a single
 * monitor-panel renderer tears down + rebuilds the canvas — that variant
 * doesn't exist yet). With 4 projects the per-row cost is negligible.
 * The design brief's monitor-panel is noted as the intended long-term form,
 * but option (b) is the clean path given current primitives.
 *
 * Zero-JS: rows are TLink <a> anchors; Image is always rendered as the SSR
 * static fallback inside CoverDisplace's children. Layout does not shift
 * when WebGL activates (canvas overlays the Image, same slot).
 */

import Image from 'next/image'

import { CoverDisplace } from '@/components/webgl/cover-displace'
import { TLink } from '@/components/common/transitionLink'
import { urlFor } from '@/sanity/lib/image'
import { QueryProjectsAllResult } from '@/types/sanity.types'

// ── Shared image sizes hint ───────────────────────────────────────────────────
const COVER_SIZES = '(max-width: 640px) 160px, (max-width: 1024px) 220px, 280px'

interface ProjectRowProps {
  project: QueryProjectsAllResult[number]
  index: number
}

/**
 * Single project row — owns its own <CoverDisplace> so MotionValues are
 * created at component mount, not inside the parent's .map() callback.
 */
function ProjectRow({ project, index }: ProjectRowProps) {
  const src = urlFor(project.cover).width(600).auto('format').url()
  const idx = String(index + 1).padStart(2, '0')

  return (
    <li className="border-hairline border-t first:border-t-0">
      <TLink
        href={`/projects/${project.slug.current}`}
        className="group hover:bg-graphite-2 flex items-center gap-4 px-6 py-6 transition-colors duration-300 lg:px-10 lg:py-8"
      >
        {/* Index — mono instrument readout */}
        <span
          className="font-data text-paper-dim w-8 shrink-0 text-[11px] leading-none tracking-[0.1em] select-none"
          aria-hidden
        >
          {idx}
        </span>

        {/* Project title — slides right on hover (ease-out-quint) */}
        <span className="font-nohemi text-paper text-display-md ease-out-quint min-w-0 flex-1 leading-none font-bold uppercase transition-transform duration-500 group-hover:translate-x-2">
          {project.title}
        </span>

        {/* Service tag — mono instrument label */}
        <span className="font-data text-paper-dim hidden shrink-0 text-[11px] tracking-[0.12em] uppercase md:block">
          {project.service}
        </span>

        {/* Arrow affordance — slides with the title, warms to signal */}
        <span
          className="text-paper-dim group-hover:text-signal ease-out-quint shrink-0 transition-[color,transform] duration-300 group-hover:translate-x-1"
          aria-hidden
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M4 16L16 4M16 4H8M16 4V12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {/* Per-row cover: CoverDisplace — always rendered as <Image> fallback.
            Visible from md+ (was lg-only) so the tablet reel is not text-only. */}
        <div className="relative ml-4 hidden aspect-video w-40 shrink-0 overflow-clip rounded-sm md:block lg:w-56">
          <CoverDisplace src={src} className="size-full">
            <Image
              fill
              src={src}
              alt={project.cover.alt}
              sizes={COVER_SIZES}
              className="size-full object-cover"
            />
          </CoverDisplace>
        </div>
      </TLink>
    </li>
  )
}

export function ProjectsList({ data }: { data: QueryProjectsAllResult }) {
  return (
    <section
      aria-labelledby="projects-reel-heading"
      className="border-hairline col-span-full border-t px-0"
    >
      {/* Accessible label for the list region */}
      <h2 id="projects-reel-heading" className="sr-only">
        All Projects
      </h2>

      <ul>
        {data.map((project, index) => (
          <ProjectRow key={project.slug.current} project={project} index={index} />
        ))}
      </ul>
    </section>
  )
}
