import type { Lang } from '@/pages/site/types'

/* Tiny bilingual helper. `t(lang, en, ar)` picks the right string; `pick` does
   the same for objects/lists. Keeps Arabic next to its English source. */
export function t(lang: Lang, en: string, ar: string): string {
  return lang === 'ar' ? ar : en
}

export function pick<T>(lang: Lang, en: T, ar: T): T {
  return lang === 'ar' ? ar : en
}

export const isAr = (lang: Lang) => lang === 'ar'

/* True when a string contains Arabic script — used to switch rendering paths
   (e.g. SplitText must not mask per-word for connected Arabic script). */
export const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s)
