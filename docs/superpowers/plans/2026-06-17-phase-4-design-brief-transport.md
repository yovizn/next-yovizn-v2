# Phase 4 Design Brief — "TRANSPORT"

> The immersive (Direction C) redesign direction for next-yovizn-v2. Produced via the frontend-design skill. This is the **design definition** that unblocks Phase 4 implementation. Alternatives considered: FLUID FIELD (atmospheric shader backdrop — heaviest budget, nearest to generic-WebGL) and SPECIMEN (light, type-led, single WebGL lens). TRANSPORT was chosen as the recommendation.

## 1. Subject & thesis

**Subject:** Yovi Zulkarnaen — a frontend developer whose craft *is* motion, micro-interaction, and timing. **Audience:** design studios, agencies, and discerning clients (and the awwwards jury). **The page's one job:** prove, by being one, that this person makes interfaces that feel alive and precise.

**Thesis:** The site is a **motion instrument**. Scroll is a *transport* — the mechanism that plays the work, like a film/tape transport or a sequencer timeline. The hero does not *claim* "I do animation"; it *demonstrates interpolation* live. Every section is a **cue** on a single reel. Navigation, progress, and timing are surfaced as the interface itself, because timing is the subject.

## 2. Why this isn't a default (anti-cliché check)

The three AI-design tells and how TRANSPORT avoids each:
- **Not cream + serif + terracotta.** Base is warm graphite, display is a geometric *grotesque* (not serif). The warm signal (#FF6A3D) appears **only** as 1–2px instrument lines, small glyphs, and the live timecode digits — never as a terracotta fill or accent surface. It reads as an equipment signal-LED / exposure indicator, not a warm accent field.
- **Not near-black + single acid neon.** Graphite `#17151A` is a deliberate warm-violet near-black (not flat `#000`/`#111`). There is no acid-green/vermilion flood. The only cool, glowing color (`--phosphor`) is reserved exclusively for the WebGL/motion layer — so the warm/cool tension lives in *motion*, not in static chrome.
- **Not broadsheet hairlines.** Structure comes from the **transport/timecode instrument** (a live scrub rail, section indices, easing-curve glyphs), which encodes something true — the timing of the experience — not decorative rules.

## 3. Tokens

### Color — "tungsten on graphite"
| Token | Hex | Role |
|---|---|---|
| `--graphite` | `#17151A` | base / instrument body (warm-violet near-black) |
| `--graphite-2` | `#211E25` | raised surface (rails, cards) |
| `--paper` | `#F2EDE4` | primary type; fill of inverted "exposure" sections |
| `--paper-dim` | `#9A958C` | secondary type, labels, captions |
| `--signal` | `#FF6A3D` | THE live indicator — timecode digits, scrub head, easing glyph. **Lines & glyphs only, never a fill.** |
| `--phosphor` | `#C7F7E9` | cool specular/shear highlight — **WebGL layer only**, never static UI |

Discipline: the static layout is entirely warm (graphite + paper + signal-as-line). The single cool color glows only where motion is *live* (the shader shear, the cover displacement edge). "The body is warm; the live things glow cool."

### Type (all already loaded — zero new font deps)
- **Display — Nohemi** (`next/font/local`): the wordmark and section headers, set huge, tight tracking, heaviest weights. Carries the personality.
- **Body — Helvetica Neue** (`next/font/local`): neutral, recedes.
- **Data — Geist Mono** (`next/font/google`, already loaded): timecode, section indices (`CUE 02`), frame counts, and literal easing labels (`cubic-bezier(.22,1,.36,1)`). The mono is the "instrument readout" voice.

Type scale: a wide modular scale — display ranges from `clamp` ~clamp(3rem, 9vw, 11rem) for the wordmark down through section heads; mono fixed-small (12–13px) for readouts.

## 4. The signature

**The transport rail.** A persistent thin column — **left edge on desktop, bottom bar on mobile** — that runs the entire site and shows, live, driven by `useScrollProgress`:
1. a **timecode** readout (scroll position mapped to a pseudo-runtime, e.g. `00:00:14`) in `--signal` mono;
2. the **current cue** index + name (`CUE 03 · PROJECTS`);
3. a vertical **scrub line** (`<ScrollProgressBar>` reimagined) with a `--signal` scrub head;
4. a small **easing-curve glyph** that *morphs* between sections — the literal cubic-bezier of that section's entrance animation, drawn as a tiny live curve. This is the most "Yovi" object on the site: his craft (easing) made into wayfinding.

Spend the boldness here. Everything else stays quiet.

## 5. Layout & section inventory (per route)

ASCII wireframes (desktop). The transport rail `▏` is persistent on the left of every page.

### Home `/`
```
▏00:00:00          ┌───────────────────────────────────────┐
▏CUE 01            │  ⌁ shear-field island (behind name)    │
▏▔▔▔▔▔             │   Y O V I   Z U L K A R N A E N        │ Nohemi, huge
▏ ●               │   FRONTEND · MOTION ENGINEER  (mono)    │ KineticText in
▏ ┊  scrub        │                                         │
▏ ┊  +easing      └───────────────────────────────────────┘
▏ ┊
▏CUE 02 OVERVIEW   "Hello, I'm Yovi…"  ← TextReveal(scrollReveal)
▏                  parallax portrait (useParallax, existing)
▏
▏CUE 03 CLIENTS    logo wall — kept DOM (SVGs), staggered reveal
▏
▏CUE 04 SELECTED   project cards — cover = WebGL displace on hover
▏                  [Kreasiindo] [Dynamics] [Design by Erson] [Relou]
▏
▏CUE 05 CONTACT    big mono CTA: contact@yovizn.com
```
- **Hero** = the thesis: the wordmark with a small OGL **shear-field island** behind it that displaces the glyphs by scroll velocity (the live interpolation demo). Static fallback = plain wordmark.
- **Clients** stay DOM (they're SVG logos — WebGL is wrong for them).
- **Selected work** cards get the **cover hover-displacement** WebGL island.

### Projects index `/projects`
```
▏CUE · INDEX       I N D E X  /  2025
▏                  a vertical reel of project rows:
▏ ●               ┌─ 01  KREASIINDO ENERGI PRATAMA  ─ ENERGY ─→
▏ ┊  scrub        ├─ 02  DYNAMICS MANAGEMENT          ─ SAAS   ─→
▏ ┊               ├─ 03  DESIGN BY ERSON              ─ BRAND  ─→
▏                 └─ 04  RELOU IDN                     ─ COMMERCE ─→
▏                  hovering a row = its cover displaces in a
▏                  fixed "monitor" panel on the right (WebGL).
```
Row hover drives the **one** displacement island in a fixed preview panel (reuses the existing `RenderCursor` cover idea, upgraded). Breadcrumb JSON-LD (Phase 0) unchanged.

### Project detail `/projects/[slug]`
```
▏CUE · CASE        01 / KREASIINDO ENERGI PRATAMA
▏                  ┌───────────────────────────────────────┐
▏ ●               │  cover (next/image; WebGL displace only │
▏ ┊                │   on the hero cover, fades to static)   │
▏ ┊  +easing      └───────────────────────────────────────┘
▏                  meta row (mono): CLIENT · YEAR · SERVICE
▏CUE · OVERVIEW    body — TextReveal(scrollReveal)
▏CUE · GALLERY     existing subgrid gallery (DOM, parallax)
▏CUE · NEXT        → next case (transport "advances the reel")
```
Detail keeps the existing gallery (DOM/subgrid — the Pin task already respected it). "Next case" is framed as advancing the transport.

### About `/about`
```
▏CUE · PROFILE     portrait (useParallax) + kinetic intro
▏CUE · EXPERIENCE  typed timeline — THIS is a real sequence,
▏                  so numbered cues are honest here:
▏                  ┌ 2023 ─ … ┐  scrub-synced highlight
▏CUE · CONTACT     contact CTA
```
About's experience list is a genuine chronological sequence, so the cue-numbering carries real information here (not decoration).

## 6. Motion & scroll language (mapped to the Phase-3 primitives — all already built)
- `useScrollProgress` → the transport rail: timecode, scrub head, cue index, easing-glyph morph.
- `<ScrollProgressBar>` → re-skinned as the vertical scrub line with the `--signal` head.
- `useParallax` → hero/portrait/section depth (already wired into OverviewImage + about hero).
- `<KineticText>` → wordmark + section headers (char/word stagger). **Its first consumer here MUST add an `sr-only` plain-text companion** (the carried Phase-3 a11y note).
- `TextReveal` / `TextBlur` with `scrollReveal` → below-the-fold copy reveals on scroll (the opt-in flag built in Phase 3).
- **Brand `PageTransition` — preserved unchanged.** It reads as the transport "changing reels" between routes; it fits the metaphor and the owner asked to keep it.
- All gated by `prefers-reduced-motion` (the Phase-3 systemic kill-switch + per-component handling).

## 7. WebGL islands — exactly two, both contained (respects ≤170KB budget)
1. **Hero shear-field** (`/`): an OGL island sized to the wordmark only (not full-bleed). Shader shears/chromatic-splits the wordmark by scroll velocity. Lazy (`next/dynamic ssr:false`), `pointer:fine` + not-reduced-motion only, IntersectionObserver mount/unmount. **Static fallback = the plain wordmark.**
2. **Cover displacement** (`/projects`, `/projects/[slug]` hero, home selected-work): the reference effect already scoped in the Phase-4 plan — OGL displacement on hover, driven by the existing cursor/hover surface. **Static fallback = the `next/image` cover.**

No global canvas. Both use the single OGL dep (~9–14KB gz). Everything else is DOM + Motion + CSS.

## 8. The one aesthetic risk
The **persistent transport rail as load-bearing chrome** (live timecode + scrub + morphing easing glyph). It's opinionated and could read gimmicky if overbuilt — but executed with restraint (thin, monochrome-warm, the easing glyph tiny and honest), it becomes the memorable signature, and it's *true* to the subject in a way a generic progress bar never is. Justification: Yovi's craft is timing and easing; making those the wayfinding is the thesis, not decoration.

## 9. Build approach (Phase 4, against this brief)
This brief replaces the "design gate" in the Phase-4 plan. Implementation order:
1. **Tokens + type** — add the TRANSPORT color tokens to `globals.css`; wire Geist Mono as the data face. (No new font deps.)
2. **Transport rail** — build the signature first (it's the spine), on `useScrollProgress` + re-skinned `<ScrollProgressBar>` + the easing-glyph component.
3. **WebGL island infra** — the OGL `<WebGLIsland>` + the two effects (hero shear, cover displace), per the existing Phase-4 plan's infra tasks.
4. **Re-lay each route** to the section inventory above, wiring `<KineticText>` (+ sr-only), `scrollReveal`, `useParallax`, `<Pin>`.
5. **Verify** — CWV/INP (web-perf), reduced-motion, the budget (WebGL stays a separate lazy chunk), and that the brand transition still plays.

Open inputs that would sharpen this (optional): reference awwwards sites the owner admires; any fixed brand constraints (logo, exact name styling); whether the rail should be left-edge or bottom on desktop.
