import { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { ChevronLeft, Shield, Server, Mail, BarChart2, HardDrive, Brain, ExternalLink } from "lucide-react";

import SitePage from "@/pages/site/SitePage";
import { Heading, Card, CardContent, GoldLine, Prose, Badge, Button, Accordion, AccordionItem } from "@/components/ui";
import { SUB_PROCESSORS, SUB_PROCESSOR_CATEGORIES, type SubProcessor, type SubProcessorCategory } from "@/content/sub-processors";
import { type Lang } from "@/pages/site/types";

function SubProcessorCard({ processor, lang }: { processor: SubProcessor; lang: Lang }) {
  const ar = lang === "ar";

  const categoryMeta = SUB_PROCESSOR_CATEGORIES.find(c => c.value === processor.category);

  const getCategoryIcon = (category: SubProcessorCategory) => {
    switch (category) {
      case 'hosting': return Server;
      case 'email': return Mail;
      case 'analytics': return BarChart2;
      case 'storage': return HardDrive;
      case 'ai': return Brain;
      case 'communication': return Mail;
      case 'payment': return Shield;
      default: return Shield;
    }
  };

  const Icon = getCategoryIcon(processor.category);

  return (
    <Card className="group h-full border-line hover:border-gold transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-ivory-2 border border-line flex items-center justify-center group-hover:border-gold group-hover:bg-ivory transition-colors">
            <Icon className="text-gold-strong" size={24} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Heading level={3} className="text-lg group-hover:text-gold transition-colors">
                {processor.name}
              </Heading>
              {categoryMeta && (
                <Badge tone="neutral" className="text-xs">
                  {ar ? categoryMeta.labelAr : categoryMeta.label}
                </Badge>
              )}
            </div>
            <p className="text-sm text-navy-2 mb-4">{ar ? processor.descriptionAr : processor.description}</p>

            <div className="space-y-2 text-xs text-navy-2 border-t border-line pt-4">
              <div className="flex justify-between">
                <span className="text-slate">Location</span>
                <span className="font-medium text-navy-2">{processor.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">DPA Status</span>
                <span className="font-medium text-navy-2">
                  {processor.dpaSigned
                    ? `Signed (${processor.dpaDate})`
                    : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Retention</span>
                <span className="font-medium text-navy-2">{processor.retention}</span>
              </div>
            </div>

            {processor.certifications && processor.certifications.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {processor.certifications.map((cert) => (
                  <Badge key={cert} tone="neutral" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubProcessorsPage() {
  const { routeParams } = usePageContext();
  const resolvedLang = "en" as const;
  const ar = false;

  return (
    <SitePage lang={resolvedLang}>
      <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20">
        <header className="mb-12 sm:mb-16">
          <Heading level={1} className="text-h1 sm:text-h2 mb-4">
            {ar ? "قائمة المعالجين الفرعيين" : "Sub-processor List"}
          </Heading>
          <Prose className="max-w-3xl text-navy-2">
            <p>
              {ar
                ? "نحن نشارك البيانات الشخصية فقط مع معالجين فرعيين موثوقين لديهم اتفاقيات معالجة بيانات (DPA) موقعة. القائمة التالية محدثة باستمرار."
                : "We only share personal data with trusted sub-processors who have signed Data Processing Agreements (DPAs). This list is kept up to date."}
            </p>
            <p className="text-sm text-slate-strong font-mono tracking-wide uppercase">
              {ar ? "آخر تحديث: نوفمبر ٢٠٢٦" : "Last updated: November 2026"}
            </p>
          </Prose>
        </header>

        <GoldLine className="mb-10" />

        <div className="space-y-10">
          {SUB_PROCESSOR_CATEGORIES.map((category) => {
            const processors = SUB_PROCESSORS.filter(p => p.category === category.value);
            if (processors.length === 0) return null;

            return (
              <section key={category.value} className="scroll-mt-20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-ivory-2 border border-line flex items-center justify-center">
                    <Shield className="text-gold-strong" size={20} aria-hidden="true" />
                  </div>
                  <Heading level={2} className="text-h3">
                    {ar ? category.labelAr : category.label}
                  </Heading>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {processors.map((processor) => (
                    <SubProcessorCard key={processor.id} processor={processor} lang={resolvedLang} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-16 pt-10 border-t border-line">
          <Heading level={2} className="text-h3 mb-4">
            {ar ? "ملاحظات مهمة" : "Important Notes"}
          </Heading>
          <Prose className="max-w-3xl text-navy-2 space-y-3">
            <p>
              <strong>{ar ? "لا نبيع البيانات الشخصية" : "We do not sell personal data"}</strong>
              {ar ? ". جميع المعالجات الفرعية ملزمة باتفاقيات DPA." : ". All sub-processors are bound by signed DPAs."}
            </p>
            <p>
              <strong>{ar ? "النقل الدولي" : "International Transfers"}</strong>
              {ar ? ": عند نقل البيانات خارج مصر، نستخدم البنود التعاقدية القياسية (SCCs) أو قرارات الكفاية." : ": When data leaves Egypt, we use Standard Contractual Clauses (SCCs) or adequacy decisions."}
            </p>
            <p>
              <strong>{ar ? "الإخطار بالتغييرات" : "Change Notification"}</strong>
              {ar ? ": نُخطرك بـ ٣٠ يومًا قبل إضافة معالج فرعي جديد جوهري." : ": We notify you 30 days before adding a new material sub-processor."}
            </p>
            <p>
              <strong>{ar ? "حق الاعتراض" : "Right to Object"}</strong>
              {ar ? ": يمكنك الاعتراض على معالج فرعي جديد بالتواصل معنا." : ": You may object to a new sub-processor by contacting us."}
            </p>
          </Prose>
        </section>

        <section className="mt-10 pt-8 border-t border-line">
          <Heading level={2} className="text-h3 mb-4">
            {ar ? "التواصل" : "Contact"}
          </Heading>
          <Prose className="max-w-xl text-navy-2">
            <p>
              {ar
                ? "للأسئلة حول هذه القائمة أو لممارسة حقوقك:"
                : "For questions about this list or to exercise your rights:"}
            </p>
            <address className="not-italic mt-4 space-y-1">
              <p>Email: <a href="mailto:privacy@askterramorph.com" className="underline decoration-gold underline-offset-2 hover:text-navy">privacy@askterramorph.com</a></p>
              <p>Post: TerraMorph Advisory LLC, New Cairo, Egypt</p>
              <p>CR No. 184 562 · Cairo · TIN 742-118-903</p>
            </address>
          </Prose>
        </section>
      </div>
    </SitePage>
  );
}