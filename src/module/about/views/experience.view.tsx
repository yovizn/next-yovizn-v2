import { Cue } from '@/components/common/cue'
import { KineticText } from '@/components/animations/text/kinetic.text'
import { ExperienceList } from './experience-detail.view'

/**
 * CUE · EXPERIENCE
 *
 * Typed timeline from experience.constant.ts. Sits in the case-study hairline
 * grid (side gutters + content column). Section header = h2; KineticText is
 * aria-hidden with an sr-only companion.
 */
export function Experience() {
  return (
    <section
      aria-labelledby="experience-heading"
      className="col-span-full grid grid-cols-subgrid gap-px"
    >
      <div className="bg-graphite col-span-1 hidden lg:block" />

      <div className="bg-graphite-2 col-span-full px-6 py-12 lg:col-span-4 lg:px-10 lg:py-16">
        {/* CUE · EXPERIENCE eyebrow */}
        <Cue aria-hidden className="mb-4">
          CUE &nbsp;·&nbsp; EXPERIENCE
        </Cue>

        {/* Section header: KineticText + sr-only h2 companion */}
        <h2 id="experience-heading" className="sr-only">
          Experience
        </h2>

        <div aria-hidden className="mb-10">
          <KineticText
            text="Experience"
            by="char"
            stagger={0.04}
            className="font-nohemi text-paper text-display-lg leading-none font-bold uppercase"
          />
        </div>

        <ExperienceList />
      </div>

      <div className="bg-graphite col-span-1 hidden lg:block" />
    </section>
  )
}
