import { PAGES } from "@/content/pages"
import { audiences } from "@/content/data"
import { cmsPaths, fetchPublicSlugs } from "@/content/publicRoutes"

// Static routes (/, /for, /evidence, …) are pre-rendered automatically; this
// hook lists the dynamic ones: static footer pages, audience hubs, and every
// published CMS slug. The CMS list is fetched at build time and falls back to
// the static routes if the API is unreachable.
export default async function onBeforePrerenderStart(): Promise<string[]> {
  const urls = new Set<string>()

  for (const page of PAGES) urls.add(page.path)

  for (const audience of audiences) urls.add(`/hub/${audience.slug}`)

  try {
    const slugs = await fetchPublicSlugs()

    for (const path of cmsPaths(slugs, urls)) urls.add(path)
  } catch (error) {
    console.warn(
      `[prerender] public slugs unavailable, using static routes only: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }

  return [...urls]
}
