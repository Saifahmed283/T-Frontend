import { useState } from "react"

import { cases as staticCases } from "@/content/data"

import { Reveal, Spotlight } from "@/components/motion/fx"

import { EmptyState, LiveStatus } from "@/components/ui"

import {
  mapCase,
  mapLedgerRow,
  usePublicCollection,
  type LiveLedgerRow,
} from "@/lib/publicContent"

import { Head } from "./Head"

import type { Lang } from "../types"

// Evidence: three cases up top, the full ledger beneath, sector as a filter

export const ledger = [
  {
    y: 2026,

    sector: "Social enterprise",

    title: "Blended-finance structure, women-led agri cooperative",

    titleAr: "هيكل تمويل مختلط لتعاونية زراعية تقودها نساء",

    client: "Delta Impact Fund",

    clientAr: "صندوق أثر الدلتا",

    geo: "Egypt",

    geoAr: "مصر",

    size: "< USD 100k",
  },

  {
    y: 2026,

    sector: "Investment climate",

    title: "Investment climate action plan",

    titleAr: "خطة عمل مناخ الاستثمار",

    client: "Ministry of Planning",

    clientAr: "وزارة التخطيط",

    geo: "Egypt",

    geoAr: "مصر",

    size: "USD 250–500k",
  },

  {
    y: 2025,

    sector: "Local economic development",

    title: "Governorate investment map, phase I–II",

    titleAr: "الخريطة الاستثمارية للمحافظة، المرحلة الأولى–الثانية",

    client: "Assiut Governorate",

    clientAr: "محافظة أسيوط",

    geo: "Egypt",

    geoAr: "مصر",

    size: "USD 100–250k",
  },

  {
    y: 2025,

    sector: "Local economic development",

    title: "Main-street LED pilot design",

    titleAr: "تصميم مشروع تجريبي للتنمية الاقتصادية المحلية بالشارع الرئيسي",

    client: "Municipal authority",

    clientAr: "سلطة محلية",

    geo: "Egypt",

    geoAr: "مصر",

    size: "< USD 100k",
  },

  {
    y: 2024,

    sector: "TVET & skills",

    title: "Employer-validated curricula for 14 schools",

    titleAr: "مناهج معتمدة من أصحاب العمل لـ14 مدرسة",

    client: "GIZ programme",

    clientAr: "برنامج GIZ",

    geo: "Egypt",

    geoAr: "مصر",

    size: "USD 100–250k",
  },

  {
    y: 2024,

    sector: "Policy",

    title: "SME regulatory burden review",

    titleAr: "مراجعة العبء التنظيمي على المشروعات الصغيرة والمتوسطة",

    client: "Chamber of commerce",

    clientAr: "غرفة تجارية",

    geo: "Jordan",

    geoAr: "الأردن",

    size: "< USD 100k",
  },

  {
    y: 2023,

    sector: "TVET & skills",

    title: "Train-the-trainer certification framework",

    titleAr: "إطار اعتماد تدريب المدربين",

    client: "AAST Academy",

    clientAr: "أكاديمية AAST",

    geo: "Egypt",

    geoAr: "مصر",

    size: "< USD 100k",
  },

  {
    y: 2023,

    sector: "Infrastructure",

    title: "Regional logistics corridor pre-feasibility",

    titleAr: "دراسة الجدوى الأولية لممر لوجستي إقليمي",

    client: "Development partner",

    clientAr: "شريك تنموي",

    geo: "Morocco",

    geoAr: "المغرب",

    size: "USD 100–250k",
  },
]

const sectorLabel: Record<string, string> = {
  "All sectors": "كل القطاعات",

  "Social enterprise": "المشروعات الاجتماعية",

  "Investment climate": "مناخ الاستثمار",

  "Local economic development": "التنمية الاقتصادية المحلية",

  "TVET & skills": "التعليم الفني والمهارات",

  Policy: "السياسات",

  Infrastructure: "البنية التحتية",
}

// The static ledger has no per-row detail link; CMS rows do.

type LedgerRow = Omit<LiveLedgerRow, "href" | "sectorAr"> & {
  href?: string

  sectorAr?: string
}

type CaseView = {
  href: string

  sector: string

  sectorAr: string

  year: string

  title: string

  titleAr: string

  client: string

  clientAr: string
}

export function Evidence({ lang }: { lang: Lang }) {
  const ar = lang === "ar"

  const [sec, setSec] = useState("All sectors")

  const [open, setOpen] = useState(false)

  /* CMS first, static fallback. The hook keeps the prerendered copy on screen
     when the public API is unreachable, and polls so a published edit appears
     without a rebuild. */

  const assignments = usePublicCollection("assignments", { pageSize: 100 })

  const cases = usePublicCollection("cases", { pageSize: 12 })

  const liveRows: LedgerRow[] = assignments.live
    ? assignments.items.map(mapLedgerRow)
    : []

  const allRows: LedgerRow[] = liveRows.length ? liveRows : ledger

  const rows = allRows.filter((l) => sec === "All sectors" || l.sector === sec)

  const liveCases = cases.live ? cases.items.map(mapCase) : []

  const caseList: CaseView[] = liveCases.length
    ? liveCases
    : staticCases.map((c) => ({ ...c, href: "/evidence/case-studies" }))

  const sectorOptions = [
    "All sectors",

    ...new Set(allRows.map((l) => l.sector).filter(Boolean)),
  ]

  const sLabel = (s: string) => {
    if (!ar) return s

    const fromRow = allRows.find((r) => r.sector === s)?.sectorAr

    return fromRow ?? sectorLabel[s] ?? s
  }

  const ledgerMessage = assignments.live
    ? ar
      ? "تم تحديث سجل المهام من مساحة المحتوى."
      : "Showing the live assignment ledger from the content workspace."
    : ar
      ? "يُعرض سجل المهام الثابت."
      : "Showing the static assignment ledger."

  return (
    <section className="mx-auto max-w-[1320px] px-5 py-24 md:px-10">
      <LiveStatus message={ledgerMessage} />
      <Head
        id="evidence"
        n="02"
        eyebrow={ar ? "الأدلة" : "Evidence"}
        title={
          ar
            ? "ثلاث حالات، ثم السجل كاملًا."
            : "Three cases, then the whole ledger."
        }
        aside={
          <p className="max-w-xs text-sm text-slate">
            {ar
              ? "كل ادّعاء مرتبط بمهمة مؤرخة وممسماة. يستطيع قارئ المشتريات التحقق من كل ذلك."
              : "Every claim links to a dated, named assignment. A procurement reader can check all of it."}
          </p>
        }
      />
      {cases.live && cases.total === 0 ? (
        <div className="mt-14">
          <EmptyState
            eyebrow={ar ? "لا حالات منشورة" : "No cases published"}
            title={
              ar ? "لم يُنشر أي ملف حالة بعد." : "No case studies published yet."
            }
            body={
              ar
                ? "انشر ملفات الحالة من لوحة التحكم وستظهر هنا تلقائيًا."
                : "Publish case studies in the dashboard and they appear here automatically."
            }
          />
        </div>
      ) : (
        <div className="mt-14 grid gap-px bg-line lg:grid-cols-3">
          {caseList.map((c, i) => (
            <Reveal key={c.title} delay={i * 120} className="bg-ivory">
              <a
                href={c.href}
                className="block h-full focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-navy"
              >
                <Spotlight className="h-full" color="rgba(19,43,69,0.06)">
                  <article className="flex h-full min-h-[340px] flex-col p-8">
                    <div className="flex justify-between">
                      <span className="eyebrow text-gold-strong">
                        {ar ? c.sectorAr : c.sector}
                      </span>
                      <span className="eyebrow text-slate">{c.year}</span>
                    </div>
                    <div className="relative my-7 h-24 border-y border-line">
                      <svg
                        viewBox="0 0 300 100"
                        className="h-full w-full"
                        preserveAspectRatio="none"
                        aria-hidden
                      >
                        <path
                          d={
                            [
                              "M0 80 Q60 75 100 60 T200 35 T300 10",

                              "M0 70 L50 66 L100 50 L150 52 L200 30 L250 26 L300 12",

                              "M0 85 C80 85 120 50 170 45 S260 20 300 18",
                            ][i]
                          }
                          fill="none"
                          stroke="#A98A4B"
                          strokeWidth="1.5"
                          strokeDasharray="400"
                          strokeDashoffset="400"
                          className="transition-[stroke-dashoffset] duration-[1600ms] group-hover:[stroke-dashoffset:0]"
                        />
                        <path
                          d={
                            [
                              "M0 80 Q60 75 100 60 T200 35 T300 10",

                              "M0 70 L50 66 L100 50 L150 52 L200 30 L250 26 L300 12",

                              "M0 85 C80 85 120 50 170 45 S260 20 300 18",
                            ][i]
                          }
                          fill="none"
                          stroke="#132B45"
                          strokeOpacity=".12"
                          strokeWidth="1.5"
                        />
                      </svg>
                      <span className="eyebrow absolute end-0 bottom-2 text-slate">
                        {ar ? "خط الأساس ← مُتحقَّق" : "Baseline → Verified"}
                      </span>
                    </div>
                    <h3 className="text-2xl leading-snug font-medium">
                      {ar ? c.titleAr : c.title}
                    </h3>
                    <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                      <p className="text-sm text-slate">
                        {ar ? c.clientAr : c.client}
                      </p>
                      <span
                        aria-hidden
                        className="eyebrow shrink-0 text-gold-strong opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      >
                        {ar ? "اقرأ الحالة ←" : "Read the case →"}
                      </span>
                    </div>
                  </article>
                </Spotlight>
              </a>
            </Reveal>
          ))}
        </div>
      )}

      <div className="mt-px border border-line bg-ivory-2">
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 px-8 py-6 text-start transition hover:bg-ivory"
        >
          <span>
            <span className="eyebrow text-gold-strong">
              {ar ? "سجل المهام" : "Assignment ledger"}
            </span>
            <span className="ms-4 font-display text-2xl">
              {ar
                ? `عرض ${allRows.length} قيود`
                : `${allRows.length} entries shown`}
            </span>
          </span>
          <span
            className={`grid h-10 w-10 place-items-center rounded-full border border-navy transition-transform duration-500 ${
              open ? "rotate-45 bg-navy text-ivory" : ""
            }`}
          >
            +
          </span>
        </button>
        <div
          className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-8 pb-4">
              {sectorOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setSec(s)}
                  className={`shrink-0 border px-3 py-1.5 text-xs tracking-wide transition ${
                    sec === s
                      ? "border-navy bg-navy text-ivory"
                      : "border-line bg-ivory hover:border-navy"
                  }`}
                >
                  {sLabel(s)}
                </button>
              ))}
            </div>
            {assignments.live && assignments.total === 0 ? (
              <div className="px-8 pb-8">
                <EmptyState
                  eyebrow={ar ? "لا مهام منشورة" : "No assignments published"}
                  title={
                    ar ? "السجل فارغ حاليًا." : "The ledger is empty right now."
                  }
                  body={
                    ar
                      ? "انشر المهام من لوحة التحكم وستظهر هنا تلقائيًا."
                      : "Publish assignments in the dashboard and they appear here automatically."
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto px-8 pb-8">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="eyebrow text-slate">
                      {(ar
                        ? ["السنة", "المهمة", "العميل", "البلد", "الحجم"]
                        : ["Year", "Assignment", "Client", "Country", "Size"]
                      )

                        .map((h) => (
                          <th key={h} className="py-3 text-start font-medium">
                            {h}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.title}
                        className="border-t border-line transition hover:bg-ivory"
                      >
                        <td className="py-3 pe-4 font-display text-lg text-gold-strong">
                          {r.y}
                        </td>
                        <td className="py-3 pe-4">
                          {r.href ? (
                            <a href={r.href} className="hover:text-gold-strong">
                              {ar ? r.titleAr : r.title}
                            </a>
                          ) : (
                            <p>{ar ? r.titleAr : r.title}</p>
                          )}
                          <p className="text-xs text-slate">
                            {sLabel(r.sector)}
                          </p>
                        </td>
                        <td className="py-3 pe-4 text-navy-2">
                          {ar ? r.clientAr : r.client}
                        </td>
                        <td className="py-3 pe-4 text-slate">
                          {ar ? r.geoAr : r.geo}
                        </td>
                        <td className="py-3 text-slate">{r.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
