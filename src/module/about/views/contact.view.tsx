import { KineticText } from '@/components/animations/text/kinetic.text'
import { GAnchor } from '@/components/common/googleAnchor'

/**
 * CUE · CONTACT
 *
 * Large mono mailto CTA — mirrors home contact.view.tsx.
 * KineticText renders the email (aria-hidden, char stagger); sr-only
 * companion inside the <a> satisfies a11y. Section header = h2.
 */
export function AboutContact() {
  return (
    <section aria-labelledby="about-contact-heading" className="col-span-full">
      {/* CUE · CONTACT eyebrow */}
      <p
        className="font-data text-paper-dim px-6 pt-16 pb-4 text-[11px] tracking-[0.12em] uppercase lg:px-10"
        aria-hidden
      >
        CUE &nbsp;·&nbsp; CONTACT
      </p>

      {/* Section header */}
      <h2 id="about-contact-heading" className="sr-only">
        Contact
      </h2>

      <div className="bg-graphite-2 border-graphite-2 border-t px-6 py-20 lg:px-10 lg:py-28">
        <GAnchor
          href="mailto:contact@yovizn.com"
          className="group block"
          aria-label="Send email to contact@yovizn.com"
        >
          {/* Visible KineticText — aria-hidden, decorative char stagger */}
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
