import type { Lang } from "@/pages/site/types"
import { type Hub } from "@/content/hubs"

/* Same lazy treatment as pages.ar — the Arabic hub copy (~42 kB) only ships
   once the visitor actually toggles to Arabic. */
let HUBS_AR: Record<string, Hub> | null = null
let pending: Promise<void> | null = null

export function loadHubsAr(): Promise<void> {
  if (HUBS_AR) return Promise.resolve()
  if (pending) return pending
  pending = import("@/content/hubs.ar")
    .then((m) => {
      HUBS_AR = m.HUBS_AR
    })
    .finally(() => {
      pending = null
    })
  return pending
}

/* Swap an English audience hub for its Arabic overlay when one exists. */
export function localizedHub(hub: Hub, lang: Lang): Hub {
  if (lang !== "ar" || !HUBS_AR) return hub
  return HUBS_AR[hub.slug] ?? hub
}
