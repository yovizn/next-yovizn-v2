import Image from 'next/image'

import { Cue } from '@/components/common/cue'
import { KineticText } from '@/components/animations/text/kinetic.text'
import { CoverDisplace } from '@/components/webgl/cover-displace'
import { urlFor } from '@/sanity/lib/image'
import { QueryProjectsBySlugResult } from '@/types/sanity.types'

interface HeroProps {
  projects: QueryProjectsBySlugResult
  /** 1-based index of this project in the date-ordered reel (drives `01 /` cue) */
  index: number
}

export function Hero({ projects, index }: HeroProps) {
  if (!projects) return null

  const idx = String(index).padStart(2, '0')
  const year = new Date(projects.date).getFullYear()
  const clientName = projects.client?.name ?? '—'

  const coverSrc = urlFor(projects.cover).width(1200).auto('format').url()

  return (
    <section
      aria-labelledby="project-detail-heading"
      className="col-span-full grid grid-cols-subgrid gap-px"
    >
      {/* ── CUE header row ────────────────────────────────────────────── */}
      <div className="col-span-full flex min-h-[40svh] flex-col items-start justify-end gap-4 px-6 pt-32 pb-12 lg:px-10 lg:pt-40">
        {/* CUE eyebrow */}
        <Cue aria-hidden className="leading-none">
          CUE &nbsp;·&nbsp; CASE
        </Cue>

        {/* Accessible h1 — project title only (no index; one page heading) */}
        <h1 id="project-detail-heading" className="sr-only">
          {projects.title}
        </h1>

        {/* Decorative cue line — aria-hidden: mono index + Nohemi title */}
        <div aria-hidden className="flex items-baseline gap-3">
          {/* Mono index — instrument readout voice */}
          <span className="font-data text-paper-dim clamp-[text,sm,xl] leading-none tracking-[0.1em]">
            {idx} /
          </span>
          {/* Nohemi display title — KineticText char stagger */}
          <KineticText
            text={projects.title}
            by="char"
            stagger={0.03}
            className="font-nohemi text-paper text-display-md leading-none font-bold uppercase tracking-tight"
          />
        </div>

        {/* Meta grid — CLIENT / SERVICE / YEAR as labelled columns (real schema
            fields only; no invented role/stack). dl/dt/dd keeps it accessible. */}
        <dl className="border-hairline mt-2 grid w-full max-w-2xl grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <dt className="font-data text-paper-dim text-[11px] tracking-[0.12em] uppercase">
              Client
            </dt>
            <dd className="font-data text-paper text-sm">{clientName}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="font-data text-paper-dim text-[11px] tracking-[0.12em] uppercase">
              Service
            </dt>
            <dd className="font-data text-paper text-sm">{projects.service}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="font-data text-paper-dim text-[11px] tracking-[0.12em] uppercase">
              Year
            </dt>
            <dd className="font-data text-paper text-sm">
              <time dateTime={projects.date}>{year}</time>
            </dd>
          </div>
        </dl>
      </div>

      {/* ── Cover image — CoverDisplace (WebGL hover displacement) ───── */}
      <div className="bg-graphite-2 clamp-[px,0,20,sm,xl] relative col-span-full pb-0">
        <div className="relative aspect-video h-auto w-full overflow-hidden lg:rounded-sm">
          <CoverDisplace src={coverSrc} className="size-full">
            <Image
              src={coverSrc}
              alt={projects.cover.alt}
              fill
              priority
              sizes="(max-width: 640px) 640px,(max-width: 1024px) 1024px,(max-width: 1280px) 1280px, 100vw"
              className="size-full object-cover"
            />
          </CoverDisplace>
        </div>

        <div className="bg-graphite-2 col-span-full h-24 w-full" />
      </div>
    </section>
  )
}
