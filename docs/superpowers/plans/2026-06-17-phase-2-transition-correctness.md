# Phase 2 — Transition Correctness Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (- [ ]) syntax.
**Goal:** Replace the brittle fixed-timer page transition with a navigation-signal-driven state machine so the brand overlay covers off the Motion `onAnimationComplete` and uncovers off the REAL committed navigation (`usePathname()` change), never a dead timer.
**Architecture:** The page slice becomes an explicit 4-phase state machine (`idle | covering | covered | uncovering`) plus a `targetPath`. `TLink` is the single nav funnel: its `onNavigate` handler enters `covering` and stores the destination, then calls `router.push`. The centralized `PageTransition` overlay owns the choreography — its cover animation's `onAnimationComplete` flips `covering -> covered`, and a `usePathname()` effect detects arrival at `targetPath` to flip `covered -> uncovering -> idle`. No `sleep()` remains in the nav path. `useFirstRender`'s parallel `setTimeout(3000)` is retired; first-render completion is already signalled by the SVG `onUpdate` in `firstRender.transition.tsx`.
**Tech Stack:** Next.js 16.2.9 (App Router, Turbopack) · React 19.2.7 · Motion v12.40 (`motion/react`) · Lenis v1.3.23 (Motion frame loop, `autoRaf:false`) · Zustand v5 (single vanilla store, sliced) · Tailwind v4. Package manager: bun.
**Depends on:** none (Phase 2 is self-contained; touches only the transition state machine and its consumers).

## Global Constraints (every task must respect these)
PERFORMANCE BUDGET (p75, mobile+desktop): LCP <= 2.5s · INP <= 200ms · CLS <= 0.1 · critical-path JS <= 170 KB gz.
ANIMATION RULES: (1) animate transform/opacity/clip-path ONLY — never width/height/top/left/margin. (2) Single RAF loop — Lenis stays driven by Motion's frame; never run Lenis's own raf AND Motion's. (3) Cursor is imperative (MotionValue+spring), never React state per pointermove. (4) NEVER useSpring a Lenis-smoothed useScroll value (double-lerp = lag). (5) prefers-reduced-motion is systemic (gate Lenis, intro overlay, transitions; CSS kill-switch). (6) Don't gate the LCP hero behind an opacity:0 reveal. (7) will-change only transiently.
DEPENDENCY RULE: zero new runtime deps EXCEPT the one chosen WebGL lib (Phase 4), used ONLY for isolated lazy-loaded islands — never a global canvas.
SEO FACTS (verified live 2026-06-17): BreadcrumbList is the ONLY structured-data type that yields a visible Google rich result. Person/WebSite are entity-only (no snippet). DROP SearchAction (deprecated Nov 2024); do NOT build FAQPage/HowTo (deprecated). Canonicals must exist on every route. CWV thresholds unchanged in 2026. llms.txt irrelevant to Google.

---

## Background: the bug being fixed (read before starting)

`src/components/common/transitionLink.tsx` lines 38-45 today:
```tsx
setPageTransition({ isTransition: true, isTransitionComplete: false })
await sleep(1500)            // cover wait — ignores when overlay ACTUALLY finishes covering
push(href, { scroll: true })
await sleep(3000)            // uncover wait — ignores whether destination DATA has loaded
setPageTransition({ isTransition: false })
```
Plus `src/hooks/useFirstRender.hook.ts` line 24 runs a parallel `setTimeout(handleFirstRender, 3000)`.

Failure modes: (a) on slow data, the overlay lifts (after fixed 3000ms) BEFORE the destination content is ready; (b) on fast nav, the user waits out the dead 1500+3000ms timer; (c) rapid re-clicks restart `sleep` chains that desync against the overlay's own `AnimatePresence`.

**Key API facts (verified against installed `node_modules/next@16.2.9`):**
- `next/link` exports `onNavigate?: (event: { preventDefault: () => void }) => void` (link.d.ts:89). It receives NO href — we capture the destination from `TLink`'s own `href` prop.
- `next/link` exports `useLinkStatus(): { pending: boolean }` (link.d.ts:117) but it reads Link context and MUST be called from a component rendered INSIDE a `<Link>`. We do NOT use it here: the centralized overlay is not a Link descendant. The robust single-funnel "arrival" signal is `usePathname()` flipping to `targetPath` (navigation committed + new segment rendered). `useLinkStatus` is noted as an optional per-link enhancement only.
- `motion/react` `motion.div` supports `onAnimationComplete?: (definition) => void` fired when an animation target finishes — this is our "fully covered" signal.

**Why pathname-change over a loading.tsx Suspense boundary:** there is currently NO `loading.tsx` in `src/app/(main)`. `usePathname()` changing is the universal commit signal across all four routes (`/`, `/about`, `/projects`, `/projects/[slug]`) and needs no per-route file. A `loading.tsx` boundary is noted as an optional Task 6 enhancement for streamed slow data, but is NOT required for correctness.

---

### Task 1: Extend the page slice into an explicit state machine

**Files:**
- Modify `src/stores/slices/page.slice.ts` (full file, currently 17 lines).

**Interfaces:**
- Produces: `PageSlice['page']` now `{ isTransition: boolean; isTransitionComplete: boolean; phase: TransitionPhase; targetPath: string | null }`; type `TransitionPhase = 'idle' | 'covering' | 'covered' | 'uncovering'`; same `setPageTransition(partial)` setter signature (later tasks call it with the new keys).
- Consumes: nothing.

Backward-compat note: `isTransition` and `isTransitionComplete` are RETAINED so existing consumers (`blur.text.tsx`, `reveal.text.tsx`, `page.transition.tsx`'s `useScrollControl`) keep working unchanged. `phase`/`targetPath` are additive.

- [ ] **Step 1: Read the current file to confirm it matches the diff base.** Run `cat src/stores/slices/page.slice.ts`. Expect exactly the 17-line version (interface with `page: { isTransition; isTransitionComplete }` + `setPageTransition` + `initialPageState` + `createPageSlice`).

- [ ] **Step 2: Replace the whole file with the state-machine version.** Write `src/stores/slices/page.slice.ts`:
```ts
import { CreateSlice } from '..'

export type TransitionPhase = 'idle' | 'covering' | 'covered' | 'uncovering'

export interface PageSlice {
  page: {
    isTransition: boolean
    isTransitionComplete: boolean
    phase: TransitionPhase
    targetPath: string | null
  }
  setPageTransition: (page: Partial<PageSlice['page']>) => void
}

export const initialPageState: PageSlice['page'] = {
  isTransition: false,
  isTransitionComplete: false,
  phase: 'idle',
  targetPath: null,
}

export const createPageSlice: CreateSlice<PageSlice> = (set) => ({
  page: initialPageState,
  setPageTransition: (page) => set((state) => ({ page: { ...state.page, ...page } })),
})
```

- [ ] **Step 3: VERIFICATION.** Run:
```
bunx tsc --noEmit
```
Expected: no output (0 errors). The additive fields cannot break existing reads; `setPageTransition(Partial<...>)` still accepts old-shape calls.

- [ ] **Step 4: COMMIT.**
```
git add src/stores/slices/page.slice.ts && git commit -m "feat(transition): extend page slice with phase state machine"
```
(Repo may not be initialized in the execution env — run the command regardless.)

---

### Task 2: Make `TLink` fire `onNavigate` and drop the sleep timers

**Files:**
- Modify `src/components/common/transitionLink.tsx` (full file, currently 49 lines).

**Interfaces:**
- Consumes: `usePageTransition()` -> `{ setPageTransition }` (Task 1 setter, now accepts `phase`/`targetPath`); `TransitionPhase` is internal to the slice — `TLink` only sets `phase: 'covering'`.
- Produces: on click of an internal `TLink`, store transitions to `{ isTransition: true, isTransitionComplete: false, phase: 'covering', targetPath: <href> }` and `router.push(href)` is called immediately (no pre-push sleep). The overlay (Task 3) owns the rest of the choreography.

Design note: `onNavigate` fires for client-side nav AND lets us `preventDefault()` to suppress a duplicate same-path push. We keep `onClick` ONLY for the side effects that must run on pointer intent regardless of nav (close menu, hide cursor, analytics, same-path scroll-to-top). The navigation funnel logic (set phase + push) moves to `onNavigate` so it runs exactly once per real navigation and never on `preventDefault`-ed clicks.

- [ ] **Step 1: Read the current file to confirm the diff base.** Run `cat src/components/common/transitionLink.tsx`. Expect the 49-line version importing `sleep`, doing `await sleep(1500)` / `await sleep(3000)`.

- [ ] **Step 2: Replace the whole file.** Write `src/components/common/transitionLink.tsx`:
```tsx
'use client'

import Link, { LinkProps } from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { handleGoogleEvent } from '@/lib/analytic/googleEvent'
import { useLenis } from 'lenis/react'
import { usePageTransition } from '@/hooks/stores/usePage.hook'
import { useMenu } from '@/hooks/stores/useMenu.hook'
import { useCursor } from '@/hooks/stores/useCursor.hook'

type TLinkProps = Omit<React.HTMLProps<HTMLAnchorElement> & LinkProps, 'onClick' | 'classID'>

export function TLink({ href, ...props }: TLinkProps) {
  const lenis = useLenis()
  const pathname = usePathname()
  const { push } = useRouter()
  const {
    page: { phase },
    setPageTransition,
  } = usePageTransition()
  const { setMenu } = useMenu()
  const { setCursor } = useCursor()

  const target = typeof href === 'string' ? href : (href.pathname ?? '')

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Pointer-intent side effects always run; navigation itself is handled in onNavigate.
    setMenu({ isOpen: false })
    setCursor({ isVisible: false, children: null })
    handleGoogleEvent({ event: 'linkClicked', url: target })

    if (pathname === target) {
      e.preventDefault()
      if (lenis) lenis.scrollTo(0)
      else window.scrollTo(0, 0)
    }
  }

  const handleNavigate = (e: { preventDefault: () => void }) => {
    // Same-path: no transition (scroll-to-top already handled in handleClick).
    if (pathname === target) {
      e.preventDefault()
      return
    }
    // Rapid re-click guard: a cover/cover-hold is already running — let it own the nav.
    if (phase === 'covering' || phase === 'covered') {
      e.preventDefault()
      return
    }

    setPageTransition({
      isTransition: true,
      isTransitionComplete: false,
      phase: 'covering',
      targetPath: target,
    })
    // Drive navigation immediately; the overlay covers in parallel and the
    // uncover is gated on the REAL pathname arrival (see PageTransition).
    push(target, { scroll: true })
  }

  return <Link href={href} onClick={handleClick} onNavigate={handleNavigate} {...props} />
}
```

- [ ] **Step 3: VERIFICATION — types.** Run:
```
bunx tsc --noEmit
```
Expected: no output. (`sleep` import removed; confirm no other file imported `sleep` FROM this module — it imports from `@/lib/utils/sleep`, which still exists and is untouched.)

- [ ] **Step 4: VERIFICATION — no stray sleep in nav path.** Run:
```
grep -n "sleep" src/components/common/transitionLink.tsx
```
Expected: no output (zero matches).

- [ ] **Step 5: COMMIT.**
```
git add src/components/common/transitionLink.tsx && git commit -m "refactor(transition): drive TLink via onNavigate, remove sleep timers"
```

---

### Task 3: Rewrite `PageTransition` to drive cover/uncover off real signals

**Files:**
- Modify `src/components/transitions/page.transition.tsx` (full file, currently 83 lines).

**Interfaces:**
- Consumes: `usePageTransition()` -> `{ page, setPageTransition }` where `page` now carries `phase` + `targetPath` (Task 1); `useScrollControl(page.isTransitionComplete)` (unchanged hook at `src/hooks/useScrollControl.hook.ts`); `mountAnim`, `duration`, `easing` from `animation.constant.ts`; `pageTransitionVariant`, `pageTransitionOverlayVariant` from `pageTransition.variant.ts`; `Logo` from `../common/icon`; `usePathname` from `next/navigation`; `useReducedMotion` from `motion/react`.
- Produces: the overlay's lifecycle. `covering` shows overlay; cover `motion.div`'s `onAnimationComplete` flips `phase -> 'covered'`; a `usePathname()` effect detects `pathname === targetPath` while `covered` and flips `phase -> 'uncovering'`; `AnimatePresence onExitComplete` resets to `{ isTransition: false, isTransitionComplete: true, phase: 'idle', targetPath: null }`.

Choreography preserved: the brand overlay (blur backdrop + logo + animated current-path label) is unchanged visually. We only re-gate WHEN it exits.

Reduced-motion: when `useReducedMotion()` is true, collapse the choreography — render NO overlay, and on click the nav still happens (TLink already pushed). We short-circuit by never entering the visible branch and immediately resolving the phase to `idle` so `isTransitionComplete` flips true without animation.

- [ ] **Step 1: Read the current file to confirm the diff base.** Run `cat src/components/transitions/page.transition.tsx`. Expect the 83-line version: `AnimatePresence mode="wait" onExitComplete={() => setPageTransition({ isTransitionComplete: true })}` gated on `page.isTransition`, with the blur/logo/label markup.

- [ ] **Step 2: Replace the whole file.** Write `src/components/transitions/page.transition.tsx`:
```tsx
'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { usePageTransition } from '@/hooks/stores/usePage.hook'
import { useScrollControl } from '@/hooks/useScrollControl.hook'
import { duration, easing, mountAnim } from '@/lib/constants/animation.constant'
import {
  pageTransitionOverlayVariant,
  pageTransitionVariant,
} from '@/lib/constants/variants/pageTransition.variant'
import { Logo } from '../common/icon'

export function PageTransition() {
  const { page, setPageTransition } = usePageTransition()
  const pathname = usePathname()
  const isReduceMotion = useReducedMotion()

  const currentPath = pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'home'

  useScrollControl(page.isTransitionComplete)

  // Reduced motion: never play the choreography. As soon as a transition is
  // requested, resolve it immediately (no overlay, no dead time).
  useEffect(() => {
    if (isReduceMotion && page.isTransition) {
      setPageTransition({
        isTransition: false,
        isTransitionComplete: true,
        phase: 'idle',
        targetPath: null,
      })
    }
  }, [isReduceMotion, page.isTransition, setPageTransition])

  // REAL navigation-arrival signal: once we are fully covered AND the router has
  // committed to the target path (new segment rendered), begin uncovering.
  useEffect(() => {
    if (page.phase === 'covered' && page.targetPath && pathname === page.targetPath) {
      setPageTransition({ phase: 'uncovering' })
    }
  }, [page.phase, page.targetPath, pathname, setPageTransition])

  if (isReduceMotion) return null

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() =>
        setPageTransition({
          isTransition: false,
          isTransitionComplete: true,
          phase: 'idle',
          targetPath: null,
        })
      }
    >
      {/* Overlay stays mounted through covering + covered, and only EXITS when
          phase is uncovering. Removing the node triggers AnimatePresence exit. */}
      {page.isTransition && page.phase !== 'uncovering' && (
        <div className="fixed top-0 left-0 z-[999] h-dvh w-full">
          <motion.div
            {...mountAnim(pageTransitionVariant)}
            className="absolute top-0 left-0 size-full"
          >
            <motion.div
              {...mountAnim(pageTransitionOverlayVariant)}
              onAnimationComplete={() => {
                // Fully covered: hand off to the pathname-arrival effect above.
                if (page.phase === 'covering') setPageTransition({ phase: 'covered' })
              }}
              className="bg-secondary absolute top-0 left-0 size-full"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  duration: duration.medium,
                  delay: duration.medium,
                  ease: easing.inOut,
                },
              }}
              exit={{ opacity: 0, transition: { duration: duration.short, ease: easing.inOut } }}
              className="relative flex size-full flex-col items-center justify-center"
            >
              <AnimatePresence mode="wait" propagate initial={false}>
                <motion.p
                  key={currentPath}
                  initial={{ y: '50%', opacity: 0 }}
                  animate={{
                    y: '20%',
                    opacity: 1,
                    transition: {
                      duration: duration.medium,
                      delay: duration.short,
                      ease: easing.out,
                    },
                  }}
                  exit={{
                    y: '-50%',
                    opacity: 0,
                    transition: { duration: duration.short, ease: easing.in },
                  }}
                  className="text-foreground font-helvetica absolute right-6 bottom-6  font-bold uppercase clamp-[text,xl,5xl]"
                >
                  {currentPath}
                </motion.p>
              </AnimatePresence>

              <Logo className="text-foreground size-40 translate-x-[10%] md:size-60" />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
```

Mechanism summary:
- `covering`: overlay node present, blur+opacity ENTER animations play. The `bg-secondary` cover div's `onAnimationComplete` flips `covering -> covered`.
- `covered`: overlay stays fully on-screen (held) while the router resolves. The `usePathname()` effect waits for `pathname === targetPath`. On a fast static route this is ~instant; on slow data it waits exactly as long as the route takes — no dead 3000ms, no premature lift.
- `uncovering`: the node is removed from the tree, `AnimatePresence` plays the EXIT animations (blur out + label exit). `onExitComplete` resets to `idle` and sets `isTransitionComplete: true`, which re-arms `blur.text`/`reveal.text` reveals and re-enables Lenis via `useScrollControl`.

- [ ] **Step 3: VERIFICATION — types.** Run:
```
bunx tsc --noEmit
```
Expected: no output. (`onAnimationComplete` and `useReducedMotion` are valid `motion/react` exports/props at v12.40.)

- [ ] **Step 4: VERIFICATION — build + route markers.** Run:
```
bun run build
```
Expected: build succeeds. In the route table, the `(main)` routes still render as before — assert the home route line is present, e.g. quote a line matching:
```
○ /                                       (static)
```
and the project detail line:
```
ƒ /projects/[slug]
```
(`○ (Static)` for `/`, `/about`, `/projects`; `ƒ (Dynamic)` for `/projects/[slug]`.) This change is client-only and must NOT flip any route's static/dynamic classification.

- [ ] **Step 5: > BROWSER-VERIFY (web-perf skill — Chrome DevTools MCP).** Manually drive nav and confirm:
  - Fast nav (static `/` -> `/about`): overlay covers, then lifts as soon as `/about` is committed — NO multi-second dead wait. Compare against the old ~4.5s.
  - Slow data (`/projects` -> `/projects/[slug]` with network throttled to Slow 3G via DevTools): overlay stays COVERED until the detail content is ready; it must NOT lift to reveal a blank/spinner. (This is the core regression being fixed.)
  - Rapid re-click: click two menu links in quick succession; the second click's `onNavigate` is `preventDefault`-ed by the `covering|covered` guard (Task 2) so the overlay does not desync or double-fire.
  - INP under 200ms on the click (no main-thread block from a removed `await sleep`).
  Reference the `web-perf` skill for capturing a performance trace + INP. There is no rich-result/structured-data surface in this task, so the Rich Results Test / validator.schema.org are not applicable here.

- [ ] **Step 6: COMMIT.**
```
git add src/components/transitions/page.transition.tsx && git commit -m "feat(transition): drive cover via onAnimationComplete, uncover via pathname arrival"
```

---

### Task 4: Retire `useFirstRender`'s `setTimeout(3000)`; signal off the intro animation

**Files:**
- Modify `src/hooks/useFirstRender.hook.ts` (full file, currently 28 lines).
- Modify `src/components/transitions/firstRender.transition.tsx` (the SVG `onUpdate` already at line 58-60 — wire it to also resolve `isTransitionDone`).

**Interfaces:**
- Consumes: `usePageTransition()` -> `{ setPageTransition }`; `tryCatch`, `checkFirstRender` (kept for the cookie round-trip — only the timer wrapper changes); `firstRenderVariant`/`polygonVariant`/`rectVariant`, `mountAnim`.
- Produces: `useFirstRender(isFirstRender, setIsTransitionDone)` no longer schedules a 3000ms timer. The intro overlay's exit is driven by the SVG `rect` reaching `y === '-50%'` (its existing `onUpdate` completion marker), which now ALSO calls `setIsTransitionDone(true)` and fires the `checkFirstRender()` cookie write. `setPageTransition({ isTransitionComplete: true })` still flips at the same animation moment.

Design note: today there are TWO independent clocks for first render — the 3000ms `setTimeout` in `useFirstRender` AND the SVG `onUpdate` marker in `firstRender.transition.tsx`. They can disagree. We make the ANIMATION the single source of truth: the SVG completion both reveals content and triggers the cookie round-trip. The hook keeps the cookie/side-effect responsibility but loses its own timer.

- [ ] **Step 1: Read both files to confirm the diff base.** Run `cat src/hooks/useFirstRender.hook.ts src/components/transitions/firstRender.transition.tsx`. Confirm the hook has `const timeout = setTimeout(handleFirstRender, 3000)` (line 24) and the transition has the `rect`'s `onUpdate={(latest) => { if (latest.y === '-50%') setPageTransition({ isTransitionComplete: true }) }}` (lines 58-60).

- [ ] **Step 2: Replace `src/hooks/useFirstRender.hook.ts`.** Expose a callback the animation can call instead of running a timer:
```ts
import { tryCatch } from '@/lib/utils/tryCatch'
import { checkFirstRender } from '@/services/checkFirstRender.service'
import { useCallback, useEffect } from 'react'
import { usePageTransition } from './stores/usePage.hook'

export function useFirstRender(
  isFirstRender: boolean,
  setIsTransitionDone: (isTransitionDone: boolean) => void,
) {
  const { setPageTransition } = usePageTransition()

  useEffect(() => {
    if (isFirstRender) {
      setPageTransition({ isTransitionComplete: true })
    }
  }, [isFirstRender, setPageTransition])

  // Called by the intro overlay when its SVG mark finishes animating — the
  // animation is the single source of truth, not a parallel setTimeout.
  const completeFirstRender = useCallback(async () => {
    setIsTransitionDone(true)
    const [, error] = await tryCatch(checkFirstRender())
    if (error) return
  }, [setIsTransitionDone])

  return { completeFirstRender }
}
```

- [ ] **Step 3: Wire the intro overlay to the callback.** In `src/components/transitions/firstRender.transition.tsx`, change the hook call and the `rect` `onUpdate`. First the hook call (currently `useFirstRender(isFirstRender, setIsTransitionDone)` at line 25):
```tsx
  const { completeFirstRender } = useFirstRender(isFirstRender, setIsTransitionDone)
```
Then the `rect`'s `onUpdate` (currently lines 58-60):
```tsx
                    onUpdate={(latest) => {
                      if (latest.y === '-50%') {
                        setPageTransition({ isTransitionComplete: true })
                        completeFirstRender()
                      }
                    }}
```
Leave everything else (the `useState(isFirstRender)`, `useScrollControl(isTransitionDone)`, the SVG markup) unchanged. The `AnimatePresence` exit on `!isTransitionDone` now plays the moment the SVG mark completes — driven by the animation, not a 3000ms guess.

- [ ] **Step 4: VERIFICATION — types + no stray timer.** Run:
```
bunx tsc --noEmit && grep -n "setTimeout\|3000" src/hooks/useFirstRender.hook.ts
```
Expected: `tsc` produces no output; the `grep` produces no output (the 3000ms timer is gone).

- [ ] **Step 5: > BROWSER-VERIFY (web-perf skill).** Clear the first-render cookie (DevTools > Application > Cookies, or hit the route in a fresh incognito window) and load `/`:
  - The intro SVG plays once, and content reveals exactly when the mark finishes — not on a fixed 3s clock.
  - Confirm the `/api/first-render` request fires once (DevTools Network) so subsequent loads skip the intro.
  - With `prefers-reduced-motion` emulated (DevTools Rendering > Emulate CSS prefers-reduced-motion), confirm the menu/PageTransition reduced paths still behave (intro overlay variant already gated elsewhere; verify content is not stuck hidden — `isTransitionComplete` must reach true).

- [ ] **Step 6: COMMIT.**
```
git add src/hooks/useFirstRender.hook.ts src/components/transitions/firstRender.transition.tsx && git commit -m "refactor(transition): retire first-render setTimeout, signal off intro animation"
```

---

### Task 5: Confirm consumers + dead-code sweep

**Files:**
- Read-only verification of `src/components/animations/text/blur.text.tsx` (reads `page.isTransitionComplete`, line 30), `src/components/animations/text/reveal.text.tsx` (reads `page.isTransitionComplete`, line 37), `src/hooks/useScrollControl.hook.ts`, `src/hooks/stores/usePage.hook.ts` (selector exposes `page` + `setPageTransition`), `src/stores/index.ts` (spreads `initialPageState`).
- No file changes expected unless the sweep finds a stale reference.

**Interfaces:**
- Consumes: the Task 1 slice shape. Confirms NO consumer reads a removed field (none were removed — `isTransition`/`isTransitionComplete` retained).
- Produces: a clean type surface; `sleep` is no longer used by any nav code (only its own module remains; other callers may exist and are out of scope).

- [ ] **Step 1: Confirm `isTransitionComplete` consumers are intact.** Run:
```
grep -rn "isTransitionComplete\|page\.phase\|targetPath" src/components src/hooks src/stores
```
Expected: matches in `blur.text.tsx`, `reveal.text.tsx`, `page.transition.tsx`, `firstRender.transition.tsx`, `transitionLink.tsx`, `useScrollControl.hook.ts` (via `enable` arg), `page.slice.ts`. Every read of `isTransitionComplete` still resolves against the retained field. No read references a deleted key.

- [ ] **Step 2: Confirm `usePage.hook.ts` selector still exposes what tasks need.** Run `cat src/hooks/stores/usePage.hook.ts`. Expect it returns `{ page, setPageTransition }` via `useShallow` — `page` now includes `phase`/`targetPath` automatically (whole-`page` selector), so Task 2/3 destructures (`page.phase`) work with no hook change.

- [ ] **Step 3: Confirm `sleep` has no remaining nav-path importer.** Run:
```
grep -rn "from '@/lib/utils/sleep'" src
```
Expected: zero matches in `transitionLink.tsx` (it was the only nav consumer). If any OTHER file still imports `sleep`, that is out of Phase 2 scope — leave it; `src/lib/utils/sleep.ts` itself stays (constraint: reuse existing utils, do not delete shared helpers).

- [ ] **Step 4: VERIFICATION — full type + build gate.** Run:
```
bunx tsc --noEmit && bun run build
```
Expected: `tsc` no output; `bun run build` succeeds with the same route table classification as Task 3 Step 4 (`○` for `/`, `/about`, `/projects`; `ƒ` for `/projects/[slug]`).

- [ ] **Step 5: > BROWSER-VERIFY (web-perf skill — full regression matrix).** With `bun run build && bun run start` running, exercise the whole funnel through all four `TLink` call sites:
  - Header logo (`src/components/layout/header/index.tsx` -> `/`).
  - Menu links (`src/components/layout/menu/index.tsx` -> each `links[]` href).
  - Projects list rows (`src/module/projects/view/project-list.view.tsx` -> `/projects/[slug]`).
  - Cursor trigger (`src/components/animations/cursor/view.cursor.tsx` -> href).
  Confirm for each: overlay covers fully before content swaps, holds until arrival, then lifts; `blur.text`/`reveal.text` re-reveal after `isTransitionComplete` flips; Lenis re-starts (scroll works) post-transition. Capture an INP measurement on a representative click (target <200ms) and a CLS check during the overlay lift (target <0.1 — the overlay is `position:fixed`, must not shift document flow).

- [ ] **Step 6: COMMIT (if any change was needed; otherwise skip).**
```
git add -A && git commit -m "test(transition): verify consumers + dead-code sweep for phase machine"
```

---

### Task 6 (OPTIONAL enhancement, not required for correctness): add a `loading.tsx` Suspense floor for streamed slow data

**Files:**
- Create `src/app/(main)/projects/[slug]/loading.tsx` (only if Task 5 BROWSER-VERIFY shows the detail route streams and the `covered` hold ends a beat before the LCP image paints).

**Interfaces:**
- Consumes: nothing from earlier tasks at runtime; complements the `covered` phase by guaranteeing the new segment's Suspense boundary resolves before `usePathname()`-driven uncover reveals real content.
- Produces: a route-level loading fallback. Note: because the brand overlay already holds `covered` until `pathname === targetPath`, this is belt-and-suspenders for streamed RSC payloads, not a fix for the timer bug.

Decision rule: SKIP this task unless the browser regression in Task 5 demonstrates a visible gap (overlay lifts, then a flash of fallback before content). If skipped, document "Task 6 skipped — pathname-arrival hold sufficient" in the execution log.

- [ ] **Step 1: > BROWSER-VERIFY first — decide if needed.** Under Slow 3G, navigate `/projects` -> `/projects/[slug]`. If the overlay lift is perfectly aligned with content paint, STOP and skip Task 6. Only proceed if there is a fallback flash.

- [ ] **Step 2 (only if needed): Create `src/app/(main)/projects/[slug]/loading.tsx`.** Render a minimal `bg-secondary` full-bleed placeholder matching the overlay color so any sub-frame gap is invisible:
```tsx
export default function Loading() {
  return <div className="bg-secondary fixed inset-0 z-[998] h-dvh w-full" aria-hidden />
}
```

- [ ] **Step 3: VERIFICATION.** Run `bunx tsc --noEmit && bun run build`. Expected: no output / build success. Confirm `ƒ /projects/[slug]` still dynamic.

- [ ] **Step 4: > BROWSER-VERIFY.** Re-run the Slow 3G nav; confirm zero fallback flash on uncover.

- [ ] **Step 5: COMMIT (only if created).**
```
git add src/app/(main)/projects/[slug]/loading.tsx && git commit -m "feat(transition): add loading floor for streamed project detail"
```

---

## Phase 2 done-definition
- `bunx tsc --noEmit` clean and `bun run build` green with unchanged route classifications.
- No `sleep()` and no `setTimeout(_, 3000)` in the navigation or first-render path (`grep` clean per Task 2 Step 4 and Task 4 Step 4).
- BROWSER-VERIFY confirmed: overlay no longer lifts before content on slow data; no dead-timer wait on fast nav; rapid re-click does not desync; reduced-motion collapses the choreography (overlay returns `null`, content still reveals).
- The brand overlay choreography is visually preserved (NOT replaced with View Transitions — explicitly out of scope this phase).
