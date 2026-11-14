import { useState } from "react"

import { Contours } from "@/components/motion/fx"

import { Head } from "./Head"

import { api, type SubmissionKind } from "@/lib/api"

import {
  mapPartner,
  mapVacancy,
  usePublicCollection,
} from "@/lib/publicContent"

import { EmptyState } from "@/components/ui"

import {
  validateAtLeastOne,
  validateEmail,
  validateName,
  validateOptionalUrl,
  validateTerms,
} from "@/lib/validation"

import { useFormValidation } from "@/lib/useFormValidation"

import {
  RequestDialog,
  type RequestConfig,
} from "@/pages/site/components/RequestDialog"

import type { Lang } from "../types"

// Join: two doors (partners, experts) + careers, one place

const lists: Record<string, {
  title: string

  meta: string

  cta: string

  kind: SubmissionKind
}[]> = {
  "PR Partner": [
    {
      title: "Specialist sub-partner for LED & policy lots",

      meta: "Method + local reach + compliance file",

      cta: "Propose teaming",

      kind: "TEAM_PROPOSAL",
    },

    {
      title: "Capability statement — consultancies",

      meta: "PDF · v3.1 · Sep 2026",

      cta: "Download",

      kind: "PUBLICATION_REQUEST",
    },

    {
      title: "Compliance pack",

      meta: "Registration, tax ID, ISO 37001",

      cta: "Download",

      kind: "PUBLICATION_REQUEST",
    },
  ],

  Careers: [
    {
      title: "Senior policy analyst",

      meta: "Cairo · Full time",

      cta: "Apply",

      kind: "JOB_APPLICATION",
    },

    {
      title: "LED field coordinator",

      meta: "Assiut · 12 months",

      cta: "Apply",

      kind: "JOB_APPLICATION",
    },

    {
      title: "Research intern (AAST)",

      meta: "Alexandria · 6 months",

      cta: "Apply",

      kind: "JOB_APPLICATION",
    },
  ],
}

const listLabel: Record<string, string> = {
  "Expert network": "شبكة الخبراء",

  "PR Partner": "شريك علاقات عامة",

  Careers: "الوظائف",
}

const listsAr: Record<string, {
  title: string

  meta: string

  cta: string
}[]> = {
  "PR Partner": [
    {
      title: "شريك متخصص من الباطن لمكوّنات التنمية الاقتصادية والسياسات",

      meta: "المنهج + الانتشار المحلي + ملف الامتثال",

      cta: "اقترح شراكة",
    },

    {
      title: "بيان القدرات — للاستشاريين",

      meta: "PDF · الإصدار 3.1 · سبتمبر 2026",

      cta: "حمّل",
    },

    {
      title: "حزمة الامتثال",

      meta: "التسجيل، الرقم الضريبي، ISO 37001",

      cta: "حمّل",
    },
  ],

  Careers: [
    { title: "محلّل سياسات أول", meta: "القاهرة · دوام كامل", cta: "تقدّم" },

    {
      title: "منسّق ميداني للتنمية الاقتصادية المحلية",

      meta: "أسيوط · 12 شهرًا",

      cta: "تقدّم",
    },

    { title: "متدرب بحثي (AAST)", meta: "الإسكندرية · 6 أشهر", cta: "تقدّم" },
  ],
}

/* A single row shape for both the static fallback and live CMS rows, so the tab
   renderer never has to care which source is on screen. */

type JoinRow = {
  title: string

  titleAr: string

  meta: string

  metaAr: string

  cta: string

  ctaAr: string

  kind: SubmissionKind
}

const partnerCta = { en: "Propose teaming", ar: "اقترح شراكة" }

const vacancyCta = { en: "Apply", ar: "تقدّم" }

const areas = [
  "Local economic development",

  "Policy",

  "TVET & skills",

  "Investment climate",

  "Social enterprise",

  "Public finance",

  "GIS & data",
]

const areasAr = [
  "التنمية الاقتصادية المحلية",

  "السياسات",

  "التعليم الفني والمهارات",

  "مناخ الاستثمار",

  "المشروعات الاجتماعية",

  "المالية العامة",

  "نظم المعلومات الجغرافية والبيانات",
]

export function Join({ lang }: { lang: Lang }) {
  const ar = lang === "ar"

  const tabs = ["Expert network", ...Object.keys(lists)]

  const [tab, setTab] = useState("Expert network")

  /* Partners back the "PR Partner" tab and vacancies back "Careers"; each
     collection replaces its static list only when the public API answers. */

  const partners = usePublicCollection("partners", { pageSize: 50 })

  const vacancies = usePublicCollection("vacancies", { pageSize: 50 })

  const liveRows: Record<string, JoinRow[]> = {
    "PR Partner": partners.live
      ? partners.items.map((item) => {
          const p = mapPartner(item)

          return {
            title: p.title,

            titleAr: p.titleAr,

            meta: p.sectors || p.description,

            metaAr: p.sectors || p.descriptionAr,

            cta: partnerCta.en,

            ctaAr: partnerCta.ar,

            kind: "TEAM_PROPOSAL" as SubmissionKind,
          }
        })
      : [],

    Careers: vacancies.live
      ? vacancies.items.map((item) => {
          const v = mapVacancy(item)

          return {
            title: v.title,

            titleAr: v.titleAr,

            meta: v.meta,

            metaAr: v.metaAr,

            cta: vacancyCta.en,

            ctaAr: vacancyCta.ar,

            kind: "JOB_APPLICATION" as SubmissionKind,
          }
        })
      : [],
  }

  const staticRows = (key: string): JoinRow[] =>
    (lists[key] ?? []).map((row, i) => ({
      title: row.title,

      titleAr: listsAr[key]?.[i]?.title ?? row.title,

      meta: row.meta,

      metaAr: listsAr[key]?.[i]?.meta ?? row.meta,

      cta: row.cta,

      ctaAr: listsAr[key]?.[i]?.cta ?? row.cta,

      kind: row.kind,
    }))

  const cmsBacked = tab === "PR Partner" || tab === "Careers"

  const tabLive =
    cmsBacked && (tab === "PR Partner" ? partners.live : vacancies.live)

  const live = liveRows[tab] ?? []

  const rows: JoinRow[] = !cmsBacked
    ? []
    : live.length
      ? live
      : tabLive
        ? []
        : staticRows(tab)

  const [step, setStep] = useState(0)

  const steps = ar
    ? ["الملف", "الخبرة", "السيرة", "الحالة"]
    : ["Profile", "Expertise", "CV", "Status"]

  const [cvName, setCvName] = useState("")

  const [cvErr, setCvErr] = useState("")

  const [req, setReq] = useState<RequestConfig | null>(null)

  const areasShown = ar ? areasAr : areas

  const form = useFormValidation({
    fields: {
      name: {
        initial: "",

        validate: (value) => validateName(value, lang),
      },

      email: {
        initial: "",

        validate: (value) => validateEmail(value, lang),
      },

      location: {
        initial: "",
      },

      linkedin: {
        initial: "",

        validate: (value) => validateOptionalUrl(value, lang),
      },

      areas: {
        initial: [] as string[],

        validate: (value) => validateAtLeastOne(value, lang),
      },

      terms: {
        initial: false,

        validate: (value) => validateTerms(value, lang),
      },
    },

    onSubmit: async (values) => {
      const emailVal = String(values.email).trim()

      const nameVal = String(values.name).trim()

      const linkedinVal = String(values.linkedin).trim()

      await api.submit({
        kind: "EXPERT_REGISTRATION",

        email: emailVal,

        name: nameVal || undefined,

        source: "site",

        payload: {
          location: String(values.location).trim() || undefined,

          linkedin: linkedinVal || undefined,

          areas: values.areas as string[] ?? [],

          ...(cvName ? { cvFileName: cvName } : {}),
        },
      })

      setStep(3)

      // Record terms acceptance with backend (non-blocking)

      void api

        .termsAcceptanceRecord({
          email: emailVal,

          privacyVersion: "1.0",

          termsVersion: "1.0",

          source: "join",
        })

        .catch(() => {
          /* terms acceptance recording should not block form submission */
        })
    },
  })

  const selectedAreas = form.values.areas as string[] ?? []

  const toggleArea = (a: string) =>
    form.setValue(
      "areas",

      selectedAreas.includes(a)
        ? selectedAreas.filter((x) => x !== a)
        : [...selectedAreas, a],
    )

  const MAX_CV_BYTES = 10 * 1024 * 1024

  const onCvChange = (f: File | undefined) => {
    setCvErr("")

    if (!f) {
      setCvName("")

      return
    }

    if (!/\.(pdf|docx?)$/i.test(f.name)) {
      setCvErr(
        ar
          ? "يرجى اختيار ملف PDF أو DOCX."
          : "Please choose a PDF or DOCX file.",
      )

      setCvName("")

      return
    }

    if (f.size > MAX_CV_BYTES) {
      setCvErr(
        ar ? "الملف أكبر من 10 ميغابايت." : "That file is larger than 10 MB.",
      )

      setCvName("")

      return
    }

    setCvName(f.name)
  }

  /** Validate the fields owned by `step` before moving forward. */

  const advance = () => {
    if (step === 0) {
      for (const field of ["name", "email", "linkedin", "terms"]) {
        form.markTouched(field)
      }

      if (
        form.rawError("name") ||
        form.rawError("email") ||
        form.rawError("linkedin") ||
        form.rawError("terms")
      ) {
        return
      }
    }

    if (step === 1) {
      form.markTouched("areas")

      if (form.rawError("areas")) return
    }

    if (step === 2) {
      if (cvErr) return

      void form.submit()

      return
    }

    setStep(step + 1)
  }

  const startOver = () => {
    setStep(0)

    form.reset()

    setCvName("")

    setCvErr("")
  }

  return (
    <section
      id="join-board"
      className="relative scroll-mt-40 overflow-hidden bg-navy text-ivory"
    >
      <Contours className="absolute inset-0 h-full w-full" opacity={0.08} />
      <div className="relative mx-auto max-w-[1320px] px-5 py-24 md:px-10">
        <Head
          dark
          n="07"
          eyebrow={ar ? "انضم" : "Join"}
          title={
            ar
              ? "خبراء وشركاء وأفراد — باب واحد لكلٍّ."
              : "Experts, partners and people — one door each."
          }
        />
        <div className="no-scrollbar mt-10 flex gap-1 overflow-x-auto border-b border-ivory/15">
          {tabs.map((x) => (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={`relative shrink-0 px-5 py-4 text-sm transition ${
                tab === x ? "text-ivory" : "text-ivory/65 hover:text-ivory"
              }`}
            >
              {ar ? listLabel[x] : x}
              {tab === x && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold-light" />
              )}
            </button>
          ))}
        </div>
        {tab === "Expert network" ? (
          <div className="mt-10 grid gap-10 lg:grid-split-tall">
            <div>
              <p className="max-w-sm text-ivory/70">
                {ar
                  ? "سجّل مرة واحدة. تابع حالتك في كل خطوة. طابِق مهامًا قائمة — لا رفع سيرة ذاتية بلا نهاية."
                  : "Register once. See your status at every step. Get matched to live assignments — never a dead-end CV upload."}
              </p>
              <ol className="mt-8 flex gap-2">
                {steps.map((s, k) => (
                  <li key={s} className="flex-1">
                    <div className="h-0.5 bg-ivory/15">
                      <div
                        className="h-full bg-gold-light transition-all duration-700"
                        style={{ width: k <= step ? "100%" : "0%" }}
                      />
                    </div>
                    <p
                      className={`eyebrow mt-3 ${
                        k <= step ? "text-gold-light" : "text-ivory/65"
                      }`}
                    >
                      {s}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="border border-ivory/15 bg-navy-3/60 p-8">
              {step < 3 ? (
                <>
                  <p className="font-display text-3xl">
                    {
                      (ar
                        ? [
                            "من أنت؟",

                            "ما الذي تعرفه بعمق؟",

                            "ارفع سيرتك الذاتية",
                          ]
                        : [
                            "Who are you?",

                            "What do you know deeply?",

                            "Upload your CV",
                          ])[step]
                    }
                  </p>
                  <div className="mt-6 space-y-4">
                    {step === 0 && (
                      <>
                        <input
                          {...form.input("name")}
                          autoComplete="name"
                          placeholder={ar ? "الاسم الكامل" : "Full name"}
                          className={`w-full border-b bg-transparent py-3 placeholder:text-ivory/30 focus:border-gold-light focus:outline-none ${
                            form.error("name")
                              ? "border-error-light"
                              : "border-ivory/20"
                          }`}
                        />
                        {form.error("name") && (
                          <p
                            id={form.errorId("name")}
                            role="alert"
                            className="eyebrow mt-1 text-error-light"
                          >
                            {form.error("name")}
                          </p>
                        )}
                        <input
                          {...form.input("email")}
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          placeholder="you@example.com"
                          className={`w-full border-b bg-transparent py-3 placeholder:text-ivory/30 focus:border-gold-light focus:outline-none ${
                            form.error("email")
                              ? "border-error-light"
                              : "border-ivory/20"
                          }`}
                        />
                        {form.error("email") && (
                          <p
                            id={form.errorId("email")}
                            role="alert"
                            className="eyebrow mt-1 text-error-light"
                          >
                            {form.error("email")}
                          </p>
                        )}
                        <input
                          {...form.input("location")}
                          autoComplete="address-level2"
                          placeholder={
                            ar ? "الدولة · المدينة" : "Country · city"
                          }
                          className="w-full border-b border-ivory/20 bg-transparent py-3 placeholder:text-ivory/30 focus:border-gold-light focus:outline-none"
                        />
                        <input
                          {...form.input("linkedin")}
                          type="url"
                          inputMode="url"
                          autoComplete="url"
                          placeholder={ar ? "رابط LinkedIn" : "LinkedIn URL"}
                          className={`w-full border-b bg-transparent py-3 placeholder:text-ivory/30 focus:border-gold-light focus:outline-none ${
                            form.error("linkedin")
                              ? "border-error-light"
                              : "border-ivory/20"
                          }`}
                        />
                        {form.error("linkedin") && (
                          <p
                            id={form.errorId("linkedin")}
                            role="alert"
                            className="eyebrow mt-1 text-error-light"
                          >
                            {form.error("linkedin")}
                          </p>
                        )}
                        <label className="flex items-start gap-3 mt-4 border-t border-ivory/10 pt-4">
                          <input
                            {...form.checkbox("terms")}
                            type="checkbox"
                            className={`mt-1 h-4 w-4 shrink-0 rounded text-gold-light focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                              form.error("terms")
                                ? "border-error-light ring-1 ring-error-light"
                                : "border-ivory/30"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="block text-sm text-ivory/80">
                              {ar ? "أوافق على " : "I accept the "}
                              <a
                                href="/legal/privacy-policy"
                                className="underline decoration-gold-light underline-offset-2 hover:text-ivory"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {ar ? "سياسة الخصوصية" : "Privacy Policy"}
                              </a>{" "}
                              {ar ? " و " : " and "}
                              <a
                                href="/legal/terms-of-service"
                                className="underline decoration-gold-light underline-offset-2 hover:text-ivory"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {ar ? "شروط الخدمة" : "Terms of Service"}
                              </a>
                            </span>
                            <p className="mt-1 text-xs text-ivory/50">
                              {ar
                                ? "بإرسال هذا النموذج، أنت تقبل معالجة بياناتك وفقًا لسياسة الخصوصية."
                                : "By submitting this form, you accept processing of your data per the Privacy Policy."}
                            </p>
                            {form.error("terms") && (
                              <p
                                id={form.errorId("terms")}
                                role="alert"
                                className="mt-2 text-xs font-medium text-error-light"
                              >
                                {form.error("terms")}
                              </p>
                            )}
                          </div>
                        </label>
                      </>
                    )}
                    {step === 1 && (
                      <div>
                        <div className="flex flex-wrap gap-2">
                          {areasShown.map((a, k) => (
                            <label
                              key={a}
                              className={`cursor-pointer border px-3 py-2 text-sm transition ${
                                selectedAreas.includes(areas[k])
                                  ? "border-gold-light bg-gold-light text-navy"
                                  : "border-ivory/20"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedAreas.includes(areas[k])}
                                onChange={() => toggleArea(areas[k])}
                                onBlur={() => form.markTouched("areas")}
                                className="sr-only"
                              />
                              {a}
                            </label>
                          ))}
                        </div>
                        {form.error("areas") && (
                          <p
                            id={form.errorId("areas")}
                            role="alert"
                            className="eyebrow mt-3 text-error-light"
                          >
                            {form.error("areas")}
                          </p>
                        )}
                      </div>
                    )}
                    {step === 2 && (
                      <div>
                        <label className="grid h-36 cursor-pointer place-items-center border border-dashed border-ivory/30 text-ivory/60 transition hover:border-gold-light">
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.doc,.docx,application/pdf"
                            onChange={(e) => onCvChange(e.target.files?.[0])}
                          />
                          {cvName
                            ? cvName
                            : ar
                              ? "أفلت سيرتك الذاتية أو انقر للتصفّح (PDF، DOCX)"
                              : "Drop your CV or click to browse (PDF, DOCX)"}
                        </label>
                        <p className="mt-3 text-xs text-ivory/50">
                          {ar
                            ? "الملف نفسه يُطلب بأمان أثناء المراجعة — لا يُخزَّن هنا."
                            : "The file itself is requested securely during review — it is not stored here."}
                        </p>
                        {cvErr && (
                          <p
                            role="alert"
                            className="eyebrow mt-3 text-error-light"
                          >
                            {cvErr}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {form.submitError && (
                    <p role="alert" className="eyebrow mt-4 text-error-light">
                      {form.submitError}
                    </p>
                  )}
                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      disabled={!step}
                      onClick={() => setStep(step - 1)}
                      className="eyebrow text-ivory/65 disabled:opacity-30"
                    >
                      {ar ? "رجوع →" : "← Back"}
                    </button>
                    <button
                      type="button"
                      disabled={form.isSubmitting}
                      aria-busy={form.isSubmitting || undefined}
                      onClick={advance}
                      className="bg-gold-light px-6 py-3 text-xs tracking-cta text-navy uppercase transition hover:bg-ivory disabled:opacity-60 rtl:normal-case rtl:tracking-normal"
                    >
                      {step === 2
                        ? form.isSubmitting
                          ? ar
                            ? "جارٍ الإرسال…"
                            : "Submitting…"
                          : ar
                            ? "إرسال"
                            : "Submit"
                        : ar
                          ? "متابعة ←"
                          : "Continue →"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="animate-fade-up">
                  <p className="eyebrow text-gold-light">
                    <span className="pulse-dot me-2 inline-block h-2 w-2 rounded-full bg-gold-light" />
                    {ar
                      ? "قيد المراجعة · ~5 أيام عمل"
                      : "Under review · ~5 working days"}
                  </p>
                  <p className="mt-4 font-display text-3xl">
                    {ar ? "أنت الآن في الشبكة." : "You're in the network."}
                  </p>
                  <p className="mt-3 text-ivory/60">
                    {ar
                      ? "سنطابقك مع مهام قائمة ونؤهّلك بمنهج الترحيب من TerraMorph."
                      : "We'll match you to live assignments and onboard you with the TerraMorph welcome method."}
                  </p>
                  <button
                    type="button"
                    onClick={startOver}
                    className="eyebrow mt-6 border-b border-gold-light pb-1"
                  >
                    {ar ? "ابدأ من جديد" : "Start over"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : tabLive && rows.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              eyebrow={ar ? "لا عناصر منشورة" : "Nothing published"}
              title={
                tab === "PR Partner"
                  ? ar
                    ? "لا شركاء مدرجون بعد."
                    : "No partners listed yet."
                  : ar
                    ? "لا وظائف مفتوحة الآن."
                    : "No open roles right now."
              }
              body={
                tab === "PR Partner"
                  ? ar
                    ? "نضيف شركاء التنفيذ من مساحة المحتوى؛ ستظهر هنا فور النشر."
                    : "Delivery partners are added from the content workspace and appear here as soon as they publish."
                  : ar
                    ? "تُنشر الوظائف من مساحة المحتوى؛ عُد قريبًا أو أرسل ملفك على أي حال."
                    : "Roles are published from the content workspace — check back soon, or send us your profile anyway."
              }
              action={{
                label: ar
                  ? tab === "PR Partner"
                    ? "اقترح شراكة"
                    : "تواصل معنا"
                  : tab === "PR Partner"
                    ? "Propose a partnership"
                    : "Talk to us",

                href: "/contact",
              }}
            />
          </div>
        ) : (
          <ul key={tab} className="mt-6 divide-y divide-ivory/10">
            {rows.map((row, i) => {
              const rt = {
                title: ar ? row.titleAr : row.title,

                meta: ar ? row.metaAr : row.meta,

                cta: ar ? row.ctaAr : row.cta,
              }

              return (
                <li
                  key={row.title}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setReq({
                        kind: row.kind,

                        title: `${rt.cta} — ${rt.title}`,

                        intro: rt.meta,

                        context: { item: row.title, category: tab },

                        submitLabel: rt.cta,
                      })
                    }
                    className="group grid w-full cursor-pointer items-center gap-2 py-6 text-start transition hover:bg-ivory/5 md:grid-vacancy md:px-4"
                  >
                    <span className="font-display text-2xl transition-transform duration-500 group-hover:translate-x-2 rtl:group-hover:-translate-x-2">
                      {rt.title}
                    </span>
                    <span className="text-sm text-ivory/55">{rt.meta}</span>
                    <span className="eyebrow text-gold-light md:text-end">
                      {rt.cta} {ar ? "←" : "→"}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <RequestDialog request={req} onClose={() => setReq(null)} lang={lang} />
    </section>
  )
}
