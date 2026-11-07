import { useState } from "react";
import { Shield, FileText, Cookie, Gavel, ChevronRight, ExternalLink } from "lucide-react";
import SitePage, { useLang } from "@/pages/site/SitePage";
import { Heading, Card, Button, Badge, GoldLine, Prose } from "@/components/ui";
import type { Lang } from "@/pages/site/types";

const legalPages = [
  {
    slug: "privacy-policy",
    icon: Shield,
    title: { en: "Privacy Policy", ar: "سياسة الخصوصية" },
    description: {
      en: "How we collect, use, and protect your personal data under Egypt PDPL and international standards.",
      ar: "كيف نجمع ونستخدم ونحمي بياناتك الشخصية بموجب قانون حماية البيانات الشخصية المصري والمعايير الدولية.",
    },
    lastUpdated: "2026-11-07",
  },
  {
    slug: "terms-of-service",
    icon: FileText,
    title: { en: "Terms of Service", ar: "شروط الخدمة" },
    description: {
      en: "Terms governing use of our website, client portal, and advisory services.",
      ar: "الشروط المنظمة لاستخدام موقعنا، بوابة العملاء، والخدمات الاستشارية.",
    },
    lastUpdated: "2026-11-07",
  },
  {
    slug: "cookie-policy",
    icon: Cookie,
    title: { en: "Cookie Policy", ar: "سياسة ملفات تعريف الارتباط" },
    description: {
      en: "How we use cookies and similar technologies, and how to manage your preferences.",
      ar: "كيف نستخدم ملفات تعريف الارتباط والتقنيات المماثلة، وكيف تدير تفضيلاتك.",
    },
    lastUpdated: "2026-11-07",
  },
  {
    slug: "dmca-policy",
    icon: Gavel,
    title: { en: "DMCA Policy", ar: "سياسة DMCA" },
    description: {
      en: "How to submit a copyright takedown notice to TerraMorph Advisory LLC.",
      ar: "كيفية تقديم إشعار إزالة dovuto إلى انتهاك حقوق النشر إلى شركة تيرامورف للاستشارات.",
    },
    lastUpdated: "2026-11-07",
  },
];

export default function LegalIndexPage() {
  const { lang } = useLang();
  const ar = lang === "ar";

  const [openSubProcessors, setOpenSubProcessors] = useState(false);
  const [openDataRequest, setOpenDataRequest] = useState(false);

  return (
    <SitePage lang={lang}>
      <div className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20">
        {/* Hero */}
        <header className="mb-12 sm:mb-20 text-center sm:text-left">
          <div className="flex items-center justify-between sm:justify-start gap-3 mb-6">
            <Badge tone="gold" className="text-xs font-medium">
              {ar ? "الامتثال القانوني" : "Legal & Compliance"}
            </Badge>
          </div>
          <Heading level={1} className="text-h1 sm:text-h2 mb-4 leading-tight">
            {ar ? "السياسات القانونية" : "Legal & Policies"}
          </Heading>
          <Prose className="max-w-md sm:max-w-lg text-navy-2">
            <p>
              {ar
                ? "اطّلع على سياساتنا القانونية المصممة للشفافية والامتثال لقانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020، ومتوافقة مع متطلبات اللائحة العامة لحماية البيانات (GDPR) حيثما ينطبق. جميع السياسات هي وثائق حية تُحدّث مع تطور اللوائح وممارساتنا."
                : "Our legal framework is designed for transparency and compliance with Egypt's Personal Data Protection Law (PDPL) No. 151 of 2020, and aligned with GDPR/UK GDPR where applicable. All policies are living documents — updated as regulations evolve and our practices improve."}
            </p>
          </Prose>
          <div className="mt-6 inline-flex items-center gap-2 text-xs text-slate-strong font-mono tracking-wide uppercase">
            <Badge tone="neutral" className="text-[10px]">
              {ar ? "آخر مراجعة: نوفمبر 2026" : "Last review: November 2026"}
            </Badge>
            <Badge tone="neutral" className="text-[10px]">
              {ar ? "مراجعة قانونية قيد الانتظار" : "Legal review pending"}
            </Badge>
          </div>
        </header>

        <GoldLine className="my-12" />

        {/* Policies Grid */}
        <div className="grid gap-6 sm:gap-8 lg:gap-10">
          {legalPages.map((page) => (
            <Card
              key={page.slug}
              className="group h-full p-6 sm:p-8 border-line hover:border-gold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-ivory-2 border border-line flex items-center justify-center group-hover:border-gold group-hover:bg-gold/10 transition-colors">
                  <page.icon className={`text-gold-strong group-hover:text-gold-strong`} size={20} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <Heading level={3} className="text-lg font-medium group-hover:text-gold transition-colors leading-tight">
                    {ar ? page.title.ar : page.title.en}
                  </Heading>
                  <p className="mt-3 text-sm text-navy-2 leading-relaxed line-clamp-3">
                    {ar ? page.description.ar : page.description.en}
                  </p>
                </div>
              </div>
              <div className="mt-auto border-t border-line pt-6">
                <div className="flex items-center justify-between gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={`/legal/${page.slug}`}
                      className="flex items-center gap-2 font-medium text-navy transition-colors"
                    >
                      {ar ? "اقرأ السياسة" : "Read policy"} <ChevronRight size={12} className="text-gold-strong" />
                    </a>
                  </Button>
                  <Badge tone="neutral" className="text-[10px] px-2 py-1">
                    {ar ? `تم التحديث: ${page.lastUpdated}` : `Updated ${page.lastUpdated}`}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Resources */}
        <section className="mt-16 pt-12 border-t border-line">
          <Heading level={2} className="text-h3 mb-6">
            {ar ? "موارد إضافية" : "Additional Resources"}
          </Heading>

          <div className="space-y-3">
            <div className="border border-line rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenSubProcessors((o) => !o)}
                className="flex w-full items-center justify-between px-6 py-4 text-navy font-medium hover:bg-ivory-2 hover:text-gold transition-colors"
                aria-expanded={openSubProcessors}
              >
                <div className="flex items-center gap-3">
                  <Gavel className="text-gold-strong" size={18} />
                  <span>{ar ? "قائمة المعالجات الفرعية" : "Sub-processor List"}</span>
                </div>
                <ChevronRight size={16} className={`text-slate-strong transition-transform duration-200 ${openSubProcessors ? "rotate-90" : ""}`} />
              </button>
              {openSubProcessors && (
                <div className="border-t border-line px-6 py-4">
                  <p className="text-sm text-navy-2 leading-relaxed">
                    {ar
                      ? "قائمة بالمعالجات الفرعية الحالية ومزودي الخدمة من الأطراف الثالثة مع اتفاقيات معالجة البيانات الموقعة (DPAs)."
                      : "Current third-party processors and service providers with signed Data Processing Agreements (DPAs)."}
                  </p>
                  <Button variant="ghost" size="sm" className="mt-4" asChild>
                    <a href="/legal/sub-processors" className="flex items-center gap-2 font-medium text-navy">
                      {ar ? "عرض القائمة" : "View list"} <ChevronRight size={12} className="text-gold-strong" />
                    </a>
                  </Button>
                </div>
              )}
            </div>

            <div className="border border-line rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenDataRequest((o) => !o)}
                className="flex w-full items-center justify-between px-6 py-4 text-navy font-medium hover:bg-ivory-2 hover:text-gold transition-colors"
                aria-expanded={openDataRequest}
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="text-gold-strong" size={18} />
                  <span>{ar ? "بوابة طلبات موضوع البيانات" : "Data Subject Request Portal"}</span>
                </div>
                <ChevronRight size={16} className={`text-slate-strong transition-transform duration-200 ${openDataRequest ? "rotate-90" : ""}`} />
              </button>
              {openDataRequest && (
                <div className="border-t border-line px-6 py-4">
                  <p className="text-sm text-navy-2 leading-relaxed">
                    {ar
                      ? "قدم طلبات الوصول، أو التصحيح، أو الحذف لبياناتك الشخصية من خلال بوابة طلبات موضوع البيانات."
                      : "Submit access, rectification, or erasure requests for your personal data through the Data Subject Request portal."}
                  </p>
                  <Button variant="ghost" size="sm" className="mt-4" asChild>
                    <a href="/data-request" className="flex items-center gap-2 font-medium text-navy">
                      {ar ? "فتح البوابة" : "Open portal"} <ChevronRight size={12} className="text-gold-strong" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mt-12 pt-10 border-t border-line">
          <Heading level={2} className="text-h3 mb-4">
            {ar ? "تواصل معنا" : "Contact"}
          </Heading>
          <Prose className="max-w-lg text-navy-2">
            <p>
              {ar
                ? "لأي أسئلة حول هذه السياسات، أو لممارسة حقوقك، أو للإبلاغ عن مخاوف، تواصل معنا:"
                : "For questions about these policies, to exercise your rights, or to report a concern:"}
            </p>
          </Prose>
          <address className="mt-4 space-y-3 text-navy-2">
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 text-gold-strong" aria-hidden="true">
                ✉
              </span>
              <span>
                Email:
                <a href="mailto:info@askterramorph.com" className="underline decoration-gold underline-offset-2 hover:text-navy font-medium">
                  info@askterramorph.com
                </a>
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 text-gold-strong" aria-hidden="true">
                📮
              </span>
              <span>TerraMorph Advisory LLC, New Cairo, Egypt</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 text-gold-strong" aria-hidden="true">
                🏢
              </span>
              <span>CR No. 184 562 · Cairo · TIN 742-118-903</span>
            </p>
          </address>
        </section>
      </div>
    </SitePage>
  );
}
