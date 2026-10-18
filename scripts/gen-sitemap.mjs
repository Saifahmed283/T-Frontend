import { writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { PAGES } from "../src/content/pages.ts"
import { audiences } from "../src/content/data.ts"

/* Generates public/sitemap.xml from the same content data the prerender hook
   uses (pages/+onBeforePrerenderStart.ts), so the sitemap can never drift from
   the routes that actually exist. Runs automatically before `vike build`. */

const ORIGIN = "https://askterramorph.com"
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")

const STATIC_ROUTES = [
  "/",
  "/for",
  "/evidence",
  "/method",
  "/knowledge",
  "/learning",
  "/about",
  "/join",
  "/contact",
]

const urls = [
  ...STATIC_ROUTES,
  ...PAGES.map((p) => p.path),
  ...audiences.map((a) => `/hub/${a.slug}`),
]

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(
    (path) => `  <url><loc>${ORIGIN}${path === "/" ? "/" : path}</loc></url>`,
  ),
  "</urlset>",
  "",
].join("\n")

writeFileSync(resolve(root, "public/sitemap.xml"), xml)
console.log(`sitemap.xml: ${urls.length} urls`)
