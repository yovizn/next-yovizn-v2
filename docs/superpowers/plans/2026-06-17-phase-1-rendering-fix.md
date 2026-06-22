# Phase 1 — Rendering Fix (prerender + LCP) Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (- [ ]) syntax.
**Goal:** Decouple the `(main)` route tree from per-request dynamic rendering so `/`, `/about`, `/projects`, and every `projects/[slug]` prerender as static, by moving the cosmetic device/first-render reads from server (`cookies()`/`headers()`) to client-side detection.
**Architecture:** `src/app/(main)/layout.tsx` currently `await`s `getFirstRender()` (reads `cookies()`) and `getDeviceInfo()` (reads `headers()`), which marks the whole subtree dynamic (`ƒ`). We remove both server reads. Device gating moves to a client `(pointer:fine)` matchMedia hook for Lenis (JS-conditional-mount) and to a CSS media query for the cursor (always rendered, CSS-hidden on coarse pointers — avoids hydration mismatch). First-render is read post-hydration from `document.cookie` inside the existing `FirstRenderTransition`, defaulting to "skip intro" so repeat visits never flash. The Sanity data layer already uses plain `client.fetch` (no `sanityFetch`/`defineLive`/`draftMode`), so it stays static-compatible — the layout reads are the only dynamic dependency.
**Tech Stack:** Next.js 16.2.9 (App Router, Turbopack), React 19.2.7, Motion v12.40, Lenis v1.3.23 (Motion-frame-driven, `autoRaf:false`), Tailwind v4 (CSS-first in `src/styles/globals.css`), Zustand v5 (vanilla store via context), next-sanity 13, bun. No test framework.
**Depends on:** none (this phase UNBLOCKS Phase 0's JSON-LD landing in static HTML).

## Global Constraints (every task must respect these)
PERFORMANCE BUDGET (p75, mobile+desktop): LCP <= 2.5s · INP <= 200ms · CLS <= 0.1 · critical-path JS <= 170 KB gz.
ANIMATION RULES: (1) animate transform/opacity/clip-path ONLY — never width/height/top/left/margin. (2) Single RAF loop — Lenis stays driven by Motion's frame; never run Lenis's own raf AND Motion's. (3) Cursor is imperative (MotionValue+spring), never React state per pointermove. (4) NEVER useSpring a Lenis-smoothed useScroll value (double-lerp = lag). (5) prefers-reduced-motion is systemic (gate Lenis, intro overlay, transitions; CSS kill-switch). (6) Don't gate the LCP hero behind an opacity:0 reveal. (7) will-change only transiently.
DEPENDENCY RULE: zero new runtime deps EXCEPT the one chosen WebGL lib (Phase 4), used ONLY for isolated lazy-loaded islands — never a global canvas.
SEO FACTS (verified live 2026-06-17): BreadcrumbList is the ONLY structured-data type that yields a visible Google rich result. Person/WebSite are entity-only (no snippet). DROP SearchAction (deprecated Nov 2024); do NOT build FAQPage/HowTo (deprecated). Canonicals must exist on every route. CWV thresholds unchanged in 2026. llms.txt irrelevant to Google.

---

## Background: facts established by reading the actual files (2026-06-17)

- `src/app/(main)/layout.tsx` lines 13-14 are the ONLY dynamic-API reads in the `(main)` tree. A repo-wide grep confirms `cookies()`/`headers()` appear only in `getFirstRender.cookie.ts`, `device.ts`, and `api/first-render/route.ts` (the API route is fine — route handlers are dynamic by nature and not part of the prerendered page tree).
- The pages (`page.tsx`, `about/page.tsx`, `projects/page.tsx`, `projects/[slug]/page.tsx`) fetch via `src/services/getProjects.service.ts`, which calls plain `client.fetch(...)`. `src/sanity/lib/client.ts` uses `createClient({ useCdn: false })` with NO `draftMode`, NO `sanityFetch`, NO `defineLive`. Therefore the data path does NOT force dynamic. Removing the two layout reads is sufficient to flip the markers to static.
- `useScrollControl` (used by `FirstRenderTransition` and `PageTransition`) calls `useLenis()` from `lenis/react`. `<ReactLenis root>` registers a GLOBAL Lenis instance; the transitions are SIBLINGS of `<LenisProvider/>`, not children — `useLenis()` reads the registered instance, not subtree context. When Lenis isn't mounted (coarse pointer), `useLenis()` returns `null` and `useScrollControl` no-ops the lenis calls (it still sets `document.body.style.overflow`). This is the CURRENT mobile behavior and MUST be preserved.
- First-render cookie semantics are INVERTED: `isFirstRender === 'true'` means the cookie EXISTS = already visited = SKIP the intro; cookie ABSENT = genuine first visit = PLAY the intro. `FirstRenderTransition` initializes `useState(isFirstRender)` for `isTransitionDone` — i.e. `true` (done/skip) when already visited.
- `src/hooks/useMedia.hook.ts` exports `useMatchMedia(breakPoint, query)` — width-only; it CANNOT express `(pointer:fine)`. We extend that file with a raw-query variant rather than creating a new file (per Shared-naming reuse rule).
- Cursor root element: `motion.div` with `className="pointer-events-none fixed top-0 left-0 z-50 h-screen w-full"` (line 73 of `cursor/index.tsx`).

---

### Task 1: Add a raw media-query hook to `useMedia.hook.ts`

**Files:** Modify `src/hooks/useMedia.hook.ts` (append after existing `useMatchMedia`, currently lines 1-21).

**Interfaces:**
- Consumes: nothing.
- Produces: `useMediaQuery(query: string): boolean` — SSR-safe (returns `false` until mounted), re-renders on change. Used by Task 2 for `'(pointer:fine)'`.

- [ ] **Step 1: Read the current file to confirm exact contents.**
  Run: `cat src/hooks/useMedia.hook.ts` — confirm it matches the snippet below before editing.

- [ ] **Step 2: Append `useMediaQuery` to `src/hooks/useMedia.hook.ts`.**
  The file currently is:
  ```ts
  import { useEffect, useState } from 'react'

  export const useMatchMedia = (
    breakPoint: number | undefined = 640,
    query: 'min' | 'max' = 'max',
  ) => {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
      const mediaQuery = window.matchMedia(`(${query}-width: ${breakPoint}px)`)

      setMatches(mediaQuery.matches)

      const handleChange = () => setMatches(mediaQuery.matches)

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }, [breakPoint, query])

    return matches
  }
  ```
  Append this AFTER the existing export (keep the existing `import { useEffect, useState } from 'react'` line — do not duplicate it):
  ```ts

  /**
   * Subscribes to an arbitrary CSS media query string.
   * SSR-safe: returns `false` until mounted (matches static HTML), then
   * resolves to the real match after hydration. Re-renders on change.
   * @example const isFinePointer = useMediaQuery('(pointer: fine)')
   */
  export const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
      const mediaQuery = window.matchMedia(query)

      setMatches(mediaQuery.matches)

      const handleChange = () => setMatches(mediaQuery.matches)

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }, [query])

    return matches
  }
  ```

- [ ] **Step 3 (VERIFY):** Run `bunx tsc --noEmit`. Expected: no output (0 errors).

- [ ] **Step 4 (COMMIT):** `git add src/hooks/useMedia.hook.ts && git commit -m "feat(hooks): add useMediaQuery for raw media-query strings"`
  (Note: repo may not be initialized for commits in the execution env — run the command regardless.)

---

### Task 2: Create a client `DeviceChrome` island that mounts Lenis on fine pointers

**Files:** Create `src/components/animations/device-chrome.tsx`.

**Rationale:** The layout must become a static server component with NO dynamic reads. The desktop-only mount of `<LenisProvider/>` moves into a `'use client'` island that decides via `matchMedia('(pointer:fine)')` AFTER hydration. The cursor is NOT gated here (it is always rendered and CSS-hidden — Task 4) to avoid a hydration mismatch. Lenis IS JS-gated here because we must never run smooth-scroll on touch, and Lenis registering globally has no DOM footprint that could mismatch.

**Interfaces:**
- Consumes: `useMediaQuery` (Task 1, `(query: string) => boolean`); default-export `LenisProvider` from `@/providers/lenis.provider` (`({ options }?) => JSX`).
- Produces: default export `DeviceChrome(): JSX.Element | null` — rendered by the layout (Task 3). Renders `<LenisProvider/>` only when `(pointer:fine)` matches; otherwise `null`.

- [ ] **Step 1: Create `src/components/animations/device-chrome.tsx`.**
  ```tsx
  'use client'

  import LenisProvider from '@/providers/lenis.provider'
  import { useMediaQuery } from '@/hooks/useMedia.hook'

  /**
   * Client-side device gate for smooth-scroll chrome.
   *
   * Lenis is JS-conditionally mounted only on fine-pointer devices
   * (`(pointer: fine)` ≈ mouse/trackpad), preserving the previous
   * desktop-only behavior WITHOUT a server `headers()` read. Lenis with
   * `root` registers a global instance and renders no DOM, so a
   * post-hydration mount causes no layout shift or hydration mismatch.
   *
   * The cursor is intentionally NOT gated here — it is always rendered and
   * hidden via CSS (`@media (pointer: coarse)`), which avoids the hydration
   * mismatch a JS conditional mount would create.
   */
  export default function DeviceChrome() {
    const isFinePointer = useMediaQuery('(pointer: fine)')

    if (!isFinePointer) return null

    return <LenisProvider />
  }
  ```

- [ ] **Step 2 (VERIFY):** Run `bunx tsc --noEmit`. Expected: no output (0 errors).

- [ ] **Step 3 (COMMIT):** `git add src/components/animations/device-chrome.tsx && git commit -m "feat(animations): add client DeviceChrome to gate Lenis on fine pointers"`

---

### Task 3: Make `FirstRenderTransition` self-source the cookie post-hydration

**Files:** Modify `src/components/transitions/firstRender.transition.tsx` (currently lines 1-70). Modify `src/hooks/useFirstRender.hook.ts` (currently lines 1-28).

**Rationale:** The layout must stop passing a server-derived `isFirstRender` prop (that prop is what forces the `cookies()` read upstream). Instead the component reads `document.cookie` in an effect (NOT a `useState` initializer — that would mismatch hydration on repeat visits). It defaults `isTransitionDone = true` (skip intro) so repeat visits never flash the full-screen overlay, and flips to PLAY only when the cookie is absent. The `/api/first-render` persistence call stays as-is.

**Interfaces:**
- Consumes: `usePageTransition` (`{ page, setPageTransition }`); `useScrollControl(enable: boolean)`; `mountAnim`, `firstRenderVariant`, `polygonVariant`, `rectVariant`.
- Produces: `FirstRenderTransition()` — NO props (was `{ isFirstRender: boolean }`). Task 5 (layout) relies on this new no-prop signature.
- Also produces: `useFirstRender(setIsTransitionDone: (b: boolean) => void)` — NO `isFirstRender` param (was `(isFirstRender, setIsTransitionDone)`).

- [ ] **Step 1: Read both files to confirm current contents.**
  Run: `cat src/components/transitions/firstRender.transition.tsx src/hooks/useFirstRender.hook.ts`.

- [ ] **Step 2: Rewrite `src/hooks/useFirstRender.hook.ts` to read the cookie itself.**
  Current file:
  ```ts
  import { tryCatch } from '@/lib/utils/tryCatch'
  import { checkFirstRender } from '@/services/checkFirstRender.service'
  import { useEffect } from 'react'
  import { usePageTransition } from './stores/usePage.hook'

  export function useFirstRender(
    isFirstRender: boolean,
    setIsTransitionDone: (isTransitionDone: boolean) => void,
  ) {
    const { setPageTransition } = usePageTransition()

    useEffect(() => {
      if (isFirstRender) {
        setPageTransition({ isTransitionComplete: true })
        return
      }

      const handleFirstRender = async () => {
        const [, error] = await tryCatch(checkFirstRender())
        setIsTransitionDone(true)
        if (error) return
      }

      const timeout = setTimeout(handleFirstRender, 3000)

      return () => clearTimeout(timeout)
    }, [isFirstRender])
  }
  ```
  Replace the ENTIRE file with:
  ```ts
  import { tryCatch } from '@/lib/utils/tryCatch'
  import { checkFirstRender } from '@/services/checkFirstRender.service'
  import { useEffect } from 'react'
  import { usePageTransition } from './stores/usePage.hook'

  /**
   * Drives the first-render intro overlay using a CLIENT-side cookie read
   * (no server `cookies()`, so the route stays static).
   *
   * Cookie semantics are inverted: `isFirstRender=true` EXISTS => already
   * visited => SKIP intro; cookie ABSENT => genuine first visit => PLAY.
   * We read `document.cookie` in an effect (never in a render/useState
   * initializer) so SSR HTML and first client render agree.
   *
   * Fail-safe default: the caller initializes `isTransitionDone = true`
   * (skip). We only flip to PLAY when the cookie is absent — so a repeat
   * visit never flashes the overlay even if the effect is delayed.
   */
  export function useFirstRender(
    setIsTransitionDone: (isTransitionDone: boolean) => void,
  ) {
    const { setPageTransition } = usePageTransition()

    useEffect(() => {
      const hasVisited = document.cookie.includes('isFirstRender=true')

      // Already visited: keep the (default) skip state and let the page show.
      if (hasVisited) {
        setPageTransition({ isTransitionComplete: true })
        return
      }

      // First visit: play the intro, persist the cookie, then finish.
      setIsTransitionDone(false)

      const handleFirstRender = async () => {
        const [, error] = await tryCatch(checkFirstRender())
        setIsTransitionDone(true)
        if (error) return
      }

      const timeout = setTimeout(handleFirstRender, 3000)

      return () => clearTimeout(timeout)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  }
  ```

- [ ] **Step 3: Update `FirstRenderTransition` to drop the prop and default to skip.**
  Current file (lines 16-26 region):
  ```tsx
  interface FirstRenderTransitionProps {
    isFirstRender: boolean
  }

  export function FirstRenderTransition({ isFirstRender }: FirstRenderTransitionProps) {
    const [isTransitionDone, setIsTransitionDone] = useState(isFirstRender)
    const { setPageTransition } = usePageTransition()

    useScrollControl(isTransitionDone)
    useFirstRender(isFirstRender, setIsTransitionDone)
  ```
  Apply this exact replacement (remove the interface, remove the prop, default `useState(true)`, update the `useFirstRender` call):
  ```tsx
  export function FirstRenderTransition() {
    // Default `true` = skip intro (fail-safe for repeat visits). The
    // cookie is read post-hydration inside useFirstRender, which flips
    // this to `false` (play) only on a genuine first visit.
    const [isTransitionDone, setIsTransitionDone] = useState(true)
    const { setPageTransition } = usePageTransition()

    useScrollControl(isTransitionDone)
    useFirstRender(setIsTransitionDone)
  ```
  Leave the entire `return (...)` JSX (lines 27-70) UNCHANGED — `setPageTransition` and the `AnimatePresence`/SVG block stay as-is.

- [ ] **Step 4 (VERIFY):** Run `bunx tsc --noEmit`. Expected: no output (0 errors). (Confirms the call-site signatures match across both files.)

- [ ] **Step 5 (COMMIT):** `git add src/components/transitions/firstRender.transition.tsx src/hooks/useFirstRender.hook.ts && git commit -m "refactor(transitions): read first-render cookie client-side, default to skip"`

---

### Task 4: CSS-gate the cursor for coarse pointers (kill-switch in globals.css)

**Files:** Modify `src/components/animations/cursor/index.tsx` (add a marker class to the root, line 73). Modify `src/styles/globals.css` (add a `@layer utilities` rule).

**Rationale:** The cursor must always render (so the layout can mount it unconditionally — no hydration mismatch). It is hidden purely in CSS on coarse-pointer / no-hover devices, which is also the correct trigger for "no mouse cursor to augment." This satisfies the scope's "hide until pointer:fine in CSS, not JS" mitigation. CRITICAL: because the component now mounts on ALL devices (previously `isDesktop &&` skipped it on mobile), we must also gate its perpetual `requestAnimationFrame` loop + `mousemove` listener behind `(pointer: fine)` — otherwise touch devices run continuous main-thread work (8 lerps + 4 MotionValue.set per frame) for an invisible element, a NEW INP/battery regression against this phase's perf budget. Gating happens inside an effect (does not touch SSR HTML), so the rendered DOM stays identical server/client.

**Interfaces:**
- Consumes: nothing new.
- Produces: cursor root carries class `cursor-root`; CSS hides `.cursor-root` on `(pointer: coarse)`/`(hover: none)`; the RAF/mousemove effect is a no-op on coarse pointers.

- [ ] **Step 1: Add the `cursor-root` class to the cursor root element.**
  Current line 73 in `src/components/animations/cursor/index.tsx`:
  ```tsx
      className="pointer-events-none fixed top-0 left-0 z-50 h-screen w-full"
  ```
  Replace with (prepend `cursor-root`):
  ```tsx
      className="cursor-root pointer-events-none fixed top-0 left-0 z-50 h-screen w-full"
  ```

- [ ] **Step 2: Gate the cursor's RAF loop behind `(pointer: fine)`.**
  In `src/components/animations/cursor/index.tsx`, the RAF/listener effect is currently (lines 52-64):
  ```tsx
    useEffect(() => {
      const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
        mouse.current = { x: clientX, y: clientY }
      }

      window.addEventListener('mousemove', handleMouseMove)
      rafId.current = requestAnimationFrame(render)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        cancelAnimationFrame(rafId.current)
      }
    }, [render])
  ```
  Add an early return at the top of the effect body (so coarse-pointer devices never start the loop or attach the listener):
  ```tsx
    useEffect(() => {
      // No mouse to track on coarse pointers — skip the RAF loop entirely.
      // (The element is also CSS-hidden in Step 3; this stops wasted work.)
      if (!window.matchMedia('(pointer: fine)').matches) return

      const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
        mouse.current = { x: clientX, y: clientY }
      }

      window.addEventListener('mousemove', handleMouseMove)
      rafId.current = requestAnimationFrame(render)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        cancelAnimationFrame(rafId.current)
      }
    }, [render])
  ```

- [ ] **Step 3: Add the CSS kill-switch to `src/styles/globals.css`.**
  The current `@layer utilities` block ends at line 99 with the `.about-clip` rule then `}`. Insert this rule INSIDE the existing `@layer utilities { ... }` block, right after the `.about-clip` rule (before the closing `}` of the utilities layer):
  ```css

    /* Custom cursor is always rendered (no hydration mismatch) but hidden
       on coarse-pointer / no-hover devices where there is no mouse to
       augment. This replaces the former server `headers()` device gate. */
    @media (pointer: coarse), (hover: none) {
      .cursor-root {
        display: none;
      }
    }
  ```

- [ ] **Step 4 (VERIFY):** Run `bunx tsc --noEmit`. Expected: no output (0 errors). (CSS isn't type-checked, but the cursor `.tsx` edits are.)

- [ ] **Step 5 (COMMIT):** `git add src/components/animations/cursor/index.tsx src/styles/globals.css && git commit -m "feat(cursor): CSS-gate custom cursor + skip RAF loop on coarse pointers"`

---

### Task 5: Make `(main)/layout.tsx` static — remove server dynamic reads

**Files:** Modify `src/app/(main)/layout.tsx` (currently lines 1-37).

**Rationale:** This is the load-bearing change. Removing `await getFirstRender()` and `await getDeviceInfo()` deletes the only `cookies()`/`headers()` reads in the subtree, so the layout (and the static pages under it) become `○`. `DeviceChrome` (Task 2) replaces the desktop gate for Lenis; `Cursor` renders unconditionally (CSS-gated per Task 4); `FirstRenderTransition` takes no prop (Task 3).

**Interfaces:**
- Consumes: `DeviceChrome` (Task 2, default export); `Cursor` (existing); `FirstRenderTransition()` no-prop (Task 3); `Header`, `Footer`, `PageTransition` (existing).
- Produces: a static (non-async) layout default export.

- [ ] **Step 1: Read the file to confirm current contents.**
  Run: `cat 'src/app/(main)/layout.tsx'`.

- [ ] **Step 2: Replace the ENTIRE `src/app/(main)/layout.tsx`.**
  Current file:
  ```tsx
  import LenisProvider from '@/providers/lenis.provider'

  import { Header } from '@/components/layout/header'
  import { Footer } from '@/components/layout/footer'
  import { PageTransition } from '@/components/transitions/page.transition'
  import { FirstRenderTransition } from '@/components/transitions/firstRender.transition'

  import { getFirstRender } from '@/lib/cookies/getFirstRender.cookie'
  import { getDeviceInfo } from '@/lib/device'
  import { Cursor } from '@/components/animations/cursor'

  export default async function MainLayout({ children }: React.PropsWithChildren) {
    const isFirstRender = await getFirstRender()
    const { isDesktop } = await getDeviceInfo()

    return (
      <>
        {isDesktop && (
          <>
            <LenisProvider />
            <Cursor />
          </>
        )}

        <Header />

        <div className="bg-accent/5 [container-type:inline-size] flex w-full flex-[1_0_100%] flex-col gap-px">
          {children}
        </div>

        <Footer />

        <FirstRenderTransition isFirstRender={isFirstRender} />
        <PageTransition />
      </>
    )
  }
  ```
  Replace with (note: NOT `async`, NO server imports, `DeviceChrome` gates Lenis, `Cursor` always rendered, `FirstRenderTransition` no prop):
  ```tsx
  import { Header } from '@/components/layout/header'
  import { Footer } from '@/components/layout/footer'
  import { PageTransition } from '@/components/transitions/page.transition'
  import { FirstRenderTransition } from '@/components/transitions/firstRender.transition'

  import DeviceChrome from '@/components/animations/device-chrome'
  import { Cursor } from '@/components/animations/cursor'

  export default function MainLayout({ children }: React.PropsWithChildren) {
    return (
      <>
        {/* Lenis is JS-gated to fine pointers client-side; the cursor is
            always rendered and CSS-hidden on coarse pointers (Task 4). */}
        <DeviceChrome />
        <Cursor />

        <Header />

        <div className="bg-accent/5 [container-type:inline-size] flex w-full flex-[1_0_100%] flex-col gap-px">
          {children}
        </div>

        <Footer />

        <FirstRenderTransition />
        <PageTransition />
      </>
    )
  }
  ```

- [ ] **Step 3 (VERIFY — types):** Run `bunx tsc --noEmit`. Expected: no output (0 errors).

- [ ] **Step 4 (VERIFY — static markers):** Run `bun run build` and inspect the route table. Expected lines (marker `○` = Static; was `ƒ` = Dynamic before this phase):
  ```
  ○ /
  ○ /about
  ○ /projects
  ● /projects/[slug]      (SSG via generateStaticParams — prerendered per slug)
  ```
  Assert NONE of `/`, `/about`, `/projects`, `/projects/[slug]` show `ƒ`. (`●` denotes SSG pages generated from `generateStaticParams`; `/projects/[slug]` should appear with its prerendered slug paths listed beneath, not as a `ƒ` dynamic route.) If any still shows `ƒ`, STOP and run `superpowers:systematic-debugging` — re-grep for stray `cookies()`/`headers()`/`draftMode()` reachable from that route before proceeding.

- [ ] **Step 5 (VERIFY — prerendered HTML on disk):** The authoritative static signal is the build output (Step 4) PLUS the emitted prerender files. After `bun run build`, a statically prerendered route writes an `.html` file under `.next/server/app`; a dynamic (`ƒ`) route does NOT. Run:
  ```
  ls .next/server/app/index.html .next/server/app/about.html .next/server/app/projects.html
  ```
  Expected: all three files exist (proves `/`, `/about`, `/projects` were prerendered, not rendered per-request). For `[slug]`, the prerendered slugs land under `.next/server/app/projects/<slug>.html` — run `ls .next/server/app/projects/` and expect one `.html` per slug returned by `generateStaticParams`.
  Then confirm the content is actually IN the static document (not client-only) by grepping a prerendered file directly — no running server needed (this harness blocks foreground `sleep` and unreliable job-control `%1`, so prefer disk inspection over `next start` + `curl`):
  ```
  grep -o '<main' .next/server/app/about.html | head -1
  ```
  Expected match: `<main`. (If you DO want a live-serve check, start the server with `bun run start` via `run_in_background`, then `curl -s http://localhost:3000/about | grep -o '<main'` — but the disk grep above is the deterministic gate.)

- [ ] **Step 6 (COMMIT):** `git add 'src/app/(main)/layout.tsx' && git commit -m "perf(main): make (main) layout static by removing server device/cookie reads"`

---

### Task 6: Final verification gates (CWV, hydration, intro) and dead-code note

**Files:** none (verification only). Optionally Modify `src/lib/device.ts` doc note.

**Interfaces:** none.

- [ ] **Step 1 (VERIFY — full build clean):** Run `bunx tsc --noEmit && bun run build`. Expected: 0 type errors; build succeeds; the static markers from Task 5 Step 4 persist.

- [ ] **Step 2 (VERIFY — dead-code audit):** Run `grep -rn "getFirstRender\b" src --include="*.ts" --include="*.tsx"`. Expected: only the definition in `src/lib/cookies/getFirstRender.cookie.ts` remains (no callers). `getDeviceInfo` / `isMobileDevice` in `src/lib/device.ts` may still have other callers — re-grep `grep -rn "getDeviceInfo\|isMobileDevice" src`; the `(main)` layout must NOT appear. Leave `device.ts`/`getFirstRender.cookie.ts` in place (still used by other surfaces / the API route pattern); do NOT delete them in this phase.

- [ ] **Step 3:** `> BROWSER-VERIFY:` Use the `web-perf` skill (Chrome DevTools MCP → Lighthouse). On a desktop emulation (fine pointer):
  - No hydration warning in the console for the cursor or Lenis (the cursor renders identically server/client; Lenis mounts post-hydration with no DOM).
  - Custom cursor appears and tracks the mouse; Lenis smooth scroll is active.
  - On mobile emulation (coarse pointer): cursor is NOT visible (CSS-hidden), Lenis is NOT mounted, native scroll works.
  - LCP hero is NOT gated behind an opacity:0 reveal (Constraint 6); LCP <= 2.5s on the home route.
  - CLS <= 0.1 across `/`, `/about`, `/projects` (the post-hydration Lenis mount must not shift layout).

- [ ] **Step 4:** `> BROWSER-VERIFY:` First-render intro behavior. (Precondition: this whole client-cookie mechanism depends on `isFirstRender` being JS-readable. Confirm `src/app/api/first-render/route.ts` sets the cookie WITHOUT `httpOnly` — it currently does, so `document.cookie.includes('isFirstRender=true')` works. If the intro replays on a second visit, the root cause is an `httpOnly`/`path`/`domain` cookie mismatch making the cookie invisible to JS — NOT the skip-default logic.)
  - In a fresh browser/profile (no `isFirstRender` cookie), load `/`: the full-screen SVG intro plays ONCE, the `/api/first-render` call sets the cookie, the page reveals.
  - On this genuine first visit, observe the first paint: because the route is now static and defaults to `isTransitionDone = true`, page content paints, then the post-hydration effect flips to `false` and the overlay covers. EXPECTED: the overlay mounts at its `mountAnim` `initial` (covering) state, so any content-before-overlay flash is at most 1-2 frames and acceptable. If the flash is objectionable, the only no-regression mitigation is a render-blocking inline cookie-check `<script>` in the layout `<head>` (the theme-flash pattern) — record as a Phase-1 follow-up; do NOT build it here (it re-introduces nothing dynamic but adds inline JS that needs its own review).
  - Reload (or navigate) with the cookie present: the intro does NOT replay and there is NO flash of the overlay (validates the `isTransitionDone = true` fail-safe default).
  - Then clear cookies and confirm the intro plays again.

- [ ] **Step 5 (NOTE — unblocks Phase 0):** With `(main)` now static, Phase 0's `JsonLd` (`src/components/common/json-ld.tsx`) and `buildBreadcrumbList`/`buildPersonGraph` output will land in the static prerendered HTML. After Phase 0 ships JSON-LD, validate with the Rich Results Test (https://search.google.com/test/rich-results) and validator.schema.org — BreadcrumbList is the only type yielding a visible rich result. SSR-HTML grep to confirm JSON-LD is in the static document: `curl -s http://localhost:3000/projects/<slug> | grep -o 'application/ld+json'`.

- [ ] **Step 6 (COMMIT — if doc note edited, else skip):** `git add -A && git commit -m "docs(phase-1): verification notes for rendering fix"` (only if any file changed in this task; otherwise no commit needed).
