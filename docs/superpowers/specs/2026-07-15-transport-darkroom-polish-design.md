# TRANSPORT v3.1 — Darkroom Polish & Font System

**Date:** 2026-07-15
**Status:** Approved design, pending implementation plan
**Decisions locked:** Darkroom mode (darkroom.engineering register) · Full polish scope · Satoshi font swap

## 1. Context

The site is a dark-only "TRANSPORT" instrument-panel concept: graphite surfaces cut by 1px
hairline seams, Nohemi Bold uppercase display type, an 11px tracked Geist Mono kicker system,
one signal orange accent, and a studio-grade motion stack (single Motion RAF driving Lenis,
dual-lerp cursor, two OGL shader islands). A six-agent audit (2026-07-15) found the concept
strong but the execution half-consolidated: two competing color-token systems, three competing
hero type scales, semantically inverted easing names, display type capping below genre size,
several generic sections, ~40% dead motion primitives, and an unlicensed HelveticaNeueCyr
subset serving as the body face.

This spec polishes the site toward the darkroom.engineering aesthetic without replacing its
identity: the existing TRANSPORT concept is the design language; the work is consolidation,
scale, and sharpening.

## 2. Typography system

Three voices, three families (down from four):

| Voice | Family | Weights | Loading | Used for |
| --- | --- | --- | --- | --- |
| Display | Nohemi Bold (kept) | 700 | local woff2 (19KB) | Wordmark, section headers, page heroes, menu links, footer headline, transition label, next-case, contact CTA |
| Body | Satoshi Variable (new) | 400–700 variable | local variable woff2, `next/font/local` with `weight: "300 900"` | Ledes, about body, case-study prose, `--font-sans` default |
| Instrument | Geist Mono (kept) | variable | `next/font/google` | CUE eyebrows, meta rows, rail readouts, buttons, email CTAs, marquee, time readout |

### 2.1 Font acquisition & wiring

- Download Satoshi from Fontshare (`https://api.fontshare.com/v2/fonts/download/satoshi`),
  extract `Satoshi-Variable.woff2` into `src/fonts/Satoshi/`, add a `LICENSE.md` noting the
  Fontshare Free Font License (free for personal/commercial use, self-hosting allowed, no
  redistribution of the files alone).
- New loader `src/fonts/Satoshi/index.ts` (`--font-satoshi`, `display: "swap"`).
- **Delete** `src/fonts/Helvetica/` (all three woff2 + loader) and the Geist Sans import in
  `src/fonts/index.ts`. `fontVariables` becomes Satoshi + Geist Mono + Nohemi.
- In `src/styles/globals.css` `@theme`: `--font-sans: var(--font-satoshi)`; remove
  `--font-helvetica`; keep `--font-mono`/`--font-data` → Geist Mono, `--font-nohemi` as is.
- Fix the h1–h6 rule: font-family becomes `var(--font-sans)` with a **sans-serif** fallback
  stack (the current fallback is monospace — a bug).

### 2.2 `font-helvetica` call-site migration map

Every `font-helvetica` class site migrates by role:

- → **Nohemi** (display role): menu links (`menu/index.tsx`), MENU/CLOSE roller
  (`button.menu.tsx`), page-transition destination label (`page.transition.tsx`).
- → **Satoshi** (`font-sans`, body role): about ledes/body (`about/views/*`), homepage
  overview body (`overview.view.tsx`), portable text (`portableText.tsx`), any remaining
  lede/paragraph sites.

`rg 'font-helvetica'` must return zero hits when done; `rg 'font-sans'` sites are audited so
none accidentally regress to a generic voice.

### 2.3 Type scale tokens

Replace the three competing scales (`.text-hero`, `--font-sz`/`.text-fixed`, ad-hoc
`clamp-[…]` display calls) with named `@theme` tokens generating Tailwind utilities:

```css
@theme {
  --text-display-xl: clamp(3rem, 10vw, 11rem);      /* hero wordmark, footer, menu links */
  --text-display-xl--line-height: 0.85;
  --text-display-lg: clamp(2.5rem, 7.5vw, 8.5rem);  /* page heroes, section headers */
  --text-display-lg--line-height: 0.9;
  --text-display-md: clamp(1.75rem, 4.5vw, 5rem);   /* reel rows, case titles, contact email */
  --text-display-md--line-height: 0.95;
}
```

- Migrate display call sites to these utilities; `tailwind-clamp` remains for body-size
  one-offs only.
- Scale-ups: projects/about heroes 8xl→`display-lg`; reel row titles 4xl→`display-md`;
  menu links fixed 3rem→`display-xl`; case titles→`display-md` or `lg` by length.
- Delete `.text-hero`, `.text-fixed`, `--font-sz` after migration (`.text-fixed`/`about-clip`
  usages re-checked before deletion; if used, migrate them first).
- Kicker spec is standardized by the `<Cue>` primitive (§6.2): `font-data text-[11px]
  tracking-[0.12em] uppercase text-paper-dim`.

### 2.4 WebGL raster verification

`hero-shear-canvas.tsx` rasterizes the wordmark's *computed* styles, so the display face is
unchanged (Nohemi stays), but hero metrics must be visually verified after the type-token
migration at prod build.

## 3. Color: one palette, one source

TRANSPORT becomes the only system. Migration then deletion of legacy oklch tokens:

| Legacy usage | Becomes |
| --- | --- |
| `body { background: oklch(var(--background)) }` | `background: var(--graphite)` (kills the two-blacks bug) |
| `::selection` accent/primary | signal background, graphite text |
| Layout wrapper `bg-accent/5` (`(main)/layout.tsx`) | hairline token or removed |
| Footer seams `bg-accent/5`, menu dividers `bg-background/20`, reel `border-paper/10`, rail `border-graphite-2` | one `--color-hairline` token (paper at ~10% over graphite) used everywhere |
| Menu overlay `bg-foreground text-background` | `bg-paper text-graphite` (keeps the inversion, on-palette) |
| TextReveal highlight `text-primary` | `text-signal` |
| Cursor bubble / scroll bar `bg-primary` | `bg-paper` (or signal where emphasis is wanted) |

- Delete `--background/--foreground/--accent/--primary/--secondary` and their `@theme`
  bindings once `rg` confirms zero remaining usages.
- New `src/lib/constants/palette.constant.ts` exports `GRAPHITE/GRAPHITE_2/PAPER/PAPER_DIM/
  SIGNAL/PHOSPHOR` hex values; `hero-shear-canvas.tsx`, `displacement-canvas.tsx`, and
  `firstRender.variant.ts` import from it instead of hardcoding. `globals.css` values carry a
  comment pointing at the constant as the paired source.
- Site remains dark-only; that decision is now documented here rather than implicit.

## 4. Motion system

### 4.1 Easing rename (semantic correction)

| New name | Curve | Old (wrong) name | Role |
| --- | --- | --- | --- |
| `easing.out` | `[0.22, 1, 0.36, 1]` (out-quint) | `easing.in` | All entrance reveals — sharp attack |
| `easing.inOut` | `[0.76, 0, 0.24, 1]` (in-out-quart) | `easing.out` | Wipes, covers, roller swaps |
| `easing.outSoft` | `[0.215, 0.61, 0.355, 1]` (out-cubic) | `easing.inOut` | Gentle secondary motion |
| `easing.in` | `[0.64, 0, 0.78, 0]` (in-quint, new) | — | Exits |

Every consumer in `variants/*.ts` and animation components is re-audited against role, not
mechanically renamed: text reveals (KineticText/TextReveal/TextBlur) use `out`; menu/page
wipes use `inOut`; exits use `in` or `inOut`. Expected feel change: reveals attack sharply
instead of easing in softly.

### 4.2 CSS bridge & duration discipline

- `@theme`: `--ease-out-quint`, `--ease-in-out-quart`, `--duration-short: 300ms`,
  `--duration-medium: 500ms`, `--duration-long: 800ms`. Hot CSS-transition sites (reel rows,
  hovers currently on Tailwind defaults) migrate to these utilities.
- Ad-hoc duration arithmetic (`duration.medium+0.45`, `*1.2`, hardcoded 1s/0.75s/1.5s) is
  consolidated onto the scale where feel allows; deliberate exceptions get a comment.
- The six scattered lerp factors (0.04–0.1) are gathered into a named `lerp` constant object
  in `animation.constant.ts` (values unchanged — this is discoverability, not retuning).

### 4.3 Page transition

Replace the 10px backdrop-blur + opacity fade with a hard clip-path panel wipe using the
shared `clipPath` polygons, destination label in Nohemi. **The phase state machine — deferred
`router.push` behind the opaque cover, popstate recovery, 6s/4s backstops, reduced-motion
bail-out — is not modified.** Only the cover's visual variants change
(`pageTransition.variant.ts` + markup in `page.transition.tsx`).

## 5. Section redesigns

### 5.1 Homepage

- **Hero** (`hero.view.tsx`): `min-h-[60svh]` → `min-h-dvh`, wordmark bottom-anchored; add a
  mono meta row along the bottom edge (role · location · availability). OGL shear untouched.
- **Overview** (`overview.view.tsx`): header joins the display system (Nohemi uppercase,
  `display-lg`); body Satoshi. Proposed copy (approve/edit at spec review): headline
  **"MOTION ENGINEER"** context line, body *"Motion engineer building interfaces where type,
  scroll, and shader move as one instrument."* replacing the self-deprecating line. TextReveal
  highlight → signal.
- **Clients** (`company-list.view.tsx`): logo-wall grid → seamless transform-only marquee band
  (client names in mono + logos), duplicated-track `x: 0→-50%` loop, `aria-hidden` duplicate,
  paused for reduced motion with a static list fallback. No filler cells.
- **Selected work** (`projects.view.tsx` + `queries.ts`): `queryProjectsOverview` gains
  `title, services, date`; cards get padStart ordinals, Nohemi titles, mono meta row;
  accessible name uses the real title. CoverDisplace unchanged.
- **Contact** (`contact.view.tsx`): Nohemi `display-lg/xl` close, mono availability line, and
  a live GMT+7 time readout resurrecting `SlidingNumber` (client island, mono, `tabular-nums`).

### 5.2 Projects index & case study

- **Index hero** (`view/hero.view.tsx`): "INDEX / 2025" derived from build-time year; hero
  scales to `display-lg`, stays bottom-anchored.
- **Reel rows** (`project-list.view.tsx`): titles → `display-md`; genre-signature
  cursor-following image preview on fine pointers (MotionValue-lerped, shared frame loop, no
  new rAF), title x-shift + arrow slide on hover, hairline token borders; thumbnails become
  visible below `lg`.
- **Case hero/content** (`detail/hero.view.tsx`, `detail/content.view.tsx`): single 11px meta
  line → mono meta grid (CLIENT / ROLE / STACK / YEAR columns on the hairline grid); prose
  drops `prose-sm lg:prose-xl` defaults for art-directed Satoshi (measured `max-w`, lede
  treatment, paper for body / paper-dim for captions).
- **Gallery** (`detail/gallery.view.tsx`): clip-inset + scale (1.04→1) in-view reveals with
  stagger; subtle `useParallax` on full-bleed items; sticky gallery bar z-index checked
  against site chrome. Ruler-tick divider styles deduplicated into one component.
- **NextCase** (`detail/next-case.view.tsx`): full-bleed band with a CoverDisplace cover
  teaser and mono progress cue, title at `display-lg`.

### 5.3 About

- Adopt the case-study hairline grid: parent `grid-cols-4 gap-px lg:grid-cols-6` + subgrid
  sections, making the existing `col-span-full` classes real instead of dead.
- Portrait: full-contrast CoverDisplace in a framed grid cell instead of the `opacity-30`
  background wash.
- Experience rows keep their data (skills + years) and signal-edge reveal; typography moves
  onto the token scale. Content changes (roles/companies) are **out of scope**.

## 6. Chrome & primitives

### 6.1 Chrome

- **Header socials** (`social.header.tsx`): mono 11px tracked uppercase spec + HoverText
  roller-flip; curved exits replace the 0.1s linear pops.
- **Menu** (`menu/index.tsx` + variants): full-height (`h-dvh`) at all viewports (removes the
  `lg:h-[412px]` magic number), links in Nohemi `display-xl`, keep the clip-path wipe +
  140px stagger choreography.
- **Footer** (`footer/index.tsx`): CTA gets the roller-flip hover; stock lucide arrow →
  custom SVG primitive; seams on the hairline token; invalid `div`-inside-`h3` fixed.
- **OG images** (all three `opengraph-image.tsx`): graphite background, paper logo, signal
  accent. No text → no font embedding needed.

### 6.2 Primitives

- **`<Cue>`**: shared kicker primitive (label + optional index, standardized tracking/padding)
  replacing the 8+ copy-pasted eyebrow blocks.
- **`HoverText`**: the empty stub becomes a real roller-flip (two stacked labels in an
  `overflow-clip` mask, translateY swap on `group-hover`, `aria-hidden` duplicate). Used by
  header socials, menu links, footer CTA.
- **`button.tsx`**: real cva variants (`primary` and `ghost`, mono uppercase, sharp
  `rounded-sm` to match the site's edge language), remove the focus-ring kill so the global
  signal `:focus-visible` ring applies. Existing call sites keep working.
- **Dead code deleted**: `pin.tsx`, `scroll-progress-bar.tsx`, `useScrollProgress.ts`,
  `header-1.tsx`, `.tailwind:is(.bg-background)` hack. `slidingNumber.tsx` (+`digit`/`number`)
  is *kept and mounted* by the contact time readout. Lucide stays, locked to
  `strokeWidth={1.5}` everywhere it renders.

## 7. Data & copy

- **Sanity**: only `queryProjectsOverview` changes (adds existing fields to the projection).
  No schema changes, no studio changes. ISR/tag revalidation untouched.
- **Copy**: Overview headline/body per §5.1; hero meta row and contact availability line
  copy proposed at implementation review. All copy shown to the user before merge; voice is
  stark editorial, uppercase for display, no self-deprecation.

## 8. Protected invariants (do not break)

1. **Single-RAF architecture** — Motion `frame.update` drives Lenis (`autoRaf: false`), the
   cursor, and both OGL loops. No new `requestAnimationFrame`, no `useSpring` on scroll values.
2. **Page-transition state machine** — deferred push, popstate recovery, 6s/4s backstops,
   reduced-motion bail. Restyle only.
3. **`useScrollControl` + Lenis stop/`overflow: clip` locking** — the site of the prior
   prod-only bug (commits `6ba8023`, `7626e22`).
4. **WebGLIsland contract** — lazy import, IO pre-mount, capability gates, DPR cap 2,
   disposal, SSR fallbacks always in the DOM.
5. **Deliberate split gating** — Lenis JS-gated (DeviceChrome), cursor CSS-gated
   (`@media (pointer: coarse)`).
6. **A11y conventions** — sr-only companions for every aria-hidden kinetic element,
   per-primitive reduced-motion handling + global kill-switch, signal `:focus-visible` ring.
7. **Cookie-gated first-render intro** and Sanity ISR/tag revalidation flow.

## 9. Verification

- `bun run lint` + `tsc --noEmit` clean.
- **Production build verification is mandatory** (`next build && next start`) — repo memory:
  transition/scroll bugs are invisible in dev. Chrome DevTools MCP drive-through: navigate all
  four routes via the page transition (including browser back), open/close the menu, confirm
  scroll never stays locked, screenshot every page at 390px and 1440px.
- Reduced-motion pass (emulate `prefers-reduced-motion`) and coarse-pointer sanity check.
- Font checks: no FOUT flash of wrong family, hero raster metrics correct, `rg
  'font-helvetica|--font-geist-sans'` returns zero, OG images render on-palette.
- Bundle sanity: confirm Helvetica/Geist Sans no longer in the font payload.

## 10. Out of scope

- Light theme / `prefers-color-scheme` support (dark-only is a documented decision).
- Sanity schema or studio changes; experience-content rewrites (roles/companies).
- New WebGL effects; GSAP; replacing Nohemi.
- Lenis retuning (lerp/duration already in the right register).
