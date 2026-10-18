# TerraMorph Frontend

React 19 + Vike (SSR/prerender) + Tailwind CSS site for askterramorph.com.

## Development Server

A Vike dev server runs on port 8443.

- URL: http://localhost:8443
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

Routing is file-based via Vike: `pages/` contains `+Page.tsx` files (and `+config.ts`, `+Head.tsx` at the root). Imports use the `@` alias (mapped to `src/` in `tsconfig.json` and `vite.config.ts`), e.g. `@/pages/site/home`.

- `pages/+config.ts` - Vike config: prerender, lang, favicon, async Google Fonts in `headHtmlBegin`
- `pages/+Head.tsx` - Per-route `<title>`, meta description, canonical, Open Graph/Twitter cards, robots noindex (`/dashboard`, 404), and JSON-LD (Organization, WebSite, LocalBusiness, BreadcrumbList)
- `pages/index/+onBeforePrerenderStart.ts` - Lists dynamic prerender URLs (detail pages + hubs). MUST stay scoped to `pages/index/` (NOT the pages root) — a root-level `+onBeforePrerenderStart` is inherited by every page-id, Vike calls it once per page, and then rejects the duplicate URLs
- `pages/*/​+Page.tsx` - One per route (`/`, `/for`, `/evidence`, `/method`, `/knowledge`, `/learning`, `/about`, `/join`, `/contact`, `/dashboard`, plus `@slug` detail/hub routes). Each renders `SitePage` from `src/pages/site/SitePage.tsx`
- `pages/_error/+Page.tsx` - Custom 404 (renders `src/pages/NotFound.tsx`); `+Head.tsx` marks it noindex
- `index.html` - Minimal Vike HTML template only (charset/viewport). Do NOT add SPA entry scripts — Vike owns hydration
- `src/pages/site/Site.tsx` - Marketing site shell: hero hold, section order, footer; renders `src/pages/site/components/*`
- `src/pages/site/SitePage.tsx` - Client-side language toggle wrapper around `Site`
- `src/pages/site/types.ts` - Shared `Lang` type (`'en' | 'ar'`), re-exported by `Site.tsx`
- `src/pages/site/components/` - Site shell internals: `Header` (nav + mobile menu + search trigger), `Hero`, `Audiences` (orbit picker — keep computed SVG coordinates rounded to 2 decimals or SSR/client float ULP differences cause React hydration mismatches), `SectionHead`, `Globe`, `Footer`, `Hub` (per-audience pages)
- `src/pages/site/Intro.tsx` - Introductory splash shown once per browser
- `src/pages/site/home/` - Homepage sections, one file per section (`Head`, `Evidence`, `Knowledge`, `Learning`, `Join`, `Conversation`, `SearchOverlay`) plus `index.tsx` as the barrel that re-exports them
- `src/pages/site/additions/` - Extras, one file per section (`WhatsNew`, `CauseExhibition`, `WhoWeAre`, `PrivilegeToggle`) plus `index.tsx` barrel and `shared.ts` helpers (`img`, `areas`). `WhatsNew`'s four action buttons post real submissions (Suggest/Join/Request a payment link as `CONTRIBUTION`, Reserve a seat as `SEAT_RESERVATION` with an inline email field)
- `src/pages/site/pages/DetailPage.tsx` - Single renderer for all footer detail pages (breadcrumbs + data-driven blocks + related rail)
- `src/pages/dashboard/Workspace.tsx` - The single admin dashboard at `/dashboard` (merged client portal + CMS): an auth gate (`SignInPage`, shown whenever the session probe returns 401 or is still resolving) wrapping the T-Dashboard shell (sidebar nav grouped by WORKSPACE/WEBSITE/MANAGEMENT, topbar, page headings, footer) plus internal pages `OverviewPage`, `ContentPage`, `CollectionPage`, `WorkflowPage`, `MediaPage`, `WebsitePage`, `SubmissionsPage`, `UsersPage`, `ActivityPage`, `SettingsPage`, all wired to `useWorkspace`/`useCollection`/`api` against the live API (no demo/sample data); hosts the search/notifications/create/help modals and the content item editor. Loaded client-only (`ssr: false`) from `pages/dashboard/+Page.tsx`
- `src/pages/dashboard/ContentEditor.tsx` - Content item editor overlay (T-Dashboard styled): localized `{en,ar}` fields, Content/SEO/Publishing tabs, layout preview, create/update/transition/delete via `api`, history
- `src/pages/dashboard/content-model.ts` - Content model for the CMS: the `collections` list (11 collections with their fields) plus `collectionById` and `collectionGroups` helpers
- `src/pages/dashboard/hooks/useWorkspace.ts` - Content workspace data hook: session/auth, content counts, workflow board, submissions, activity, sign-in/out and reload; a 401 from `auth/me` sets `needsAuth` (which renders the auth gate), and there is no demo/sample-data fallback
- `src/pages/dashboard/hooks/useCollection.ts` - Per-collection content list/detail hook (search, status filter, pagination) used by `CollectionPage`/`ContentEditor`
- `src/pages/dashboard/ui.tsx` - Dashboard-local UI primitives styled with the scoped T-Dashboard classes (`Button`, `Input`, `Textarea`, `Select`, `Field`, `Heading`, `Badge`, `Modal` — a `<dialog>`-based modal)
- `src/pages/NotFound.tsx` - Fallback for unknown routes
- `src/components/motion/fx.tsx` - Animation primitives (SplitText, CountUp, Reveal, Magnetic, Contours, Logo, Emblem, Spotlight, GoldLine, Decrypt, useInView)
- `src/components/ui/` - Shared UI primitives (`Badge`, `Breadcrumbs`, `EmptyState`, `SegmentedControl`, `Dialog` with focus trap, `LiveStatus`) plus `index.tsx` barrel; imports via `@/components/ui`
- `src/hooks/useMetrics.ts` - sessionStorage UX KPI counters (`tm.t3t`, `tm.priv.commits`, `tm.priv.undos`, `tm.priv.cancels`)
- `src/lib/api.ts` - Typed API client for the Terramorph backend (auth incl. password change, dashboard summary, assignments + detail, experts, submissions, activity); same-origin in dev via the `/api` proxy; `VITE_API_URL` overrides the base
- `src/lib/routes.ts` - `SectionId` type and section path maps
- `src/content/pages.ts` - Footer detail page content (`PAGES`, `columnMeta`, `pageBySlug`, `pageForPath`, `labelPath`)
- `src/content/hubs.ts` - Audience hub content (`hubs`, `hubBySlug`)
- `src/content/data.ts` - Content: audiences, method, cases, knowledge, footer
- `src/styles/index.css` - Global CSS entrypoint and Tailwind CSS v4 theme (see Styling); imports `src/styles/dashboard.css`
- `src/styles/dashboard.css` - The T-Dashboard stylesheet, scoped under `.tm-workspace` (generated from the prototype and hand-edited), plus WCAG AA contrast overrides
- `scripts/gen-sitemap.mjs` - Generates `public/sitemap.xml` from `pages.ts`/`data.ts` (runs automatically in the `build` script; also `pnpm sitemap`)
- `scripts/gen-og-image.mjs` - Renders `public/og-image.png` (1200×630 social share image) via local Chrome/Edge (`pnpm og-image`); commit the PNG
- `scripts/a11y.mjs` - Headless axe-core accessibility scan (`pnpm a11y`)
- `scripts/console-smoke.mjs` - Headless console-error smoke test against a running preview (`node scripts/console-smoke.mjs [base-url]`)
- `public/` - Static assets copied verbatim: `favicon.svg`, `robots.txt` (disallows `/dashboard`, points at sitemap), `llms.txt`, `sitemap.xml`, `og-image.png`
- `.env.example` - Documents `VITE_API_URL` and `VITE_PROXY_TARGET`
- `.env.production` - Sets `VITE_API_URL=https://api.askterramorph.com` for production builds
- `package.json` - Dependencies and scripts (`dev`, `build` = sitemap + vike build, `preview`, `format`, `a11y`, `sitemap`, `og-image`)
- `vite.config.ts` - Vite configuration: React + Tailwind v4 + Vike plugins, `@` alias, `/api` dev proxy, explicit `build.sourcemap: false`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

Barrels (`home/index.tsx`, `additions/index.tsx`) re-export section components so the shell and `Header`/`Hub` import them from one place. When adding a section, add a file in the relevant `pages/site/*` folder and export it from that folder's `index.tsx`.

## Dependencies

- Runtime: React 19, React DOM 19, Vike, vike-react, lucide-react (dashboard icons only — loaded in the lazy dashboard chunk)
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, `@vitejs/plugin-react`
- Dev tooling: `cross-env` (cross-platform `NODE_ENV` in the `build` script), `puppeteer-core` (a11y, OG image, console smoke — drives local Chrome/Edge; set `CHROME_PATH` if not auto-detected)
- Testing: `scripts/a11y.mjs` (`pnpm a11y`) runs a headless axe-core scan against a running dev server (`A11Y_BASE_URL`, default `http://localhost:8443`). It scans the home page (base, search overlay, WhatsNew drawer), the dashboard `/dashboard` (the signed-out auth gate, and the signed-in live workspace via `POST /api/v1/auth/login` with the seeded admin account), a hub page, and the 404 page with `prefers-reduced-motion: reduce`, and exits non-zero on serious/critical violations. `scripts/console-smoke.mjs` checks `/`, `/evidence`, a detail page, a hub, `/dashboard` and a 404 for console errors against `pnpm preview`
- Linting: no dedicated script; typecheck with `pnpm exec tsc --noEmit`
- Formatting: oxfmt — see the corruption warning under Code quality BEFORE running it

## Routing

File-based via Vike (`pages/` directory). Dynamic routes use `@slug` directories (`pages/evidence/@slug/`, `pages/hub/@slug/`, …) whose concrete URLs are listed in `pages/index/+onBeforePrerenderStart.ts` for prerendering. In-page anchors are plain section links such as `/#evidence`. All public routes are prerendered to static HTML at build time; `/dashboard` is client-rendered (`ssr: false`) and marked `noindex`.

## API access

The backend is a separate service (default `http://localhost:4000`). In development the Vike dev server proxies `/api` to it (`server.proxy` in `vite.config.ts`, target overridable with `VITE_PROXY_TARGET`), so requests are same-origin and the backend's httpOnly session cookie works without CORS. In production the frontend is served from `askterramorph.com` and the API from `api.askterramorph.com` (set via `VITE_API_URL` in `.env.production`), so requests are cross-origin: the backend must allow the frontend origin with credentials and set the session cookie `SameSite=None; Secure`. All endpoints require a session; `src/lib/api.ts` sends `credentials: 'include'`, and `useWorkspace` treats a 401 from `auth/me` as `needsAuth`, which makes `Workspace` render its auth gate (`SignInPage`) instead of the dashboard shell. There is no sample/demo data — the dashboard is empty until you sign in.

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/styles/index.css` imports Tailwind with `@import "tailwindcss";`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/styles/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

Global font wiring belongs in `src/styles/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there. Google Fonts are loaded asynchronously in `pages/+config.ts` (`headHtmlBegin`) — the full family list (including Arabic families) lives there, not in `index.html`.

The `@theme` block defines the color tokens (`navy`, `navy-2`, `navy-3`, `ivory`, `ivory-2`, `line`, `slate`, `gold`, `gold-light`), semantic tokens (`gold-strong` `#76602c`, `warn-strong` `#7a5200`, `risk-strong` `#8f1f1f`, `ok-strong` `#2f6b3a`, `error` `#b42318`), the color-blind-safe data ramp (`data-1`–`data-4`), and fonts (`display` Cormorant Garamond, `sans` Jost, `mono` JetBrains Mono). Use the `-strong` variants for text on `ivory`/`ivory-2` (they meet WCAG AA; the plain variants are decorative or for text on navy). `gold` is the on-light accent, `gold-light` the on-dark one. On navy surfaces use `text-ivory/65` or higher for secondary text (lower opacities fail AA). Numeric cells use `font-mono tabular-nums`.

Keyframes include `grow` (arming/loading fills) and `shrink` (3s privilege undo countdown). Motion primitives are gated by `prefers-reduced-motion` (`reduced()` in `fx.tsx`, plus a CSS media block); keep new transforms/animations behind the same guard.

The dashboard uses a separate stylesheet, `src/styles/dashboard.css` (imported from `index.css`), ported from the standalone T-Dashboard prototype and scoped under `.tm-workspace` so its class names (`.button`, `.panel`, `.eyebrow`, `.orbit`, …) don't leak to the marketing site. Its hand-written tail carries WCAG AA contrast overrides (the prototype's `--muted` and brass small text were darkened), and `.tm-workspace .orbit` cancels the site's global spin animation. Arabic copy in the dashboard uses the "Readex Pro" family.

## Code quality

- Run `pnpm format` (oxfmt). It normalizes to double quotes and drops semicolons, so match that style (e.g. `import x from "y"`).
- **WARNING: oxfmt 0.2.0 corrupts single-line multi-member object type literals** — it strips the `;` separators but keeps members on one line, producing invalid TS that `tsc` catches as `TS1005`. After running `pnpm format`, always run `pnpm exec tsc --noEmit` and fix any TS1005 errors by expanding the affected type literals to multi-line (one member per line, no separators). Prefer writing such types multi-line from the start, or use named `interface`/`type` aliases.
- SSR hydration: components that compute numeric attributes (SVG coordinates, CSS percentages) must round consistently — V8 on Node and the browser can produce floats differing by 1 ULP, which React reports as a hydration mismatch. Round to a fixed precision (e.g. `Math.round(x * 100) / 100`).
- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
- SEO: per-route titles/descriptions live in `pages/+Head.tsx` (`SECTIONS` map plus content-derived fallbacks). Canonical URL, OG image and JSON-LD are also emitted there. When adding a public route, add it to `SECTIONS` and to the sitemap inputs (`src/content/pages.ts` or `src/content/data.ts` audiences) so `scripts/gen-sitemap.mjs` picks it up. Keep `public/og-image.png` in sync if the brand changes (`pnpm og-image`).
