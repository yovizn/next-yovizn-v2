import { KineticText } from '@/components/animations/text/kinetic.text'
import { GAnchor } from '@/components/common/googleAnchor'

/**
 * CUE 05 — Contact
 *
 * Large mono CTA: contact@yovizn.com.
 * KineticText renders the email display (aria-hidden, char stagger).
 * The <a> element is always in the DOM for a11y and no-JS fallback.
 */
export function Contact() {
  return (
    <section
      aria-labelledby="contact-heading"
      // KEEP IN SYNC with the eyebrow below — TransportRail scroll-spies data-cue.
      data-cue="CUE 05 · CONTACT"
      className="col-span-full"
    >
      {/* CUE 05 eyebrow — mirrors data-cue on the <section> (TransportRail reads it) */}
      <p
        className="font-data text-paper-dim px-6 pt-16 pb-4 text-[11px] tracking-[0.12em] uppercase lg:px-10"
        aria-hidden
      >
        CUE 05 &nbsp;·&nbsp; CONTACT
      </p>

      {/* Section header: sr-only companion (a11y requirement for KineticText) */}
      <h2 id="contact-heading" className="sr-only">
        Contact
      </h2>

      <div className="bg-graphite-2 border-graphite-2 border-t px-6 py-20 lg:px-10 lg:py-28">
        {/* sr-only anchor is the real interactive + a11y element */}
        <GAnchor
          href="mailto:contact@yovizn.com"
          className="group block"
          aria-label="Send email to contact@yovizn.com"
        >
          {/* Visible KineticText — aria-hidden, decorative stagger */}
          <div aria-hidden>
            <KineticText
              text="contact@yovizn.com"
              by="char"
              stagger={0.025}
              className="font-data text-paper clamp-[text,xl,5xl] leading-none tracking-tight transition-colors duration-300 group-hover:text-signal"
            />
          </div>
          {/* sr-only fallback text inside the link */}
          <span className="sr-only">contact@yovizn.com</span>
        </GAnchor>
      </div>
    </section>
  )
}
