import { Cue } from '@/components/common/cue'
import { KineticText } from '@/components/animations/text/kinetic.text'
import { TextReveal } from '@/components/animations/text/reveal.text'
import { OverviewImage } from './overview-image.view'

const OVERVIEW_BODY =
  'Motion engineer building interfaces where type, scroll, and shader move as one instrument. Front-end developer focused on web interactions, responsive layout, and precise animation.'

export function Overview() {
  return (
    <section
      aria-labelledby="overview-heading"
      // KEEP IN SYNC with the eyebrow below — TransportRail scroll-spies data-cue.
      data-cue="CUE 02 · OVERVIEW"
      className="col-span-full"
    >
      {/* CUE 02 eyebrow — mirrors data-cue on the <section> (TransportRail reads it) */}
      <Cue aria-hidden className="px-6 pt-16 pb-4 lg:px-10">
        CUE 02 &nbsp;·&nbsp; OVERVIEW
      </Cue>

      <div className="bg-graphite-2 relative grid grid-cols-1 gap-px lg:grid-cols-2">
        {/* Copy column */}
        <div className="px-6 py-12 lg:px-10 lg:py-16">
          {/* Section header: KineticText + sr-only companion (a11y requirement) */}
          <h2 id="overview-heading" className="sr-only">
            Motion Engineer
          </h2>
          <div aria-hidden className="mb-6">
            <KineticText
              text="Motion Engineer"
              by="word"
              stagger={0.08}
              className="font-nohemi text-paper text-display-lg leading-none font-bold uppercase"
            />
          </div>

          <p className="text-paper sr-only">{OVERVIEW_BODY}</p>

          <div aria-hidden className="font-sans text-paper clamp-[text,base,xl] font-medium">
            <TextReveal
              text={OVERVIEW_BODY}
              highlight={['one instrument.']}
              amount={[42, 55]}
              delay={0.3}
              scrollReveal
            />
          </div>
        </div>

        {/* Portrait column */}
        <OverviewImage />
      </div>
    </section>
  )
}
