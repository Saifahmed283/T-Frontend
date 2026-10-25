import { writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { PAGES } from "../src/content/pages.ts"
import { audiences } from "../src/content/data.ts"
import { cmsPaths, fetchPublicSlugs } from "../src/content/publicRoutes.ts"

/* Generates public/sitemap.xml from the same content data the prerender hook
   uses (pages/+index/+onBeforePrerenderStart.ts), so the sitemap can never drift
   from the routes that actually exist. Published CMS slugs are fetched from the
   public API and merged in; if the API is unreachable the static routes remain.
   Runs automatically before `vike build`. */

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

const urls = new Set([
  ...STATIC_ROUTES,
  ...PAGES.map((p) => p.path),
  ...audiences.map((a) => `/hub/${a.slug}`),
])

// The sitemap describes the deployed site, so default to the production API
// even though this runs before `cross-env NODE_ENV=production vike build`.
process.env.NODE_ENV ??= "production"

try {
  const slugs = await fetchPublicSlugs()
  for (const path of cmsPaths(slugs, urls)) urls.add(path)
} catch (error) {
  console.warn(
    `sitemap: public slugs unavailable, using static routes only: ${
      error instanceof Error ? error.message : String(error)
    }`,
  )
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...[...urls].map(
    (path) => `  <url><loc>${ORIGIN}${path === "/" ? "/" : path}</loc></url>`,
  ),
  "</urlset>",
  "",
].join("\n")

writeFileSync(resolve(root, "public/sitemap.xml"), xml)
console.log(`sitemap.xml: ${urls.size} urls`)
