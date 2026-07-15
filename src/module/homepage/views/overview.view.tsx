import { KineticText } from '@/components/animations/text/kinetic.text'
import { TextReveal } from '@/components/animations/text/reveal.text'
import { OverviewImage } from './overview-image.view'

export function Overview() {
  return (
    <section
      aria-labelledby="overview-heading"
      // KEEP IN SYNC with the eyebrow below — TransportRail scroll-spies data-cue.
      data-cue="CUE 02 · OVERVIEW"
      className="col-span-full"
    >
      {/* CUE 02 eyebrow — mirrors data-cue on the <section> (TransportRail reads it) */}
      <p
        className="font-data text-paper-dim px-6 pt-16 pb-4 text-[11px] tracking-[0.12em] uppercase lg:px-10"
        aria-hidden
      >
        CUE 02 &nbsp;·&nbsp; OVERVIEW
      </p>

      <div className="bg-graphite-2 relative grid grid-cols-1 gap-px lg:grid-cols-2">
        {/* Copy column */}
        <div className="px-6 py-12 lg:px-10 lg:py-16">
          {/* Section header: KineticText + sr-only companion (a11y requirement) */}
          <h2 id="overview-heading" className="sr-only">
            Hello, I&apos;m Yovi.
          </h2>
          <div aria-hidden className="mb-6">
            <KineticText
              text="Hello, I'm Yovi."
              by="word"
              stagger={0.08}
              className="font-sans text-paper clamp-[text,2xl,5xl] leading-none font-bold"
            />
          </div>

          <p className="text-paper sr-only">
            I&apos;m a front-end developer who loves working on web interactions, responsive
            design, and slick animations. Still got a lot to learn, but hey—we all start somewhere.
          </p>

          <div aria-hidden className="font-sans text-paper clamp-[text,base,xl] font-medium">
            <TextReveal
              text="I'm a front-end developer who loves working on web interactions, responsive design, and slick animations. Still got a lot to learn, but hey—we all start somewhere."
              highlight={['start somewhere.']}
              amount={[40, 50]}
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
