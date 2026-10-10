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
- `src/pages/site/additions/` - Extras, one file per section (`HelloIntake`, `WhatsNew`, `CauseExhibition`, `WhoWeAre`, `JoinBoard`, `ContactCard`, `LearningStrip`, `PrivilegeToggle`) plus `index.tsx` barrel and `shared.ts` helpers (`img`, `areas`)
- `src/pages/dashboard/Dashboard.tsx` - Client portal prototype ("Command Deck"): tenant scope switcher, KPI cards with delta chips and skeleton loading, portfolio pulse (status + G0–G7 stage distribution), assignment ledger, activity rail; loads live data via `useDashboard` and falls back to bundled sample data
- `src/pages/NotFound.tsx` - Fallback for unknown routes
- `src/components/motion/fx.tsx` - Animation primitives (SplitText, CountUp, Reveal, Magnetic, Contours, Logo, Emblem, Spotlight, GoldLine, Decrypt, useInView)
- `src/components/ui/` - Shared UI primitives (`Badge`, `EmptyState`, `SegmentedControl`, `Dialog` with focus trap, `LiveStatus`) plus `index.tsx` barrel; imports via `@/components/ui`
- `src/hooks/` - `useRoute` (history-based routing), `useHead` (per-route title/meta), `useDashboard` (portal data plus `demo`/`live` source and sign-in helpers), and `useMetrics` (sessionStorage UX KPI counters: `tm.t3t`, `tm.priv.commits`, `tm.priv.undos`, `tm.priv.cancels`)
- `src/lib/api.ts` - Typed API client for the Terramorph backend (auth, dashboard summary, assignments, activity); same-origin in dev via the `/api` proxy; `VITE_API_URL` overrides the base
- `src/content/data.ts` - Content: audiences, method, cases, knowledge, footer
- `src/styles/index.css` - Global CSS entrypoint and Tailwind CSS v4 theme (see Styling)
- `.env.example` - Documents `VITE_API_URL` and `VITE_PROXY_TARGET`
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
- Formatting: oxfmt

## Routing

Routes use `window.history` (`/hub/governments`, `/dashboard`, `/`) — no hash routing. In-page anchors are plain section links such as `/#evidence`.

## API access

The backend is a separate service (default `http://localhost:4000`). In development the Vite dev server proxies `/api` to it (`server.proxy` in `vite.config.ts`, target overridable with `VITE_PROXY_TARGET`), so requests are same-origin and the backend's httpOnly session cookie works without CORS. For deployments, set `VITE_API_URL` to the API origin. All endpoints require a session; `src/lib/api.ts` sends `credentials: 'include'`, and `useDashboard` treats a 401 as `needsAuth` and falls back to the bundled sample data so the dashboard always renders.

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/styles/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/styles/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/styles/index.css`, so global font wiring belongs in `src/styles/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

The `@theme` block defines the color tokens (`navy`, `navy-2`, `navy-3`, `ivory`, `ivory-2`, `line`, `slate`, `gold`, `gold-light`), semantic tokens (`gold-strong` `#8a6d33`, `warn-strong` `#9a6700`, `risk-strong` `#8f1f1f`, `ok-strong` `#2f6b3a`, `error` `#b42318`), the color-blind-safe data ramp (`data-1`–`data-4`), and fonts (`display` Cormorant Garamond, `sans` Jost, `mono` JetBrains Mono). Use the `-strong` variants for text on `ivory` (they meet WCAG AA; the plain variants are decorative/on-navy only). Numeric cells use `font-mono tabular-nums`.

Keyframes include `grow` (arming/loading fills) and `shrink` (3s privilege undo countdown). Motion primitives are gated by `prefers-reduced-motion` (`reduced()` in `fx.tsx`, plus a CSS media block); keep new transforms/animations behind the same guard.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.