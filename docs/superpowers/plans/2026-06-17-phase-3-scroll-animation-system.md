# Phase 3 — Scroll-Animation System Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (- [ ]) syntax.
**Goal:** Build a reusable scroll-animation foundation (`useScrollProgress`, `useParallax`, `<Pin>`, `<ScrollProgressBar>` + a hand-rolled kinetic-type primitive) on Motion `useScroll`/`useTransform` + Lenis, decouple the text reveals from page-transition gating, and generalize the existing sticky blocks onto it — adding zero runtime deps.
**Architecture:** All primitives live in `src/components/animations/scroll/` and read the single Lenis-driven `frame` loop already wired in `src/providers/lenis.provider.tsx` (autoRaf:false, lerp:0.095). `useScroll` MotionValues are consumed RAW through `useTransform` only — never re-smoothed with `useSpring` (that would double-lerp against Lenis). Reduced-motion is honored per-primitive (the `useReducedMotion` branch pattern from `reveal.text.tsx`) plus a global CSS kill-switch added to `src/styles/globals.css`. The existing `position: sticky` `h-24` divs ARE the codebase's current pin idiom; `<Pin>` formalizes them.
**Tech Stack:** Next.js 16.2.9 (App Router, Turbopack) · React 19.2.7 · Motion v12.40 (`motion/react`) · Lenis v1.3.23 (`lenis/react`, driven by Motion `frame`) · Tailwind v4 (CSS-first in `src/styles/globals.css`) · Zustand v5 · bun. No test framework.
**Depends on:** Phases 1–2 (Lenis provider, text reveals, page-transition store, `useMatchMedia`, animation constants) already exist. No prior-phase code is rewritten here, only extended.

---

## Global Constraints (every task must respect these)
PERFORMANCE BUDGET (p75, mobile+desktop): LCP <= 2.5s · INP <= 200ms · CLS <= 0.1 · critical-path JS <= 170 KB gz.
ANIMATION RULES: (1) animate transform/opacity/clip-path ONLY — never width/height/top/left/margin. (2) Single RAF loop — Lenis stays driven by Motion's `frame`; never run Lenis's own raf AND Motion's. (3) Cursor is imperative (MotionValue+spring), never React state per pointermove. (4) NEVER `useSpring` a Lenis-smoothed `useScroll` value (double-lerp = lag). (5) `prefers-reduced-motion` is systemic (gate Lenis, intro overlay, transitions; CSS kill-switch). (6) Don't gate the LCP hero behind an `opacity:0` reveal. (7) `will-change` only transiently.
DEPENDENCY RULE: zero new runtime deps EXCEPT the one chosen WebGL lib (Phase 4), used ONLY for isolated lazy-loaded islands — never a global canvas.
SEO FACTS (verified live 2026-06-17): BreadcrumbList is the ONLY structured-data type that yields a visible Google rich result. Person/WebSite are entity-only. DROP SearchAction (deprecated Nov 2024); do NOT build FAQPage/HowTo. Canonicals must exist on every route. CWV thresholds unchanged in 2026. llms.txt irrelevant to Google.

---

## CRITICAL PRE-FLIGHT FACTS (verified against the installed tree 2026-06-17 — read before writing any code)
- **`splitText` does NOT exist in Motion v12.40.** Verified: `require('motion/react')` has no `splitText`; `require('motion')` has no `splitText`; `grep -rl splitText node_modules/motion*` returns nothing. The kinetic-type primitive MUST be hand-rolled by splitting the string (exactly like `src/components/animations/text/blur.text.tsx` does with `text.split('')`) and staggering per index. `stagger` and `useAnimate` ARE exported from `motion/react` but are NOT needed for the declarative `initial`/`animate`/`whileInView` approach used here. **Do not import `splitText` — the build will fail.**
- **`useScroll`, `useTransform`, `useMotionValueEvent`, `useReducedMotion`, `useInView`, `motion` are all exported from `motion/react`** (verified).
- **`<Pin>` = `position: sticky`.** Every sticky block in scope is already a `sticky top-0 z-20 h-24` div (`overview.view.tsx:8`, `projects.view.tsx:49` homepage, `detail/hero.view.tsx:79`, `detail/gallery.view.tsx:33`, plus the inline one at `app/(main)/projects/page.tsx:19`). `<Pin>` is a thin wrapper over that, NOT JS scroll-pinning. Sticky is GPU-cheap and needs no RAF.
- **LenisProvider mounts ONLY on desktop**, inside `src/app/(main)/layout.tsx:18-23` (`{isDesktop && <LenisProvider/>}`). Mobile has native scroll. Therefore `useScroll`/`useParallax` MUST degrade gracefully when Lenis is absent — Motion's `useScroll` reads native scroll fine, so this is automatic; just never assume Lenis exists.
- **`OverviewImage` (`overview-image.view.tsx`) already gates parallax behind `isDesktop`** (`style={isDesktop ? { y } : {}}`). This is the seed pattern `useParallax` generalizes.
- **`reveal.text.tsx:103` and `blur.text.tsx:63` gate on `isInView && isTransitionComplete`.** `isTransitionComplete` comes from `usePageTransition()` (`src/hooks/stores/usePage.hook.ts`). Task 5 decouples this so scroll-driven reveals fire on viewport entry without waiting for the page-transition store.
- **`globals.css` has NO `prefers-reduced-motion` block and NO `animation-timeline` usage yet.** Both are added here.
- **Route staticness:** `/` and `/projects` fetch Sanity with `useCdn:false` and no dynamic APIs → prerendered `○ (Static)`. `/projects/[slug]` uses `generateStaticParams` → `● (SSG)`. The animation work is client-only and MUST NOT change staticness. Verification asserts "no regression vs baseline," captured in Task 1.
- **The scope said `src/module/projects/view/projects.view.tsx` — that file does not exist.** The real projects listing views are `src/module/projects/view/hero.view.tsx` and `src/module/projects/view/project-list.view.tsx`; sticky blocks for the projects route are inline in `src/app/(main)/projects/page.tsx:19` and in the homepage `src/module/homepage/views/projects.view.tsx:49`. Plan targets the real files.
- **Exact tokens (from `src/lib/constants/animation.constant.ts`):** `easing.in = [0.22,1,0.36,1]`, `easing.out = [0.76,0,0.24,1]`, `easing.inOut = [0.215,0.61,0.355,1]`; `duration.short=0.3, medium=0.5, long=0.8`; `clipPath.close/open` polygons.
- **Utils:** `cn` is `src/lib/utils/cn.ts` (`cn(...classValue: ClassValue[])`). `useMatchMedia(breakPoint=640, query:'min'|'max'='max')` is `src/hooks/useMedia.hook.ts`. Path aliases: `@/* -> ./src/*`, `@public/* -> ./public/*`.

---

### Task 1: Baseline capture + reduced-motion CSS kill-switch
Capture the current build/typecheck/route-marker baseline so later tasks can prove "no regression," and add the systemic reduced-motion CSS kill-switch (Animation Rule 5) that every primitive relies on.

- **Files:** Modify `src/styles/globals.css` (append a new layer block after line 99, the end of `@layer utilities`). Create `docs/superpowers/plans/.phase3-baseline.txt` (scratch artifact, git-ignored or committed as a record).
- **Interfaces:** Produces — global CSS selector `@media (prefers-reduced-motion: reduce)` killing `animation`/`transition`/`scroll-behavior`; consumed implicitly by every animated element (no JS import).

- [ ] **Step 1: Capture the typecheck baseline.** Run and record output.
  ```bash
  bunx tsc --noEmit
  ```
  Expected: no output (0 errors). Record this as the pre-change baseline.

- [ ] **Step 2: Capture the build + route-marker baseline.** Run and save the route table.
  ```bash
  bun run build 2>&1 | tee docs/superpowers/plans/.phase3-baseline.txt | grep -E '^\s*[○●ƒ]|Route \(app\)'
  ```
  Expected lines (record EXACT markers actually printed — assert no regression later, do not hardcode if they differ):
  ```
  ┌ ○ /                          (or ● if SSG)
  ├ ○ /projects
  └ ● /projects/[slug]
  ```
  Note: `○ (Static)` = prerendered, `● (SSG)` = static via generateStaticParams, `ƒ (Dynamic)` = server-rendered on demand. The animation tasks are client-only; the SAME markers must appear after every later task.

- [ ] **Step 3: Add the reduced-motion CSS kill-switch to `globals.css`.** Append after the closing `}` of `@layer utilities` (current last line is line 99). This is the systemic kill-switch — JS primitives still branch on `useReducedMotion`, but this guarantees nothing animates even if a primitive is missed.
  ```css

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

- [ ] **Step 4: VERIFICATION.**
  ```bash
  bunx tsc --noEmit                       # Expected: no output
  bun run build 2>&1 | grep -E '^\s*[○●ƒ]' # Expected: SAME markers as Step 2 baseline
  ```
  > BROWSER-VERIFY (web-perf skill → Chrome DevTools MCP): emulate `prefers-reduced-motion: reduce` (DevTools Rendering tab) and confirm the homepage text reveals and the parallax hero are static (no motion). Confirm normal mode still animates.

- [ ] **Step 5: COMMIT.**
  ```bash
  git add src/styles/globals.css docs/superpowers/plans/.phase3-baseline.txt
  git commit -m "feat(a11y): add systemic prefers-reduced-motion CSS kill-switch + capture phase-3 build baseline"
  ```
  (Repo may not be initialized for commits in the execution env — include the command regardless.)

---

### Task 2: `useScrollProgress` + `useParallax` hooks
The two scroll-reading primitives. Both wrap `useScroll`+`useTransform`. NEVER wrap the result in `useSpring` (Rule 4 — Lenis already smooths). `useParallax` keeps the codebase's ±5–15% magnitude and the `isDesktop` gate seen in `overview-image.view.tsx`.

- **Files:** Create `src/components/animations/scroll/useScrollProgress.ts`. Create `src/components/animations/scroll/useParallax.ts`.
- **Interfaces:**
  - Consumes — `useScroll`, `useTransform`, `MotionValue` from `motion/react`; `useReducedMotion` from `motion/react`; `useMatchMedia` from `@/hooks/useMedia.hook`.
  - Produces:
    - `useScrollProgress(opts?: { offset?: ScrollOffset }): { ref: RefObject<HTMLElement | null>; scrollYProgress: MotionValue<number> }`
    - `useParallax(opts?: { offset?: ScrollOffset; range?: [string, string]; axis?: 'x' | 'y'; disabledOnMobile?: boolean }): { ref: RefObject<HTMLElement | null>; value: MotionValue<string>; enabled: boolean }`
    - where `ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>['offset']` (derived from the function signature — see note below).
  - **WHY derive the type, not import `UseScrollOptions`:** the runtime export probe (`Object.keys(require('motion/react'))`) can only see VALUE exports, not type-only ones. Whether `UseScrollOptions` is a named type export of `motion/react` in v12.40 is UNVERIFIED, and importing a non-existent type fails `tsc` — silently breaking the "Expected: no output" gate. `useScroll` (the value) is verified-present, so deriving the offset type from its parameter is guaranteed to compile. PRE-FLIGHT PROBE for this task: write `src/_probe.ts` containing `import { useScroll } from 'motion/react'; type O = NonNullable<Parameters<typeof useScroll>[0]>['offset']; const r: import('react').RefObject<HTMLElement | null> = { current: null }; useScroll({ target: r });` then `bunx tsc --noEmit` (Expected: no output — proves both the derived type AND that `useScroll` accepts a `RefObject<HTMLElement | null>` target under React 19), then delete `src/_probe.ts`.

- [ ] **Step 1: Create `useScrollProgress.ts`.** A sticky-target progress reader. Default offsets match the `['start end','end start']` pattern in `about/hero-section.view.tsx:16`.
  ```ts
  'use client'

  import { useRef } from 'react'
  import { useScroll } from 'motion/react'

  // Derive the offset type from useScroll's own signature — `UseScrollOptions`
  // is NOT verified to be a named type export of motion/react v12.40, and a
  // missing type import silently breaks `tsc`. The function value IS verified.
  type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>['offset']

  interface UseScrollProgressOptions {
    /** Motion scroll offsets. Default tracks element entering to leaving viewport. */
    offset?: ScrollOffset
  }

  /**
   * Reads scroll progress (0→1) of a target element through the viewport.
   * Returns the RAW Lenis-driven MotionValue — DO NOT wrap in useSpring (double-lerp).
   * Feed `scrollYProgress` directly into useTransform.
   */
  export function useScrollProgress({ offset = ['start end', 'end start'] }: UseScrollProgressOptions = {}) {
    const ref = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({ target: ref, offset })
    return { ref, scrollYProgress }
  }
  ```

- [ ] **Step 2: Create `useParallax.ts`.** Generalizes `overview-image.view.tsx`. Default range ±10% (mid of the 5–15% spec). Disabled (returns static `value`) when reduced-motion OR (mobile and `disabledOnMobile`). NO `useSpring`.
  ```ts
  'use client'

  import { useRef } from 'react'
  import { useScroll, useTransform, useReducedMotion } from 'motion/react'

  import { useMatchMedia } from '@/hooks/useMedia.hook'

  // Derive the offset type from useScroll's signature (see useScrollProgress.ts note).
  type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>['offset']

  interface UseParallaxOptions {
    /** Motion scroll offsets. Default: element crosses the viewport. */
    offset?: ScrollOffset
    /** Output range start→end. Default ±10% (spec: 5–15%). Use % or px strings. */
    range?: [string, string]
    /** Translate axis. Default 'y'. */
    axis?: 'x' | 'y'
    /** Disable parallax on mobile (native scroll, no Lenis). Default true. */
    disabledOnMobile?: boolean
  }

  /**
   * Parallax translate driven by Lenis-smoothed scroll. transform-only (Rule 1).
   * Returns RAW useTransform output (no useSpring — Rule 4).
   * Apply: <motion.div style={enabled ? { [axis]: value } : undefined} />
   */
  export function useParallax({
    offset = ['start end', 'end start'],
    range = ['-10%', '10%'],
    axis = 'y',
    disabledOnMobile = true,
  }: UseParallaxOptions = {}) {
    const ref = useRef<HTMLElement>(null)
    const isDesktop = useMatchMedia(640, 'min')
    const prefersReduced = useReducedMotion()

    const { scrollYProgress } = useScroll({ target: ref, offset })
    const value = useTransform(scrollYProgress, [0, 1], range)

    const enabled = !prefersReduced && (!disabledOnMobile || isDesktop)
    return { ref, value, enabled, axis }
  }
  ```

- [ ] **Step 3: PRE-FLIGHT TYPE PROBE (settles the derived-type + nullable-ref risks before relying on the gate).** Write `src/_probe.ts`, typecheck, delete it.
  ```bash
  cat > src/_probe.ts <<'EOF'
  import { useScroll } from 'motion/react'
  import type { RefObject } from 'react'
  type O = NonNullable<Parameters<typeof useScroll>[0]>['offset']
  const _o: O = ['start end', 'end start']
  const r: RefObject<HTMLElement | null> = { current: null }
  // proves useScroll accepts a React-19 nullable ref as target
  void useScroll
  void r
  void _o
  EOF
  bunx tsc --noEmit   # Expected: no output (derived offset type + nullable ref both valid)
  rm src/_probe.ts
  ```

- [ ] **Step 4: VERIFICATION (typecheck — hooks are not directly callable in a script).**
  ```bash
  bunx tsc --noEmit   # Expected: no output
  ```
  Confirm there is NO `useSpring` import anywhere in the new files:
  ```bash
  grep -rn "useSpring" src/components/animations/scroll/   # Expected: no output
  ```

- [ ] **Step 5: COMMIT.**
  ```bash
  git add src/components/animations/scroll/useScrollProgress.ts src/components/animations/scroll/useParallax.ts
  git commit -m "feat(scroll): add useScrollProgress and useParallax hooks (Lenis-driven, no useSpring)"
  ```

---

### Task 3: `<Pin>` wrapper (position: sticky)
Formalize the `sticky top-0 z-20 h-24` idiom into a typed, reduced-motion-safe wrapper. Pure CSS sticky — no RAF, no JS scroll math (Rule 2 stays single-loop because we add no loop).

- **Files:** Create `src/components/animations/scroll/pin.tsx`.
- **Interfaces:**
  - Consumes — `cn` from `@/lib/utils/cn`.
  - Produces — default export NONE; named `Pin` component: `Pin(props: { children?: React.ReactNode; top?: number; zIndex?: number; as?: React.ElementType; className?: string }): JSX.Element`. `children` is OPTIONAL — 4 of 5 pin usages pass no children (they are empty bars).

- [ ] **Step 1: Create `pin.tsx`.** `top` accepts a number (→ rem-free px via Tailwind arbitrary value) or a string class fragment; default `top-0`. Renders `position: sticky` via Tailwind `sticky`. No `'use client'` needed (no hooks) — keep it a server-compatible component so it can wrap server content.
  ```tsx
  import { cn } from '@/lib/utils/cn'

  interface PinProps {
    /** Optional — most pin bars are empty (no children). */
    children?: React.ReactNode
    /** Sticky offset from top. Number = px. Default 0. */
    top?: number
    /** Stacking context. Default 20 (matches existing sticky blocks). */
    zIndex?: number
    /** Element tag. Default 'div'. */
    as?: React.ElementType
    className?: string
  }

  /**
   * position: sticky pin. GPU-cheap, no RAF, no JS scroll listener.
   * Formalizes the existing `sticky top-0 z-20` idiom used across the sticky blocks.
   * For reduced-motion there is nothing to disable — sticky is a layout behavior, not motion.
   */
  export function Pin({ children, top = 0, zIndex = 20, as: Tag = 'div', className }: PinProps) {
    return (
      <Tag
        className={cn('sticky', className)}
        style={{ top, zIndex }}
      >
        {children}
      </Tag>
    )
  }
  ```

- [ ] **Step 2: VERIFICATION.**
  ```bash
  bunx tsc --noEmit   # Expected: no output
  ```

- [ ] **Step 3: COMMIT.**
  ```bash
  git add src/components/animations/scroll/pin.tsx
  git commit -m "feat(scroll): add <Pin> sticky-position wrapper formalizing the sticky-block idiom"
  ```

---

### Task 4: `<ScrollProgressBar>` (CSS animation-timeline + whileInView fallback)
A top-fixed `scaleX` progress bar. Preferred path: pure CSS `animation-timeline: scroll(root block)` behind `@supports` (zero JS, zero RAF). Fallback for browsers without scroll-timeline: a Motion `useScroll`→`scaleX` MotionValue (still no `useSpring`). Reduced-motion: bar is hidden.

- **Files:** Create `src/components/animations/scroll/scroll-progress-bar.tsx`. Modify `src/styles/globals.css` (append a `@layer utilities` rule + `@supports` block + keyframes after the Task 1 reduced-motion block).
- **Interfaces:**
  - Consumes — `useScroll`, `useReducedMotion`, `motion` from `motion/react`; `cn` from `@/lib/utils/cn`.
  - Produces — named `ScrollProgressBar` component: `ScrollProgressBar(props?: { className?: string }): JSX.Element`.

- [ ] **Step 1: Add CSS for the native scroll-timeline bar to `globals.css`.** Append AFTER the `@media (prefers-reduced-motion: reduce)` block from Task 1. The class `.scroll-progress-bar--css` is applied only when `@supports (animation-timeline: scroll())` matches; the component reads that same `@supports` at runtime via a feature check to pick the path.
  ```css

  @layer utilities {
    .scroll-progress-bar {
      transform-origin: 0 50%;
      transform: scaleX(0);
    }
  }

  @supports (animation-timeline: scroll()) {
    @keyframes scroll-progress-grow {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }
    .scroll-progress-bar--css {
      animation: scroll-progress-grow linear both;
      animation-timeline: scroll(root block);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .scroll-progress-bar,
    .scroll-progress-bar--css {
      display: none !important;
    }
  }
  ```

- [ ] **Step 2: Create `scroll-progress-bar.tsx`.** CRITICAL — the SSR/client divergence here is a REACT-TREE hydration mismatch, NOT a CLS issue. `supportsScrollTimeline()` returns `false` on the server and may return `true` on the client (different element + className), and a `prefersReduced` early-return-null makes the server render an element while a reduced-motion client renders nothing. React 19 warns on, and may discard, these structural mismatches. (This differs from `reveal.text.tsx`, where Motion only diffs STYLE props on a stable element — safe.) FIX: render an SSR-stable first paint (always the CSS-class `<div>`, which is valid markup everywhere and simply does nothing where `scroll()` is unsupported), then a `mounted` flag upgrades the unsupported case to the MotionValue fallback. Reduced-motion is handled entirely by the CSS rule (`display:none`), so NO conditional `return null` — the element is always present, keeping the tree stable.
  ```tsx
  'use client'

  import { useEffect, useState } from 'react'
  import { useScroll, motion } from 'motion/react'
  import { cn } from '@/lib/utils/cn'

  interface ScrollProgressBarProps {
    className?: string
  }

  const supportsScrollTimeline = () =>
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('animation-timeline: scroll()')

  /**
   * Top-fixed scroll progress bar (scaleX). Prefers pure-CSS animation-timeline
   * (no JS, no RAF); progressively upgrades to a raw Lenis-driven MotionValue
   * (no useSpring — Rule 4) only where scroll-timeline is unsupported.
   * Reduced-motion handled by the CSS `display:none` rule (NOT a conditional
   * return — the element stays mounted so SSR and hydration trees match).
   */
  export function ScrollProgressBar({ className }: ScrollProgressBarProps) {
    const [mounted, setMounted] = useState(false)
    // Hooks run unconditionally / in stable order.
    const { scrollYProgress } = useScroll()
    useEffect(() => setMounted(true), [])

    const base = cn(
      'scroll-progress-bar bg-primary pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] origin-left',
      className,
    )

    // SSR + first client render are byte-identical: the CSS-class div.
    // It is inert where scroll() is unsupported (scaleX stays 0 via base CSS).
    if (!mounted || supportsScrollTimeline()) {
      return <div aria-hidden className={cn(base, 'scroll-progress-bar--css')} />
    }

    // Post-mount, unsupported browsers only: drive scaleX with the raw MotionValue.
    return <motion.div aria-hidden style={{ scaleX: scrollYProgress }} className={base} />
  }
  ```
  Note: first paint everywhere is the CSS-class `<div>` (identical on server and client → no hydration warning). Only after mount, and only in browsers lacking `scroll()`, does it swap to the `motion.div` — a same-position `fixed` overlay, so the swap causes no CLS. Reduced-motion never branches the tree; the `@media` rule hides the bar.

- [ ] **Step 3: VERIFICATION.**
  ```bash
  bunx tsc --noEmit   # Expected: no output
  grep -rn "useSpring" src/components/animations/scroll/   # Expected: no output
  ```
  > BROWSER-VERIFY (web-perf skill): mount `<ScrollProgressBar/>` temporarily in a route, scroll, confirm the bar grows 0→100% smoothly with NO double-lerp lag (compare against Lenis scroll speed — bar must track 1:1, not trail). In a Chromium with scroll-timeline, confirm the bar uses the CSS class (DevTools → Animations shows a `scroll()` timeline, no JS frames in the Performance panel). Under reduced-motion the bar must be absent.

- [ ] **Step 4: COMMIT.**
  ```bash
  git add src/components/animations/scroll/scroll-progress-bar.tsx src/styles/globals.css
  git commit -m "feat(scroll): add <ScrollProgressBar> (CSS animation-timeline w/ raw-MotionValue fallback)"
  ```

---

### Task 5: Decouple `TextReveal` / `TextBlur` from `isTransitionComplete`
Add an opt-in `scrollReveal` flag so reveals can fire on viewport entry alone (for scroll-triggered content) while the default behavior (first-paint hero reveals that wait for the page transition) is unchanged. The gate becomes `isInView && (scrollReveal || isTransitionComplete)`.

- **Files:** Modify `src/components/animations/text/reveal.text.tsx` (interface lines 12–22, destructure lines 24–31, gate line 103–105). Modify `src/components/animations/text/blur.text.tsx` (signature lines 11–25, gate lines 63–69).
- **Interfaces:**
  - Consumes — existing `usePageTransition` (`@/hooks/stores/usePage.hook`), `useInView`, `useReducedMotion`.
  - Produces — `TextRevealProps.scrollReveal?: boolean` (default `false`); `TextBlur` prop `scrollReveal?: boolean` (default `false`). Behavior identical to today when unset.

- [ ] **Step 1: Add `scrollReveal` to `TextRevealProps` (reveal.text.tsx).** Replace the interface block.
  ```tsx
  interface TextRevealProps {
    text?: string
    delay?: number
    className?: {
      text?: string
      highlight?: string
    }
    highlight?: string[]
    amount?: [number, number]
    once?: boolean
    /** Fire on viewport entry alone, skipping the page-transition gate. Default false. */
    scrollReveal?: boolean
  }
  ```

- [ ] **Step 2: Destructure `scrollReveal` (reveal.text.tsx).** Replace the function signature destructure (currently lines 24–31).
  ```tsx
  export function TextReveal({
    text = '',
    amount = [40, 60],
    className,
    delay = 0,
    highlight = [],
    once = true,
    scrollReveal = false,
  }: TextRevealProps) {
  ```

- [ ] **Step 3: Compute a single trigger flag and use it in the gate (reveal.text.tsx).** Add the flag right after the `usePageTransition` destructure (after current line 38), then swap every `isInView && isTransitionComplete` in the `animate` block (lines 103–105) for `triggered`.
  Add after line 38:
  ```tsx
    const triggered = isInView && (scrollReveal || isTransitionComplete)
  ```
  Replace the three gated lines (103–105) inside `animate`:
  ```tsx
                clipPath: triggered ? clipPath.open : clipPath.close,
                translateY: triggered ? '0%' : y,
                translateZ: triggered ? '0px' : '-10px',
  ```

- [ ] **Step 4: Add `scrollReveal` to `TextBlur` signature (blur.text.tsx).** Replace the destructured-props signature (lines 11–25).
  ```tsx
  export function TextBlur({
    text,
    delay = 0,
    direction = 'right',
    distance = 0.25,
    className,
    once = true,
    scrollReveal = false,
  }: {
    text: string
    delay?: number
    direction?: 'right' | 'left'
    distance?: number
    className?: string
    once?: boolean
    /** Fire on viewport entry alone, skipping the page-transition gate. Default false. */
    scrollReveal?: boolean
  }) {
  ```

- [ ] **Step 5: Compute the trigger flag and use it in `TextBlur`'s gate.** Add after the `usePageTransition` destructure (after current line 31):
  ```tsx
    const triggered = isInView && (scrollReveal || isTransitionComplete)
  ```
  Then replace the four `isInView && isTransitionComplete` occurrences in the `animate` block (lines 63–69) with `triggered`:
  ```tsx
              filter: triggered ? 'blur(0px)' : 'blur(2px)',
              opacity: triggered ? 1 : 0,
              translateZ: triggered ? '0px' : '-10px',
              translateX: triggered ? '0em' : `${distance * (direction === 'left' ? -1 : 1)}em`,
  ```

- [ ] **Step 6: VERIFICATION.**
  ```bash
  bunx tsc --noEmit   # Expected: no output
  bun run build 2>&1 | grep -E '^\s*[○●ƒ]'   # Expected: SAME markers as Task 1 baseline
  ```
  Assert default behavior is byte-stable for existing callers (none pass `scrollReveal`, so `triggered === isInView && isTransitionComplete` exactly):
  ```bash
  grep -rn "scrollReveal" src/module/   # Expected: no output (no caller opted in yet — default path unchanged)
  ```
  > BROWSER-VERIFY (web-perf skill): on the homepage, hero `TextReveal`s still wait for the intro transition (unchanged). Then add `scrollReveal` to one below-the-fold reveal in a throwaway test and confirm it fires on scroll into view WITHOUT the page transition. Confirm reduced-motion still renders text immediately (the `isReduceMotion` initial branch + CSS kill-switch).

- [ ] **Step 7: COMMIT.**
  ```bash
  git add src/components/animations/text/reveal.text.tsx src/components/animations/text/blur.text.tsx
  git commit -m "feat(text): add opt-in scrollReveal to TextReveal/TextBlur (decouple from page transition)"
  ```

---

### Task 6: `<KineticText>` — hand-rolled char/word stagger primitive (Direction A accents)
Motion v12.40 has NO `splitText` (verified — see pre-flight). Build the kinetic-type primitive by splitting the string in JS (char or word) and staggering per index, mirroring `blur.text.tsx`'s `text.split('')` approach. transform/opacity only. Reduced-motion-safe per the `reveal.text.tsx` template. NOT gated on `isTransitionComplete` (it is scroll/viewport triggered by design).

- **Files:** Create `src/components/animations/text/kinetic.text.tsx`.
- **Interfaces:**
  - Consumes — `motion`, `useInView`, `useReducedMotion` from `motion/react`; `cn` from `@/lib/utils/cn`; `easing`, `duration` from `@/lib/constants/animation.constant`.
  - Produces — named `KineticText` component:
    `KineticText(props: { text: string; by?: 'char' | 'word'; stagger?: number; delay?: number; once?: boolean; amount?: number; className?: string }): JSX.Element`.

- [ ] **Step 1: Create `kinetic.text.tsx`.** Splits on `''` (char) or `' '` (word). Each unit animates `translateY` + `opacity` (transform/opacity only — Rule 1). aria-hidden + `sr-only` companion is the caller's responsibility (same convention as `reveal.text.tsx`/`blur.text.tsx`, which the existing views pair with an `sr-only` span). Reduced-motion: units render in final state immediately (initial branch). Words use a non-breaking space preserved with `whitespace-pre`.
  ```tsx
  'use client'

  import { motion, useInView, useReducedMotion } from 'motion/react'
  import { useRef } from 'react'

  import { duration, easing } from '@/lib/constants/animation.constant'
  import { cn } from '@/lib/utils/cn'

  interface KineticTextProps {
    text: string
    /** Split granularity. Default 'char'. */
    by?: 'char' | 'word'
    /** Per-unit stagger seconds. Default 0.04. */
    stagger?: number
    /** Base delay seconds. Default 0. */
    delay?: number
    /** Animate once. Default true. */
    once?: boolean
    /** useInView amount (0–1) to trigger. Default 0.6. */
    amount?: number
    className?: string
  }

  /**
   * Kinetic char/word stagger reveal. Scroll/viewport triggered (NOT gated on
   * page transition). transform + opacity only (Rule 1). Hand-rolled split —
   * Motion v12.40 has no splitText. Pair with an sr-only companion for a11y
   * (same convention as TextReveal/TextBlur).
   */
  export function KineticText({
    text,
    by = 'char',
    stagger = 0.04,
    delay = 0,
    once = true,
    amount = 0.6,
    className,
  }: KineticTextProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { amount, once })
    const prefersReduced = useReducedMotion()

    const units = by === 'word' ? text.split(' ') : text.split('')
    const ease = easing.out

    return (
      <span ref={ref} aria-hidden tabIndex={-1} className={cn('inline-flex flex-wrap', className)}>
        {units.map((unit, idx) => (
          <span key={idx} className="inline-block overflow-clip" style={{ whiteSpace: 'pre' }}>
            <motion.span
              className="inline-block"
              initial={{
                translateY: !prefersReduced ? '110%' : '0%',
                opacity: !prefersReduced ? 0 : 1,
              }}
              animate={{
                translateY: isInView && !prefersReduced ? '0%' : !prefersReduced ? '110%' : '0%',
                opacity: isInView || prefersReduced ? 1 : 0,
                transition: {
                  translateY: { duration: duration.long, delay: delay + idx * stagger, ease },
                  opacity: { duration: duration.medium, delay: delay + idx * stagger, ease },
                },
              }}
            >
              {by === 'word' ? `${unit} ` : unit === ' ' ? ' ' : unit}
            </motion.span>
          </span>
        ))}
      </span>
    )
  }
  ```

- [ ] **Step 2: VERIFICATION (typecheck + no banned imports).**
  ```bash
  bunx tsc --noEmit   # Expected: no output
  grep -rn "splitText" src/components/animations/   # Expected: no output (splitText must NOT be imported)
  grep -rn "useSpring" src/components/animations/scroll/ src/components/animations/text/   # Expected: no output
  ```

- [ ] **Step 3: COMMIT.**
  ```bash
  git add src/components/animations/text/kinetic.text.tsx
  git commit -m "feat(text): add <KineticText> hand-rolled char/word stagger (no splitText dep)"
  ```

---

### Task 7: Barrel export for the scroll primitives
One import surface for later phases. Re-export the four scroll primitives.

- **Files:** Create `src/components/animations/scroll/index.ts`.
- **Interfaces:** Produces — re-exports `Pin`, `ScrollProgressBar`, `useScrollProgress`, `useParallax`.

- [ ] **Step 1: Create `index.ts`.**
  ```ts
  export { Pin } from './pin'
  export { ScrollProgressBar } from './scroll-progress-bar'
  export { useScrollProgress } from './useScrollProgress'
  export { useParallax } from './useParallax'
  ```

- [ ] **Step 2: VERIFICATION.**
  ```bash
  bunx tsc --noEmit   # Expected: no output
  ```

- [ ] **Step 3: COMMIT.**
  ```bash
  git add src/components/animations/scroll/index.ts
  git commit -m "chore(scroll): add barrel export for scroll primitives"
  ```

---

### Task 8: Generalize `OverviewImage` onto `useParallax`
Replace the bespoke `useScroll`+`useTransform`+`isDesktop` block in `overview-image.view.tsx` with `useParallax`, proving the hook reproduces the seed behavior. The original used `offset:['start start','end start']`, range `['-50px','50px']`, desktop-only.

- **Files:** Modify `src/module/homepage/views/overview-image.view.tsx` (full rewrite of the 30-line file).
- **Interfaces:** Consumes — `useParallax` from `@/components/animations/scroll`.

- [ ] **Step 1: Read the current file to confirm it is unchanged since capture.**
  ```bash
  bunx tsc --noEmit >/dev/null && grep -n "useScroll\|useTransform\|useParallax" src/module/homepage/views/overview-image.view.tsx
  ```
  Expected current state: imports `useScroll`, `useTransform` (the seed). After this task: imports `useParallax` only.

- [ ] **Step 2: Rewrite `overview-image.view.tsx` to use `useParallax`.** Same px range, same desktop gate (now inside the hook), same image. The hook's `ref` goes on the parallax container.
  ```tsx
  'use client'

  import Image from 'next/image'
  import { motion } from 'motion/react'

  import { useParallax } from '@/components/animations/scroll'

  import WhiteOne from '@public/images/white-one.jpg'

  export function OverviewImage() {
    const { ref, value, enabled } = useParallax({
      offset: ['start start', 'end start'],
      range: ['-50px', '50px'],
      axis: 'y',
      disabledOnMobile: true,
    })

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className="bg-background col-span-4 aspect-video h-auto overflow-clip lg:row-span-2 lg:aspect-auto"
      >
        <motion.div
          style={enabled ? { y: value } : undefined}
          className="relative h-[calc(100%+100px)] w-full"
        >
          <Image
            src={WhiteOne}
            alt="Image White One"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 640px,(max-width: 1024px) 1024px,(max-width: 1280px) 1280px, 100vw"
          />
        </motion.div>
      </div>
    )
  }
  ```

- [ ] **Step 3: VERIFICATION.**
  ```bash
  bunx tsc --noEmit   # Expected: no output
  bun run build 2>&1 | grep -E '^\s*[○●ƒ]'   # Expected: SAME markers as Task 1 baseline (route still static)
  ```
  > BROWSER-VERIFY (web-perf skill): on the homepage, the overview image still parallaxes on desktop within the same ±50px range and is static on mobile/reduced-motion. Run a Performance trace while scrolling: confirm a SINGLE RAF loop (Lenis via Motion `frame`) — no second Lenis raf, no spring trailing on the parallax. CLS must stay 0 (image is `fill` in a fixed-aspect container).

- [ ] **Step 4: COMMIT.**
  ```bash
  git add src/module/homepage/views/overview-image.view.tsx
  git commit -m "refactor(homepage): use useParallax in OverviewImage (replace bespoke useScroll block)"
  ```

---

### Task 9: Generalize `about/hero-section.view.tsx` parallax onto `useParallax`
The about hero has its own `useScroll`+`useTransform` (lines 13–18, range `['-10%','10%']`, offset `['start end','end start']`). Swap to `useParallax`. Keep the `containerRef` on the `<section>` (it is the scroll target).

- **Files:** Modify `src/module/about/views/hero-section.view.tsx` (imports lines 1–5, hook block lines 12–18, ref + style usage).
- **Interfaces:** Consumes — `useParallax` from `@/components/animations/scroll`.

- [ ] **Step 1: Replace imports (lines 1–9).** Drop `useScroll`, `useTransform`, `useRef`; keep `motion`; add `useParallax`.
  ```tsx
  'use client'

  import Image from 'next/image'
  import { motion } from 'motion/react'

  import { TextReveal } from '@/components/animations/text/reveal.text'
  import { useParallax } from '@/components/animations/scroll'

  import whiteOne from '@public/images/profile-blur.png'
  ```

- [ ] **Step 2: Replace the hook block (lines 11–18) with `useParallax`.** This hero parallaxes on ALL viewports today (no `isDesktop` gate), so pass `disabledOnMobile: false` to preserve behavior. Range/offset are the existing values.
  ```tsx
  export function HeroSection() {
    const { ref, value, enabled } = useParallax({
      offset: ['start end', 'end start'],
      range: ['-10%', '10%'],
      axis: 'y',
      disabledOnMobile: false,
    })
  ```

- [ ] **Step 3: Re-point the `<section ref>` and the parallax `<motion.div style>`.** The section gets the hook `ref`; the image wrapper uses `enabled ? { y: value } : undefined`. Replace `ref={containerRef}` with the hook ref, and `style={{ y }}` with the gated style.
  Section open tag (was line 21–22):
  ```tsx
      <section
        ref={ref as React.Ref<HTMLElement>}
        id="about"
        className="relative mb-px flex h-screen w-full flex-col items-center justify-center overflow-clip"
        style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
      >
  ```
  Parallax image wrapper (was line 60):
  ```tsx
          <motion.div style={enabled ? { y: value } : undefined} className="relative size-full">
  ```

- [ ] **Step 4: VERIFICATION.**
  ```bash
  bunx tsc --noEmit   # Expected: no output
  bun run build 2>&1 | grep -E '^\s*[○●ƒ]'   # Expected: SAME markers as Task 1 baseline
  grep -n "useScroll\|useTransform\|containerRef" src/module/about/views/hero-section.view.tsx   # Expected: no output
  ```
  > BROWSER-VERIFY (web-perf skill): about hero image parallaxes identically (±10%) on desktop and mobile; static under reduced-motion. Confirm the LCP element (hero image) is NOT hidden behind opacity:0 (Rule 6) — it is `fill` and visible immediately; parallax only translates it. Lighthouse LCP <= 2.5s on `/about`.

- [ ] **Step 5: COMMIT.**
  ```bash
  git add src/module/about/views/hero-section.view.tsx
  git commit -m "refactor(about): use useParallax in HeroSection (replace bespoke useScroll block)"
  ```

---

### Task 10: Replace the sticky `h-24` blocks with `<Pin>`
Swap the inline `sticky top-0 z-20 h-24` divs for `<Pin>` so the pin idiom is centralized. Targets (verified): homepage `overview.view.tsx:8` (mobile-only sticky), homepage `projects.view.tsx:49`, projects route inline div `app/(main)/projects/page.tsx:19`, detail `hero.view.tsx:79`, detail `gallery.view.tsx:33` (the sticky "Showcase" header is a subgrid sticky — see note). Behavior must be byte-identical (same `top`, `z`, height, bg).

- **Files:** Modify `src/module/homepage/views/overview.view.tsx` (line 8); `src/module/homepage/views/projects.view.tsx` (line 49); `src/app/(main)/projects/page.tsx` (line 19); `src/module/projects/view/detail/hero.view.tsx` (line 79). **Do NOT touch `gallery.view.tsx:33`** — see Step 5.
- **Interfaces:** Consumes — `Pin` from `@/components/animations/scroll`.

- [ ] **Step 1: `overview.view.tsx` — replace the mobile-only sticky bar (line 8).** This bar is `sm:hidden` and has no fixed top class beyond `top-0`. Add the `Pin` import (line 1 area) and swap the div. Keep `bg-foreground`, `block sm:hidden`, `h-24`, `col-span-full`, `z-20`.
  Add import:
  ```tsx
  import { Pin } from '@/components/animations/scroll'
  ```
  Replace line 8:
  ```tsx
          <Pin zIndex={20} className="bg-foreground block sm:hidden col-span-full h-24" />
  ```
  (`<Pin>` defaults `top={0}` → `top-0`; default tag `div`; renders no children — valid.)

- [ ] **Step 2: `homepage/projects.view.tsx` — replace line 49.** Add `Pin` import; swap.
  Add import:
  ```tsx
  import { Pin } from '@/components/animations/scroll'
  ```
  Replace line 49:
  ```tsx
        <Pin zIndex={20} className="bg-background col-span-full h-24" />
  ```

- [ ] **Step 3: `app/(main)/projects/page.tsx` — replace the inline sticky div (line 19).** Add `Pin` import; swap.
  Add import:
  ```tsx
  import { Pin } from '@/components/animations/scroll'
  ```
  Replace line 19:
  ```tsx
        <Pin zIndex={20} className="col-span-full h-24 bg-foreground" />
  ```

- [ ] **Step 4: `detail/hero.view.tsx` — replace line 79 (z-30 here).** Note: this one uses `z-30`, not `z-20`. Add `Pin` import; pass `zIndex={30}`.
  Add import:
  ```tsx
  import { Pin } from '@/components/animations/scroll'
  ```
  Replace line 79:
  ```tsx
          <Pin zIndex={30} className="bg-foreground col-span-full h-24 w-full" />
  ```

- [ ] **Step 5: SKIP `gallery.view.tsx:33` — document why.** That sticky element is `<div className="sticky top-0 z-20 col-span-full grid h-24 grid-cols-subgrid gap-px">` and it is a CSS-subgrid container with three children. Wrapping it in `<Pin>` (which renders its own `div` with `style={{top,zIndex}}`) would break the `grid-cols-subgrid` parent-child relationship unless `<Pin>` carried `grid grid-cols-subgrid` too. To keep behavior byte-identical and avoid subgrid breakage, LEAVE this one as a raw sticky div. (Optional future: pass `as` + grid classes to `<Pin>` once subgrid is proven safe.) No code change in this step — just confirm it is untouched:
  ```bash
  grep -n "sticky top-0 z-20 col-span-full grid h-24" src/module/projects/view/detail/gallery.view.tsx   # Expected: line 33 still present
  ```

- [ ] **Step 6: VERIFICATION.**
  ```bash
  bunx tsc --noEmit   # Expected: no output
  bun run build 2>&1 | grep -E '^\s*[○●ƒ]'   # Expected: SAME markers as Task 1 baseline
  ```
  SSR HTML assertion — the pinned bars must still emit `position:sticky` inline style. Build + start, then grep:
  ```bash
  bun run build && (bun run start &) && sleep 4 && curl -s http://localhost:3000/projects | grep -o 'position:sticky' | head -1
  ```
  Expected match: `position:sticky` (the `<Pin>` inline style is server-rendered; `top`/`zIndex` are inline). Kill the server after: `kill %1 2>/dev/null || pkill -f "next start"`.
  > BROWSER-VERIFY (web-perf skill): scroll homepage, `/projects`, and a project detail page — every pinned header sticks at the same offset and stacking as before (no visual diff). No CLS introduced (Pin is sticky, not fixed; reserves no extra space differently than the old div).

- [ ] **Step 7: COMMIT.**
  ```bash
  git add src/module/homepage/views/overview.view.tsx src/module/homepage/views/projects.view.tsx "src/app/(main)/projects/page.tsx" src/module/projects/view/detail/hero.view.tsx
  git commit -m "refactor(layout): replace inline sticky h-24 bars with <Pin> (gallery subgrid bar left as-is)"
  ```

---

### Task 11: Final full-system verification gate
End-to-end confirmation that the phase introduced zero regressions and the perf/a11y budgets hold.

- **Files:** None (verification only).
- **Interfaces:** None.

- [ ] **Step 1: Typecheck + build + marker parity.**
  ```bash
  bunx tsc --noEmit   # Expected: no output
  bun run build 2>&1 | grep -E '^\s*[○●ƒ]'   # Expected: byte-identical to docs/superpowers/plans/.phase3-baseline.txt markers
  ```

- [ ] **Step 2: Confirm zero new runtime deps (Dependency Rule).**
  ```bash
  git diff --stat -- package.json bun.lock 2>/dev/null; git status --porcelain package.json bun.lock 2>/dev/null
  ```
  Expected: no changes to `package.json` / lockfile (no dep added — `splitText` was hand-rolled).

- [ ] **Step 3: Confirm the banned patterns are absent across the new/changed surface.**
  ```bash
  grep -rn "useSpring" src/components/animations/   # Expected: no output (Rule 4)
  grep -rn "splitText" src/components/animations/   # Expected: no output (not in Motion v12.40)
  grep -rn "lenis.*raf\|new Lenis\|autoRaf: *true" src/   # Expected: only src/providers/lenis.provider.tsx (single loop, autoRaf:false)
  ```

- [ ] **Step 4: BROWSER-VERIFY full pass (web-perf skill → Chrome DevTools MCP → Lighthouse).**
  > BROWSER-VERIFY: For `/`, `/projects`, `/projects/[slug]`, `/about`:
  > - CWV: LCP <= 2.5s, INP <= 200ms (interact while scrolling — the scroll handlers must not block input), CLS <= 0.1.
  > - Critical-path JS <= 170 KB gz (Coverage / Network panel; the scroll primitives are tiny but confirm `motion` isn't double-bundled).
  > - Performance trace while scrolling: ONE RAF loop only; no spring trailing on any parallax; no long tasks > 50ms from scroll.
  > - `prefers-reduced-motion: reduce`: all reveals/parallax/progress-bar static or hidden; page fully usable.
  > - `<ScrollProgressBar>` (if mounted): CSS `scroll()` timeline path in Chromium; raw-MotionValue fallback elsewhere; both track scroll 1:1 with no lag.
  > Structured-data is out of scope for Phase 3 — no JSON-LD changes here. (Reminder for later phases: validate BreadcrumbList via https://search.google.com/test/rich-results and https://validator.schema.org; Person/WebSite are entity-only.)

- [ ] **Step 5: COMMIT (no-op marker / or skip if nothing to commit).**
  ```bash
  git add -A && git commit -m "chore(scroll): phase-3 scroll-animation system verification gate" --allow-empty
  ```

---

## Done criteria
- `src/components/animations/scroll/` exists with `useScrollProgress`, `useParallax`, `<Pin>`, `<ScrollProgressBar>`, and `index.ts` barrel.
- `<KineticText>` exists in `src/components/animations/text/` (hand-rolled, no `splitText`).
- `TextReveal`/`TextBlur` accept `scrollReveal` and default-behave identically.
- `OverviewImage` and `about/HeroSection` parallax via `useParallax`; four sticky bars use `<Pin>` (gallery subgrid bar intentionally left raw).
- `globals.css` has the reduced-motion kill-switch + scroll-timeline progress-bar CSS.
- `bunx tsc --noEmit` clean; `bun run build` route markers unchanged from baseline; zero new deps; no `useSpring`/`splitText`/second-RAF anywhere.
