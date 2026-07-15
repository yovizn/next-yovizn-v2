import { Cue } from '@/components/common/cue'
import { KineticText } from '@/components/animations/text/kinetic.text'

/**
 * CUE · INDEX — Projects hero
 *
 * Server component (no 'use client'). The year is derived at render (ISR
 * revalidation keeps it current) instead of a hardcoded "2025".
 */
export function Hero() {
  const year = new Date().getFullYear()

  return (
    <section
      aria-labelledby="projects-index-heading"
      className="col-span-full flex min-h-[40svh] flex-col items-start justify-end gap-4 px-6 pt-32 pb-12 lg:px-10 lg:pt-40"
    >
      {/* CUE eyebrow — instrument readout, not a heading */}
      <Cue aria-hidden className="leading-none">
        CUE &nbsp;·&nbsp; INDEX
      </Cue>

      {/* Accessible h1 — screen readers get plain text */}
      <h1 id="projects-index-heading" className="sr-only">
        Index / {year}
      </h1>

      {/* KineticText — decorative animated render, aria-hidden */}
      <div aria-hidden>
        <KineticText
          text={`INDEX / ${year}`}
          by="char"
          stagger={0.035}
          className="font-nohemi text-paper text-display-lg leading-none font-bold uppercase tracking-tight"
        />
      </div>
    </section>
  )
}
