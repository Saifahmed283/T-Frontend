import { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { ChevronLeft, Shield, FileText, Cookie, Gavel } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import SitePage, { useLang } from "@/pages/site/SitePage";
import { labelPath } from "@/content/pages";
import { type Lang } from "@/pages/site/types";

import {
  Heading,
  Prose,
  GoldLine,
  Card,
  Button,
  Badge,
  Accordion,
  AccordionItem,
} from "@/components/ui";

/* Legal page types mirror the content structure in src/content/legal/*.ts */

type LegalSection = {
  id: string;
  heading: string;
  body?: string[];
  items?: Array<
    | { name: string; purpose: string; domain: string; retention?: string }
    | { name: string; retention: string }
  >;
};

type LegalContent = {
  meta: {
    title: string;
    description: string;
    lastUpdated: string;
    effectiveDate?: string;
    version?: string;
  };
  sections: LegalSection[];
};

const LEGAL_PAGES = {
  "privacy-policy": {
    en: () => import("@/content/legal/privacy-policy.en").then((m) => m.privacyPolicy),
    ar: () => import("@/content/legal/privacy-policy.ar").then((m) => m.privacyPolicyAr),
    icon: Shield,
    fallbackTitle: { en: "Privacy Policy", ar: "سياسة الخصوصية" },
  },
  "terms-of-service": {
    en: () => import("@/content/legal/terms-of-service.en").then((m) => m.termsOfService),
    ar: () => import("@/content/legal/terms-of-service.ar").then((m) => m.termsOfServiceAr),
    icon: FileText,
    fallbackTitle: { en: "Terms of Service", ar: "شروط الخدمة" },
  },
  "cookie-policy": {
    en: () => import("@/content/legal/cookie-policy.en").then((m) => m.cookiePolicy),
    ar: () => import("@/content/legal/cookie-policy.ar").then((m) => m.cookiePolicyAr),
    icon: Cookie,
    fallbackTitle: { en: "Cookie Policy", ar: "سياسة ملفات تعريف الارتباط" },
  },
  "dmca-policy": {
    en: () => import("@/content/legal/dmca-policy.en").then((m) => m.dmcaPolicy),
    ar: () => import("@/content/legal/dmca-policy.ar").then((m) => m.dmcaPolicy),
    icon: Gavel,
    fallbackTitle: { en: "DMCA Policy", ar: "سياسة DMCA" },
  },
} as const;

type LegalSlug = keyof typeof LEGAL_PAGES;

function LegalIcon({ icon: Icon, className = "" }: { icon: LucideIcon; className?: string }) {
  return <Icon className={`text-gold-strong ${className}`} size={28} aria-hidden="true" />;
}

function SectionBody({ section, lang }: { section: LegalSection; lang: Lang }) {
  return (
    <div className="space-y-4">
      {section.body && (
        <Prose className="text-navy-2">
          {section.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Prose>
      )}
      {section.items && section.items.length > 0 && (
        <div className="space-y-4">
          {section.items.map((item, i) => {
            const hasPurpose = "name" in item && "purpose" in item;
            return (
              <div key={i} className="border border-line rounded-lg p-4 bg-ivory">
                {hasPurpose ? (
                  <div>
                    <p className="font-medium text-navy">{item.name}</p>
                    <p className="mt-1 text-sm text-navy-2">{item.purpose}</p>
                    <p className="mt-1 text-xs text-slate-strong">
                      Domain: <code className="font-mono text-navy-2">{item.domain}</code>
                      {item.retention && (
                        <>
                          <span className="mx-2">·</span> Retention: <code className="font-mono text-navy-2">{item.retention}</code>
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-navy">{item.name}</p>
                    <p className="font-mono text-navy-2 text-sm">{item.retention}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LegalPageContent({ content, lang, slug }: { content: LegalContent; lang: Lang; slug: LegalSlug }) {
  const ar = lang === "ar";
  const Icon = LEGAL_PAGES[slug].icon;

  return (
    <article className="prose prose-navy max-w-none">
      <header className="mb-10 sm:mb-14">
        <LegalIcon icon={Icon} className="mb-4" />
        <Heading level={1} className="text-h1 sm:text-h2 mb-3">
          {content.meta.title}
        </Heading>
        <p className="text-sm text-slate-strong font-mono tracking-wide uppercase">
          Last updated: {content.meta.lastUpdated}
          {content.meta.effectiveDate && ` · Effective: ${content.meta.effectiveDate}`}
          {content.meta.version && ` · v${content.meta.version}`}
        </p>
        <GoldLine className="mt-4" />
      </header>

      <nav className="hidden md:block mb-10 p-4 bg-ivory rounded-lg border border-line" aria-label="Table of contents">
        <p className="eyebrow text-gold-strong mb-3">Contents</p>
        <ol className="space-y-1 text-sm">
          {content.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-navy-2 hover:text-navy hover:underline decoration-gold underline-offset-2">
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-10">
        {content.sections.map((section) => (
          <section id={section.id} key={section.id} className="scroll-mt-20">
            <Heading level={2} className="text-h3 mb-4">
              {section.heading}
            </Heading>
            <SectionBody section={section} lang={lang} />
          </section>
        ))}
      </div>

      <footer className="mt-12 pt-8 border-t border-line">
        <p className="text-sm text-slate-strong">
          {ar ? "أسئلة؟ تواصل مع " : "Questions? Contact "}
          <a href="mailto:privacy@askterramorph.com" className="underline decoration-gold underline-offset-2 hover:text-navy">privacy@askterramorph.com</a>
        </p>
        <p className="mt-2 text-xs text-slate-strong">
          {ar ? "هذه الصفحة جزء من وثائق امتثال شركة تيرامورف. المراجعة القانونية قيد الانتظار." : "This page is part of TerraMorph's compliance documentation. Legal review pending."}
        </p>
      </footer>
    </article>
  );
}

export default function LegalPage() {
  const { routeParams } = usePageContext();
  const slug = routeParams.slug as LegalSlug;
  const { lang } = useLang();
  const resolvedLang = lang;
  const pageConfig = slug ? LEGAL_PAGES[slug] : undefined;
  const [content, setContent] = useState<LegalContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !pageConfig) {
      setError("Legal page not found");
      setLoading(false);
      return;
    }
    const loader = pageConfig[resolvedLang] ?? pageConfig.en;
    loader()
      .then((mod: { default?: LegalContent }) => {
        setContent(mod.default ?? mod as LegalContent);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load legal content");
        setLoading(false);
      });
  }, [slug, resolvedLang, pageConfig]);

  const pageTitle = pageConfig?.fallbackTitle[resolvedLang] ?? pageConfig?.fallbackTitle.en ?? "Legal";

  return (
    <SitePage
      lang={resolvedLang}
    >
      <div className="mx-auto max-w-[800px] px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20 lg:max-w-[900px]">
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-strong">
            <li><a href="/" className="hover:text-navy hover:underline">Home</a></li>
            <li aria-hidden="true">/</li>
            <li><a href="/legal" className="hover:text-navy hover:underline">Legal</a></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-navy font-medium">{pageTitle}</li>
          </ol>
        </nav>

        {loading ? (
          <div className="space-y-4" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-8 w-full animate-pulse bg-ivory-2 rounded" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12" role="alert">
            <p className="text-navy-2">{error}</p>
            <Button variant="ghost" className="mt-4" onClick={() => window.history.back()}>
              <ChevronLeft size={16} className="mr-1" /> Back
            </Button>
          </div>
        ) : content ? (
          <LegalPageContent content={content} lang={resolvedLang} slug={slug} />
        ) : null}
      </div>
    </SitePage>
  );
}