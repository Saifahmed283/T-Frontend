import type { Config } from "vike/types"
import vikeReact from "vike-react/config"

/* The Latin families are self-hosted (see src/styles/fonts.css). The three faces
   used above the fold are preloaded so the hero headline paints in its final
   metrics instead of reflowing (CLS) when a late webfont swaps in. Arabic
   families are still fetched from Google Fonts on demand — see src/lib/fonts.ts.

   `?v=` must match src/styles/fonts.css exactly: a mismatched URL makes the
   browser download the face twice instead of reusing the preload. Bump both
   together when a font binary changes (fonts are not content-hashed). */
const FONT_VERSION = "2"

const PRELOAD_FONTS = [
  `/fonts/cormorant-garamond-latin.woff2?v=${FONT_VERSION}`,
  `/fonts/cormorant-garamond-italic-latin.woff2?v=${FONT_VERSION}`,
  `/fonts/jost-latin.woff2?v=${FONT_VERSION}`,
]

export default {
  extends: [vikeReact],
  prerender: true,
  lang: "en",
  favicon: "/favicon.svg",
  headHtmlBegin: [
    '<meta name="theme-color" content="#132B45" />',
    '<link rel="preconnect" href="https://images.unsplash.com" crossorigin />',
    ...PRELOAD_FONTS.map(
      (href) =>
        `<link rel="preload" as="font" type="font/woff2" crossorigin href="${href}" />`,
    ),
    // Google Tag Manager (GTM)
    '<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-PFCD4L4H"></script>',
    // Google Analytics 4 (gtag.js) — direct Measurement ID
    '<script async src="https://www.googletagmanager.com/gtag/js?id=G-MJ2BKDEXPL"></script>',
    `<script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-MJ2BKDEXPL');
    </script>`,
  ].join("\n"),
} satisfies Config
