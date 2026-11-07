import { Shield, FileText, Cookie, Gavel, ChevronRight, ExternalLink } from "lucide-react";
import SitePage from "@/pages/site/SitePage";
import { Heading, Card, Button, Badge, GoldLine, Prose } from "@/components/ui";
import { type Lang } from "@/pages/site/types";

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
      ar: "كيفية تقديم إشعار إزالة devido إلى انتهاك حقوق النشر إلى شركة تيرامورف للاستشارات.",
    },
    lastUpdated: "2026-11-07",
  },
];

export default function LegalIndexPage() {
  return (
    <SitePage
      lang="en"
    >
      <div className="mx-auto max-w-[800px] px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20">
        <header className="mb-12 sm:mb-16">
          <Heading level={1} className="text-h1 sm:text-h2 mb-4">
            Legal & Compliance
          </Heading>
          <Prose className="max-w-2xl text-navy-2">
            <p>
              Our legal framework is designed for transparency and compliance with Egypt's Personal Data Protection Law (PDPL) No. 151 of 2020,
              and aligned with GDPR/UK GDPR where applicable. All policies are living documents — updated as regulations evolve and our practices improve.
            </p>
            <p className="text-sm text-slate-strong font-mono tracking-wide uppercase">
              Last review: November 2026 · Legal review pending
            </p>
          </Prose>
        </header>

        <GoldLine className="mb-10" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {legalPages.map((page) => (
            <Card key={page.slug} className="group h-full p-6 border-line hover:border-gold transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-ivory-2 border border-line flex items-center justify-center group-hover:border-gold group-hover:bg-ivory transition-colors">
                  <page.icon className="text-gold-strong" size={24} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <Heading level={3} className="text-lg group-hover:text-gold transition-colors">
                    {page.title.en}
                  </Heading>
                  <p className="mt-2 text-sm text-navy-2 line-clamp-3">{page.description.en}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/legal/${page.slug}`}>
                        Read policy <ChevronRight size={14} className="ml-1" />
                      </a>
                    </Button>
                    <Badge tone="neutral" className="text-xs font-mono">
                      Updated {page.lastUpdated}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <section className="mt-16 pt-10 border-t border-line">
          <Heading level={2} className="text-h3 mb-4">
            Additional Resources
          </Heading>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5 border-line">
              <div className="flex items-center gap-3">
                <Gavel className="text-gold-strong" size={20} />
                <div>
                  <Heading level={3} className="text-base">Sub-processor List</Heading>
                  <p className="text-xs text-slate-strong mt-1">Current third-party processors with DPAs</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-4" asChild>
                <a href="/legal/sub-processors">View list <ChevronRight size={12} className="ml-1" /></a>
              </Button>
            </Card>
            <Card className="p-5 border-line">
              <div className="flex items-center gap-3">
                <ExternalLink className="text-gold-strong" size={20} />
                <div>
                  <Heading level={3} className="text-base">Data Subject Request Portal</Heading>
                  <p className="text-xs text-slate-strong mt-1">Submit access, rectification, or erasure requests</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-4" asChild>
                <a href="/dashboard#data-requests">Open portal <ChevronRight size={12} className="ml-1" /></a>
              </Button>
            </Card>
          </div>
        </section>

        <section className="mt-10 pt-8 border-t border-line">
          <Heading level={2} className="text-h3 mb-4">
            Contact
          </Heading>
          <Prose className="max-w-xl text-navy-2">
            <p>
              For questions about these policies, to exercise your rights, or to report a concern:
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