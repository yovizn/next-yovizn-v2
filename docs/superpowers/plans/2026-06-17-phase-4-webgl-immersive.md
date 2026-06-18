# Phase 4 — WebGL Immersive Infrastructure (+ design gate) Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (- [ ]) syntax.
**Goal:** Ship reusable, isolated, lazy-loaded WebGL-island infrastructure (never a global canvas) plus ONE reference effect (hover image-displacement on the project covers) — all design-agnostic — and gate the rest of the visual redesign behind an explicit design pass.
**Architecture:** A capability-gated `'use client'` wrapper (`<WebGLIsland>`) owns a `next/dynamic({ssr:false})` import of an OGL effect, mounting it only on `(pointer:fine)` + `(hover:hover)` + not-reduced-motion clients, using an `IntersectionObserver` to mount/unmount (freeing the GL context offscreen) and rendering its `children` (the existing `next/image`) as the static SSR fallback. The reference effect is an OGL `Renderer/Program/Triangle/Texture` island that hooks the single Lenis-driven Motion `frame.render` loop (never a second `requestAnimationFrame`) and reuses the cover image URL as its texture. The full visual redesign is NOT designed yet — only the infrastructure + one proof effect ship here.
**Tech Stack:** Next.js 16.2.9 (App Router, Turbopack) · React 19.2.7 · Motion v12.40 (`motion`, `motion/react`) · Lenis v1.3.23 (`lenis/react`, driven by Motion `frame`, `autoRaf:false`) · OGL (new dep, ~9–14 KB gz) · Tailwind v4 (CSS-first in `src/styles/globals.css`) · Zustand v5 · bun. No test framework.
**Depends on:** Phase 3 ONLY for the systemic `@media (prefers-reduced-motion: reduce)` CSS kill-switch in `src/styles/globals.css` (Phase 3 Task 1). Everything else is self-contained — this plan does NOT import Phase 3's `useScrollProgress`/`<Pin>`; it reads Motion's `useScroll` directly so it can run even if Phase 3's `src/components/animations/scroll/` is not yet built.

---

## Global Constraints (every task must respect these)
PERFORMANCE BUDGET (p75, mobile+desktop): LCP <= 2.5s · INP <= 200ms · CLS <= 0.1 · critical-path JS <= 170 KB gz.
ANIMATION RULES: (1) animate transform/opacity/clip-path ONLY — never width/height/top/left/margin. (2) Single RAF loop — Lenis stays driven by Motion's `frame`; never run Lenis's own raf AND Motion's. WebGL islands hook `frame.render`; they NEVER call `requestAnimationFrame` themselves and NEVER cancel the Lenis `frame.update` callback. (3) Cursor is imperative (MotionValue+spring), never React state per pointermove. (4) NEVER `useSpring` a Lenis-smoothed `useScroll` value (double-lerp = lag). (5) `prefers-reduced-motion` is systemic (gate Lenis, intro overlay, transitions; CSS kill-switch). (6) Don't gate the LCP hero behind an `opacity:0` reveal. (7) `will-change` only transiently.
DEPENDENCY RULE: zero new runtime deps EXCEPT the one chosen WebGL lib (this phase = **OGL**), used ONLY for isolated lazy-loaded islands — never a global canvas.
SEO FACTS (verified live 2026-06-17): BreadcrumbList is the ONLY structured-data type that yields a visible Google rich result. Person/WebSite are entity-only (no snippet). DROP SearchAction (deprecated Nov 2024); do NOT build FAQPage/HowTo (deprecated). Canonicals must exist on every route. CWV thresholds unchanged in 2026. llms.txt irrelevant to Google.

---

## CRITICAL PRE-FLIGHT FACTS (verified against the installed tree 2026-06-17 — read before writing any code)

These correct two claims in the shared-naming/scope brief that do not match the actual code. Honor the CODE.

- **`OGL` is the chosen library and is NOT yet installed.** Verified: `ls node_modules/ogl` → absent. It is the ONLY new runtime dep this phase. ~9–14 KB gz for the realistic island (Renderer, Program, Mesh, Geometry, Texture, Transform, Triangle + math); measured upper bound 14.2 KB crude-min-gz from `ogl@1.0.11`, trending to ~9 KB under Turbopack minification. Three.js/R3F (~155 KB+) is rejected — it would eat ~90% of the 170 KB budget for one shader.
- **`dynamic(..., {ssr:false})` MUST live inside a `'use client'` file** (confirmed against current vercel/next.js docs: "only effective for Client Components and must be used within them"). Calling it from a Server Component is a build error. So `<WebGLIsland>` is `'use client'` and owns the dynamic import; the static `next/image` fallback is passed in as `children`.
- **There is NO in-flow thumbnail grid in `project-list.view.tsx`.** Verified: the list rows (lines 34–55) render only `project.title` + `project.service` TEXT. The ONLY cover `<Image>` in that file lives inside `RenderCursor` (lines 63–106, `<Image src={urlFor(project.cover).url()} … width={400} height={400}/>` at lines 93–99), which is fed into the global cursor store via `setCursor({ children: <RenderCursor/> })` (lines 21–24). The spike's `<figure><Image/></figure>` thumbnail-grid DOM does NOT exist here. **The reference effect therefore attaches to `RenderCursor`'s cover `<Image>` — the actual hover-driven image surface in the current design.** Do NOT invent an in-flow thumbnail grid to match the spike; "which sections get WebGL / what the layout is" is exactly what the DESIGN GATE freezes.
- **Consequence for the reference effect (state honestly):** `RenderCursor` is rendered inside `<Cursor/>` (`src/components/animations/cursor/index.tsx`), a `position: fixed` overlay that is mounted ONLY on desktop (`{isDesktop && <Cursor/>}` in `src/app/(main)/layout.tsx:18–23`) and is client-only — it NEVER appears in SSR HTML. So for the reference effect, SEO/LCP are unaffected even more trivially than the spike's path (there is no SSR `<img>` to protect on the cursor surface; the page's indexable content is the title/service text). The generic `<WebGLIsland>` STILL encodes the IntersectionObserver-near-viewport mount + SSR-`children` fallback so it is correct for post-redesign IN-FLOW thumbnails — but the reference effect does not exercise those two features (the cursor cover is always-rendered-when-hovering and non-SSR). This is documented, not hidden.
- **`RenderCursor` stacks ALL covers** in a `translateY` `motion.ul` (`animate={{ y: ${index * -100}% }}`, lines 78–103) and shows the hovered `index`. For the reference effect we render the canvas for the CURRENT-INDEX cover only (one texture, one context at a time) — this matches the interaction (only one tile shown) and keeps us trivially under the ~16 WebGL-context cap.
- **`useMatchMedia` CANNOT express `(pointer:fine)`.** Verified: `src/hooks/useMedia.hook.ts` only builds `(${query}-width: ${breakPoint}px)`. The brief's claim "reuse useMedia.hook.ts with matchMedia('(pointer:fine)')" is impossible as written. **Resolution: the gate inlines `window.matchMedia('(pointer:fine)')` / `(hover:hover)` / `(prefers-reduced-motion: reduce)` directly** (exactly the spike's Layer B). We do NOT extend `useMatchMedia` (out of scope; it's a width-only hook by design). `useMatchMedia` stays untouched.
- **The single RAF is Motion's `frame`.** Verified: `src/providers/lenis.provider.tsx` runs `frame.update(update, true)` → `lenisRef.current?.lenis?.raf(time)`, `autoRaf:false`. Motion batches `read → update → render`; Lenis runs in `update`, so the island's draw goes in `frame.render` (runs AFTER `update` in the same tick → reads post-scroll value, zero lag, zero extra frame). Verified: `require('motion').frame` is an object, `require('motion').cancelFrame` is a function.
- **A SECOND `requestAnimationFrame` ALREADY exists in `Cursor` (`index.tsx:42,58`)** for the imperative cursor lerp. This is pre-existing and out of scope — the WebGL island MUST NOT add a third loop or touch it; the island uses `frame.render` only.
- **`useScroll` is from `motion/react`** (Task 4 uses it directly, NOT Phase 3's `useScrollProgress`, so Task 4 has no hard dependency on the unbuilt `src/components/animations/scroll/`).
- **Route staticness:** `/projects` fetches Sanity in a Server Component with no dynamic APIs → prerendered `○ (Static)` (per Phase 3 preflight). The WebGL work is client-only + lazy and MUST NOT change this. Verification asserts "no regression vs baseline."
- **Image URL for texture:** `urlFor(project.cover).url()` (from `src/sanity/lib/image.ts`). NOTE — this is NOT free-from-cache: `next/image` proxies via `/_next/image?url=…` (a different URL), and the texture loader sets `crossOrigin='anonymous'` (CORS), so the texture is a SEPARATE, small, DPR-capped, DESKTOP-ONLY fetch — not a re-use of the `<Image>` bytes. `cdn.sanity.io` returns `Access-Control-Allow-Origin`, so the upload won't taint. LCP is unaffected because this fetch is client-only, lazy, and on the cursor overlay (not an SSR/LCP element). Cap requested dimensions (Task 5).
- **Context-swap cost (BROWSER-VERIFY perf item):** mounting the canvas only for the current `idx === index` cover means a fresh GL context is created/disposed on every row change (context creation is tens of ms). The original stacked-`translateY` design was instant. Acceptable for the reference proof; if it stutters, the post-design real effect can keep ONE persistent canvas and swap the texture instead of remounting. Flagged, not blocking.
- **Path aliases:** `@/* -> ./src/*`. Utils: `cn` = `src/lib/utils/cn.ts`. Cover dims in current design: `width:400,height:400` (`project-list.view.tsx:13–16`).

---

## DESIGN GATE — READ FIRST (the rest of Phase 4 is BLOCKED until this is resolved)

> **This plan delivers ONLY design-agnostic infrastructure + ONE reference effect as proof. It does NOT redesign any section.** The full visual redesign — which sections exist, the new layout, and which sections get WebGL — is **NOT yet designed**, and executable per-section redesign tasks **CANNOT** be written until a concrete design is locked. Writing them now would mean inventing DOM (as the brief's spike did with a thumbnail grid that doesn't exist — see Pre-Flight Facts).

**Recommended next step before any further Phase-4 planning:** run a design/brainstorm pass using the **`frontend-design`** skill (and `superpowers:brainstorming`) against reference awwwards sites, then lock a concrete design doc. Only then can per-section redesign tasks be written.

**Design decisions REQUIRED before the remaining Phase 4 can be planned (each blocks specific executable tasks):**
1. **Section inventory & order** for the redesigned site (home, projects index, project detail, about) — what sections exist and their content. *Blocks: any per-section build task.*
2. **Layout system** of each section (grid, full-bleed, columns) — concrete enough to write real DOM/Tailwind. *Blocks: real (non-placeholder) markup.*
3. **Which sections get WebGL, and which effect each gets** (hover displacement? scroll shader? distortion? particle field?). *Blocks: choosing whether to reuse `<WebGLIsland>` as-is or build new effect islands.*
4. **Whether any redesigned section uses an IN-FLOW thumbnail grid** (vs the current cursor-only cover). If yes, that is where `<WebGLIsland>`'s IO + SSR-`<img>` fallback path is actually exercised. *Blocks: a real `ProjectThumb` server-component task.*
5. **Scroll-shader target section + uniform mapping** (which section drives `uScroll`, what the shader does with it) — Task 4 here only proves the wiring; the real effect needs a designed home. *Blocks: a real scroll-shader build task.*
6. **LCP element per redesigned route** (so we never gate it behind a WebGL reveal, Animation Rule 6) and per-section perf budget split. *Blocks: sign-off that the redesign stays within the 170 KB / CWV budget.*
7. **Reduced-motion / coarse-pointer visual fallback per section** — what the static experience looks like where the canvas is skipped. *Blocks: the fallback markup for each WebGL section.*

**What this plan DOES deliver (design-agnostic, ships now):** OGL dependency · `<WebGLIsland>` capability+IO gate with static-`children` fallback · one OGL displacement effect wired into `RenderCursor`'s cover · scroll-uniform wiring proof on the single `frame.render` loop · the full guardrail set (DPR cap, context-loss, visibility/offscreen pause, dispose) · bundle verification that OGL is a separate lazy chunk outside first-load JS.

---

### Task 1: Baseline capture + add OGL (the only new dependency)

Record the current build/typecheck/route-marker/first-load-JS baseline so later tasks can prove "no regression," then install OGL.

- **Files:** Modify `package.json` (dependencies block, lines 13–36 — add `"ogl"`). Create `docs/superpowers/plans/.phase4-baseline.txt` (scratch record).
- **Interfaces:** Produces — `ogl` available as an import; a captured baseline (typecheck=0 errors, `/projects` = `○ (Static)`, first-load-JS number) consumed by Task 6's "no regression" assertion.

- [ ] **Step 1: Capture the typecheck baseline.**
  ```bash
  bunx tsc --noEmit
  ```
  Expected: no output (0 errors). Record "tsc: 0 errors" in `.phase4-baseline.txt`.

- [ ] **Step 2: Capture the build + route-marker + first-load-JS baseline.**
  ```bash
  bun run build
  ```
  Expected: build succeeds; the route table shows a line for `/projects` marked `○` (Static). Copy the FULL `/projects` row (route + Size + First Load JS) and the "First Load JS shared by all" line into `.phase4-baseline.txt`. (Turbopack chunk hashes are not stable across builds — capture the NUMBER, not chunk filenames.)

- [ ] **Step 3: Add OGL to dependencies.** Read `package.json` first; then add the dep alphabetically (after `next-sanity`, before `react`). Current lines 25–26 are:
  ```json
      "next": "16.2.9",
      "next-sanity": "^13.1.0",
  ```
  Edit to:
  ```json
      "next": "16.2.9",
      "next-sanity": "^13.1.0",
      "ogl": "^1.0.11",
  ```

- [ ] **Step 4: Install.**
  ```bash
  bun install
  ```
  Expected: `ogl@1.0.11` resolves; lockfile updates. Verify: `ls node_modules/ogl/package.json` exists.

- [ ] **Step 5: Confirm OGL imports type-clean (it ships its own types).**
  ```bash
  bunx tsc --noEmit
  ```
  Expected: no output (0 errors) — adding the dep alone must not break typecheck.

- [ ] **Step 6 — VERIFICATION:**
  - `bunx tsc --noEmit` → Expected: no output.
  - `ls node_modules/ogl` → Expected: directory exists.
  - `.phase4-baseline.txt` records: tsc=0, `/projects` `○ (Static)`, baseline first-load-JS number.

- [ ] **Step 7 — COMMIT:**
  ```bash
  git add package.json bun.lock docs/superpowers/plans/.phase4-baseline.txt
  git commit -m "build(webgl): add ogl as the single phase-4 webgl dependency"
  ```
  (Repo may not be initialized for commits in the execution env — include the command regardless.)

---

### Task 2: `<WebGLIsland>` — capability + IntersectionObserver gate with static `children` fallback

Create the design-agnostic lazy wrapper. It is `'use client'` (so `dynamic(ssr:false)` is legal), gates on capability, lazy-mounts a passed-in effect only when near the viewport, and renders `children` (the static `next/image`) as the always-present fallback.

- **Files:** Create `src/components/webgl/webgl-island.tsx`.
- **Interfaces:**
  - Consumes — `cn` from `@/lib/utils/cn` (`cn(...classValue: ClassValue[])`).
  - Produces — `export function WebGLIsland(props: WebGLIslandProps)` where
    ```ts
    type WebGLIslandProps = {
      children: React.ReactNode            // static SSR/no-WebGL fallback (e.g. <Image/>)
      load: () => Promise<{ default: React.ComponentType<EffectProps> }>  // dynamic effect import
      effectProps: EffectProps             // props forwarded to the lazy effect
      rootMargin?: string                  // IO prefetch margin, default '200px'
      className?: string
    }
    export type EffectProps = { src: string } & Record<string, unknown>
    ```
    Task 3 consumes `WebGLIsland` + `EffectProps`.

- [ ] **Step 1: Write the file.** Complete code (no placeholders):
  ```tsx
  'use client'

  import dynamic from 'next/dynamic'
  import { useEffect, useMemo, useRef, useState } from 'react'

  import { cn } from '@/lib/utils/cn'

  export type EffectProps = { src: string } & Record<string, unknown>

  export type WebGLIslandProps = {
    /** Static fallback — the SSR HTML / no-WebGL / a11y content (e.g. an <Image/>). Always rendered. */
    children: React.ReactNode
    /** Dynamic import of the OGL effect component. Loaded lazily, ssr:false. */
    load: () => Promise<{ default: React.ComponentType<EffectProps> }>
    /** Props forwarded to the lazy effect (must include `src`). */
    effectProps: EffectProps
    /** IntersectionObserver prefetch margin. Default '200px'. */
    rootMargin?: string
    className?: string
  }

  /**
   * Design-agnostic lazy WebGL-island wrapper.
   * - `'use client'` so `dynamic(ssr:false)` is legal (Next 16 rule).
   * - Mounts the effect ONLY on (pointer:fine)+(hover:hover)+!reduced-motion+!save-data+!weak clients.
   * - IntersectionObserver mounts/unmounts the effect (unmount frees the GL context offscreen).
   * - `children` is the always-present static fallback; the canvas only ever draws on top of it.
   */
  export function WebGLIsland({
    children,
    load,
    effectProps,
    rootMargin = '200px',
    className,
  }: WebGLIslandProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const [enabled, setEnabled] = useState(false)
    const [near, setNear] = useState(false)

    // dynamic import is memoized so the chunk is requested once. ssr:false is legal here.
    const Effect = useMemo(
      () => dynamic(load, { ssr: false, loading: () => null }),
      // `load` is a stable module-scope import fn from the caller; intentionally one-shot.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    )

    // Capability gate — client-only, runs once.
    useEffect(() => {
      const fine =
        window.matchMedia('(pointer:fine)').matches &&
        window.matchMedia('(hover:hover)').matches
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection
      const saveData = conn?.saveData === true
      const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8
      const weak = (navigator.hardwareConcurrency ?? 8) <= 4 || deviceMemory <= 4
      setEnabled(fine && !reduced && !saveData && !weak)
    }, [])

    // Mount only when near viewport; unmount when far (frees the WebGL context).
    useEffect(() => {
      if (!enabled || !ref.current) return
      const el = ref.current
      const io = new IntersectionObserver(
        ([entry]) => setNear(entry.isIntersecting),
        { rootMargin },
      )
      io.observe(el)
      return () => io.disconnect()
    }, [enabled, rootMargin])

    return (
      <span ref={ref} className={cn('relative block', className)}>
        {children}
        {enabled && near && (
          <span aria-hidden className="pointer-events-none absolute inset-0">
            <Effect {...effectProps} />
          </span>
        )}
      </span>
    )
  }
  ```

- [ ] **Step 2 — VERIFICATION:**
  - `bunx tsc --noEmit` → Expected: no output.
  - File-shape check (the dynamic import must be inside a client component): grep that `'use client'` and `ssr: false` co-exist in the file.
    ```bash
    grep -c "use client" src/components/webgl/webgl-island.tsx && grep -c "ssr: false" src/components/webgl/webgl-island.tsx
    ```
    Expected: each prints `1`.
  - > BROWSER-VERIFY: actual capability gating + IO mount/unmount can only be confirmed in-browser; deferred to Task 3 where it's wired to a real surface. Use the `web-perf` skill (Chrome DevTools MCP) to confirm the OGL chunk is requested only on hover-near.

- [ ] **Step 3 — COMMIT:**
  ```bash
  git add src/components/webgl/webgl-island.tsx
  git commit -m "feat(webgl): add design-agnostic WebGLIsland lazy gate with static children fallback"
  ```

---

### Task 3: Reference effect — OGL hover image-displacement on the project cover (in `RenderCursor`)

Implement the ONE reference effect and wire it into the real hover-driven image surface (`RenderCursor`'s current-index cover in `project-list.view.tsx`), with the existing `next/image` as the untouched fallback. Per Pre-Flight Facts, this surface is client-only + desktop-only, so the IO/SSR-fallback paths of `<WebGLIsland>` are intentionally NOT exercised here (they exist for post-redesign in-flow grids); the gate still provides capability gating and the always-present `<Image>` fallback.

- **Files:** Create `src/components/webgl/displacement-canvas.tsx` (the OGL effect, default export). Modify `src/module/projects/view/project-list.view.tsx` (`RenderCursor`, lines 76–104 — wrap the per-item cover `<Image>` in `<WebGLIsland>`).
- **Interfaces:**
  - Consumes — `WebGLIsland`, `EffectProps` from `@/components/webgl/webgl-island`; `frame`, `cancelFrame` from `motion`; OGL `Renderer/Program/Mesh/Triangle/Texture` from `ogl`.
  - Produces — default-export `DisplacementCanvas` (client component, `EffectProps` shape: `{ src: string }`). Task 4 extends this same component with scroll uniforms; Task 5 hardens its guardrails.

- [ ] **Step 1: Write the OGL effect.** Complete code (no placeholders). It uses ONLY `frame.render` (single-RAF rule), loads the cover URL as the texture, and animates `uHover`/`uMouse` imperatively from WINDOW listeners + the cursor store (no per-pointermove React state).
  > **CRITICAL (verified pattern):** `RenderCursor` lives inside `<Cursor/>`, whose root is `pointer-events-none` (`index.tsx:73`), and `<WebGLIsland>`'s effect span adds `pointer-events-none` again. `pointer-events: none` is INHERITED — so `pointerenter`/`pointermove` bound to the host NEVER fire. `Cursor` itself dodges this by listening on `window` (`index.tsx:57`). We follow that exact pattern: drive `uMouse` from a `window` `mousemove` listener (computed against `host.getBoundingClientRect()`), and drive `uHover` from the cursor store's `cursor.isVisible` (the conceptual "hover" here is hovering a project ROW, which sets `cursor.isVisible`/`index` via the row's `onMouseOver`, NOT hovering the floating follower). Binding hover to host pointer events would leave `uHover` stuck at 0 → zero displacement → a dead effect.
  ```tsx
  'use client'

  import { Mesh, Program, Renderer, Texture, Triangle } from 'ogl'
  import { cancelFrame, frame } from 'motion'
  import { useEffect, useRef } from 'react'

  import { useCursor } from '@/hooks/stores/useCursor.hook'

  type Props = { src: string }

  const VERTEX = /* glsl */ `
    attribute vec2 uv;
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `

  const FRAGMENT = /* glsl */ `
    precision highp float;
    uniform sampler2D tMap;
    uniform vec2 uMouse;     // normalized cursor within the tile
    uniform float uHover;    // 0..1 eased on enter/leave
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vec2 dir = vUv - uMouse;
      float d = length(dir);
      vec2 disp = dir * uHover * 0.06 * smoothstep(0.5, 0.0, d);
      float shift = uHover * 0.015 + uHover * 0.004 * sin(uTime * 2.0);
      float r = texture2D(tMap, vUv - disp + vec2(shift, 0.0)).r;
      float g = texture2D(tMap, vUv - disp).g;
      float b = texture2D(tMap, vUv - disp - vec2(shift, 0.0)).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `

  export default function DisplacementCanvas({ src }: Props) {
    const hostRef = useRef<HTMLDivElement>(null)
    const { cursor } = useCursor()
    // Mirror the store value into a ref so the frame.render loop reads it without re-running the effect.
    const visibleRef = useRef(cursor.isVisible)
    visibleRef.current = cursor.isVisible

    useEffect(() => {
      const host = hostRef.current
      if (!host) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const renderer = new Renderer({ alpha: true, dpr })
      const gl = renderer.gl
      const canvas = gl.canvas as HTMLCanvasElement
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      host.appendChild(canvas)

      const texture = new Texture(gl)
      const program = new Program(gl, {
        vertex: VERTEX,
        fragment: FRAGMENT,
        uniforms: {
          tMap: { value: texture },
          uMouse: { value: [0.5, 0.5] },
          uHover: { value: 0 },
          uTime: { value: 0 },
        },
      })
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

      // Load the cover as the texture. NOTE: this is a small, capped, DESKTOP-ONLY fetch — NOT
      // the same URL as next/image (which proxies via /_next/image), and crossOrigin forces a
      // CORS request, so it's a separate cache entry. cdn.sanity.io DOES send
      // Access-Control-Allow-Origin, so the upload won't taint; if it ever errors, the <Image/>
      // underneath remains the content (Texture stays transparent).
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      img.decode().then(
        () => {
          texture.image = img
        },
        () => {
          /* decode failed: leave transparent canvas; the <Image/> underneath remains the content */
        },
      )

      const resize = () => {
        const rect = host.getBoundingClientRect()
        renderer.setSize(rect.width, rect.height)
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(host)

      // uMouse from a WINDOW listener — the host is pointer-events:none (inherited from <Cursor/>),
      // so host-bound pointer events never fire. window listeners fire regardless (same trick as
      // Cursor index.tsx:57). No per-event React state — Animation Rule 3.
      const onMove = (e: MouseEvent) => {
        const rect = host.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return
        program.uniforms.uMouse.value = [
          (e.clientX - rect.left) / rect.width,
          1 - (e.clientY - rect.top) / rect.height,
        ]
      }
      window.addEventListener('mousemove', onMove)

      // SINGLE-RAF rule: draw inside Motion's frame.render (runs after Lenis's frame.update).
      // uHover target = the cursor store's isVisible (set true on project-row onMouseOver),
      // read via the ref so the loop need not re-subscribe.
      const draw = () => {
        const target = visibleRef.current ? 1 : 0
        const h = program.uniforms.uHover.value as number
        program.uniforms.uHover.value = h + (target - h) * 0.12
        program.uniforms.uTime.value = performance.now() * 0.001
        renderer.render({ scene: mesh })
      }
      frame.render(draw, true) // keepAlive — runs every tick on the ONE shared loop

      return () => {
        cancelFrame(draw) // cancels ONLY this island's callback, never Lenis's frame.update
        ro.disconnect()
        window.removeEventListener('mousemove', onMove)
        gl.getExtension('WEBGL_lose_context')?.loseContext()
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
      }
    }, [src])

    return <div ref={hostRef} className="absolute inset-0 h-full w-full" />
  }
  ```

- [ ] **Step 2: Read `project-list.view.tsx`, then wire `<WebGLIsland>` around the cover `<Image>`.** Current `RenderCursor` body (lines 76–104) renders, per item, an `<li>` containing the cover `<Image>` (lines 93–99). Add the import at the top of the file (after line 4's `import Image from 'next/image'`):
  ```tsx
  import { WebGLIsland } from '@/components/webgl/webgl-island'
  ```
  Then replace the existing `<Image>` (lines 93–99):
  ```tsx
              <Image
                src={urlFor(project.cover).url()}
                alt={project.cover.alt}
                width={width}
                height={height}
                className="aspect-video size-auto object-contain"
              />
  ```
  with the `<Image>` wrapped in `<WebGLIsland>` (effect mounts only for the visible/current item via `idx === index`, keeping exactly one context alive):
  ```tsx
              {idx === index ? (
                <WebGLIsland
                  className="aspect-video size-auto"
                  load={() => import('@/components/webgl/displacement-canvas')}
                  effectProps={{ src: urlFor(project.cover).url() }}
                >
                  <Image
                    src={urlFor(project.cover).url()}
                    alt={project.cover.alt}
                    width={width}
                    height={height}
                    className="aspect-video size-auto object-contain"
                  />
                </WebGLIsland>
              ) : (
                <Image
                  src={urlFor(project.cover).url()}
                  alt={project.cover.alt}
                  width={width}
                  height={height}
                  className="aspect-video size-auto object-contain"
                />
              )}
  ```
  (`index` is the current hovered index from `useCursor()`, already destructured at lines 65–67; `idx` is the map index at line 79. Only the shown cover gets a canvas; the rest stay plain `<Image>`. No in-flow DOM is invented — this is the existing cursor cover.)

- [ ] **Step 3 — VERIFICATION:**
  - `bunx tsc --noEmit` → Expected: no output.
  - SSR HTML unchanged (the canvas is desktop-only/client-only, never in SSR HTML — assert the page still renders the cover and stays static):
    ```bash
    bun run build && (bun run start &) && sleep 4 && curl -s http://localhost:3000/projects | grep -o 'cdn.sanity.io' | head -1
    ```
    Expected: prints `cdn.sanity.io` (the cover image URL is still in SSR HTML via `RenderCursor`/`next/image`). Then `kill %1` (or `pkill -f "next start"`).
  - Build route marker unchanged:
    ```bash
    bun run build
    ```
    Expected: `/projects` still `○ (Static)` (matches `.phase4-baseline.txt`).
  - > BROWSER-VERIFY: the actual displacement/RGB-shift on hover, and that the OGL chunk loads ONLY on a fine-pointer desktop on hover, are visual/network facts — confirm with the `web-perf` skill (Chrome DevTools MCP: hover the project list, watch the network panel for the lazy `displacement-canvas` chunk, confirm reduced-motion + coarse-pointer emulation show the plain `<Image>` with NO chunk fetched).

- [ ] **Step 4 — COMMIT:**
  ```bash
  git add src/components/webgl/displacement-canvas.tsx src/module/projects/view/project-list.view.tsx
  git commit -m "feat(webgl): add OGL hover image-displacement reference effect on project cover"
  ```

---

### Task 4: Wire scroll-driven uniforms from Motion `useScroll` on the single `frame.render` loop

Prove the scroll-uniform wiring WITHOUT a second RAF and WITHOUT re-smoothing the Lenis-driven value. We SAMPLE `scrollYProgress.get()` inside the existing `frame.render` draw — never subscribe-and-render. Uses Motion's `useScroll` directly (NOT Phase 3's `useScrollProgress`), so there is no hard dependency on the unbuilt scroll primitives.

- **Files:** Modify `src/components/webgl/displacement-canvas.tsx` (add a `uScroll` uniform + sample it in `draw`).
- **Interfaces:**
  - Consumes — `useScroll` from `motion/react`; the existing `frame.render` draw from Task 3.
  - Produces — a `uScroll` uniform driven by scroll progress, sampled in-loop. Demonstrates the scroll-uniform pattern that real post-design scroll-shader sections will reuse.

- [ ] **Step 1: Add the `useScroll` import.** At the top of `displacement-canvas.tsx`, after the `motion` import (`import { cancelFrame, frame } from 'motion'`):
  ```tsx
  import { useScroll } from 'motion/react'
  ```

- [ ] **Step 2: Read `scrollYProgress` in the component body** (before the `useEffect`), without `useSpring` (Animation Rule 4 — never re-smooth a Lenis value):
  ```tsx
    // Raw Lenis-smoothed scroll progress. NEVER wrap in useSpring (double-lerp = lag).
    const { scrollYProgress } = useScroll()
  ```

- [ ] **Step 3: Add the `uScroll` uniform** to the `Program` uniforms (after `uTime: { value: 0 },`):
  ```tsx
          uTime: { value: 0 },
          uScroll: { value: 0 },
  ```
  And add the matching declaration in the fragment shader (after `uniform float uTime;`):
  ```glsl
    uniform float uScroll;
  ```
  Use it to bias the channel shift so the effect responds to scroll (replace the `shift` line):
  ```glsl
      float shift = uHover * 0.015 + uHover * 0.004 * sin(uTime * 2.0) + uScroll * 0.01;
  ```

- [ ] **Step 4: SAMPLE `scrollYProgress.get()` inside the existing `draw`** (NOT a `.on('change')` subscription). In the `draw` function, before `renderer.render(...)`:
  ```tsx
      const draw = () => {
        const target = visibleRef.current ? 1 : 0
        const h = program.uniforms.uHover.value as number
        program.uniforms.uHover.value = h + (target - h) * 0.12
        program.uniforms.uTime.value = performance.now() * 0.001
        program.uniforms.uScroll.value = scrollYProgress.get() // sample on the ONE loop
        renderer.render({ scene: mesh })
      }
  ```
  Add `scrollYProgress` to the effect deps array (it's a stable MotionValue, safe):
  ```tsx
    }, [src, scrollYProgress])
  ```

- [ ] **Step 5 — VERIFICATION:**
  - `bunx tsc --noEmit` → Expected: no output.
  - Single-RAF audit (no NEW `requestAnimationFrame` introduced by the WebGL files; the only allowed loop hook is `frame.render`):
    ```bash
    grep -rn "requestAnimationFrame" src/components/webgl/
    ```
    Expected: NO matches (the island uses `frame.render` exclusively; the pre-existing cursor RAF is in `src/components/animations/cursor/index.tsx`, out of scope).
  - Confirm no `.on('change')`-driven render path:
    ```bash
    grep -rn "scrollYProgress.on" src/components/webgl/
    ```
    Expected: NO matches (we sample with `.get()` in-loop only).
  - > BROWSER-VERIFY: that the uniform actually updates with scroll and stays in lockstep with Lenis (no double-lerp lag) — confirm with the `web-perf` skill (scroll the page, observe the shift responding without lag).

- [ ] **Step 6 — COMMIT:**
  ```bash
  git add src/components/webgl/displacement-canvas.tsx
  git commit -m "feat(webgl): drive scroll uniform via Motion useScroll sampled on the single frame.render loop"
  ```

---

### Task 5: Guardrails pass — DPR cap, context-loss handling, visibility/offscreen pause, dispose

Harden the reference island with the full WebGL guardrail set. Several are already in Task 3's code (DPR cap, dispose, `loseContext`); this task ADDS context-loss recovery and a hidden-tab pause, and asserts the complete set. The texture-dimension cap is enforced via the Sanity URL.

- **Files:** Modify `src/components/webgl/displacement-canvas.tsx`.
- **Interfaces:** Consumes — the island from Tasks 3–4. Produces — a context-loss-resilient, visibility-aware, leak-free island (the guardrail reference all post-design effect islands copy).

- [ ] **Step 1: Cap the requested texture size via the Sanity URL.** The incoming `src` is a raw `urlFor(...).url()`. Append a width cap so a 4000px asset is never uploaded into a ~400px tile. In `DisplacementCanvas`, before `img.src = src`, compute a capped URL:
  ```tsx
      // Cap texture request to displayed size × DPR (don't upload a 4000px asset into a ~400px tile).
      const cap = Math.round(400 * dpr)
      const capped = src.includes('?') ? `${src}&w=${cap}&fit=max` : `${src}?w=${cap}&fit=max`
      img.src = capped
  ```
  (Replace the prior `img.src = src` line. Sanity's image CDN honors `w`/`fit` query params; `urlFor` output may already carry a query, hence the `?`/`&` branch.)

- [ ] **Step 2: Add context-loss / context-restore handling.** After the `frame.render(draw, true)` line (still inside the effect, before the `return` cleanup), register the handlers (mandatory `preventDefault` so the context can restore):
  ```tsx
      const onLost = (e: Event) => {
        e.preventDefault() // REQUIRED — without it the context never restores
        cancelFrame(draw)
      }
      const onRestored = () => {
        // Re-upload the texture and resume the single-loop draw.
        if (img.complete && img.naturalWidth > 0) texture.image = img
        frame.render(draw, true)
      }
      canvas.addEventListener('webglcontextlost', onLost, false)
      canvas.addEventListener('webglcontextrestored', onRestored, false)
  ```

- [ ] **Step 3: Pause the draw on hidden tab.** After the context-loss handlers:
  ```tsx
      const onVisibility = () => {
        if (document.hidden) cancelFrame(draw)
        else frame.render(draw, true)
      }
      document.addEventListener('visibilitychange', onVisibility)
  ```

- [ ] **Step 4: Extend the cleanup to remove the new listeners.** Update the `return () => { ... }` cleanup to also detach the context-loss + visibility listeners (add these lines inside the existing cleanup, after `cancelFrame(draw)`):
  ```tsx
        canvas.removeEventListener('webglcontextlost', onLost, false)
        canvas.removeEventListener('webglcontextrestored', onRestored, false)
        document.removeEventListener('visibilitychange', onVisibility)
  ```
  (Offscreen pause is already handled structurally: `<WebGLIsland>`'s IntersectionObserver UNMOUNTS the effect when far from viewport, which runs this full cleanup and frees the context. The coarse-pointer / reduced-motion / save-data / weak-device degradation is the capability gate in Task 2 — those clients never load this chunk at all. Battery Status API is intentionally NOT used: removed in Firefox/Safari, gated in Chromium — `prefers-reduced-motion` + `saveData` + `hardwareConcurrency`/`deviceMemory` + coarse-pointer are the real low-power signals.)

- [ ] **Step 5 — VERIFICATION:**
  - `bunx tsc --noEmit` → Expected: no output.
  - Assert all guardrails present:
    ```bash
    grep -c "preventDefault" src/components/webgl/displacement-canvas.tsx
    grep -c "WEBGL_lose_context" src/components/webgl/displacement-canvas.tsx
    grep -c "visibilitychange" src/components/webgl/displacement-canvas.tsx
    grep -c "Math.min(window.devicePixelRatio" src/components/webgl/displacement-canvas.tsx
    grep -c "fit=max" src/components/webgl/displacement-canvas.tsx
    ```
    Expected: each prints `>= 1` (context-loss `preventDefault`, dispose `loseContext`, visibility pause, DPR cap, texture-size cap).
  - > BROWSER-VERIFY: context-loss recovery and hidden-tab pause are runtime behaviors — confirm with the `web-perf` skill / Chrome DevTools (simulate context loss via `WEBGL_lose_context().loseContext()` in console; switch tabs and confirm GPU work stops; scroll a long list and confirm contexts don't accumulate past the ~16 cap).

- [ ] **Step 6 — COMMIT:**
  ```bash
  git add src/components/webgl/displacement-canvas.tsx
  git commit -m "feat(webgl): add DPR cap, texture-size cap, context-loss recovery and visibility pause guardrails"
  ```

---

### Task 6: Bundle verification — OGL is a separate lazy chunk OUTSIDE first-load JS, budget held

Prove the dependency rule and budget: OGL must NOT appear in the critical-path/first-load JS of any route, and first-load JS must stay within budget vs the Task 1 baseline.

- **Files:** None (verification-only). Updates `docs/superpowers/plans/.phase4-baseline.txt` with the post-WebGL numbers.
- **Interfaces:** Consumes — the baseline first-load-JS number from Task 1. Produces — a recorded assertion that OGL is lazy and first-load JS did not regress.

- [ ] **Step 1: Production build.**
  ```bash
  bun run build
  ```
  Expected: build succeeds; `/projects` still `○ (Static)`.

- [ ] **Step 2: Assert first-load JS did not regress.** Compare the new `/projects` "First Load JS" and "First Load JS shared by all" against `.phase4-baseline.txt` (Task 1). Expected: unchanged (OGL is lazy → not in first-load JS). Allow only minor variance from the `<WebGLIsland>` gate itself (a few KB of gate code, NOT OGL). Record both numbers. Hard ceiling: critical-path JS ≤ 170 KB gz.

- [ ] **Step 3: Assert OGL is a SEPARATE chunk, not in first-load.** OGL must live in a lazily-imported chunk. Verify it is present in the build output but NOT referenced by the `/projects` entry's first-load set:
  ```bash
  grep -rl "ogl" .next/static/chunks/ | head
  ```
  Expected: OGL code appears in SOME chunk file under `.next/static/chunks/` (proving it built), but because it is imported only via `dynamic(() => import('@/components/webgl/displacement-canvas'), { ssr:false })`, that chunk is NOT part of the `/projects` first-load JS table (Step 2 already confirmed first-load did not grow by OGL's ~9–14 KB). Note: Turbopack chunk filenames are hashed and not stable — assert on the first-load NUMBER (Step 2), not a fixed chunk name.

- [ ] **Step 4 — VERIFICATION:**
  - `bun run build` → Expected: `/projects` `○ (Static)`, first-load JS ≈ baseline (no OGL inflation), ≤ 170 KB gz.
  - `.phase4-baseline.txt` records baseline vs post-WebGL first-load JS, with the delta attributable to the gate only (not OGL).
  - > BROWSER-VERIFY: run a Lighthouse pass via the `web-perf` skill (Chrome DevTools MCP → Lighthouse) on `/projects` desktop AND mobile-emulated, confirming LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1, and that the OGL chunk is requested only on hover (desktop, fine-pointer) and never on the mobile/coarse-pointer profile. For any structured-data work in later phases, validate at https://search.google.com/test/rich-results and https://validator.schema.org — N/A for this infrastructure-only phase.

- [ ] **Step 5 — COMMIT:**
  ```bash
  git add docs/superpowers/plans/.phase4-baseline.txt
  git commit -m "test(webgl): record bundle verification — OGL lazy chunk outside first-load JS, budget held"
  ```

---

## Done-criteria for THIS plan (infrastructure only)
- OGL added (only new dep); `<WebGLIsland>` capability+IO gate with static `children` fallback; one OGL displacement reference effect on the project cover; scroll-uniform wiring proven on the single `frame.render` loop; full guardrail set; bundle verification that OGL is lazy and first-load JS holds.
- `bunx tsc --noEmit` = 0 errors throughout; `/projects` stays `○ (Static)`; no second `requestAnimationFrame` added.
- The remaining Phase-4 redesign work is BLOCKED on the DESIGN GATE above — do a `frontend-design` brainstorm pass and lock the 7 design decisions before writing per-section tasks.
