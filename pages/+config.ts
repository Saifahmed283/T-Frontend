import type { Config } from "vike/types"
import vikeReact from "vike-react/config"

const FONTS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&family=JetBrains+Mono:wght@400;500;600&family=Noto+Naskh+Arabic:wght@400;500&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Cairo:wght@400;500;600&family=Readex+Pro:wght@400;500;600&display=swap"

export default {
  extends: [vikeReact],
  prerender: true,
  lang: "en",
  favicon: "/favicon.svg",
  headHtmlBegin: [
    '<meta name="theme-color" content="#132B45" />',
    '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    `<link rel="preload" as="style" href="${FONTS}" onload="this.onload=null;this.rel='stylesheet'" />`,
    `<noscript><link rel="stylesheet" href="${FONTS}" /></noscript>`,
  ].join("\n"),
} satisfies Config
