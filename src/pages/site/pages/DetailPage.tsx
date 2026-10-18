import { Contours, GoldLine, Reveal, SplitText } from "@/components/motion/fx"
import { Breadcrumbs } from "@/components/ui"
import {
  columnMeta,
  pageBySlug,
  pagesInColumn,
  pathForPage,
  type PageDef,
} from "@/content/pages"
import { columnLabelAr, localizedPage } from "@/content/pages.i18n"
import { pathForSection } from "@/lib/routes"
import type { Lang } from "@/pages/site/types"
import { Block } from "./blocks"

/* ——— Dedicated footer page: breadcrumbed hero, data-driven blocks, related rail ——— */
export function DetailPage({
  slug,
  lang,
}: {
  slug: string
  lang: Lang
}) {
  const base = pageBySlug[slug]
  if (!base) {
    return (
      <div className="mx-auto max-w-[1320px] px-5 py-32 text-center md:px-10">
        <p className="eyebrow text-gold-strong">
          {lang === "ar" ? "غير موجود" : "Not found"}
        </p>
        <h1 className="mt-4 text-4xl font-medium">
          {lang === "ar"
            ? "هذه الصفحة ليست في السجل."
            : "This page is not in the register."}
        </h1>
        <a
          href="/"
          className="mt-8 inline-block bg-navy px-6 py-3 text-xs tracking-[0.2em] text-ivory uppercase rtl:normal-case rtl:tracking-normal"
        >
          {lang === "ar"
            ? "العودة إلى الصفحة الرئيسية"
            : "Back to the homepage"}
        </a>
      </div>
    )
  }
  return <PageBody page={localizedPage(base, lang)} lang={lang} />
}

function PageBody({
  page,
  lang,
}: {
  page: PageDef
  lang: Lang
}) {
  const ar = lang === "ar"
  const col = columnMeta[page.column]
  const related = pagesInColumn(page.column)
    .filter((p) => p.slug !== page.slug)
    .slice(0, 4)
    .map((p) => localizedPage(p, lang))

  return (
    <article>
      <header className="relative overflow-hidden border-b border-line bg-ivory-2">
        <Contours className="absolute inset-0 h-full w-full" opacity={0.05} />
        <div className="relative mx-auto max-w-[1320px] px-5 pt-12 pb-16 md:px-10">
          <Breadcrumbs
            items={[
              { label: ar ? "الرئيسية" : "Home", href: "/" },
              {
                label: ar ? columnLabelAr[page.column] : page.column,
                href: pathForSection(col.section),
              },
              { label: page.title },
            ]}
          />
          <div className="mt-10 flex items-center gap-4">
            <span className="eyebrow text-gold-strong">{col.n}</span>
            <span className="eyebrow text-slate">{page.eyebrow}</span>
          </div>
          <GoldLine className="mt-4" />
          <h1 className="mt-8 max-w-4xl text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.02] font-medium">
            <SplitText text={page.title} immediate />
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-2">
            {page.lede}
          </p>
          {page.tags && page.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {page.tags.map((t) => (
                <span
                  key={t}
                  className="eyebrow border border-line px-3 py-1.5 text-slate"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {page.updated && (
            <p className="eyebrow mt-6 text-slate">
              {ar ? `آخر تحديث ${page.updated}` : `Updated ${page.updated}`}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        {page.blocks.map((b, i) => (
          <Block key={i} block={b} index={i} lang={lang} />
        ))}
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-ivory-2">
          <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-10">
            <p className="eyebrow text-gold-strong">
              {ar
                ? `المزيد في ${columnLabelAr[page.column]}`
                : `More in ${page.column}`}
            </p>
            <ul className="mt-8 grid gap-px bg-line md:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <Reveal as="li" key={p.slug} className="bg-ivory-2">
                  <a
                    href={pathForPage(p.slug)}
                    className="group flex h-full flex-col p-6 transition-colors hover:bg-ivory"
                  >
                    <span className="eyebrow text-slate">{p.eyebrow}</span>
                    <span className="mt-4 font-display text-xl leading-snug">
                      {p.title}
                    </span>
                    <span className="mt-auto pt-6 text-sm text-gold-strong">
                      {ar ? "اقرأ ←" : "Read →"}
                    </span>
                  </a>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  )
}
