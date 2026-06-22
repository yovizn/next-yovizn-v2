# Phase 0 — SEO & Structured Data Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (- [ ]) syntax.
**Goal:** Ship no-regret SEO wins — canonicals on every route, per-page metadata, fixed project OG images, and schema-dts-typed JSON-LD (Person+WebSite entity graph, BreadcrumbList rich result, CreativeWork) mounted server-side.
**Architecture:** A pure builder module (`src/lib/seo/structured-data.ts`) produces schema-dts-typed objects; a server component (`src/components/common/json-ld.tsx`) renders them as XSS-safe `<script type="application/ld+json">`. Page-level Metadata exports add canonical/OG per route, and the JSON-LD component is mounted in each route's server component. No client JS, no new runtime deps.
**Tech Stack:** Next.js 16.2.9 (App Router, Turbopack) · React 19.2.7 · schema-dts 2.0 (already installed) · Sanity v6 / next-sanity 13 · `@sanity/image-url` (urlFor) · Zod env config · bun.
**Depends on:** none (first phase).

## Global Constraints (every task must respect these)
PERFORMANCE BUDGET (p75, mobile+desktop): LCP <= 2.5s · INP <= 200ms · CLS <= 0.1 · critical-path JS <= 170 KB gz.
ANIMATION RULES: (1) animate transform/opacity/clip-path ONLY — never width/height/top/left/margin. (2) Single RAF loop — Lenis stays driven by Motion's frame; never run Lenis's own raf AND Motion's. (3) Cursor is imperative (MotionValue+spring), never React state per pointermove. (4) NEVER useSpring a Lenis-smoothed useScroll value (double-lerp = lag). (5) prefers-reduced-motion is systemic (gate Lenis, intro overlay, transitions; CSS kill-switch). (6) Don't gate the LCP hero behind an opacity:0 reveal. (7) will-change only transiently.
DEPENDENCY RULE: zero new runtime deps EXCEPT the one chosen WebGL lib (Phase 4), used ONLY for isolated lazy-loaded islands — never a global canvas.
SEO FACTS (verified live 2026-06-17): BreadcrumbList is the ONLY structured-data type that yields a visible Google rich result. Person/WebSite are entity-only (no snippet). DROP SearchAction (deprecated Nov 2024); do NOT build FAQPage/HowTo (deprecated). Canonicals must exist on every route. CWV thresholds unchanged in 2026. llms.txt irrelevant to Google.

### Phase-0 ground-truth (verified against the live repo on 2026-06-17 — DO NOT re-derive, just respect)
- **Every `(main)` route is `ƒ` (Dynamic), and that is correct — not a regression.** `src/app/(main)/layout.tsx` awaits `getFirstRender()` (cookies) and `getDeviceInfo()` (headers), which opts the entire route group out of static rendering. The real `bun run build` output is:
  ```
  ┌ ƒ /
  ├ ƒ /about
  ├ ƒ /projects
  ├ ƒ /projects/[slug]
  ```
  So build-marker gates below assert `ƒ` (NOT `○`). `/projects/[slug]` keeps `generateStaticParams` but still renders `ƒ` because of the layout. Do not try to "fix" this to static in Phase 0.
- **File-based OG images already exist** and emit their own routes — do NOT delete or duplicate them: `src/app/(main)/opengraph-image.tsx`, `src/app/(main)/about/opengraph-image.tsx`, `src/app/(main)/projects/opengraph-image.tsx`. These auto-populate `openGraph.images` for static pages via Next's metadata file convention. The per-page `openGraph` we add (title/description) MERGES with these; we do NOT set `openGraph.images` on home/about/projects (the file convention owns that). We only set `openGraph.images` explicitly on `[slug]` (no file-based OG image there).
- **`sitemap.xml` and `robots.txt` already exist** (`src/app/sitemap.ts`, `src/app/robots.ts`) — out of scope, leave untouched.
- **`metadataBase` is already set** in root layout to `https://yovizn.com` in production (`env.NEXT_PUBLIC_WEBSITE_URL`) / `http://localhost:3000` in dev. So canonicals MUST be relative paths (`'/'`, `'/about'`, …) — Next resolves them against `metadataBase`. `bun run start` runs `NODE_ENV=production`, so the emitted canonical is `https://yovizn.com/...`; the curl grep must match `rel="canonical"` only, NEVER a hardcoded host.
- **Env values (from `.env`, surfaced via `src/configs/env.config.ts`):** `NEXT_PUBLIC_WEBSITE_NAME=yovizn`, `NEXT_PUBLIC_WEBSITE_URL=https://yovizn.com`, `NEXT_PUBLIC_WEBSITE_DESCRIPTION=Frontend Developer with expertise in web animations…`.
- **`QueryProjectsBySlugResult` is `T | null`** (the GROQ `[0]` projection). Builders that take a project must take `NonNullable<QueryProjectsBySlugResult>`; the page already narrows via `notFound()` before calling.
- **The committed `queryProjectsBySlug` projects `client->{ logo, link }` — NO `name`.** So `project.client` is `{ logo, link } | null` and has no usable org name. Task 1 fixes this by adding `name` to the projection (the `clients` doc DOES have `name: string`, verified in `Clients`/`QueryClientsViewResult`) and regenerating types. **DO NOT set `sourceOrganization.name` to the project title** — that names the client org after the project, which is factually wrong and passes every syntactic gate.
- **`bun run typegen` is fully offline** — it reads the committed `src/sanity/sanity-schemas.json` (config `sanity-typegen.json`), no Sanity network call. Verified to run clean. EXPECT some cosmetic diff churn in `src/types/sanity.types.ts` (comment headers / blank-line formatting from the installed next-sanity 13 generator) IN ADDITION to the real `client.name` field addition — both are expected; commit the whole regenerated file.
- **schema-dts 2.0 facts (verified):** `Graph = { "@context": "https://schema.org"; "@graph": readonly Thing[] }`; `WithContext<T> = T & { "@context": "https://schema.org" }`; `IdReference = { readonly "@id": string }`. Graph members are BARE typed literals (no `@context`); standalone `<script>` payloads need `WithContext<…>`.
- **NOTE on commits:** This repo IS a git repo (`git rev-parse --is-inside-work-tree` → true). Run the commit commands. If a step's working tree is clean for unrelated reasons, skip the commit but do not fail the task.

---

### Task 1: Add `client.name` to the project GROQ projection + regenerate Sanity types
**Files:**
- Modify: `src/sanity/queries.ts` (`queryProjectsBySlug`, current lines 32–40).
- Modify (generated): `src/types/sanity.types.ts` (via `bun run typegen` — do not hand-edit).
**Interfaces:**
- Produces: `QueryProjectsBySlugResult.client` becomes `{ name: string; logo: {...}; link: string | null } | null`, giving Task 2's `buildCreativeWork` a real client org name.

- [ ] **Step 1: Add `name` to the `client->` projection in `src/sanity/queries.ts`.** Current `queryProjectsBySlug` (lines 32–40) is:
  ```ts
  export const queryProjectsBySlug = defineQuery(
    `*[_type == 'projects' && slug.current == $slug][0]{
          ...,
          client->{
              logo,
              link
          },
      }`,
  )
  ```
  Change the `client->` sub-projection to include `name`:
  ```ts
  export const queryProjectsBySlug = defineQuery(
    `*[_type == 'projects' && slug.current == $slug][0]{
          ...,
          client->{
              name,
              logo,
              link
          },
      }`,
  )
  ```

- [ ] **Step 2: Regenerate types (offline against the committed schema).**
  - Run: `bun run typegen`
    - **Expected:** `✔ Successfully generated types to …/src/types/sanity.types.ts` and `4 queries and 16 schema types`. The generated `QueryProjectsBySlugResult.client` now includes `name: string`. (Some unrelated comment/whitespace churn in the file is expected — see ground-truth — commit it all.)

- [ ] **Step 3: VERIFICATION — confirm the new field is in the generated type.**
  - Run: `bunx tsc --noEmit` → **Expected: no output (0 errors).**
  - Run: `grep -n "name: string" src/types/sanity.types.ts | head` and visually confirm the `QueryProjectsBySlugResult` `client` object (search the `QueryProjectsBySlugResult` block) now has a `name: string` member alongside `logo` and `link: string | null`.
    - **Expected:** `client: { name: string; logo: {...}; link: string | null } | null` present in `QueryProjectsBySlugResult`.

- [ ] **Step 4: COMMIT.**
  - `git add src/sanity/queries.ts src/types/sanity.types.ts && git commit -m "feat(sanity): project client name in slug query + regen types"`

---

### Task 2: Structured-data builders (`src/lib/seo/structured-data.ts`)
**Files:**
- Create: `src/lib/seo/structured-data.ts`
**Interfaces:**
- Consumes: `env` from `@/configs/env.config`; `socials` from `@/lib/constants/social.constant`; `urlFor` from `@/sanity/lib/image`; `QueryProjectsBySlugResult` from `@/types/sanity.types`.
- Produces:
  - `buildPersonGraph(): Graph` — `@graph` of bare `Person` (`@id` = `${SITE_URL}/#person`) + `WebSite` (`@id` = `${SITE_URL}/#website`), with `sameAs` from socials, cross-linked via `IdReference`.
  - `buildBreadcrumbList(items: BreadcrumbItem[]): WithContext<BreadcrumbList>` and exported type `BreadcrumbItem = { name: string; url: string }`.
  - `buildCreativeWork(project: NonNullable<QueryProjectsBySlugResult>): WithContext<CreativeWork>` — `creator` = `IdReference` to Person; `sourceOrganization` = Organization built from `project.client` (omitted entirely when `client` is null). NO `client` property (per scope).

- [ ] **Step 1: Create `src/lib/seo/structured-data.ts` with the exact verified content below.** (This code already compiles `bunx tsc --noEmit` clean in the repo.)
  ```ts
  import type {
    BreadcrumbList,
    CreativeWork,
    Graph,
    IdReference,
    Organization,
    Person,
    WebSite,
    WithContext,
  } from 'schema-dts'

  import { env } from '@/configs/env.config'
  import { socials } from '@/lib/constants/social.constant'
  import { urlFor } from '@/sanity/lib/image'
  import type { QueryProjectsBySlugResult } from '@/types/sanity.types'

  const SITE_URL = env.NEXT_PUBLIC_WEBSITE_URL
  const PERSON_ID = `${SITE_URL}/#person`
  const WEBSITE_ID = `${SITE_URL}/#website`

  const personRef: IdReference = { '@id': PERSON_ID }

  /** Stable Person + WebSite entity graph. Entity-only (no rich snippet). */
  export function buildPersonGraph(): Graph {
    const sameAs = socials.filter((s) => s.href.startsWith('http')).map((s) => s.href)

    const person: Person = {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Yovi Zulkarnaen',
      url: SITE_URL,
      jobTitle: 'Frontend Developer',
      description: env.NEXT_PUBLIC_WEBSITE_DESCRIPTION,
      sameAs,
    }

    const website: WebSite = {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE_URL,
      name: env.NEXT_PUBLIC_WEBSITE_NAME,
      description: env.NEXT_PUBLIC_WEBSITE_DESCRIPTION,
      publisher: personRef,
      author: personRef,
    }

    return {
      '@context': 'https://schema.org',
      '@graph': [person, website],
    }
  }

  export type BreadcrumbItem = { name: string; url: string }

  /** The only structured-data type that yields a visible Google rich result. */
  export function buildBreadcrumbList(items: BreadcrumbItem[]): WithContext<BreadcrumbList> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    }
  }

  /** CreativeWork for a project detail page. Authorship via creator/sourceOrganization. */
  export function buildCreativeWork(
    project: NonNullable<QueryProjectsBySlugResult>,
  ): WithContext<CreativeWork> {
    const work: WithContext<CreativeWork> = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${SITE_URL}/projects/${project.slug.current}#creativework`,
      name: project.title,
      description: project.description,
      url: `${SITE_URL}/projects/${project.slug.current}`,
      image: urlFor(project.cover).width(1200).height(630).url(),
      genre: project.service,
      dateCreated: project._createdAt,
      dateModified: project._updatedAt,
      datePublished: project.date,
      creator: personRef,
    }

    if (project.client) {
      const organization: Organization = {
        '@type': 'Organization',
        name: project.client.name,
        ...(project.client.link ? { url: project.client.link } : {}),
        ...(project.client.logo ? { logo: urlFor(project.client.logo).url() } : {}),
      }
      work.sourceOrganization = organization
    }

    return work
  }
  ```
  > NOTE on authorship mapping (explicit, do not re-invent): `creator` is the Person `IdReference` (Yovi is the author of every project). `sourceOrganization` represents the project's CLIENT org, built from `project.client` (name + logo + link; `name` from Task 1, `link` nullable) — the whole property is OMITTED when `project.client === null`. `name` MUST be `project.client.name` (the client), NEVER `project.title` (the project). `project.credits[]` (string[]) is NOT mapped in Phase 0 (no clean schema.org slot; revisit if needed). We deliberately use `sourceOrganization`, never a `client` property.
  > NOTE on cross-page `@id` (intentional): on a `[slug]` page, `creator: { '@id': '${SITE_URL}/#person' }` references the Person node defined in `buildPersonGraph()`, which is only mounted on home/about — so the detail page carries a dangling `@id` reference. This is INTENTIONAL and Google-tolerated (entity references resolve across the site graph); do NOT mount `buildPersonGraph()` on `[slug]` to "fix" it (that would change the expected ld+json count on detail from 2 to 3).

- [ ] **Step 2: VERIFICATION — typecheck + pure-function smoke test.**
  - Run: `bunx tsc --noEmit`
    - **Expected: no output (0 errors).** (This is the hard gate; the code above was authored against it.)
  - Pure-function smoke test (no test framework — one-off `node:assert`, do NOT add vitest/jest). Because the module imports `@/` aliases + env, test the SHAPE inline by transpiling intent rather than importing. Run this exact check:
    ```bash
    bun run -e '
      import assert from "node:assert";
      // Mirror buildBreadcrumbList logic to assert ordering/positions are 1-based.
      const items = [{name:"Home",url:"/"},{name:"Projects",url:"/projects"}];
      const el = items.map((it,i)=>({"@type":"ListItem",position:i+1,name:it.name,item:it.url}));
      assert.equal(el[0].position, 1);
      assert.equal(el[1].position, 2);
      assert.equal(el[1].name, "Projects");
      console.log("OK breadcrumb positions 1-based");
    '
    ```
    - **Expected: `OK breadcrumb positions 1-based`.**
  - > BROWSER-VERIFY (deferred to Task 7): the live JSON-LD output is validated at https://validator.schema.org and https://search.google.com/test/rich-results once mounted.

- [ ] **Step 3: COMMIT.**
  - `git add src/lib/seo/structured-data.ts && git commit -m "feat(seo): add schema-dts-typed structured-data builders"`

---

### Task 3: JSON-LD server component (`src/components/common/json-ld.tsx`)
**Files:**
- Create: `src/components/common/json-ld.tsx`
**Interfaces:**
- Produces: `default export JsonLd({ data }: { data: object })` — server component rendering `<script type="application/ld+json">` with XSS-safe `JSON.stringify(data).replace(/</g, '<')`.
- Consumes: nothing.

- [ ] **Step 1: Create `src/components/common/json-ld.tsx` with the exact verified content below.** (Compiles clean; no `'use client'` — it's a server component.)
  ```tsx
  /**
   * Server component that renders a JSON-LD <script>.
   * XSS-safe: escapes `<` so a string value can never break out of the script tag.
   */
  export default function JsonLd({ data }: { data: object }) {
    return (
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data).replace(/</g, '\\u003c'),
        }}
      />
    )
  }
  ```
  > NOTE: the `\\u003c` in this Markdown is the escaped form of the source literal `<`. In the actual `.tsx` the replacement target is the 6-char sequence backslash-u-0-0-3-c (one JS string escape producing `<`). The regex `replace(/</g, '<')` replaces every literal `<` with the unicode escape so it cannot terminate the `</script>` tag.

- [ ] **Step 2: VERIFICATION — typecheck.**
  - Run: `bunx tsc --noEmit`
    - **Expected: no output (0 errors).**

- [ ] **Step 3: COMMIT.**
  - `git add src/components/common/json-ld.tsx && git commit -m "feat(seo): add XSS-safe JsonLd server component"`

---

### Task 4: Root canonical + per-page metadata (home / about / projects index)
**Files:**
- Modify: `src/app/layout.tsx` (add `alternates.canonical` to the existing `metadata` object, currently lines 16–38).
- Modify: `src/app/(main)/page.tsx` (add a `metadata` export above `HomePage`, current top imports lines 1–7).
- Modify: `src/app/(main)/about/page.tsx` (add a `metadata` export above `AboutPage`, current top imports lines 1–4).
- Modify: `src/app/(main)/projects/page.tsx` (add a `metadata` export above `ProjectPage`, current top imports lines 1–8).
**Interfaces:**
- Consumes: `Metadata` from `next`; `env` from `@/configs/env.config` (already imported in root layout; add import in the three pages).
- Produces: canonical on root (`'/'`) + canonical/title/description/openGraph on the three pages. Does NOT set `openGraph.images` (file-based OG images own that — see ground-truth).

- [ ] **Step 1: Add `alternates.canonical: '/'` to root `metadata` in `src/app/layout.tsx`.** Replace lines 26–32 region. The current block is:
  ```ts
    metadataBase: new URL(baseUrl),
    openGraph: {
      type: 'website',
      siteName: env.NEXT_PUBLIC_WEBSITE_NAME,
      title: 'Yovi Zulkarnaen — Frontend Developer',
      description: env.NEXT_PUBLIC_WEBSITE_DESCRIPTION,
    },
  ```
  Change to (insert `alternates` right after `metadataBase`):
  ```ts
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      siteName: env.NEXT_PUBLIC_WEBSITE_NAME,
      title: 'Yovi Zulkarnaen — Frontend Developer',
      description: env.NEXT_PUBLIC_WEBSITE_DESCRIPTION,
    },
  ```

- [ ] **Step 2: Add `metadata` export to `src/app/(main)/page.tsx`.** Current lines 1–9 are imports then `export default async function HomePage()`. Insert a `Metadata` import and a `metadata` export. After the change the head of the file reads:
  ```tsx
  import type { Metadata } from 'next'

  import { Header1 } from '@/components/ui/header-1'
  import { CompanyList } from '@/module/homepage/views/company-list.view'
  import { Hero } from '@/module/homepage/views/hero.view'
  import { Overview } from '@/module/homepage/views/overview.view'
  import { Projects } from '@/module/homepage/views/projects.view'
  import { getProjectsOverview } from '@/services/getProjects.service'
  import { notFound } from 'next/navigation'

  export const metadata: Metadata = {
    title: {
      absolute: 'Yovi Zulkarnaen — Frontend Developer & Motion Specialist',
    },
    description:
      'Frontend developer crafting performant web animations and micro-interactions with Motion. Explore selected projects by Yovi Zulkarnaen.',
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: 'Yovi Zulkarnaen — Frontend Developer & Motion Specialist',
      description:
        'Frontend developer crafting performant web animations and micro-interactions with Motion. Explore selected projects by Yovi Zulkarnaen.',
    },
  }

  export default async function HomePage() {
  ```
  > NOTE: `title.absolute` bypasses the root `template` (`%s — yovizn`) so the home title is not double-suffixed. `openGraph.images` is intentionally omitted so the existing `src/app/(main)/opengraph-image.tsx` populates it.

- [ ] **Step 3: Add `metadata` export to `src/app/(main)/about/page.tsx`.** Current lines 1–5 are imports then `export default function AboutPage()`. Insert:
  ```tsx
  import type { Metadata } from 'next'

  import { TextReveal } from '@/components/animations/text/reveal.text'
  import { Experience } from '@/module/about/views/experience.view'
  import { HeroImage, HeroSection } from '@/module/about/views/hero.view'

  export const metadata: Metadata = {
    title: 'About',
    description:
      'About Yovi Zulkarnaen — a frontend developer specializing in web animation, micro-interactions, and performant interfaces built with Motion.',
    alternates: {
      canonical: '/about',
    },
    openGraph: {
      title: 'About — yovizn',
      description:
        'About Yovi Zulkarnaen — a frontend developer specializing in web animation, micro-interactions, and performant interfaces built with Motion.',
    },
  }

  export default function AboutPage() {
  ```
  > NOTE: `title: 'About'` flows through the root `template` → renders `About — yovizn`. `openGraph.title` is the resolved string. `openGraph.images` omitted (file-based OG owns it).

- [ ] **Step 4: Add `metadata` export to `src/app/(main)/projects/page.tsx`.** Current lines 1–8 are imports then `export default async function ProjectPage()`. Insert:
  ```tsx
  import type { Metadata } from 'next'

  import { Header1 } from '@/components/ui/header-1'
  import { tryCatch } from '@/lib/utils/tryCatch'
  import { Hero } from '@/module/projects/view/hero.view'
  import { ProjectsList } from '@/module/projects/view/project-list.view'
  import { client } from '@/sanity/lib/client'
  import { queryProjectsAll } from '@/sanity/queries'
  import { ArrowDownRight } from 'lucide-react'
  import { notFound } from 'next/navigation'

  export const metadata: Metadata = {
    title: 'Projects',
    description:
      'Selected work by Yovi Zulkarnaen — frontend projects featuring web animation, motion design, and interaction craft.',
    alternates: {
      canonical: '/projects',
    },
    openGraph: {
      title: 'Projects — yovizn',
      description:
        'Selected work by Yovi Zulkarnaen — frontend projects featuring web animation, motion design, and interaction craft.',
    },
  }

  export default async function ProjectPage() {
  ```

- [ ] **Step 5: VERIFICATION — typecheck + build markers + SSR canonical grep.**
  - Run: `bunx tsc --noEmit` → **Expected: no output (0 errors).**
  - Run: `bun run build` → in the `Route (app)` table, **Expected lines (markers are `ƒ`, by design — see ground-truth):**
    ```
    ┌ ƒ /
    ├ ƒ /about
    ├ ƒ /projects
    ```
  - SSR HTML assertion (server is production → canonical resolves to `https://yovizn.com/...`; match only the attribute):
    ```bash
    bun run start &   # in repo root after the build above
    sleep 4
    curl -s http://localhost:3000/         | grep -o 'rel="canonical"' | head -1
    curl -s http://localhost:3000/about    | grep -o 'rel="canonical"' | head -1
    curl -s http://localhost:3000/projects | grep -o 'rel="canonical"' | head -1
    pkill -f "next-server"; pkill -f "next start"
    ```
    - **Expected: each curl prints `rel="canonical"`** (one match per route). To inspect the resolved href manually: `curl -s http://localhost:3000/about | grep -o '<link rel="canonical"[^>]*>'` should show `href="https://yovizn.com/about"`.
  - > BROWSER-VERIFY: spot-check titles/OG with the `web-perf` skill (Chrome DevTools MCP) or view-source; confirm home title is NOT double-suffixed and about/projects render `… — yovizn`.

- [ ] **Step 6: COMMIT.**
  - `git add src/app/layout.tsx "src/app/(main)/page.tsx" "src/app/(main)/about/page.tsx" "src/app/(main)/projects/page.tsx" && git commit -m "feat(seo): add canonical + per-page metadata for home, about, projects"`

---

### Task 5: `[slug]` canonical + OG image fix (`src/app/(main)/projects/[slug]/page.tsx`)
**Files:**
- Modify: `src/app/(main)/projects/[slug]/page.tsx` (`generateMetadata`, current lines 22–43).
**Interfaces:**
- Consumes: `urlFor` (already imported, line 9); `getProjectsBySlug` (already imported, line 10).
- Produces: canonical `` `/projects/${slug}` `` + OG image as object form (`url`/`width:1200`/`height:630`/`alt`). `project.cover.alt` is a required string in `QueryProjectsBySlugResult` (verified).

- [ ] **Step 1: Replace the `generateMetadata` return (current lines 28–42) with the canonical + fixed OG image version.** The current return is:
  ```tsx
    return {
      title: project?.title,
      description: project?.description,
      openGraph: {
        title: project?.title,
        description: project?.description,
        images: [urlFor(project?.cover || '').url()],
      },
      twitter: {
        title: project?.title,
        description: project?.description,
        images: [urlFor(project?.cover || '').url()],
        card: 'summary_large_image',
      },
    }
  ```
  Replace with (note: by this point `project` is already narrowed — lines 26 call `notFound()` on `error || !project` — so we can use `project.cover` directly):
  ```tsx
    const ogImage = {
      url: urlFor(project.cover).width(1200).height(630).url(),
      width: 1200,
      height: 630,
      alt: project.cover.alt,
    }

    return {
      title: project.title,
      description: project.description,
      alternates: {
        canonical: `/projects/${slug}`,
      },
      openGraph: {
        type: 'article',
        title: project.title,
        description: project.description,
        url: `/projects/${slug}`,
        images: [ogImage],
      },
      twitter: {
        title: project.title,
        description: project.description,
        images: [ogImage],
        card: 'summary_large_image',
      },
    }
  ```
  > NOTE: dropped the `?.` / `|| ''` fallbacks because `notFound()` on line 26 already guarantees `project` is non-null inside `generateMetadata`. The OG image is now the object form with real dimensions (1200×630) + `alt` from `project.cover.alt` (required by the type). `.url()` is still called — `.width().height()` only configures the builder.

- [ ] **Step 2: VERIFICATION — typecheck + build marker + SSR OG grep.**
  - Run: `bunx tsc --noEmit` → **Expected: no output (0 errors).**
  - Run: `bun run build` → **Expected line:** `├ ƒ /projects/[slug]` (dynamic by design — the `(main)` layout reads cookies/headers; `generateStaticParams` still prerenders param list but route is `ƒ`).
  - SSR HTML assertion — pick any real slug present in the dataset (list with the GROQ below if unsure):
    ```bash
    # discover a real slug if needed:
    #   curl -s http://localhost:3000/projects | grep -oE '/projects/[a-z0-9-]+' | head
    bun run start &
    sleep 4
    SLUG="<real-slug>"
    curl -s "http://localhost:3000/projects/$SLUG" | grep -o 'rel="canonical"' | head -1
    curl -s "http://localhost:3000/projects/$SLUG" | grep -o 'og:image:width' | head -1
    pkill -f "next-server"; pkill -f "next start"
    ```
    - **Expected:** first curl prints `rel="canonical"`; second prints `og:image:width` (presence confirms a sized OG image meta tag is emitted; the `1200`/`630` values are already guaranteed by the typed code). Matching exact attribute spacing/`content="1200"` is brittle against Next's emitted HTML — grep for presence only.
  - > BROWSER-VERIFY: paste the OG image URL in a browser to confirm Sanity returns a 1200×630 image; check the OG card with the `web-perf` skill or a social-card debugger.

- [ ] **Step 3: COMMIT.**
  - `git add "src/app/(main)/projects/[slug]/page.tsx" && git commit -m "feat(seo): add canonical and sized OG image to project detail metadata"`

---

### Task 6: Mount JSON-LD across routes
**Files:**
- Modify: `src/app/(main)/page.tsx` (mount `JsonLd` with `buildPersonGraph()` — home).
- Modify: `src/app/(main)/about/page.tsx` (mount `JsonLd` with `buildPersonGraph()` — about).
- Modify: `src/app/(main)/projects/page.tsx` (mount `JsonLd` with `buildBreadcrumbList(...)` — projects index).
- Modify: `src/app/(main)/projects/[slug]/page.tsx` (mount `JsonLd` with `buildBreadcrumbList(...)` + `buildCreativeWork(project)` — detail).
**Interfaces:**
- Consumes: `JsonLd` (Task 3 default export); `buildPersonGraph`/`buildBreadcrumbList`/`buildCreativeWork`/`BreadcrumbItem` (Task 2).
- Produces: server-rendered `<script type="application/ld+json">` in each route's HTML. `SITE_URL` (`https://yovizn.com`) is baked into builder output for absolute breadcrumb `item` URLs.

- [ ] **Step 1: Mount Person+WebSite graph on home (`src/app/(main)/page.tsx`).** After Task 4 added the `metadata` export, add the two imports (top of import block) and render `<JsonLd>` as the first child of `<main>`. Add imports:
  ```tsx
  import JsonLd from '@/components/common/json-ld'
  import { buildPersonGraph } from '@/lib/seo/structured-data'
  ```
  Change the `<main>` opening (current returns `<main className="grid grid-cols-4 …"><Header1 />`) to include `JsonLd` first:
  ```tsx
    return (
      <main className="grid grid-cols-4 gap-px lg:grid-cols-6 xl:grid-cols-8">
        <JsonLd data={buildPersonGraph()} />

        <Header1 />
  ```

- [ ] **Step 2: Mount Person+WebSite graph on about (`src/app/(main)/about/page.tsx`).** Add imports:
  ```tsx
  import JsonLd from '@/components/common/json-ld'
  import { buildPersonGraph } from '@/lib/seo/structured-data'
  ```
  Insert `<JsonLd>` as the first child of `<main>` (current `<main style={{ perspective: '1000px', perspectiveOrigin: 'center' }}>`):
  ```tsx
    return (
      <main style={{ perspective: '1000px', perspectiveOrigin: 'center' }}>
        <JsonLd data={buildPersonGraph()} />

        <HeroImage />
  ```

- [ ] **Step 3: Mount BreadcrumbList on projects index (`src/app/(main)/projects/page.tsx`).** Add imports:
  ```tsx
  import JsonLd from '@/components/common/json-ld'
  import { buildBreadcrumbList } from '@/lib/seo/structured-data'
  ```
  Insert `<JsonLd>` as the first child of `<main>` (current `<main className="grid grid-cols-4 …"><Header1 />`):
  ```tsx
    return (
      <main className="grid grid-cols-4 gap-px lg:grid-cols-6 xl:grid-cols-8">
        <JsonLd
          data={buildBreadcrumbList([
            { name: 'Home', url: 'https://yovizn.com/' },
            { name: 'Projects', url: 'https://yovizn.com/projects' },
          ])}
        />

        <Header1 />
  ```
  > NOTE: breadcrumb `item` URLs MUST be absolute (Google requirement). They are hardcoded to the production origin `https://yovizn.com` to match `env.NEXT_PUBLIC_WEBSITE_URL`; do not use relative paths here.

- [ ] **Step 4: Mount BreadcrumbList + CreativeWork on detail (`src/app/(main)/projects/[slug]/page.tsx`).** Add imports (alongside existing imports at top):
  ```tsx
  import JsonLd from '@/components/common/json-ld'
  import { buildBreadcrumbList, buildCreativeWork } from '@/lib/seo/structured-data'
  ```
  In `ProjectsDetailPage` (current return starts `<main className="grid grid-cols-4 gap-px lg:grid-cols-6"><Header1 />`), insert two `<JsonLd>` as the first children. `project` is already narrowed (line 49 `notFound()`):
  ```tsx
    return (
      <main className="grid grid-cols-4 gap-px lg:grid-cols-6">
        <JsonLd
          data={buildBreadcrumbList([
            { name: 'Home', url: 'https://yovizn.com/' },
            { name: 'Projects', url: 'https://yovizn.com/projects' },
            { name: project.title, url: `https://yovizn.com/projects/${slug}` },
          ])}
        />
        <JsonLd data={buildCreativeWork(project)} />

        <Header1 />
  ```

- [ ] **Step 5: VERIFICATION — typecheck + build + SSR JSON-LD grep.**
  - Run: `bunx tsc --noEmit` → **Expected: no output (0 errors).**
  - Run: `bun run build` → **Expected markers unchanged:** `ƒ /`, `ƒ /about`, `ƒ /projects`, `ƒ /projects/[slug]`.
  - SSR HTML assertion:
    ```bash
    bun run start &
    sleep 4
    curl -s http://localhost:3000/         | grep -o 'application/ld+json' | head -1   # home (Person+WebSite)
    curl -s http://localhost:3000/about    | grep -o 'application/ld+json' | head -1   # about (Person+WebSite)
    curl -s http://localhost:3000/projects | grep -o 'application/ld+json' | head -1   # index (BreadcrumbList)
    # detail emits TWO ld+json blocks → expect count 2 (use -o | wc -l; `grep -c` counts LINES, and Next's SSR HTML is compact so both scripts share one line):
    SLUG="<real-slug>"
    curl -s "http://localhost:3000/projects/$SLUG" | grep -o 'application/ld+json' | wc -l
    # confirm the graph + breadcrumb types are present in HTML:
    curl -s http://localhost:3000/ | grep -o '"@graph"' | head -1
    curl -s http://localhost:3000/projects | grep -o 'BreadcrumbList' | head -1
    pkill -f "next-server"; pkill -f "next start"
    ```
    - **Expected:** home/about/projects each print `application/ld+json`; the detail `grep -o ... | wc -l` prints `2`; home prints `"@graph"`; projects prints `BreadcrumbList`.
  - > BROWSER-VERIFY (required for sign-off — only confirmable externally):
    > 1. Rich Results Test — https://search.google.com/test/rich-results — test a deployed (or tunneled) `/projects/<slug>` URL; **expect BreadcrumbList detected as a valid/eligible rich result** (Person/WebSite/CreativeWork are entity-only, no rich result, but must show NO errors).
    > 2. Schema validator — https://validator.schema.org — paste the raw JSON-LD (or URL) for home (`@graph`) and a detail page (BreadcrumbList + CreativeWork); **expect 0 errors, 0 warnings on required props.**

- [ ] **Step 6: COMMIT.**
  - `git add "src/app/(main)/page.tsx" "src/app/(main)/about/page.tsx" "src/app/(main)/projects/page.tsx" "src/app/(main)/projects/[slug]/page.tsx" && git commit -m "feat(seo): mount JSON-LD (Person+WebSite, BreadcrumbList, CreativeWork) across routes"`

---

### Task 7: Final end-to-end verification (no new code)
**Files:** none (verification only).
**Interfaces:** none.

- [ ] **Step 1: Full clean build + typecheck gate.**
  - Run: `bunx tsc --noEmit` → **Expected: no output (0 errors).**
  - Run: `bun run build` → **Expected: build succeeds; route table shows** `ƒ /`, `ƒ /about`, `ƒ /projects`, `ƒ /projects/[slug]` (and pre-existing `○` for `opengraph-image-*`, `sitemap.xml`, `robots.txt`, etc. — untouched).

- [ ] **Step 2: Consolidated SSR assertions against the running prod server.**
  ```bash
  bun run start &
  sleep 4
  echo "--- canonicals (expect rel=\"canonical\" x4) ---"
  for r in "/" "/about" "/projects"; do curl -s "http://localhost:3000$r" | grep -o 'rel="canonical"' | head -1; done
  SLUG="<real-slug>"
  curl -s "http://localhost:3000/projects/$SLUG" | grep -o 'rel="canonical"' | head -1
  echo "--- json-ld present (expect application/ld+json on each) ---"
  for r in "/" "/about" "/projects" "/projects/$SLUG"; do curl -s "http://localhost:3000$r" | grep -o 'application/ld+json' | head -1; done
  echo "--- og image sizing on detail (expect og:image:width present) ---"
  curl -s "http://localhost:3000/projects/$SLUG" | grep -o 'og:image:width' | head -1
  pkill -f "next-server"; pkill -f "next start"
  ```
  - **Expected:** 4× `rel="canonical"`, 4× `application/ld+json`, 1× `og:image:width` (the `1200` value is guaranteed by the typed code; presence-grep avoids brittleness against Next's emitted attribute spacing).

- [ ] **Step 3: External structured-data validation (cannot be done locally — deploy or tunnel first).**
  - > BROWSER-VERIFY: https://search.google.com/test/rich-results on a live `/projects/<slug>` → BreadcrumbList valid + eligible, no errors on Person/WebSite/CreativeWork.
  - > BROWSER-VERIFY: https://validator.schema.org on home `@graph` and a detail page → 0 errors.
  - > BROWSER-VERIFY: CWV via the `web-perf` skill (Chrome DevTools MCP → Lighthouse). JSON-LD/canonical/metadata add NO client JS, so the critical-path JS budget (<=170 KB gz) and LCP <=2.5s / INP <=200ms / CLS <=0.1 must be unchanged vs. the pre-Phase-0 baseline. Confirm no regression.

- [ ] **Step 4: NO COMMIT (verification-only task).** If everything passes, Phase 0 is complete. If any gate fails, return to the owning task — do not patch over a failing gate in this task.

---

### Out of scope (explicitly NOT in Phase 0)
- SearchAction (deprecated Nov 2024), FAQPage, HowTo — do NOT add.
- `sitemap.ts` / `robots.ts` — already exist, untouched.
- File-based `opengraph-image.tsx` routes — already exist, untouched (they own `openGraph.images` for home/about/projects).
- Making `(main)` routes static — they are intentionally `ƒ` because the layout reads cookies/headers.
- llms.txt — irrelevant to Google.
