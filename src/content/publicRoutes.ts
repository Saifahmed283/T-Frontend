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

/* Which section route serves each CMS collection. */
export const CMS_ROUTE_BASE: Record<string, string> = {
  assignments: "/evidence",

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
