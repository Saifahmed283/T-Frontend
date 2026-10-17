# TerraMorph Frontend

React + Vite + Tailwind CSS single-page app.

## Development Server

A Vite development server runs on port 8443.

- URL: http://localhost:8443
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

Source lives under `src/`, organised feature-first. Imports use the `@` alias (mapped to `src/` in `tsconfig.json` and `vite.config.ts`), e.g. `@/pages/site/home`.

- `src/main.tsx` - React entrypoint; imports `src/styles/index.css` and mounts `src/app/App.tsx` into the `#root` element; in dev it also loads the `@axe-core/react` accessibility scan
- `src/app/App.tsx` - App shell and history-based router (`/`, `/hub/<slug>`, `/dashboard`, else 404); uses the `useRoute` hook
- `src/pages/site/Site.tsx` - Marketing site shell: hero hold, section order, footer; renders `src/pages/site/components/*`
- `src/pages/site/types.ts` - Shared `Lang` type (`'en' | 'ar'`), re-exported by `Site.tsx`
- `src/pages/site/components/` - Site shell internals: `Header` (nav + mobile menu + search trigger), `Hero`, `Audiences` (orbit picker), `SectionHead`, `Globe`, `Footer`, `Hub` (per-audience pages)
- `src/pages/site/Intro.tsx` - Introductory splash shown once per browser
- `src/pages/site/home/` - Homepage sections, one file per section (`Head`, `Evidence`, `Knowledge`, `Learning`, `Join`, `Conversation`, `SearchOverlay`) plus `index.tsx` as the barrel that re-exports them
- `src/pages/site/additions/` - Extras, one file per section (`WhatsNew`, `CauseExhibition`, `WhoWeAre`, `PrivilegeToggle`) plus `index.tsx` barrel and `shared.ts` helpers (`img`, `areas`). `WhatsNew`'s four action buttons post real submissions (Suggest/Join/Request a payment link as `CONTRIBUTION`, Reserve a seat as `SEAT_RESERVATION` with an inline email field)
- `src/pages/dashboard/Workspace.tsx` - The single admin dashboard at `/dashboard` (merged client portal + CMS): the T-Dashboard shell (sidebar nav grouped by WORKSPACE/WEBSITE/MANAGEMENT, topbar, page headings, footer) plus internal pages `OverviewPage`, `ContentPage`, `CollectionPage`, `WorkflowPage`, `MediaPage`, `WebsitePage`, `SubmissionsPage`, `UsersPage`, `ActivityPage`, `SettingsPage`, all wired to `useWorkspace`/`useCollection`/`api` with a demo fallback; hosts the sign-in/search/notifications/create/help modals and the content item editor
- `src/pages/dashboard/ContentEditor.tsx` - Content item editor overlay (T-Dashboard styled): localized `{en,ar}` fields, Content/SEO/Publishing tabs, layout preview, create/update/transition/delete via `api`, history; read-only in demo mode
- `src/pages/dashboard/content-model.ts` - Content model for the CMS: the `collections` list (11 collections with their fields) plus `collectionById` and `collectionGroups` helpers
- `src/pages/dashboard/hooks/useWorkspace.ts` - Content workspace data hook: session/auth, content counts, workflow board, assignments, submissions, activity, sign-in/out and reload, with demo fallback
- `src/pages/dashboard/hooks/useCollection.ts` - Per-collection content list/detail hook (search, status filter, pagination) used by `CollectionPage`/`ContentEditor`
- `src/pages/dashboard/data/demo.ts` - Bundled sample data for the dashboard (`makeDemoItems`, `demoContentCounts`, `demoPipeline`, `demoActivity`)
- `src/pages/dashboard/ui.tsx` - Dashboard-local UI primitives styled with the scoped T-Dashboard classes (`Button`, `Input`, `Textarea`, `Select`, `Field`, `Heading`, `Badge`, `Modal` — a `<dialog>`-based modal)
- `src/pages/NotFound.tsx` - Fallback for unknown routes
- `src/components/motion/fx.tsx` - Animation primitives (SplitText, CountUp, Reveal, Magnetic, Contours, Logo, Emblem, Spotlight, GoldLine, Decrypt, useInView)
- `src/components/ui/` - Shared UI primitives (`Badge`, `EmptyState`, `SegmentedControl`, `Dialog` with focus trap, `LiveStatus`) plus `index.tsx` barrel; imports via `@/components/ui`
- `src/hooks/` - `useRoute` (history-based routing), `useHead` (per-route title/meta), and `useMetrics` (sessionStorage UX KPI counters: `tm.t3t`, `tm.priv.commits`, `tm.priv.undos`, `tm.priv.cancels`)
- `src/lib/api.ts` - Typed API client for the Terramorph backend (auth incl. password change, dashboard summary, assignments + detail, experts, submissions, activity); same-origin in dev via the `/api` proxy; `VITE_API_URL` overrides the base
- `src/content/data.ts` - Content: audiences, method, cases, knowledge, footer
- `src/styles/index.css` - Global CSS entrypoint and Tailwind CSS v4 theme (see Styling); imports `src/styles/dashboard.css`
- `src/styles/dashboard.css` - The T-Dashboard stylesheet, scoped under `.tm-workspace` (generated from the prototype and hand-edited), plus WCAG AA contrast overrides
- `.env.example` - Documents `VITE_API_URL` and `VITE_PROXY_TARGET`
- `.env.production` - Sets `VITE_API_URL=https://api.askterramorph.com` for production builds
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with the React and Tailwind CSS v4 plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

Barrels (`home/index.tsx`, `additions/index.tsx`) re-export section components so the shell and `Header`/`Hub` import them from one place. When adding a section, add a file in the relevant `pages/site/*` folder and export it from that folder's `index.tsx`.

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Dev tooling: `@axe-core/react` (accessibility scan, loaded only when `import.meta.env.DEV`) and `cross-env` (cross-platform `NODE_ENV` in the `build` script)
- Testing: `scripts/a11y.mjs` (`pnpm a11y`) runs a headless axe-core scan (`puppeteer-core` drives the local Chrome/Edge — set `CHROME_PATH` if not auto-detected) against a running dev server (`A11Y_BASE_URL`, default `http://localhost:8443`). It scans the home page (base, search overlay, WhatsNew drawer), the dashboard `/dashboard` (demo and live states), a hub page, and the 404 page with `prefers-reduced-motion: reduce`, and exits non-zero on serious/critical violations
- Linting: no dedicated script; typecheck with `pnpm exec tsc --noEmit`
- Formatting: oxfmt

## Routing

Routes use `window.history` (`/hub/governments`, `/dashboard`, `/`) — no hash routing. In-page anchors are plain section links such as `/#evidence`.

## API access

The backend is a separate service (default `http://localhost:4000`). In development the Vite dev server proxies `/api` to it (`server.proxy` in `vite.config.ts`, target overridable with `VITE_PROXY_TARGET`), so requests are same-origin and the backend's httpOnly session cookie works without CORS. In production the frontend is served from `askterramorph.com` and the API from `api.askterramorph.com` (set via `VITE_API_URL` in `.env.production`), so requests are cross-origin: the backend must allow the frontend origin with credentials and set the session cookie `SameSite=None; Secure`. All endpoints require a session; `src/lib/api.ts` sends `credentials: 'include'`, and `useWorkspace` treats a 401 as `needsAuth` and falls back to the bundled sample data so the dashboard always renders.

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/styles/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/styles/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/styles/index.css`, so global font wiring belongs in `src/styles/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

The `@theme` block defines the color tokens (`navy`, `navy-2`, `navy-3`, `ivory`, `ivory-2`, `line`, `slate`, `gold`, `gold-light`), semantic tokens (`gold-strong` `#76602c`, `warn-strong` `#7a5200`, `risk-strong` `#8f1f1f`, `ok-strong` `#2f6b3a`, `error` `#b42318`), the color-blind-safe data ramp (`data-1`–`data-4`), and fonts (`display` Cormorant Garamond, `sans` Jost, `mono` JetBrains Mono). Use the `-strong` variants for text on `ivory`/`ivory-2` (they meet WCAG AA; the plain variants are decorative or for text on navy). `gold` is the on-light accent, `gold-light` the on-dark one. On navy surfaces use `text-ivory/65` or higher for secondary text (lower opacities fail AA). Numeric cells use `font-mono tabular-nums`.

Keyframes include `grow` (arming/loading fills) and `shrink` (3s privilege undo countdown). Motion primitives are gated by `prefers-reduced-motion` (`reduced()` in `fx.tsx`, plus a CSS media block); keep new transforms/animations behind the same guard.

The dashboard uses a separate stylesheet, `src/styles/dashboard.css` (imported from `index.css`), ported from the standalone T-Dashboard prototype and scoped under `.tm-workspace` so its class names (`.button`, `.panel`, `.eyebrow`, `.orbit`, …) don't leak into the marketing site. Its hand-written tail carries WCAG AA contrast overrides (the prototype's `--muted` and brass small text were darkened), and `.tm-workspace .orbit` cancels the site's global spin animation. Arabic copy in the dashboard uses the "Readex Pro" family (added to the Google Fonts links in `index.html`).

## Code quality

- Run `pnpm format` (oxfmt). It normalizes to double quotes and drops semicolons, so match that style (e.g. `import x from "y"`).
- oxfmt 0.2.0 corrupts **single-line multi-member object type literals**: it strips the `;` separators but keeps members on one line, producing invalid TS. Write such types multi-line (one member per line, no separators) or use named `interface`/`type` aliases.
- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.