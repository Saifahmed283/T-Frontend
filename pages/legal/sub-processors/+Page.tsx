import { useState } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Server, Mail, BarChart2, HardDrive, Brain, Shield } from "lucide-react";

import SitePage, { useLang } from "@/pages/site/SitePage";
import { Heading, Card, Button, Badge, GoldLine, Prose } from "@/components/ui";
import { SUB_PROCESSORS, SUB_PROCESSOR_CATEGORIES, type SubProcessor } from "@/content/sub-processors";
import type { Lang } from "@/pages/site/types";

const categoryIcons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  hosting: Server,
  email: Mail,
  analytics: BarChart2,
  payment: Shield,
  communication: Mail,
  storage: HardDrive,
  ai: Brain,
  other: Shield,
};

export default function SubProcessorsPage() {
  const { lang } = useLang();
  const ar = lang === "ar";

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
            {ar ? "قائمة المعالجات الفرعية" : "Sub-processors"}
          </Heading>
          <Prose className="max-w-md sm:max-w-lg text-navy-2">
            <p>
              {ar
                ? "نحن نشارك البيانات الشخصية فقط مع معالجين فرعيين موثوقين لديهم اتفاقيات معالجة بيانات (DPAs). القائمة التالية محدثة باستمرار."
                : "We only share personal data with trusted sub-processors who have signed Data Processing Agreements (DPAs). This list is kept up to date."}
            </p>
          </Prose>
          <div className="mt-6 inline-flex items-center gap-2 text-xs text-slate-strong font-mono tracking-wide uppercase">
            <Badge tone="neutral" className="text-[10px]">
              {ar ? "آخر تحديث: نوفمبر 2026" : "Last updated: November 2026"}
            </Badge>
          </div>
        </header>

        <GoldLine className="my-12" />

        {/* Sub-processor categories - each category is its own card */}
        <div className="grid gap-6 sm:gap-8 lg:gap-10">
          {SUB_PROCESSOR_CATEGORIES.map((category) => {
            const processors = SUB_PROCESSORS.filter((p) => p.category === category.value);
            if (processors.length === 0) return null;

            return (
              <Card
                key={category.value}
                className="border-line hover:border-gold transition-all duration-300 hover:shadow-lg"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-ivory-2 border border-line flex items-center justify-center group-hover:border-gold group-hover:bg-gold/10 transition-colors">
                      <IconComponent category={category.value} className="text-gold-strong" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Heading level={3} className="text-lg font-medium leading-tight">
                        {ar ? category.labelAr : category.label}
                      </Heading>
                      <p className="mt-2 text-sm text-navy-2 leading-relaxed line-clamp-2">
                        {processors.length} processor{processors.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {processors.map((processor) => (
                      <SubProcessorCard
                        key={processor.id}
                        processor={processor}
                        lang={lang}
                        ar={ar}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Notes */}
        <section className="mt-16 pt-12 border-t border-line">
          <Heading level={2} className="text-h3 mb-6">
            {ar ? "ملاحظات مهمة" : "Important Notes"}
          </Heading>
          <Prose className="max-w-lg text-navy-2 space-y-4">
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 text-gold-strong" aria-hidden="true">
                ✓
              </span>
              <span>
                <strong>{ar ? "لا نبيع البيانات الشخصية" : "We do not sell personal data"}</strong>{" "}
                {ar ? "جميع المعالجات الفرعية ملزمة باتفاقيات DPA." : "All sub-processors are bound by signed DPAs."}
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 text-gold-strong" aria-hidden="true">
                🌍
              </span>
              <span>
                <strong>{ar ? "النقل الدولي" : "International Transfers"}</strong>{" "}
                {ar ? ": عند نقل البيانات خارج مصر، نستخدم البنود التعاقدية القياسية (SCCs) أو قرارات الكفاية." : ": When data leaves Egypt, we use Standard Contractual Clauses (SCCs) or adequacy decisions."}
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 text-gold-strong" aria-hidden="true">
                🔔
              </span>
              <span>
                <strong>{ar ? "الإخطار بالتغييرات" : "Change Notification"}</strong>{" "}
                {ar ? ": نُخطرك بـ ٣٠ يومًا قبل إضافة معالج فرعي جديد جوهري." : ": We notify you 30 days before adding a new material sub-processor."}
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 text-gold-strong" aria-hidden="true">
                ⚖️
              </span>
              <span>
                <strong>{ar ? "حق الاعتراض" : "Right to Object"}</strong>{" "}
                {ar ? ": يمكنك الاعتراض على معالج فرعي جديد بالتواصل معنا." : ": You may object to a new sub-processor by contacting us."}
              </span>
            </p>
          </Prose>
        </section>

        {/* Contact */}
        <section className="mt-16 pt-12 border-t border-line">
          <Heading level={2} className="text-h3 mb-4">
            {ar ? "تواصل معنا" : "Contact"}
          </Heading>
          <Prose className="max-w-lg text-navy-2">
            <p>
              {ar
                ? "لأي أسئلة حول هذه القائمة أو لممارسة حقوقك:"
                : "For questions about this list or to exercise your rights:"}
            </p>
          </Prose>
          <address className="mt-4 space-y-3 text-navy-2">
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 text-gold-strong" aria-hidden="true">
                ✉
              </span>
              <span>
                Email:
                <a href="mailto:privacy@askterramorph.com" className="underline decoration-gold underline-offset-2 hover:text-navy font-medium">
                  privacy@askterramorph.com
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

function SubProcessorCard({ processor, lang, ar }: { processor: SubProcessor; lang: Lang; ar: boolean }) {
  const categoryMeta = SUB_PROCESSOR_CATEGORIES.find((c) => c.value === processor.category);

  return (
    <Card className="group border border-line rounded-lg p-5 sm:p-6 hover:border-gold transition-all duration-300">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-ivory-2 border border-line flex items-center justify-center group-hover:border-gold group-hover:bg-gold/10 transition-colors">
          <IconComponent category={processor.category} className="text-gold-strong" size={18} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Heading level={4} className="text-sm font-semibold text-navy group-hover:text-gold transition-colors leading-tight">
              {processor.name}
            </Heading>
            {categoryMeta && (
              <Badge tone="neutral" className="text-[10px]">
                {ar ? categoryMeta.labelAr : categoryMeta.label}
              </Badge>
            )}
          </div>
          <p className="mt-2 text-sm text-navy-2 leading-relaxed line-clamp-2">
            {ar ? processor.descriptionAr : processor.description}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-xs text-navy-2">
        <div className="flex justify-between">
          <span className="text-slate">Location</span>
          <span className="font-medium">{processor.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate">DPA Status</span>
          <span className="font-medium">
            {processor.dpaSigned ? (ar ? `موقعة (${processor.dpaDate})` : `Signed (${processor.dpaDate})`) : (ar ? "غير موقعة" : "Pending")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate">Retention</span>
          <span className="font-medium">{processor.retention}</span>
        </div>
      </div>

      {processor.certifications && processor.certifications.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {processor.certifications.map((cert) => (
            <Badge key={cert} tone="neutral" className="text-[10px]">
              {cert}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}

function IconComponent({ category, className, size = 16 }: { category: string; className?: string; size?: number }) {
  const Icon = categoryIcons[category] || Shield;
  return <Icon className={className} size={size} />;
}
