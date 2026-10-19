import type { Lang } from "@/pages/site/types"
import { type ColumnKey, type PageDef } from "@/content/pages"

/* The Arabic page overlay is ~115 kB of copy. The site is prerendered in
   English and Arabic is a client-only toggle, so bundling it into every page
   paid that weight on first load for most visitors. It now lives in its own
   chunk, fetched on first interest (toggle click, or prefetch on hover/focus of
   the AR button) and cached for the rest of the session. */
type PageAr = Omit<PageDef, "slug" | "path" | "column">

let PAGES_AR: Record<string, PageAr> | null = null
let pending: Promise<void> | null = null

export function hasPagesAr(): boolean {
  return PAGES_AR !== null
}

export function loadPagesAr(): Promise<void> {
  if (PAGES_AR) return Promise.resolve()
  if (pending) return pending
  pending = import("@/content/pages.ar")
    .then((m) => {
      PAGES_AR = m.PAGES_AR
    })
    .finally(() => {
      pending = null
    })
  return pending
}

/* Swap an English PageDef for its Arabic overlay when one exists. The overlay
   carries only translatable fields; slug/path/column stay from the English def.
   Before the chunk arrives this returns the English def, which is why the
   toggle awaits loadPagesAr() before flipping lang. */
export function localizedPage(page: PageDef, lang: Lang): PageDef {
  if (lang !== "ar" || !PAGES_AR) return page
  const ar = PAGES_AR[page.slug]
  return ar ? { ...page, ...ar } : page
}

export const columnLabelAr: Record<ColumnKey, string> = {
  Evidence: "الأدلة",
  Method: "المنهج",
  Knowledge: "المعرفة",
  Learning: "التعلّم",
  About: "من نحن",
  Join: "انضم",
}

export const columnMetaAr: Record<ColumnKey, string> = {
  Evidence: "أدلة مؤرخة وممسماة يستطيع قارئ المشتريات التحقق منها.",
  Method: "كيف يُبنى العمل ويُسعّر ويُنقل.",
  Knowledge: "إصدارات وموجزات ومنتجات بيانات وبودكاست.",
  Learning: "برامج وشهادات وترخيص للأكاديميات.",
  About: "الأشخاص والفلسفة وملف الامتثال.",
  Join: "وظائف وتسجيل الخبراء وفرص مفتوحة.",
}
