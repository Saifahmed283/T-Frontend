import type { Config } from "vike/types"
import vikeReact from "vike-react/config"

/* The Latin families are self-hosted (see src/styles/fonts.css). The three faces
   used above the fold are preloaded so the hero headline paints in its final
   metrics instead of reflowing (CLS) when a late webfont swaps in. Arabic
   families are still fetched from Google Fonts on demand — see src/lib/fonts.ts. */
const PRELOAD_FONTS = [
  "/fonts/cormorant-garamond-latin.woff2",
  "/fonts/cormorant-garamond-italic-latin.woff2",
  "/fonts/jost-latin.woff2",
]

export default {
  extends: [vikeReact],
  prerender: true,
  lang: "en",
  favicon: "/favicon.svg",
  headHtmlBegin: [
    '<meta name="theme-color" content="#132B45" />',
    ...PRELOAD_FONTS.map(
      (href) =>
        `<link rel="preload" as="font" type="font/woff2" crossorigin href="${href}" />`,
    ),
  ].join("\n"),
} satisfies Config
