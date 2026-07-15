import { Cue } from '@/components/common/cue'
import { KineticText } from '@/components/animations/text/kinetic.text'
import HoverText from '@/components/animations/text/hover.text'
import { GAnchor } from '@/components/common/googleAnchor'
import { LocalTime } from '@/components/animations/number/local-time'

/**
 * CUE 05 — Contact
 *
 * The closing act: a Nohemi display line, the mailto CTA with the HoverText
 * roller, an availability line, and the live GMT+7 readout. The visible display
 * text is aria-hidden/decorative; the <a> carries the real accessible name.
 * COPY ("Let's build" / availability) is a proposal — confirm before merge.
 */
export function Contact() {
  return (
    <section
      aria-labelledby="contact-heading"
      // KEEP IN SYNC with the eyebrow below — TransportRail scroll-spies data-cue.
      data-cue="CUE 05 · CONTACT"
      className="col-span-full"
    >
      <Cue aria-hidden className="px-6 pt-16 pb-4 lg:px-10">
        CUE 05 &nbsp;·&nbsp; CONTACT
      </Cue>

      <h2 id="contact-heading" className="sr-only">
        Contact
      </h2>

      <div className="bg-graphite-2 border-hairline flex flex-col gap-10 border-t px-6 py-20 lg:px-10 lg:py-28">
        <div aria-hidden>
          <KineticText
            text="Let's build"
            by="word"
            stagger={0.06}
            className="font-nohemi text-paper text-display-xl leading-none font-bold uppercase"
          />
        </div>

        <GAnchor
          href="mailto:contact@yovizn.com"
          className="group text-paper hover:text-signal w-fit font-data text-lg tracking-[0.06em] uppercase transition-colors duration-300 md:text-2xl"
          aria-label="Send email to contact@yovizn.com"
        >
          <HoverText>contact@yovizn.com</HoverText>
        </GAnchor>

        <div className="border-hairline flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-data text-paper-dim text-[11px] tracking-[0.12em] uppercase">
            Available for work &nbsp;·&nbsp; Remote / Jakarta
          </span>
          <LocalTime />
        </div>
      </div>
    </section>
  )
}
