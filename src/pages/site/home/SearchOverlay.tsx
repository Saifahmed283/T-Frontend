import { useEffect, useMemo, useRef, useState } from "react"

import { Dialog } from "@/components/ui"

import { audiences, cases } from "@/content/data"

import { PAGES } from "@/content/pages"

import { columnLabelAr, localizedPage } from "@/content/pages.i18n"

import { pathForSection } from "@/lib/routes"

import {
  mapAudience,
  mapCase,
  mapCourse,
  mapInstrument,
  mapLedgerRow,
  mapPublication,
  usePublicCollection,
} from "@/lib/publicContent"

import { ledger } from "./Evidence"

import { library } from "./Knowledge"

import type { Lang } from "../types"

const typeAr: Record<string, string> = {
  "Policy brief": "موجز سياسات",

  "Working paper": "ورقة عمل",

  "Practice note": "ملاحظة تطبيقية",

  Podcast: "بودكاست",

  Toolkit: "حزمة أدوات",
}

// Global search: reaches every content type

export function SearchOverlay({
  onClose,

  lang,
}: {
  onClose: () => void

  lang: Lang
}) {
  const ar = lang === "ar"

  const [q, setQ] = useState("")

  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  /* The overlay reads six CMS collections once per open. `pollMs: 0` avoids a
     timer for a surface that closes in seconds; the shared cache covers repeat
     opens. */

  const audienceFeed = usePublicCollection("audiences", {
    pageSize: 20,

    pollMs: 0,
  })

  const caseFeed = usePublicCollection("cases", { pageSize: 50, pollMs: 0 })

  const assignmentFeed = usePublicCollection("assignments", {
    pageSize: 100,

    pollMs: 0,
  })

  const publicationFeed = usePublicCollection("publications", {
    pageSize: 100,

    pollMs: 0,
  })

  const instrumentFeed = usePublicCollection("instruments", {
    pageSize: 100,

    pollMs: 0,
  })

  const courseFeed = usePublicCollection("courses", { pageSize: 50, pollMs: 0 })

  const all = useMemo(() => {
    /* Each collection upgrades to the CMS independently: a live feed replaces
         its static rows, an unavailable one keeps the prerendered fallback. */

    const audienceRows =
      audienceFeed.live && audienceFeed.items.length
        ? audienceFeed.items

            .map(mapAudience)

            .sort((a, b) => a.order - b.order)

            .map((a) => ({
              type: ar ? "جمهور" : "Audience",

              title: ar ? a.ar : a.label,

              href: `/hub/${a.slug}`,
            }))
        : audiences.map((a) => ({
            type: ar ? "جمهور" : "Audience",

            title: ar ? a.ar : a.label,

            href: `/hub/${a.slug}`,
          }))

    const caseRows =
      caseFeed.live && caseFeed.items.length
        ? caseFeed.items.map(mapCase).map((c) => ({
            type: ar ? "حالة" : "Case",

            title: ar ? c.titleAr : c.title,

            href: c.href,
          }))
        : cases.map((c) => ({
            type: ar ? "حالة" : "Case",

            title: ar ? c.titleAr : c.title,

            href: pathForSection("evidence"),
          }))

    const ledgerRows =
      assignmentFeed.live && assignmentFeed.items.length
        ? assignmentFeed.items.map(mapLedgerRow).map((c) => ({
            type: ar ? "سجل" : "Ledger",

            title: ar ? c.titleAr : c.title,

            href: c.href,
          }))
        : ledger.map((c) => ({
            type: ar ? "سجل" : "Ledger",

            title: ar ? c.titleAr : c.title,

            href: pathForSection("evidence"),
          }))

    const publicationRows = publicationFeed.live
      ? publicationFeed.items.map(mapPublication).map((k) => ({
          type: k.type,

          typeAr: k.typeAr,

          title: k.title,

          titleAr: k.titleAr,

          href: k.href,
        }))
      : library

          .filter((k) => k.type !== "Toolkit")

          .map((k) => ({ ...k, href: pathForSection("knowledge") }))

    const instrumentRows = instrumentFeed.live
      ? instrumentFeed.items.map(mapInstrument).map((k) => ({
          type: k.type,

          typeAr: k.typeAr,

          title: k.title,

          titleAr: k.titleAr,

          href: k.href,
        }))
      : library

          .filter((k) => k.type === "Toolkit")

          .map((k) => ({ ...k, href: pathForSection("knowledge") }))

    const seen = new Set<string>()

    const libraryRows = [...publicationRows, ...instrumentRows]

      .filter((k) => {
        if (seen.has(k.title)) return false

        seen.add(k.title)

        return true
      })

      .map((k) => ({
        type: ar ? (k.typeAr ?? typeAr[k.type] ?? k.type) : k.type,

        title: ar ? (k.titleAr ?? k.title) : k.title,

        href: k.href,
      }))

    const courseRows =
      courseFeed.live && courseFeed.items.length
        ? courseFeed.items.map(mapCourse).map((c) => ({
            type: ar ? "دورة" : "Course",

            title: ar ? c.titleAr : c.title,

            href: c.href,
          }))
        : []

    return [
      ...audienceRows,

      ...caseRows,

      ...ledgerRows,

      ...libraryRows,

      ...courseRows,

      ...PAGES.map((p) => ({
        type: ar ? (columnLabelAr[p.column] ?? p.column) : p.column,

        title: ar ? localizedPage(p, "ar").title : p.title,

        href: p.path,
      })),
    ]
  }, [
    ar,

    audienceFeed,

    caseFeed,

    assignmentFeed,

    publicationFeed,

    instrumentFeed,

    courseFeed,
  ])

  const res = q.trim()
    ? all.filter((r) =>
        (r.title + r.type).toLowerCase().includes(q.toLowerCase()),
      )
    : []

  return (
    <Dialog
      open
      onClose={onClose}
      onBackdropClick={onClose}
      labelledBy="search-overlay-title"
      className="bg-navy-3/70 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in mx-auto mt-[10vh] w-[min(760px,92vw)] bg-ivory shadow-2xl"
      >
        <h2 id="search-overlay-title" className="sr-only">
          {ar ? "بحث" : "Search"}
        </h2>
        <div className="flex items-center gap-4 border-b border-line px-6">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            ref={ref}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              ar
                ? "ابحث في الحالات والموجزات والدورات والجمهور…"
                : "Search cases, briefs, courses, audiences…"
            }
            className="w-full bg-transparent py-5 font-display text-2xl focus:outline-none"
          />
          <button onClick={onClose} className="eyebrow text-slate">
            Esc
          </button>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto">
          {res.map((r) => (
            <li key={r.type + r.title}>
              <a
                href={r.href}
                onClick={onClose}
                className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-ivory-2"
              >
                <span>{r.title}</span>
                <span className="eyebrow shrink-0 text-gold-strong">
                  {r.type}
                </span>
              </a>
            </li>
          ))}
          {q.trim() && !res.length && (
            <li className="px-6 py-8 text-slate">
              {ar
                ? `لا نتائج لـ"${q}". جرّب أحد مراكز الجمهور:`
                : `No results for "${q}". Try one of the audience hubs:`}
              <div className="mt-4 flex flex-wrap gap-2">
                {audiences.slice(0, 4).map((a) => (
                  <a
                    key={a.slug}
                    href={`/hub/${a.slug}`}
                    onClick={onClose}
                    className="border border-line px-3 py-1.5 text-sm hover:border-navy"
                  >
                    {ar ? a.ar : a.label}
                  </a>
                ))}
              </div>
            </li>
          )}
          {!q.trim() && (
            <li className="eyebrow px-6 py-6 text-slate">
              {ar
                ? "يشمل البحث كل أنواع المحتوى في الموقع"
                : "Search reaches every content type on the site"}
            </li>
          )}
        </ul>
      </div>
    </Dialog>
  )
}
