# TerraMorph Frontend

React + Vite + Tailwind CSS single-page app.

## Development Server

A Vite development server runs on port 8443.

- URL: http://localhost:8443
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

Source lives under `src/`, organised feature-first. Imports use the `@` alias (mapped to `src/` in `tsconfig.json` and `vite.config.ts`), e.g. `@/pages/site/home`.

- `src/main.tsx` - React entrypoint; imports `src/styles/index.css` and mounts `src/app/App.tsx` into the `#root` element
- `src/app/App.tsx` - App shell and history-based router (`/`, `/hub/<slug>`, `/dashboard`, else 404); uses the `useRoute` hook
- `src/pages/site/Site.tsx` - Marketing site shell: hero hold, section order, footer; renders `src/pages/site/components/*`
- `src/pages/site/types.ts` - Shared `Lang` type (`'en' | 'ar'`), re-exported by `Site.tsx`
- `src/pages/site/components/` - Site shell internals: `Header` (nav + mobile menu + search trigger), `Hero`, `Audiences` (orbit picker), `SectionHead`, `Globe`, `Footer`, `Hub` (per-audience pages)
- `src/pages/site/Intro.tsx` - Introductory splash shown once per browser
- `src/pages/site/home/` - Homepage sections, one file per section (`Head`, `Evidence`, `Knowledge`, `Learning`, `Join`, `Conversation`, `SearchOverlay`) plus `index.tsx` as the barrel that re-exports them
- `src/pages/site/additions/` - Extras, one file per section (`HelloIntake`, `WhatsNew`, `CauseExhibition`, `WhoWeAre`, `JoinBoard`, `ContactCard`, `LearningStrip`) plus `index.tsx` barrel and `shared.ts` helpers (`img`, `areas`)
- `src/pages/dashboard/Dashboard.tsx` - Client portal prototype
- `src/pages/NotFound.tsx` - Fallback for unknown routes
- `src/components/motion/fx.tsx` - Animation primitives (SplitText, CountUp, Reveal, Magnetic, Contours, Logo, Emblem, Spotlight, GoldLine, Decrypt, useInView)
- `src/hooks/` - `useRoute` (history-based routing) and `useHead` (per-route title/meta)
- `src/content/data.ts` - Content: audiences, method, cases, knowledge, footer
- `src/styles/index.css` - Global CSS entrypoint and Tailwind CSS v4 theme
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with the React and Tailwind CSS v4 plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

Barrels (`home/index.tsx`, `additions/index.tsx`) re-export section components so the shell and `Header`/`Hub` import them from one place. When adding a section, add a file in the relevant `pages/site/*` folder and export it from that folder's `index.tsx`.

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Routing

Routes use `window.history` (`/hub/governments`, `/dashboard`, `/`) — no hash routing. In-page anchors are plain section links such as `/#evidence`.

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/styles/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/styles/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/styles/index.css`, so global font wiring belongs in `src/styles/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.