# TerraMorph — Website + Dashboard

## Context
The scaffold is empty (`src/App.tsx` is a blank div; `src/index.css` only imports Tailwind). The user wants a polished, animated marketing site and a dashboard for TerraMorph. It should follow the attached **Brand Manual** and the **Website Blueprint (TM-WEB-01)**, and the animations should be inspired by ReactBits. The FigJam planning board came back truncated, so the two PDFs are the main source.

## Brand system (from the manual and blueprint)
- Colours go in tokens in `src/index.css` under `@theme`:
  - navy `#132B45`, navy-2 `#31455B`
  - gold `#A98A4B`, gold-light `#C4A868` (rules, dividers and foil only, never large fills)
  - ivory `#FBF8F1`, ivory-2 `#F5F0E5`, line `#E0D8C6`
  - status colours: red `#A32D2D`, amber `#B07A22`, green `#4A6B4E`
- Fonts: Cormorant Garamond (display, tracked caps) and Jost 300/400/500 (body, small-caps eyebrows). Both load through a Google Fonts `@import` at the top of `index.css`.
- Voice: plain and specific. Tagline "Leverage For Good". Motif: a column-and-globe emblem plus a lever/fulcrum, drawn as an inline SVG.

## Structure
- Install `react-router` and `motion`. Set up routing in `App.tsx` with `/` (site), `/hub/:audience` and `/dashboard`.
- Files: `src/site/*` sections, `src/dashboard/*`, `src/fx/*` (animation primitives), `src/data.ts` (blueprint copy).

## Website (homepage follows the wireframe order in blueprint §10)
1. Utility bar: EN / العربية toggle (switches `dir="rtl"`), search, Expert network, Contact.
2. Dark navy **audience rail**: For governments, development partners, business, NGOs, consultancies, Careers, Expert network.
3. Six-item nav: Evidence · Method · Knowledge · Learning · About · Join. No mega-menu.
4. **Hero**: one sentence and two buttons ("Start the diagnostic", "See the evidence"). Split-text reveal, plus a lever motif that slowly tilts as you scroll. No carousel.
5. Seven audience cards with a spotlight-hover effect.
6. Proof strip: four count-up numbers, each with a source link.
7. **Interactive G0–G7 method lifecycle**: a horizontal track you can scrub, with a detail panel for each stage.
8. Evidence: three cases and a link to the assignment ledger.
9. Knowledge: the latest four items, each labelled by type (Policy brief · AR, Working paper, Practice note).
10. Two side-by-side doors: Partners and Experts.
11. Segmented newsletter that asks which list to join.
12. Footer as a full site index, including a legal identity block.
- `/hub/governments` uses a single hub template: breadcrumb, H1 naming the audience, three questions, pre-filtered evidence and a procurement-pack download.

## Dashboard (`/dashboard`, an engagement portal)
- Collapsible sidebar.
- KPI tiles and an active-assignments table with filters and status chips.
- G0–G7 stage progress for each engagement.
- Expert-network pipeline, a lead segment chart (built as SVG) and an activity feed.
- Responsive: the sidebar becomes a bottom bar on mobile.

## Animation primitives in `src/fx` (built in-house, not copied)
SplitText, CountUp, SpotlightCard, Magnetic button, ScrollReveal, a gold hairline that draws in, and a faint drifting grid-and-contour background. All of them respect `prefers-reduced-motion`.

## Verification
Check the preview at mobile and desktop widths, the RTL toggle, the routes, and that the method scrubber and dashboard filters work.
