'use client'

/**
 * CUE 01 — Hero
 *
 * Renders HeroShear (the OGL wordmark shear-field island) + the mono subtitle.
 * HeroShear contains the sole <h1> in its SSR fallback (the island's children).
 * No additional <h1> or sr-only heading here — HeroShear owns that role.
 */

import { HeroShear } from '@/components/webgl/hero-shear'

export function Hero() {
  return (
    <section
      aria-labelledby="hero-wordmark"
      className="col-span-full flex min-h-[60svh] flex-col items-start justify-end gap-4 px-6 pb-16 pt-32 lg:px-10 lg:pt-40"
    >
      {/* CUE 01 eyebrow */}
      <p
        className="font-data text-paper-dim text-[11px] leading-none tracking-[0.12em] uppercase"
        aria-hidden
      >
        CUE 01 &nbsp;·&nbsp; INDEX
      </p>

      {/* Wordmark — HeroShear renders the real <h1> internally */}
      <HeroShear />

      {/* Subtitle — mono instrument line, NOT a heading */}
      <p className="font-data text-paper-dim text-sm tracking-[0.18em] uppercase select-none">
        Frontend&nbsp;·&nbsp;Motion&nbsp;Engineer
      </p>
    </section>
  )
}
