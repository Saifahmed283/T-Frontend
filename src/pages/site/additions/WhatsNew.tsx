import { useEffect, useRef, useState } from "react"

import { SplitText } from "@/components/motion/fx"

import { Dialog } from "@/components/ui"

import { api, type SubmissionKind } from "@/lib/api"
import {
  validateEmail,
  validateOptionalEmail,
  validateTerms,
} from "@/lib/validation"
import { useFormValidation } from "@/lib/useFormValidation"
import { MARKETING_LISTS, type MarketingList } from "@/content/marketing-consent"

import { img } from "./shared"

import type { Lang } from "../types"

// What's new: swipeable picture banner → description, likes, four actions

const news = [
  {
    id: "photo-1737816149139-ccdb2ce50715",

    tag: "Initiative",

    tagAr: "مبادرة",

    title: "Main Street Assiut — a living market pilot",

    titleAr: "الشارع الرئيسي بأسيوط — مشروع سوق حيّ",

    body: "We are reshaping one street into a working model of local economic development: vendors, municipality and residents designing the place together over twelve weeks.",

    bodyAr:
      "نُعيد تشكيل شارع واحد ليصبح نموذجًا عمليًا للتنمية الاقتصادية المحلية: الباعة والبلدية والسكان يصمّمون المكان معًا على مدى اثني عشر أسبوعًا.",

    date: "Oct 2026",

    dateAr: "أكتوبر 2026",

    likes: 128,
  },

  {
    id: "photo-1699197671498-ab6931ccce96",

    tag: "TerraMorph Learning",

    tagAr: "تعلّم TerraMorph",

    title: "Train-the-trainer cohort 04 opens",

    titleAr: "انطلاق الدفعة 04 من تدريب المدربين",

    body: "Twenty seats for practitioners who want to carry the G0–G7 method into their own institutions. Certification on completion.",

    bodyAr:
      "عشرون مقعدًا للممارسين الذين يرغبون في نقل منهج G0–G7 إلى مؤسساتهم. شهادة عند الإتمام.",

    date: "Nov 2026",

    dateAr: "نوفمبر 2026",

    likes: 86,
  },

  {
    id: "photo-1731024677293-2ca0c03bbf13",

    tag: "Research",

    tagAr: "بحث",

    title: "Heritage as an economic asset — field study",

    titleAr: "التراث كأصل اقتصادي — دراسة ميدانية",

    body: "A six-month study on how heritage sites can anchor local jobs without displacing the people who live beside them.",

    bodyAr:
      "دراسة على مدى ستة أشهر حول كيف يمكن للمواقع التراثية أن تُثبّت وظائف محلية دون تهجير من يعيشون بجوارها.",

    date: "Sep 2026",

    dateAr: "سبتمبر 2026",

    likes: 204,

    aiGenerated: true,
  },

  {
    id: "photo-1709234052084-750ab82a0f26",

    tag: "Tender",

    tagAr: "مناقصة",

    title: "Urban mobility diagnostic — expressions of interest",

    titleAr: "تشخيص التنقل الحضري — إبداء الاهتمام",

    body: "We are teaming for a regional urban mobility diagnostic and seeking transport economists and GIS specialists.",

    bodyAr:
      "نتحالف من أجل تشخيص إقليمي للتنقل الحضري ونبحث عن خبراء اقتصاديات النقل ومتخصصي نظم المعلومات الجغرافية.",

    date: "Closes 30 Oct",

    dateAr: "يُغلق 30 أكتوبر",

    likes: 41,
  },
]

type Action = {
  key: string

  kind: SubmissionKind

  action: string

  needsEmail: boolean

  label: string

  labelAr: string

  done: string

  doneAr: string
}

export function WhatsNew({ lang }: { lang: Lang }) {
  const ar = lang === "ar"

  const [i, setI] = useState(0)

  const [open, setOpen] = useState<number | null>(null)

  const [liked, setLiked] = useState<Record<number, boolean>>({})

  const [marketingConsent, setMarketingConsent] = useState<Record<MarketingList, boolean>>({
    newsletter: false,
    events: false,
    insights: false,
    careers: false,
  })

  const [toast, setToast] = useState<{
    text: string
  } | null>(null)

  const startX = useRef<number | null>(null)

  /* The email field is optional until the visitor picks an action that needs a
     reply. The ref is set before calling `form.submit()` so validation and the
     field's error state match the action that was actually chosen. */
  const requireEmail = useRef(false)

  const actionRef = useRef<Action | null>(null)

  const n = open !== null ? news[open] : null

  const form = useFormValidation({
    fields: {
      email: {
        initial: "",
        validate: (value) =>
          requireEmail.current
            ? validateEmail(value, lang)
            : validateOptionalEmail(value, lang),
      },
      terms: {
        initial: false,
        validate: (value) => validateTerms(value, lang),
      },
    },
    onSubmit: async (values) => {
      const action = actionRef.current
      if (!action) return

      const emailVal = String(values.email).trim()

      const selectedLists = Object.entries(marketingConsent)
        .filter(([, checked]) => checked)
        .map(([list]) => list)

      try {
        await api.submit({
          kind: action.kind,
          email: emailVal || undefined,
          source: "whatsnew",
          message: `What's new · ${n?.title ?? ""}`,
          payload: {
            action: action.action,
            itemId: n?.id,
            marketingConsent:
              selectedLists.length > 0 ? selectedLists : undefined,
          },
        })
      } catch {
        throw new Error(
          ar
            ? "تعذّر الإرسال — حاول لاحقًا"
            : "Could not send — please try again",
        )
      }

      setToast({ text: ar ? action.doneAr : action.done })

      setMarketingConsent({
        newsletter: false,
        events: false,
        insights: false,
        careers: false,
      })

      form.reset()

      // Record terms acceptance with backend (non-blocking)
      if (emailVal) {
        void api
          .termsAcceptanceRecord({
            email: emailVal,
            privacyVersion: "1.0",
            termsVersion: "1.0",
            source: "whatsnew",
          })
          .catch(() => {
            /* non-blocking */
          })
      }
    },
  })

  useEffect(() => {
    if (open !== null) return

    const t = setInterval(() => setI((x) => (x + 1) % news.length), 6000)

    return () => clearInterval(t)
  }, [open])

  const go = (d: number) => setI((x) => (x + d + news.length) % news.length)

  const actions: Action[] = [
    {
      key: "suggest",

      kind: "CONTRIBUTION",

      action: "suggest",

      needsEmail: false,

      label: "Suggest",

      labelAr: "اقترح",

      done: "Your suggestion has been noted",

      doneAr: "تم تسجيل اقتراحك",
    },

    {
      key: "join",

      kind: "CONTRIBUTION",

      action: "join",

      needsEmail: false,

      label: "Join the cause",

      labelAr: "انضم إلى القضية",

      done: "Welcome — you have joined the cause",

      doneAr: "مرحبًا — لقد انضممت إلى القضية",
    },

    {
      key: "reserve",

      kind: "SEAT_RESERVATION",

      action: "reserve",

      needsEmail: true,

      label: "Reserve a seat",

      labelAr: "احجز مقعدًا",

      done: "Seat reserved — check your inbox",

      doneAr: "تم حجز المقعد — تحقّق من بريدك",
    },

    {
      key: "contribute",

      kind: "CONTRIBUTION",

      action: "contribute",

      needsEmail: true,

      label: "Request a payment link",

      labelAr: "اطلب رابط دفع",

      done: "A partner will send you a secure link",

      doneAr: "سيرسل لك أحد الشركاء رابطًا آمنًا",
    },
  ]

  const runAction = (action: Action) => {
    requireEmail.current = action.needsEmail
    actionRef.current = action
    setToast(null)
    void form.submit()
  }

  return (
    <section
      id="new"
      className="mx-auto max-w-[1320px] scroll-mt-40 px-5 py-24 md:px-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-gold-strong">
            {ar ? "الجديد — ما نقوم به" : "What's new — what we're up to"}
          </p>
          <h2 className="mt-4 text-h2 font-medium">
            <SplitText
              text={ar ? "الكثير يحدث." : "A whole lot is happening."}
            />
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => go(-1)}
            aria-label={ar ? "السابق" : "Previous"}
            className="grid h-12 w-12 place-items-center border border-line transition hover:border-navy hover:bg-navy hover:text-ivory"
          >
            {ar ? "→" : "←"}
          </button>
          <button
            onClick={() => go(1)}
            aria-label={ar ? "التالي" : "Next"}
            className="grid h-12 w-12 place-items-center border border-line transition hover:border-navy hover:bg-navy hover:text-ivory"
          >
            {ar ? "←" : "→"}
          </button>
        </div>
      </div>
      <div
        className="relative mt-10 h-[min(70vh,560px)] touch-pan-y overflow-hidden bg-navy select-none"
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current === null) return

          const dx = e.clientX - startX.current

          startX.current = null

          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
        }}
      >
        {news.map((s, k) => (
          <button
            key={s.id}
            onClick={() => {
              form.reset()
              setToast(null)
              setOpen(k)
            }}
            aria-hidden={k !== i}
            tabIndex={k === i ? 0 : -1}
            className="absolute inset-0 text-start transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{
              opacity: k === i ? 1 : 0,

              transform: k === i ? "scale(1)" : "scale(1.06)",
            }}
          >
            <img
              src={img(s.id)}
              srcSet={`${img(s.id, 700)} 700w, ${img(s.id, 1000)} 1000w, ${img(s.id, 1400)} 1400w`}
              sizes="(max-width: 768px) calc(100vw - 40px), (max-width: 1280px) calc(100vw - 80px), 1240px"
              alt={ar ? s.titleAr : s.title}
              draggable={false}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-3 via-navy/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-ivory md:p-12">
              <p className="eyebrow text-gold-light">
                {ar ? s.tagAr : s.tag} · {ar ? s.dateAr : s.date}
              </p>
              <h3 className="mt-4 max-w-3xl text-h2 font-medium">
                {ar ? s.titleAr : s.title}
              </h3>
              <span className="eyebrow mt-6 inline-block border-b border-gold-light pb-1">
                {ar ? "افتح القصة ←" : "Open the story →"}
              </span>
            </div>
          </button>
        ))}
        <div className="absolute top-6 end-6 flex gap-2">
          {news.map((_, k) => (
            <span key={k} className="h-0.5 w-10 overflow-hidden bg-ivory/25">
              <span
                className="block h-full bg-gold-light"
                style={{
                  width: k === i ? "100%" : k < i ? "100%" : "0%",

                  transition:
                    k === i && open === null ? "width 6s linear" : "none",
                }}
              />
            </span>
          ))}
        </div>
      </div>

      {n && open !== null && (
        <Dialog
          open
          onClose={() => setOpen(null)}
          onBackdropClick={() => setOpen(null)}
          labelledBy={`whatsnew-title-${open}`}
          className="flex justify-end bg-navy-3/60 backdrop-blur-sm"
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-ivory animate-slide-in"
          >
            <div className="relative h-72 shrink-0 bg-navy">
              <img
                src={img(n.id, 900)}
                alt={ar ? n.titleAr : n.title}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <button
                onClick={() => setOpen(null)}
                aria-label={ar ? "إغلاق" : "Close"}
                className="absolute top-4 end-4 grid h-10 w-10 place-items-center bg-ivory text-navy"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-1 flex-col p-8">
              <p className="eyebrow text-gold-strong">
                {ar ? n.tagAr : n.tag} · {ar ? n.dateAr : n.date}
                {n.aiGenerated && (
                  <span className="ml-2 text-xs border border-line px-2 py-0.5 rounded text-navy-2 bg-ivory/30">
                    {ar ? "مساعدة بالذكاء الاصطناعي" : "AI-assisted"}
                  </span>
                )}
              </p>
              <h3
                id={`whatsnew-title-${open}`}
                className="mt-4 text-4xl leading-tight font-medium"
              >
                {ar ? n.titleAr : n.title}
              </h3>
              <p className="mt-5 text-lg leading-relaxed text-navy-2">
                {ar ? n.bodyAr : n.body}
              </p>
              <button
                onClick={() => setLiked({ ...liked, [open]: !liked[open] })}
                aria-pressed={!!liked[open]}
                className={`mt-8 inline-flex w-max items-center gap-3 border px-4 py-2 transition ${
                  liked[open]
                    ? "border-gold bg-gold/10 text-navy"
                    : "border-line hover:border-navy"
                }`}
              >
                <span
                  className={`transition-transform ${
                    liked[open] ? "scale-125 text-gold-strong" : ""
                  }`}
                >
                  {liked[open] ? "♥" : "♡"}
                </span>
                <span className="tabular-nums">
                  {n.likes + (liked[open] ? 1 : 0)}
                </span>{" "}
                {ar ? "أعجبهم هذا" : "people like this"}
              </button>
              <div className="mt-auto pt-6">
                <label className="block">
                  <span className="eyebrow text-slate">
                    {ar
                      ? "بريدك الإلكتروني (للرد)"
                      : "Your email (so we can reply)"}
                  </span>
                  <input
                    {...form.input("email")}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    className={`mt-2 w-full border-b bg-transparent py-2 text-sm focus:border-gold-strong focus:outline-none ${
                      form.error("email") ? "border-error" : "border-navy/20"
                    }`}
                  />
                  {form.error("email") && (
                    <p
                      id={form.errorId("email")}
                      role="alert"
                      className="mt-2 text-xs font-medium text-error"
                    >
                      {form.error("email")}
                    </p>
                  )}
                </label>

                <fieldset className="mt-6 border-t border-line pt-6">
                  <legend className="eyebrow text-slate mb-4">
                    {ar
                      ? "موافقة التسويق (اختياري)"
                      : "Marketing consent (optional)"}
                  </legend>
                  <p className="text-xs text-slate mb-4">
                    {ar
                      ? "اختر القوائم التي تريد الاشتراك بها. يمكنك إلغاء الاشتراك في أي وقت."
                      : "Choose which lists you'd like to join. Unsubscribe anytime."}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {MARKETING_LISTS.map((list: { value: MarketingList; label: string; description: string; labelAr?: string; descriptionAr?: string }) => (
                      <label
                        key={list.value}
                        className="flex items-start gap-3 p-3 border border-line rounded-lg hover:border-gold-light hover:bg-ivory transition cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={marketingConsent[list.value]}
                          onChange={(e) =>
                            setMarketingConsent((prev) => ({
                              ...prev,
                              [list.value]: e.target.checked,
                            }))
                          }
                          className="mt-1 h-4 w-4 shrink-0 rounded border-line text-gold-strong focus:ring-2 focus:ring-gold focus:ring-offset-2"
                        />
                        <div>
                          <span className="block font-medium text-sm text-navy">{ar ? list.labelAr : list.label}</span>
                          <p className="mt-0.5 text-xs text-slate">{ar ? list.descriptionAr : list.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="flex items-start gap-3 mt-5 border-t border-line pt-4">
                  <input
                    {...form.checkbox("terms")}
                    type="checkbox"
                    className={`mt-1 h-4 w-4 shrink-0 rounded text-gold-strong focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                      form.error("terms")
                        ? "border-error ring-1 ring-error"
                        : "border-line"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block font-medium text-sm text-navy">
                      {ar ? "أوافق على " : "I accept the "}
                      <a
                        href="/legal/privacy-policy"
                        className="underline decoration-gold underline-offset-2 hover:text-navy"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {ar ? "سياسة الخصوصية" : "Privacy Policy"}
                      </a>{" "}
                      {ar ? " و " : " and "}
                      <a
                        href="/legal/terms-of-service"
                        className="underline decoration-gold underline-offset-2 hover:text-navy"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {ar ? "شروط الخدمة" : "Terms of Service"}
                      </a>
                    </span>
                    <p className="mt-1 text-xs text-slate">
                      {ar ? "بإرسال هذا الطلب، أنت تقبل معالجة بياناتك وفقًا لسياسة الخصوصية." : "By submitting this request, you accept processing of your data per the Privacy Policy."}
                    </p>
                    {form.error("terms") && (
                      <p
                        id={form.errorId("terms")}
                        role="alert"
                        className="mt-2 text-xs font-medium text-error"
                      >
                        {form.error("terms")}
                      </p>
                    )}
                  </div>
                </label>

                <div className="mt-5 grid grid-cols-2 gap-px bg-line">
                  {actions.map((a, k) => (
                    <button
                      key={a.key}
                      onClick={() => runAction(a)}
                      disabled={form.isSubmitting}
                      aria-busy={(form.isSubmitting && actionRef.current?.key === a.key) || undefined}
                      className={`p-5 text-start transition disabled:opacity-60 ${
                        k === 1
                          ? "bg-navy text-ivory hover:bg-navy-2"
                          : "bg-ivory hover:bg-ivory-2"
                      }`}
                    >
                      <span
                        className={`eyebrow block ${
                          k === 1 ? "text-gold-light" : "text-gold-strong"
                        }`}
                      >
                        0{k + 1}
                      </span>
                      <span className="mt-2 block font-display text-xl">
                        {ar ? a.labelAr : a.label}
                      </span>
                    </button>
                  ))}
                </div>
                {form.submitError && (
                  <p role="alert" className="eyebrow mt-4 text-error">
                    ✕ {form.submitError}
                  </p>
                )}
                {toast && (
                  <p role="status" className="eyebrow mt-4 text-ok">
                    ✓ {toast.text}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </Dialog>
      )}
    </section>
  )
}
