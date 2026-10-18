import type { Lang } from "@/pages/site/types"
import { type ColumnKey, type PageDef } from "@/content/pages"
import { PAGES_AR } from "@/content/pages.ar"

/* Swap an English PageDef for its Arabic overlay when one exists. The overlay
   carries only translatable fields; slug/path/column stay from the English def. */
export function localizedPage(page: PageDef, lang: Lang): PageDef {
  if (lang !== "ar") return page
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
