import { KineticText } from '@/components/animations/text/kinetic.text'
import { ExperienceList } from './experience-detail.view'

/**
 * CUE · EXPERIENCE
 *
 * Typed timeline from experience.constant.ts — a genuine chronological sequence,
 * so numbered cues carry real ordering information (honest numbering per the brief).
 * Section header = h2; KineticText is aria-hidden with sr-only companion.
 * ExperienceList renders entries with scrollReveal on each row.
 */
export function Experience() {
  return (
    <section aria-labelledby="experience-heading" className="col-span-full">
      {/* CUE · EXPERIENCE eyebrow */}
      <p
        className="font-data text-paper-dim px-6 pt-16 pb-4 text-[11px] tracking-[0.12em] uppercase lg:px-10"
        aria-hidden
      >
        CUE &nbsp;·&nbsp; EXPERIENCE
      </p>

      {/* Section header: KineticText + sr-only h2 companion */}
      <h2 id="experience-heading" className="sr-only">
        Experience
      </h2>

      <div className="bg-graphite-2 border-graphite-2 border-t">
        <div className="px-6 py-12 lg:px-10 lg:py-16">
          <div aria-hidden className="mb-10">
            <KineticText
              text="Experience"
              by="char"
              stagger={0.04}
              className="font-nohemi text-paper clamp-[text,3xl,7xl] leading-none font-bold"
            />
          </div>

          <ExperienceList />
        </div>
      </div>
    </section>
  )
}
