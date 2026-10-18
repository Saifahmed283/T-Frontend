/* Arabic families load only when needed. The Latin families are self-hosted (see
   src/styles/fonts.css); rendering any Arabic glyph in English mode (the old
   language toggle showed "عربي") forced Google Fonts to download ~118 KB of
   Arabic families on every page, so Arabic is fetched on demand when the reader
   switches to Arabic (or opens the dashboard). */
export const ARABIC_FONTS =
  "https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Cairo:wght@400;500;600&family=Readex+Pro:wght@400;500;600&display=swap"

function preconnect(href: string) {
  if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) return
  const link = document.createElement("link")
  link.rel = "preconnect"
  link.href = href
  link.crossOrigin = ""
  document.head.appendChild(link)
}

export function ensureArabicFonts() {
  if (typeof document === "undefined") return
  if (document.getElementById("tm-arabic-fonts")) return
  preconnect("https://fonts.googleapis.com")
  preconnect("https://fonts.gstatic.com")
  const link = document.createElement("link")
  link.id = "tm-arabic-fonts"
  link.rel = "stylesheet"
  link.href = ARABIC_FONTS
  document.head.appendChild(link)
}
