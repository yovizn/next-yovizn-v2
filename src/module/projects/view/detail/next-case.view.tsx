import { TLink } from '@/components/common/transitionLink'
import { KineticText } from '@/components/animations/text/kinetic.text'

interface NextCaseProps {
  /** Next project title (undefined → last in reel, hide affordance) */
  title: string | undefined
  /** Next project slug.current */
  slug: string | undefined
}

/**
 * CUE · NEXT — "→ next case" affordance framed as advancing the transport reel.
 * Server component; TLink is client-only but renderable from server context.
 */
export function NextCase({ title, slug }: NextCaseProps) {
  if (!title || !slug) return null

  return (
    <section
      aria-label="Next case study"
      className="col-span-full grid grid-cols-subgrid gap-px"
    >
      <div className="bg-graphite col-span-full flex min-h-[32svh] flex-col items-start justify-end gap-4 px-6 pb-12 pt-16 lg:px-10">
        {/* CUE eyebrow */}
        <p
          className="font-data text-paper-dim text-[11px] tracking-[0.12em] uppercase"
          aria-hidden
        >
          CUE &nbsp;·&nbsp; NEXT
        </p>

        {/* Signal divider line */}
        <div className="bg-signal h-px w-8" aria-hidden />

        {/* TLink advances the transport reel */}
        <TLink
          href={`/projects/${slug}`}
          className="group flex items-center gap-4"
          aria-label={`Next case: ${title}`}
        >
          {/* Decorative animated title */}
          <div aria-hidden>
            <KineticText
              text={title}
              by="word"
              stagger={0.06}
              className="font-nohemi text-paper clamp-[text,2xl,6xl] leading-none font-bold uppercase tracking-tight"
            />
          </div>

          {/* Arrow icon — signal color on hover */}
          <span
            className="text-paper-dim group-hover:text-signal shrink-0 transition-colors duration-200"
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
        </TLink>
      </div>
    </section>
  )
}
