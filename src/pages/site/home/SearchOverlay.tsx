import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog } from "@/components/ui"
import { audiences, cases } from "@/content/data"
import { PAGES } from "@/content/pages"
import { columnLabelAr, localizedPage } from "@/content/pages.i18n"
import { pathForSection } from "@/lib/routes"
import { ledger } from "./Evidence"
import { library } from "./Knowledge"
import { programmes } from "./Learning"
import type { Lang } from "../types"

const typeAr: Record<string, string> = {
  "Policy brief": "موجز سياسات",
  "Working paper": "ورقة عمل",
  "Practice note": "ملاحظة تطبيقية",
  Podcast: "بودكاست",
  Toolkit: "حزمة أدوات",
}

/* ——— Global search (blueprint F1.3): reaches every content type ——— */
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
  const all = useMemo(
    () => [
      ...audiences.map((a) => ({
        type: ar ? "جمهور" : "Audience",
        title: ar ? a.ar : a.label,
        href: `/hub/${a.slug}`,
      })),
      ...cases.map((c) => ({
        type: ar ? "حالة" : "Case",
        title: ar ? c.titleAr : c.title,
        href: pathForSection("evidence"),
      })),
      ...ledger.map((c) => ({
        type: ar ? "سجل" : "Ledger",
        title: ar ? c.titleAr : c.title,
        href: pathForSection("evidence"),
      })),
      ...library.map((k) => ({
        type: ar ? (k.typeAr ?? typeAr[k.type] ?? k.type) : k.type,
        title: ar ? (k.titleAr ?? k.title) : k.title,
        href: pathForSection("knowledge"),
      })),
      ...programmes.map((p) => ({
        type: ar ? "دورة" : "Course",
        title: ar ? p.titleAr : p.title,
        href: pathForSection("learning"),
      })),
      ...PAGES.map((p) => ({
        type: ar ? (columnLabelAr[p.column] ?? p.column) : p.column,
        title: ar ? localizedPage(p, "ar").title : p.title,
        href: p.path,
      })),
    ],
    [ar],
  )
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
        className="mx-auto mt-[10vh] w-[min(760px,92vw)] bg-ivory shadow-2xl"
        style={{ animation: "fadeup .3s both" }}
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
