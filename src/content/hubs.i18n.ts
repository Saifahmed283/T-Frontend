import type { Lang } from '@/pages/site/types'
import { type Hub } from '@/content/hubs'
import { HUBS_AR } from '@/content/hubs.ar'

/* Swap an English audience hub for its Arabic overlay when one exists. */
export function localizedHub(hub: Hub, lang: Lang): Hub {
  return lang === 'ar' ? (HUBS_AR[hub.slug] ?? hub) : hub
}
