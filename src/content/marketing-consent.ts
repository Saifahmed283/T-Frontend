/**
 * Marketing Consent types and content.
 *
 * Tokens are generated and verified only on the backend (HMAC-SHA256); the
 * browser never holds the signing secret or derives an unsubscribe token.
 */
export type MarketingList = "newsletter" | "events" | "insights" | "careers"

export const MARKETING_LISTS: {
  value: MarketingList
  label: string
  labelAr: string
  description: string
  descriptionAr: string
}[] = [
  {
    value: "newsletter",
    label: "Monthly newsletter",
    labelAr: "النشرة الشهرية",
    description:
      "Our monthly note: what we published, what we learned, and one thing we got wrong.",
    descriptionAr:
      "ملاحظتنا الشهرية: ما نشرناه، وما تعلّمناه، وخطأ واحد ارتكبناه.",
  },
  {
    value: "events",
    label: "Event invitations",
    labelAr: "دعوات الفعاليات",
    description: "Invitations to webinars, workshops, and public events.",
    descriptionAr: "دعوات إلى ندوات عبر الإنترنت وورش عمل وفعاليات عامة.",
  },
  {
    value: "insights",
    label: "Insights & publications",
    labelAr: "الرؤى والمنشورات",
    description:
      "New policy briefs, practice notes, data products, and podcast episodes.",
    descriptionAr:
      "موجزات سياسات جديدة وملاحظات ممارسة ومنتجات بيانات وحلقات بودكاست.",
  },
  {
    value: "careers",
    label: "Careers & opportunities",
    labelAr: "الوظائف والفرص",
    description:
      "Open roles, expert network registration, and internship announcements.",
    descriptionAr:
      "الوظائف المتاحة والتسجيل في شبكة الخبراء وإعلانات التدريب.",
  },
]

export interface MarketingConsent {
  email: string
  lists: MarketingList[]
  consentedAt: string
  source: string
  ipAddress?: string
  userAgent?: string
}

export interface UnsubscribeRequest {
  email: string
  token: string
  lists?: MarketingList[]
}
