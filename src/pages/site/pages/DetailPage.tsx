import { useEffect, useState } from "react"
import { usePageContext } from "vike-react/usePageContext"

import { Contours, GoldLine, Reveal, SplitText } from "@/components/motion/fx"

import { Breadcrumbs, EmptyState, LiveStatus } from "@/components/ui"

import { api, type PublicContentItem } from "@/lib/api"

import { collectionLabels, localized, titleOf } from "@/lib/publicContent"

import {
  columnMeta,
  pagesInColumn,
  pathForPage,
  resolvePage,
  type ColumnKey,
  type PageDef,
} from "@/content/pages"

import { columnLabelAr, localizedPage } from "@/content/pages.i18n"

import { pathForSection } from "@/lib/routes"

import type { Lang } from "@/pages/site/types"

import { Block } from "./blocks"

// Dedicated footer page: breadcrumbed hero, data-driven blocks, related rail

/* Every section route that also serves CMS records, and the collections whose
   slugs land under it. A CMS-only slug gets a generic article; a static page
   whose slug is also in the CMS gets a live record band underneath. */
const CMS_SECTIONS: Record<string, {
  column: ColumnKey
  collections: string[]
}> = {
  evidence: { column: "Evidence", collections: ["cases", "assignments"] },

  knowledge: { column: "Knowledge", collections: ["publications"] },

  method: { column: "Method", collections: ["instruments"] },

  learning: { column: "Learning", collections: ["courses"] },

  join: { column: "Join", collections: ["vacancies", "experts"] },

  about: { column: "About", collections: ["partners", "initiatives"] },
}

const collectionLabelsAr: Record<string, string> = {
  assignments: "المهام",

  cases: "ملفات الحالة",

  publications: "الإصدارات",

  instruments: "الأدوات",

  courses: "الدورات",

  experts: "الخبراء",

  partners: "الشركاء",

  vacancies: "الوظائف",

  initiatives: "المبادرات",

  audiences: "الجماهير",
}

const fieldLabelsAr: Record<string, string> = {
  client: "العميل",
  sector: "القطاع",
  geography: "النطاق الجغرافي",
  year: "السنة",
  size: "الحجم",
  format: "الصيغة",
  price: "السعر",
  seats: "المقاعد",
  startDate: "تاريخ البدء",
  level: "المستوى",
  deadline: "آخر موعد",
  location: "الموقع",
  salaryBand: "نطاق الراتب",
  contractType: "نوع العقد",
  country: "البلد",
  expertise: "الخبرة",
  availability: "التوفر",
  stage: "المرحلة",
  license: "الترخيص",
  domain: "المجال",
  status: "الحالة",
  language: "اللغة",
  contentType: "نوع الإصدار",
  publicationDate: "تاريخ النشر",
  clientType: "نوع العميل",
  produces: "المخرجات",
  whenToUse: "متى يُستخدم",
  whatItIs: "ما هو",
  whatWeDid: "ما فعلناه",
  whatChanged: "ما تغيّر",
  constraint: "القيد",
  measurement: "القياس",
  mandate: "التفويض",
  output: "المخرج",
  time: "المدة",
  short: "الوصف المختصر",
  kicker: "الشريحة",
  heading: "العنوان",
  cta: "الدعوة",
  questions: "الأسئلة",
}

function sectionKeyFromPath(pathname: string): string {
  return pathname.split("/").filter(Boolean)[0] ?? ""
}

function humanize(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function fieldLabel(key: string, lang: Lang): string {
  return lang === "ar" ? (fieldLabelsAr[key] ?? humanize(key)) : humanize(key)
}

function displayValue(value: unknown, lang: Lang): string | undefined {
  const loc = localized(value, lang)

  if (loc) return loc

  if (typeof value === "number") return String(value)

  if (typeof value === "boolean") {
    return value ? (lang === "ar" ? "نعم" : "Yes") : lang === "ar" ? "لا" : "No"
  }

  if (Array.isArray(value)) {
    const parts = value

      .map((entry) => displayValue(entry, lang))

      .filter((entry): entry is string => Boolean(entry))

    return parts.length ? parts.join(" · ") : undefined
  }

  return undefined
}

const LEDE_KEYS = new Set([
  "description",

  "standfirst",

  "intro",

  "mandate",

  "whatItIs",

  "summary",
])

type CmsLookup = {
  loading: boolean

  item: PublicContentItem | null

  collection: string | null
}

function useCmsItem(sectionKey: string, slug: string): CmsLookup {
  const [state, setState] = useState<CmsLookup>({
    loading: true,

    item: null,

    collection: null,
  })

  useEffect(() => {
    const config = CMS_SECTIONS[sectionKey]

    if (!config) {
      setState({ loading: false, item: null, collection: null })

      return
    }

    let cancelled = false

    setState({ loading: true, item: null, collection: null })

    void (async () => {
      for (const collection of config.collections) {
        try {
          const item = await api.publicContentGet(collection, slug)

          if (!cancelled) setState({ loading: false, item, collection })

          return
        } catch {
          /* not in this collection — try the next one */
        }
      }

      if (!cancelled) setState({ loading: false, item: null, collection: null })
    })()

    return () => {
      cancelled = true
    }
  }, [sectionKey, slug])

  return state
}

export function DetailPage({
  slug,

  lang,
}: {
  slug: string

  lang: Lang
}) {
  const { urlPathname } = usePageContext()

  const sectionKey = sectionKeyFromPath(urlPathname)

  const base = resolvePage(slug)

  if (base) {
    return (
      <>
        <PageBody page={localizedPage(base, lang)} lang={lang} />
        <CmsSupplement slug={slug} sectionKey={sectionKey} lang={lang} />
      </>
    )
  }

  return <CmsDetailPage slug={slug} sectionKey={sectionKey} lang={lang} />
}

function NotFoundBlock({ lang }: { lang: Lang }) {
  const ar = lang === "ar"

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10">
      <EmptyState
        eyebrow={ar ? "غير موجود" : "Not found"}
        title={
          ar ? "هذه الصفحة ليست في السجل." : "This page is not in the register."
        }
        body={
          ar
            ? "قد يكون الرابط قديمًا، أو أن العنصر لم يُنشر بعد. تحقّق من القسم أو عُد إلى الرئيسية."
            : "The link may be out of date, or the record has not been published yet. Check the section or return home."
        }
        action={{
          label: ar ? "العودة إلى الرئيسية" : "Back to the homepage",
          href: "/",
        }}
      />
    </div>
  )
}

function CmsSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10" aria-busy>
      <div className="h-3 w-40 animate-pulse bg-line" />
      <div className="mt-6 h-4 w-24 animate-pulse bg-line" />
      <div className="mt-8 h-12 w-3/4 animate-pulse bg-line" />
      <div className="mt-4 h-4 w-1/2 animate-pulse bg-line" />
      <div className="mt-16 grid gap-px bg-line sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="min-h-28 bg-ivory p-6">
            <div className="h-3 w-24 animate-pulse bg-line" />
            <div className="mt-4 h-4 w-2/3 animate-pulse bg-line" />
          </div>
        ))}
      </div>
    </div>
  )
}

function CmsDetailPage({
  slug,

  sectionKey,

  lang,
}: {
  slug: string

  sectionKey: string

  lang: Lang
}) {
  const { loading, item, collection } = useCmsItem(sectionKey, slug)

  const config = CMS_SECTIONS[sectionKey]

  if (loading) return <CmsSkeleton />

  if (!item || !config || !collection) return <NotFoundBlock lang={lang} />

  const ar = lang === "ar"

  const col = columnMeta[config.column]

  const title = titleOf(item, lang)

  const lede = Object.entries(item.data)

    .filter(([key]) => LEDE_KEYS.has(key))

    .map(([, value]) => displayValue(value, lang))

    .find((value): value is string => Boolean(value))

  const fields = Object.entries(item.data)

    .filter(([key]) => key !== "title" && !LEDE_KEYS.has(key))

    .map(([key, value]) => [key, displayValue(value, lang)] as const)

    .filter(([, value]) => Boolean(value))
    .slice(0, 12)

  const related = pagesInColumn(config.column)

    .slice(0, 4)

    .map((page) => localizedPage(page, lang))

  return (
    <article>
      <LiveStatus
        message={
          ar
            ? "تم تحميل هذا السجل من مساحة المحتوى."
            : "This record was loaded from the content workspace."
        }
      />
      <header className="relative overflow-hidden border-b border-line bg-ivory-2">
        <Contours className="absolute inset-0 h-full w-full" opacity={0.05} />
        <div className="relative mx-auto max-w-[1320px] px-5 pt-12 pb-16 md:px-10">
          <Breadcrumbs
            items={[
              { label: ar ? "الرئيسية" : "Home", href: "/" },

              {
                label: ar ? columnLabelAr[config.column] : config.column,

                href: pathForSection(col.section),
              },

              { label: title },
            ]}
          />
          <div className="mt-10 flex items-center gap-4">
            <span className="eyebrow text-gold-strong">{col.n}</span>
            <span className="eyebrow text-slate">
              {ar
                ? (collectionLabelsAr[collection] ?? collection)
                : (collectionLabels[
                    (collection as keyof typeof collectionLabels)
                  ] ?? collection)}
            </span>
          </div>
          <GoldLine className="mt-4" />
          <h1 className="mt-8 max-w-4xl text-h1 font-medium">
            <SplitText text={title} immediate />
          </h1>
          {lede && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-2">
              {lede}
            </p>
          )}
          <p className="eyebrow mt-6 text-slate">
            {ar ? "آخر تحديث" : "Updated"}{" "}
            {new Date(item.updatedAt).toLocaleDateString(
              ar ? "ar-EG" : "en-GB",
              { year: "numeric", month: "long", day: "numeric" },
            )}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-10">
        {fields.length > 0 ? (
          <dl className="grid gap-px bg-line sm:grid-cols-2">
            {fields.map(([key, value]) => (
              <div key={key} className="bg-ivory p-6">
                <dt className="eyebrow text-gold-strong">
                  {fieldLabel(key, lang)}
                </dt>
                <dd className="mt-2 leading-relaxed text-navy-2">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-slate">
            {ar
              ? "لا توجد تفاصيل إضافية منشورة لهذا السجل بعد."
              : "No additional details are published for this record yet."}
          </p>
        )}

        <a
          href={pathForSection(col.section)}
          className="eyebrow mt-10 inline-block border-b border-navy/30 pb-1 text-navy transition-colors hover:border-gold-strong hover:text-gold-strong"
        >
          {ar ? "عُد إلى القسم ←" : "Back to the section →"}
        </a>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-ivory-2">
          <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-10">
            <p className="eyebrow text-gold-strong">
              {ar
                ? `المزيد في ${columnLabelAr[config.column]}`
                : `More in ${config.column}`}
            </p>
            <ul className="mt-8 grid gap-px bg-line md:grid-cols-2 lg:grid-cols-4">
              {related.map((page) => (
                <Reveal as="li" key={page.slug} className="bg-ivory-2">
                  <a
                    href={pathForPage(page.slug)}
                    className="group flex h-full flex-col p-6 transition-colors hover:bg-ivory"
                  >
                    <span className="eyebrow text-slate">{page.eyebrow}</span>
                    <span className="mt-4 font-display text-xl leading-snug">
                      {page.title}
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

/* A static page can also exist in the CMS. Surface that record as a live band
   so an editor's update is visible here without changing the page's own copy. */
function CmsSupplement({
  slug,

  sectionKey,

  lang,
}: {
  slug: string

  sectionKey: string

  lang: Lang
}) {
  const { item, collection } = useCmsItem(sectionKey, slug)

  if (!item || !collection) return null

  const ar = lang === "ar"

  const title = titleOf(item, lang)

  const summary = Object.entries(item.data)

    .filter(([key]) => LEDE_KEYS.has(key))

    .map(([, value]) => displayValue(value, lang))

    .find((value): value is string => Boolean(value))

  return (
    <section className="border-t border-line bg-ivory-2">
      <div className="mx-auto max-w-[1320px] px-5 py-12 md:px-10">
        <LiveStatus
          message={
            ar
              ? "يتوفر سجل حي من مساحة المحتوى لهذه الصفحة."
              : "A live content-workspace record is available for this page."
          }
        />
        <p className="eyebrow text-gold-strong">
          {ar ? "سجل حي" : "Live record"}{" "}
          <span className="text-slate">
            ·{" "}
            {ar
              ? (collectionLabelsAr[collection] ?? collection)
              : (collectionLabels[
                  (collection as keyof typeof collectionLabels)
                ] ?? collection)}
          </span>
        </p>
        <p className="mt-3 font-display text-2xl">{title}</p>
        {summary && <p className="mt-2 max-w-2xl text-slate">{summary}</p>}
        <p className="eyebrow mt-4 text-slate">
          {ar ? "آخر تحديث" : "Updated"}{" "}
          {new Date(item.updatedAt).toLocaleDateString(ar ? "ar-EG" : "en-GB", {
            year: "numeric",

            month: "long",

            day: "numeric",
          })}
        </p>
      </div>
    </section>
  )
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
          <h1 className="mt-8 max-w-4xl text-h1 font-medium">
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
