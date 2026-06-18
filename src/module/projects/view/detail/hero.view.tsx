import Image from 'next/image'

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
      <div className="col-span-full flex min-h-[40svh] flex-col items-start justify-end gap-4 px-6 pb-12 pt-32 lg:px-10 lg:pt-40">
        {/* CUE eyebrow */}
        <p
          className="font-data text-paper-dim text-[11px] leading-none tracking-[0.12em] uppercase"
          aria-hidden
        >
          CUE &nbsp;·&nbsp; CASE
        </p>

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
            className="font-nohemi text-paper clamp-[text,2xl,7xl] leading-none font-bold uppercase tracking-tight"
          />
        </div>

        {/* Meta row — CLIENT · YEAR · SERVICE */}
        <p
          className="font-data text-paper-dim text-[11px] tracking-[0.12em] uppercase"
          aria-label={`Client: ${clientName}, Year: ${year}, Service: ${projects.service}`}
        >
          <span aria-hidden>{clientName}</span>
          <span className="text-signal mx-2" aria-hidden>·</span>
          <span aria-hidden>{year}</span>
          <span className="text-signal mx-2" aria-hidden>·</span>
          <span aria-hidden>{projects.service}</span>
        </p>
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
