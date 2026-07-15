'use client'

/**
 * CUE 01 — Hero
 *
 * Full-height opening act: the wordmark is bottom-anchored, with the mono cue
 * pinned to the top and an instrument meta row along the bottom edge. HeroShear
 * contains the sole <h1> in its SSR fallback (the island's children); no
 * additional <h1> or sr-only heading here — HeroShear owns that role.
 */

import { HeroShear } from '@/components/webgl/hero-shear'
import { Cue } from '@/components/common/cue'

export function Hero() {
  return (
    <section
      aria-labelledby="hero-wordmark"
      // data-cue: the TransportRail scroll-spies [data-cue] sections to track the
      // active cue label. KEEP IN SYNC with the eyebrow text just below.
      data-cue="CUE 01 · INDEX"
      className="col-span-full flex min-h-dvh flex-col justify-between gap-8 px-6 pt-32 pb-10 lg:px-10 lg:pt-40"
    >
      {/* CUE 01 eyebrow — mirrors data-cue on the <section> (TransportRail reads it) */}
      <Cue aria-hidden className="leading-none">
        CUE 01 &nbsp;·&nbsp; INDEX
      </Cue>

      {/* Bottom-anchored group: wordmark, subtitle, instrument meta row */}
      <div className="flex flex-col gap-4">
        {/* Wordmark — HeroShear renders the real <h1> internally */}
        <HeroShear />

        {/* Subtitle — mono instrument line, NOT a heading */}
        <p className="font-data text-paper-dim text-sm tracking-[0.18em] uppercase select-none">
          Frontend&nbsp;·&nbsp;Motion&nbsp;Engineer
        </p>

        {/* Instrument meta row pinned to the bottom edge.
            COPY IS A PROPOSAL (location / availability) — confirm before merge. */}
        <div className="border-hairline text-paper-dim mt-4 flex w-full flex-col gap-2 border-t pt-4 font-data text-[11px] tracking-[0.12em] uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>Based in Jakarta &nbsp;·&nbsp; GMT+7</span>
          <span>Available for work</span>
        </div>
      </div>
    </section>
  )
}
