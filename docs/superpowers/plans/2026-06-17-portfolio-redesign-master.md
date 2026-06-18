# Portfolio Redesign + SEO — Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement each phase plan task-by-task. Steps use checkbox (`- [ ]`) syntax. Execute ONE phase plan at a time, in the recommended sequence below.

**Goal:** Evolve `next-yovizn-v2` into an awwwards-standard, immersive (WebGL) portfolio with strong, current-spec SEO — without sacrificing Core Web Vitals.

**Architecture:** Five sequenced phases, each producing working, independently testable software: (0) SEO & structured data, (1) rendering fix to recover static prerendering, (2) transition correctness, (3) a reusable scroll-animation system, (4) isolated lazy-loaded WebGL island infrastructure + a design gate for the full visual redesign. WebGL is deliberately scoped to lazy islands (OGL, ~9–14 KB gz) rather than a global canvas, so the SEO/CWV goal survives the immersive direction.

**Tech Stack:** Next.js 16.2.9 (App Router, Turbopack) · React 19.2.7 · Motion v12.40 · Lenis v1.3.23 (Motion-frame-driven, `autoRaf:false`) · Tailwind v4 (CSS-first) · Zustand v5 · Sanity v6 / next-sanity 13 · schema-dts 2.0 · OGL (Phase 4 only) · bun. No unit-test framework.

## Global Constraints (every task in every phase must respect these)

**PERFORMANCE BUDGET** (p75, mobile+desktop): LCP ≤ 2.5s · INP ≤ 200ms · CLS ≤ 0.1 · critical-path JS ≤ 170 KB gz.

**ANIMATION RULES:** (1) animate transform/opacity/clip-path ONLY — never width/height/top/left/margin. (2) Single RAF loop — Lenis stays driven by Motion's `frame`; never run Lenis's own raf AND Motion's. (3) Cursor is imperative (MotionValue+spring), never React state per pointermove. (4) NEVER `useSpring` a Lenis-smoothed `useScroll` value (double-lerp = lag). (5) prefers-reduced-motion is systemic (gate Lenis, intro overlay, transitions; CSS kill-switch). (6) Don't gate the LCP hero behind an `opacity:0` reveal. (7) `will-change` only transiently.

**DEPENDENCY RULE:** zero new runtime deps EXCEPT OGL (Phase 4), used ONLY for isolated lazy-loaded islands — never a global canvas.

**SEO FACTS** (verified live 2026-06-17): `BreadcrumbList` is the ONLY structured-data type that yields a visible Google rich result. `Person`/`WebSite` are entity-only (no snippet). DROP `SearchAction` (deprecated Nov 2024); do NOT build `FAQPage`/`HowTo` (deprecated). Canonicals must exist on every route. CWV thresholds unchanged in 2026. `llms.txt` irrelevant to Google. New "back-button hijacking" spam policy enforced 2026-06-15 (low risk for a hand-built site; audit third-party scripts only).

---

## Phase Map

| # | Phase | Plan file | Tasks | Goal (one line) | Depends on | Status |
|---|-------|-----------|------:|-----------------|------------|--------|
| 0 | SEO & Structured Data | [phase-0](./2026-06-17-phase-0-seo-structured-data.md) | 7 | Canonicals, per-page metadata, fixed OG, schema-dts JSON-LD | none | **Executable now** |
| 1 | Rendering Fix | [phase-1](./2026-06-17-phase-1-rendering-fix.md) | 6 | Decouple `(main)` layout from cookies/headers → pages prerender | none | **Executable now** |
| 2 | Transition Correctness | [phase-2](./2026-06-17-phase-2-transition-correctness.md) | 6 | Replace `sleep()` timers with real navigation signals | none | **Executable now** |
| 3 | Scroll-Animation System | [phase-3](./2026-06-17-phase-3-scroll-animation-system.md) | 11 | Reusable `useScrollProgress`/`useParallax`/`<Pin>`/`<ScrollProgressBar>` + decouple reveals + `splitText` kinetics | none (stack only) | **Executable now** |
| 4 | WebGL Immersive Infra | [phase-4](./2026-06-17-phase-4-webgl-immersive.md) | 6 | OGL `<WebGLIsland>` (lazy, gated, static fallback) + 1 reference effect | Phase 3 primitives (`<Pin>`, `useScrollProgress`) | **Infra executable; full redesign BLOCKED on Design Gate** |

Total: **36 tasks across 5 plans.**

---

## Recommended Sequence & Rationale

Execute in this order. Phases 0–3 are independent enough that the order is a risk/value choice, not a hard dependency; Phase 4's full scope is gated.

1. **Phase 0 — SEO/structured data (first).** Lowest risk, no rendering change, immediate value. Adds zero client JS, so it cannot regress CWV. Delivers SEO wins even while pages are still dynamic.
2. **Phase 1 — Rendering fix.** Highest single impact: flips `/`, `/about`, `/projects`, and all `[slug]` from `ƒ` (dynamic) to static prerender → better LCP/TTFB, instant nav, and it makes Phase 0's JSON-LD land in **static** HTML. (Phases 0 and 1 are mutually independent — 0-then-1 is recommended so you bank SEO first, but 1-then-0 also works.)
3. **Phase 2 — Transition correctness.** Aesthetic-independent bug fix: removes the `sleep(1500)/sleep(3000)` race in `transitionLink.tsx`. Do regardless of the redesign.
4. **Phase 3 — Scroll-animation system.** Builds the reusable primitives the redesign needs. Must precede Phase 4 (Phase 4 consumes `<Pin>`/`useScrollProgress`).
5. **Phase 4 — WebGL infra, then the full redesign.** Ship the OGL `<WebGLIsland>` infrastructure + one reference effect now. **The full visual redesign is blocked on the Design Gate below** — do not write per-section redesign tasks until the design is locked.

---

## Open Decisions before Phase 4 (the Design Gate)

The committed aesthetic is **Immersive / WebGL (Direction C)**, but "merubah layout" (change the layout) means a real visual redesign that does not exist yet. Phase 4's plan delivers only design-agnostic infrastructure + one proof effect. Before the rest of Phase 4 can be planned in executable detail, these must be decided (recommended: a design pass using the `frontend-design` skill + reference awwwards sites you like):

1. **Section inventory & layout** per page (home/about/projects/detail) — concrete enough to write real DOM/Tailwind.
2. **Which surfaces get WebGL** — the current `project-list.view.tsx` has no in-flow thumbnail grid (the cover lives inside `RenderCursor`), so the immersive image surfaces must be designed, not assumed.
3. **Motion language** — the signature scroll moves per section (pinning, parallax depth, kinetic type) drawn from the Phase 3 primitives.
4. **Reference awwwards sites** — to anchor the aesthetic and the perf/spectacle trade-off.

---

## Verification Strategy

No unit-test framework exists (and adding one is out of scope). Each task ends with an explicit, runnable gate and a commit:

- **`bunx tsc --noEmit`** — must stay 0 errors.
- **`bun run build`** — assert the route's marker (`○` Static vs `ƒ` Dynamic) in the route table. (NB: in Phase 0 the `(main)` routes are still `ƒ` by design; Phase 1 flips them to static.)
- **SSR-HTML assertions** — `bun run build && bun run start`, then `curl -s … | grep` for `rel="canonical"`, `application/ld+json`, OG tags.
- **Pure helpers** — tiny inline `node:assert` via `bun run -e` (no framework scaffolding).
- **`> BROWSER-VERIFY:`** items — structured data via [Rich Results Test](https://search.google.com/test/rich-results) + [validator.schema.org](https://validator.schema.org); CWV and all animation/visual behavior via the **`web-perf` skill** (Chrome DevTools MCP → Lighthouse, throttled mobile). These cannot be settled by build/typecheck alone.

The project IS a git repo (its own `.git` under `next-yovizn-v2/`), so commit commands run.

---

## Execution Handoff

The plan suite is complete and saved under `docs/superpowers/plans/`. Two execution options:

1. **Subagent-Driven (recommended)** — a fresh subagent implements each task, with two-stage review between tasks. Fast iteration, isolated context per task. Uses `superpowers:subagent-driven-development`.
2. **Inline Execution** — implement tasks in the main session in batches with checkpoints for review. Uses `superpowers:executing-plans`.

Recommended starting point: **Phase 0** (lowest risk, immediate SEO value).
