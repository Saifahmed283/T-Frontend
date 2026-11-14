/*
 * CMS route helpers, shared by the prerender hook
 * (pages/index/+onBeforePrerenderStart.ts) and scripts/gen-sitemap.mjs.
 *
 * The public API is the source of truth for which CMS slugs exist. Both callers
 * stay usable offline: if the fetch fails they fall back to the static route
 * list, exactly as the prerendered sections fall back to static copy.
 *
 * This module is imported by a plain `node` script, so it must stay free of
 * aliases, React and other browser-only imports.
 */

export type PublicSlugMap = Record<string, string[]>

/* Which section route serves each CMS collection. Multiple collections may
   share a section (e.g. `/evidence` serves both assignments and cases). */
export const CMS_ROUTE_BASE: Record<string, string> = {
  cases: "/evidence",

  publications: "/knowledge",

  instruments: "/method",

  courses: "/learning",

  experts: "/join",

  vacancies: "/join",

  partners: "/about",

  initiatives: "/about",

  audiences: "/hub",
}

/* Human section titles, mirrored from `pages/+Head.tsx` so detail pages can
   build a breadcrumb without importing React. */
export const SECTION_TITLES: Record<string, string> = {
  "/evidence": "Evidence",

  "/knowledge": "Knowledge",

  "/method": "Method",

  "/learning": "Learning",

  "/join": "Join",

  "/about": "About",

  "/hub": "Who we serve",
}

export function collectionsForSection(section: string): string[] {
  return Object.entries(CMS_ROUTE_BASE)
    .filter(([, base]) => base === section)
    .map(([collection]) => collection)
}

/* Metadata returned by the public content detail endpoint, normalised so the
   prerender hook, the sitemap script and `+Head.tsx` can all consume it. */
export type DetailMeta = {
  title: string

  description?: string

  section: string

  sectionPath: string

  path: string
}

export async function fetchDetailMeta(
  section: string,

  slug: string,

  base: string = publicApiBase(),

  timeoutMs = 4000,
): Promise<DetailMeta | null> {
  for (const collection of collectionsForSection(section)) {
    try {
      const response = await fetch(
        `${base}/api/v1/public/content/${collection}/${encodeURIComponent(
          slug.trim(),
        )}`,
        {
          headers: { accept: "application/json" },

          signal: AbortSignal.timeout(timeoutMs),
        },
      )

      if (!response.ok) continue

      const item = (await response.json()) as {
        title?: string

        description?: string

        seo?: {
          title?: string

          description?: string
        } | null

        data?: Record<string, unknown>
      }

      const seo = item.seo ?? {}

      return {
        title: seo.title ?? item.title ?? slug,

        description:
          seo.description ?? item.description ?? localizedMeta(item.data),

        section,

        sectionPath: section,

        path: `${section}/${encodeURIComponent(slug.trim())}`,
      }
    } catch {
      // Try the next collection sharing this section; a 404 in one collection
      // is not fatal when another collection may own the slug.
      continue
    }
  }

  return null
}

function localizedMeta(data: Record<string, unknown> | undefined): string {
  if (!data || typeof data !== "object") return ""

  const description =
    data.description ??
    data.descriptionEn ??
    data.descriptionAr ??
    data.meta ??
    data.short ??
    data.standfirst

  return typeof description === "string" && description.trim()
    ? description
    : ""
}

/* Turn the slug map into de-duplicated route paths. `existing` seeds the set so
   a static route and a CMS route never produce the same prerender URL twice. */
export function cmsPaths(
  slugs: PublicSlugMap,
  existing: Iterable<string> = [],
): string[] {
  const seen = new Set(existing)

  const paths: string[] = []

  for (const [collection, list] of Object.entries(slugs)) {
    const base = CMS_ROUTE_BASE[collection]

    if (!base || !Array.isArray(list)) continue

    for (const slug of list) {
      if (typeof slug !== "string" || !slug.trim()) continue

      const path = `${base}/${encodeURIComponent(slug.trim())}`

      if (seen.has(path)) continue

      seen.add(path)

      paths.push(path)
    }
  }

  return paths
}

/* Where to read public slugs from at build time. In production the API is a
   separate origin; in development it is the local backend. VITE_API_URL or
   PUBLIC_API_URL can override either. */
export function publicApiBase(): string {
  /* In the browser `process.env` is not defined; Vite bakes `import.meta.env`
     instead. In dev the Vike dev server proxies `/api` to the backend, so
     same-origin "" keeps the httpOnly session cookie working without CORS. */
  const isBrowser =
    typeof process === "undefined" || typeof process.env === "undefined"

  if (isBrowser) {
    /* Vite/Vike bake `import.meta.env.VITE_API_URL` at build time. In dev it
       is unset, so fall back to same-origin "" which the Vike dev server
       proxies to the backend (keeping the httpOnly session cookie working
       without CORS). */
    const url =
      import.meta.env.VITE_API_URL ?? import.meta.env.VITE_PROXY_TARGET

    if (url) return url.replace(/\/+$/, "")

    return ""
  }

  const explicit =
    process.env.PUBLIC_API_URL ??
    process.env.VITE_API_URL ??
    process.env.VITE_PROXY_TARGET

  if (explicit) return explicit.replace(/\/+$/, "")

  return process.env.NODE_ENV === "production"
    ? "https://api.askterramorph.com"
    : "http://localhost:4000"
}

export async function fetchPublicSlugs(
  base: string = publicApiBase(),
  timeoutMs = 4000,
): Promise<PublicSlugMap> {
  const response = await fetch(`${base}/api/v1/public/slugs`, {
    headers: { accept: "application/json" },

    signal: AbortSignal.timeout(timeoutMs),
  })

  if (!response.ok) {
    throw new Error(`public slugs: HTTP ${response.status}`)
  }

  const body = (await response.json()) as { collections?: PublicSlugMap }

  return body.collections ?? {}
}
