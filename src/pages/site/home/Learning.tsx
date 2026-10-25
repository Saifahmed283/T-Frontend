import { useState } from "react"

import { Reveal } from "@/components/motion/fx"

import { EmptyState, LiveStatus } from "@/components/ui"

import { mapCourse, usePublicCollection } from "@/lib/publicContent"

import { Head } from "./Head"

import {
  RequestDialog,
  type RequestConfig,
} from "@/pages/site/components/RequestDialog"

import type { Lang } from "../types"

export type Course = {
  id: string
  title: string
  titleAr: string
  fmt: string
  fmtAr: string
  price: string
  priceAr: string
  seats: number
  startDate?: string | null
  booking?: string | null
}

function Learning({ lang }: { lang: Lang }) {
  const ar = lang === "ar"

  const [req, setReq] = useState<RequestConfig | null>(null)

  const { items, live, loading } = usePublicCollection("courses", {
    pageSize: 50,
  })

  const courses: Course[] = items.map(mapCourse)

  const courseRows = courses.map((p, i) => (
    <Reveal
      as="li"
      key={p.id}
      delay={i * 80}
      className="group flex flex-col gap-4 border border-line bg-ivory rounded-[7px] p-5 transition hover:bg-navy/5 hover:border-gold/30 sm:p-6 md:p-8"
    >
      <div>
        <p className="font-display text-xl font-medium text-navy sm:text-2xl">
          {ar ? p.titleAr : p.title}
        </p>
        <p className="mt-1 text-xs text-slate sm:text-sm">
          {ar ? p.fmtAr : p.fmt}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-6 sm:gap-4 sm:pt-8">
        <p className="text-base sm:text-lg">{ar ? p.priceAr : p.price}</p>
        {p.seats > 0 && (
          <p
            className={`text-xs ${
              p.seats < 5 ? "text-warn-strong" : "text-slate"
            }`}
          >
            {ar ? `متبقٍ ${p.seats} مقعد` : `${p.seats} seats left`}
          </p>
        )}
      </div>
      <button
        onClick={() =>
          setReq({
            kind: "SEAT_RESERVATION",
            title: ar
              ? `احجز مقعدًا — ${p.titleAr}`
              : `Reserve a seat — ${p.title}`,
            intro: `${ar ? p.fmtAr : p.fmt} · ${ar ? p.priceAr : p.price}`,
            context: {
              programme: p.title,
              date: p.startDate || "",
              format: p.fmt,
              price: p.price,
              seatsLeft: p.seats,
            },
            submitLabel: ar ? "أكّد الحجز" : "Confirm reservation",
          })
        }
        className="cursor-pointer justify-self-start border border-navy px-4 py-2.5 text-xs tracking-cta uppercase transition min-h-[44px] md:justify-self-end group-hover:bg-navy group-hover:text-ivory rtl:normal-case rtl:tracking-normal sm:px-5 sm:py-3"
      >
        {p.seats
          ? ar
            ? "احجز مقعدًا"
            : "Reserve seat"
          : ar
            ? "ابدأ الآن"
            : "Start now"}
      </button>
    </Reveal>
  ))

  return (
    <section id="learning" className="relative mx-auto container section-pad">
      <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-5 sm:py-16 md:px-10 md:py-24">
        <Head
          id="learning"
          n="05"
          eyebrow={ar ? "تعلّم TerraMorph" : "TerraMorph Learning"}
          title={
            ar
              ? "مستعد لمزيد من الدافع؟ اختر موعدًا."
              : "Ready to get more motivated? Pick a date."
          }
          aside={
            <p className="max-w-xs text-sm text-slate">
              {ar
                ? 'كل برنامج له سعر وموعد — لا "تواصل معنا للتفاصيل".'
                : 'Every programme carries a price and a date — no "contact us for details".'}
            </p>
          }
        />
        <LiveStatus
          message={
            loading
              ? ar
                ? "جارٍ تحميل الدورات."
                : "Loading courses."
              : live
                ? ar
                  ? "تُعرض الدورات الحية من مساحة المحتوى."
                  : "Showing live courses from the content workspace."
                : ar
                  ? "تعذّر تحميل الدورات."
                  : "The course catalogue could not be loaded."
          }
        />
        <ul className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:mt-12 md:grid-cols-3 md:gap-8">
          {loading &&
            [0, 1, 2].map((i) => (
              <li
                key={i}
                aria-hidden
                className="min-h-[220px] animate-pulse rounded-[7px] border border-line bg-ivory-2"
              />
            ))}
          {!loading && courses.length === 0 && (
            <li className="md:col-span-3">
              <EmptyState
                eyebrow={ar ? "لا دورات منشورة" : "No courses published"}
                title={
                  ar
                    ? "لا يوجد برنامج في التقويم بعد."
                    : "Nothing on the calendar yet."
                }
                body={
                  ar
                    ? "أضف الدورات في لوحة التحكم وستظهر هنا تلقائيًا مع السعر والموعد."
                    : "Add courses in the dashboard and they appear here automatically, with their price and date."
                }
                action={
                  live
                    ? {
                        label: ar ? "اطّلع على المنهج" : "Explore the method",
                        href: "/method",
                      }
                    : {
                        label: ar ? "تواصل معنا" : "Talk to us",
                        href: "/contact",
                      }
                }
              />
            </li>
          )}
          {courses.length > 0 && courseRows}
        </ul>
      </div>
      <RequestDialog request={req} onClose={() => setReq(null)} />
    </section>
  )
}

export { Learning }
