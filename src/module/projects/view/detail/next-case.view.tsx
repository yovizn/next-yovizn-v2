import Image from 'next/image'

import { Cue } from '@/components/common/cue'
import { CoverDisplace } from '@/components/webgl/cover-displace'
import { KineticText } from '@/components/animations/text/kinetic.text'
import { TLink } from '@/components/common/transitionLink'
import { urlFor } from '@/sanity/lib/image'
import { QueryProjectsAllResult } from '@/types/sanity.types'

interface NextCaseProps {
  /** Next project title (undefined → last in reel, hide affordance) */
  title: string | undefined
  /** Next project slug.current */
  slug: string | undefined
  /** Next project cover — dimmed teaser behind the title */
  cover: QueryProjectsAllResult[number]['cover'] | undefined
}

/**
 * CUE · NEXT — full-bleed "advance the reel" affordance. The next project's
 * cover sits dimmed behind the display title (CoverDisplace, with its SSR Image
 * fallback), under a graphite scrim for legibility.
 */
export function NextCase({ title, slug, cover }: NextCaseProps) {
  if (!title || !slug) return null

  const coverSrc = cover ? urlFor(cover).width(1600).auto('format').url() : null

  return (
    <section aria-label="Next case study" className="col-span-full grid grid-cols-subgrid gap-px">
      <div className="bg-graphite relative col-span-full min-h-[60svh] overflow-clip">
        {/* Dimmed cover teaser */}
        {coverSrc && (
          <div className="absolute inset-0 opacity-30" aria-hidden>
            <CoverDisplace src={coverSrc} className="size-full">
              <Image fill src={coverSrc} alt="" sizes="100vw" className="size-full object-cover" />
            </CoverDisplace>
          </div>
        )}
        {/* Scrim — keeps the type legible over any cover */}
        <div
          className="from-graphite via-graphite/50 pointer-events-none absolute inset-0 bg-linear-to-t to-transparent"
          aria-hidden
        />

        <TLink
          href={`/projects/${slug}`}
          className="group relative flex min-h-[60svh] flex-col items-start justify-end gap-4 px-6 pt-16 pb-12 lg:px-10"
          aria-label={`Next case: ${title}`}
        >
          {/* Progress cue — signal tick + mono label */}
          <div className="flex items-center gap-3">
            <span className="bg-signal h-px w-8" aria-hidden />
            <Cue aria-hidden>Next Case</Cue>
          </div>

          <div aria-hidden className="flex items-center gap-4">
            <KineticText
              text={title}
              by="word"
              stagger={0.06}
              className="font-nohemi text-paper text-display-lg leading-none font-bold uppercase tracking-tight"
            />
            <span
              className="text-paper-dim group-hover:text-signal ease-out-quint shrink-0 transition-[color,transform] duration-300 group-hover:translate-x-2"
              aria-hidden
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
                <path
                  d="M6 26L26 6M26 6H12M26 6V20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </TLink>
      </div>
    </section>
  )
}
