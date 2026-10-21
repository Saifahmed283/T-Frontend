import { useState } from "react"

import { knowledge } from "@/content/data"

import { Contours } from "@/components/motion/fx"

import { Head } from "./Head"

import {
  RequestDialog,
  type RequestConfig,
} from "@/pages/site/components/RequestDialog"

import type { Lang } from "../types"

// Knowledge: mixed types, type + language named, free toolkit folded in

export const library = [
  ...knowledge.map((k) => ({ ...k, free: false })),

  {
    type: "Toolkit",

    typeAr: "حزمة أدوات",

    lang: "AR/EN",

    title: "LED diagnostic toolkit — open licence",

    titleAr: "حزمة تشخيص التنمية الاقتصادية المحلية — رخصة مفتوحة",

    meta: "PDF · 32 pp",

    metaAr: "PDF · 32 ص",

    free: true,
  },

  {
    type: "Toolkit",

    typeAr: "حزمة أدوات",

    lang: "EN",

    title: "Mandate note template",

    titleAr: "قالب مذكرة التفويض",

    meta: "DOCX · 4 pp",

    metaAr: "DOCX · 4 ص",

    free: true,
  },
]

const typeAr: Record<string, string> = {
  All: "الكل",

  "Policy brief": "موجز سياسات",

  "Working paper": "ورقة عمل",

  "Practice note": "ملاحظة تطبيقية",

  Podcast: "بودكاست",

  Toolkit: "حزمة أدوات",
}

export function Knowledge({ lang }: { lang: Lang }) {
  const ar = lang === "ar"

  const types = ["All", ...new Set(library.map((k) => k.type))]

  const [f, setF] = useState("All")

  const [lang2, setLang2] = useState<"All" | "AR" | "EN">("All")

  const list = library.filter(
    (k) =>
      (f === "All" || k.type === f) &&
      (lang2 === "All" || k.lang.includes(lang2)),
  )

  const [hover, setHover] = useState(0)

  const [req, setReq] = useState<RequestConfig | null>(null)

  const feat = list[hover] ?? list[0]

  const typeLabel = (k: typeof library[number]) =>
    ar ? (k.typeAr ?? typeAr[k.type] ?? k.type) : k.type

  const titleShown = (k: typeof library[number]) =>
    ar ? (k.titleAr ?? k.title) : k.title

  const metaShown = (k: typeof library[number]) =>
    ar ? (k.metaAr ?? k.meta) : k.meta

  const requestFor = (k: typeof library[number]): RequestConfig => ({
    kind: "PUBLICATION_REQUEST",

    title: ar ? `طلب: ${titleShown(k)}` : `Request: ${k.title}`,

    context: { asset: k.title, free: k.free },

    submitLabel: ar
      ? k.free
        ? "أرسل رابط تحميل"
        : "اطلب نسخة"
      : k.free
        ? "Send a download link"
        : "Request a copy",
  })

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10">
        <Head
          id="knowledge"
          n="04"
          eyebrow={ar ? "المعرفة" : "Knowledge"}
          title={
            ar
              ? "المكتبة — النوع واللغة مذكوران على كل عنصر."
              : "The library — type and language named on every item."
          }
        />
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setF(t)

                  setHover(0)
                }}
                className={`border px-4 py-2 text-xs tracking-cta uppercase transition ${
                  f === t
                    ? "border-navy bg-navy text-ivory"
                    : "border-line hover:border-navy"
                }`}
              >
                {ar ? (typeAr[t] ?? t) : t}
              </button>
            ))}
          </div>
          <div className="inline-flex border border-line p-0.5">
            {(["All", "AR", "EN"] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLang2(l)

                  setHover(0)
                }}
                className={`px-3 py-1.5 text-xs transition ${
                  lang2 === l
                    ? "bg-gold-light text-navy"
                    : "text-slate hover:text-navy"
                }`}
              >
                {l === "All" ? (ar ? "الكل" : "All") : l}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-10 lg:grid-split-wide">
          <ul className="divide-y divide-line border-y border-line">
            {list.map((k, i) => (
              <li key={k.title} onMouseEnter={() => setHover(i)}>
                <button
                  type="button"
                  onClick={() => setReq(requestFor(k))}
                  className={`group grid w-full cursor-pointer items-center gap-3 py-6 text-start transition-colors md:grid-list md:px-4 ${
                    i === hover ? "bg-ivory-2" : ""
                  }`}
                >
                  <span className="eyebrow text-gold-strong">
                    {typeLabel(k)} · <span className="text-navy">{k.lang}</span>
                    {k.free && (
                      <span className="ms-2 bg-ok px-1.5 py-0.5 text-ivory">
                        {ar ? "مجاني" : "Free"}
                      </span>
                    )}
                  </span>
                  <span
                    dir={k.lang === "AR" ? "rtl" : undefined}
                    className="font-display text-2xl font-medium transition-transform duration-500 group-hover:translate-x-2 rtl:group-hover:-translate-x-2"
                  >
                    {titleShown(k)}
                  </span>
                  <span className="hidden text-end transition-transform group-hover:-translate-y-0.5 md:block">
                    ↗
                  </span>
                </button>
              </li>
            ))}
            {!list.length && (
              <li className="py-10 text-center text-slate">
                {ar
                  ? "لا يوجد شيء في هذا المزيج بعد — جرّب لغة أخرى."
                  : "Nothing in this combination yet — try another language."}
              </li>
            )}
          </ul>
          {feat && (
            <aside className="relative hidden overflow-hidden bg-navy p-8 text-ivory lg:flex lg:flex-col">
              <Contours
                className="absolute inset-0 h-full w-full"
                opacity={0.1}
              />
              <p className="eyebrow relative text-gold-light">
                {typeLabel(feat)} · {feat.lang}
              </p>
              <p
                key={feat.title}
                dir={feat.lang === "AR" ? "rtl" : undefined}
                className="animate-fade-up relative mt-6 font-display text-3xl leading-snug"
              >
                {titleShown(feat)}
              </p>
              <p className="relative mt-auto pt-10 text-sm text-ivory/60">
                {metaShown(feat)}
              </p>
              <button
                type="button"
                onClick={() => setReq(requestFor(feat))}
                className="eyebrow relative mt-4 self-start cursor-pointer border-b border-gold-light pb-1"
              >
                {ar
                  ? feat.free
                    ? "حمّل مجانًا ←"
                    : "اقرأ ←"
                  : feat.free
                    ? "Download free →"
                    : "Read →"}
              </button>
            </aside>
          )}
        </div>
      </div>
      <RequestDialog request={req} onClose={() => setReq(null)} />
    </section>
  )
}
