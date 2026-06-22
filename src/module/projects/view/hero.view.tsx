import { KineticText } from '@/components/animations/text/kinetic.text'

/**
 * CUE · INDEX — Projects hero
 *
 * Server component (no 'use client'). Renders:
 *   - Mono cue eyebrow (aria-hidden)
 *   - sr-only h1 companion (accessible heading)
 *   - KineticText for "INDEX / 2025" (aria-hidden, decorative reveal)
 */
export function Hero() {
  return (
    <section
      aria-labelledby="projects-index-heading"
      className="col-span-full flex min-h-[40svh] flex-col items-start justify-end gap-4 px-6 pb-12 pt-32 lg:px-10 lg:pt-40"
    >
      {/* CUE eyebrow — instrument readout, not a heading */}
      <p
        className="font-data text-paper-dim text-[11px] leading-none tracking-[0.12em] uppercase"
        aria-hidden
      >
        CUE &nbsp;·&nbsp; INDEX
      </p>

      {/* Accessible h1 — screen readers get plain text */}
      <h1 id="projects-index-heading" className="sr-only">
        Index / 2025
      </h1>

      {/* KineticText — decorative animated render, aria-hidden */}
      <div aria-hidden>
        <KineticText
          text="INDEX / 2025"
          by="char"
          stagger={0.035}
          className="font-nohemi text-paper clamp-[text,3xl,8xl] leading-none font-bold uppercase tracking-tight"
        />
      </div>
    </section>
  )
}
