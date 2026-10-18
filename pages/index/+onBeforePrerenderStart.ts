import { PAGES } from "@/content/pages"
import { audiences } from "@/content/data"

// Static routes (/, /for, /evidence, …) are pre-rendered automatically; this
// hook only lists the dynamic ones (CMS pages and audience hubs).
export default function onBeforePrerenderStart(): string[] {
  const urls: string[] = []
  for (const page of PAGES) urls.push(page.path)
  for (const audience of audiences) urls.push(`/hub/${audience.slug}`)
  return urls
}
