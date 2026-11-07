import { useState } from "react"

import { Contours } from "@/components/motion/fx"

import { Head } from "./Head"

import { api, ApiError, type SubmissionKind } from "@/lib/api"
import { capturePosthog } from "@/lib/posthog.capture"

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

  const [step, setStep] = useState(0)

  const steps = ar
    ? ["الملف", "الخبرة", "السيرة", "الحالة"]
    : ["Profile", "Expertise", "CV", "Status"]

  const [name, setName] = useState("")

  const [email, setEmail] = useState("")

  const [location, setLocation] = useState("")

  const [linkedin, setLinkedin] = useState("")

  const [selAreas, setSelAreas] = useState<string[]>([])

  const [expertErr, setExpertErr] = useState("")

  const [nameErr, setNameErr] = useState("")

  const [emailErr, setEmailErr] = useState("")

  const [linkedinErr, setLinkedinErr] = useState("")

  const [sending, setSending] = useState(false)

  const [req, setReq] = useState<RequestConfig | null>(null)

  /* The public submissions API has no file field (it is a strict JSON schema),
     so a CV cannot be stored from the browser. We capture and validate the file
     name so the record shows an expert arrived with a CV, and the UI states the
     file itself is requested during review rather than pretending to upload it. */

  const [cvName, setCvName] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [cvErr, setCvErr] = useState("")

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i

  const areasShown = ar ? areasAr : areas

  const rowText = (t: string, i: number) =>
    ar
      ? listsAr[t][i]
      : {
          title: lists[t][i].title,

          meta: lists[t][i].meta,

          cta: lists[t][i].cta,
        }

  const toggleArea = (a: string) =>
    setSelAreas(
      selAreas.includes(a) ? selAreas.filter((x) => x !== a) : [...selAreas, a],
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

  const finishExpert = async () => {
    setNameErr("")
    setEmailErr("")
    setLinkedinErr("")
    setExpertErr("")

    const nameVal = name.trim()

    const emailVal = email.trim()

    const linkedinVal = linkedin.trim()

    if (!nameVal) {
      setNameErr(ar ? "الاسم الكامل مطلوب." : "Full name is required.")

      return
    }

    if (nameVal.length < 2) {
      setNameErr(ar ? "الاسم قصير جدًا." : "Name is too short.")

      return
    }

    if (!emailVal) {
      setEmailErr(ar ? "البريد الإلكتروني مطلوب." : "An email address is required.")

      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setEmailErr(
        ar ? "يرجى إدخال عنوان بريد إلكتروني صحيح." : "Please enter a valid email address.",
      )

      return
    }

    if (linkedinVal && !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(linkedinVal)) {
      setLinkedinErr(
        ar ? "يرجى إدخال رابط LinkedIn صحيح." : "Please enter a valid LinkedIn URL.",
      )

      return
    }

    if (!termsAccepted) {
      setExpertErr(
        ar ? "يرجى قبول سياسة الخصوصية وشروط الخدمة للمتابعة." : "Please accept the Privacy Policy and Terms of Service to continue.",
      )

      return
    }

    setSending(true)

    try {
      await api.submit({
        kind: "EXPERT_REGISTRATION",

        email: emailVal,

        name: nameVal || undefined,

        source: "site",

        payload: {
          location: location.trim() || undefined,

          linkedin: linkedinVal || undefined,

          areas: selAreas,

          ...(cvName ? { cvFileName: cvName } : {}),
        },
      })

      capturePosthog("expert_registration_submitted", {
        language: lang,
        expertise_count: selAreas.length,
        has_cv: Boolean(cvName),
      })
      setStep(3)

      // Record terms acceptance with backend (non-blocking)
      void api.termsAcceptanceRecord({
        email: emailVal,
        privacyVersion: '1.0',
        termsVersion: '1.0',
        source: 'join',
      }).catch(() => { /* terms acceptance recording should not block form submission */ })
    } catch (err) {
      setExpertErr(
        err instanceof ApiError
          ? err.message
          : ar
            ? "حدث خطأ ما. حاول مرة أخرى."
            : "Something went wrong. Please try again.",
      )
    } finally {
      setSending(false)
    }
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
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={ar ? "الاسم الكامل" : "Full name"}
                          className="w-full border-b border-ivory/20 bg-transparent py-3 placeholder:text-ivory/30 focus:border-gold-light focus:outline-none"
                        />
                        {nameErr && (
                          <p role="alert" className="eyebrow mt-1 text-error">
                            {nameErr}
                          </p>
                        )}
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          placeholder="you@example.com"
                          className="w-full border-b border-ivory/20 bg-transparent py-3 placeholder:text-ivory/30 focus:border-gold-light focus:outline-none"
                        />
                        {emailErr && (
                          <p role="alert" className="eyebrow mt-1 text-error">
                            {emailErr}
                          </p>
                        )}
                        <input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder={
                            ar ? "الدولة · المدينة" : "Country · city"
                          }
                          className="w-full border-b border-ivory/20 bg-transparent py-3 placeholder:text-ivory/30 focus:border-gold-light focus:outline-none"
                        />
                        <input
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          placeholder={ar ? "رابط LinkedIn" : "LinkedIn URL"}
                          className="w-full border-b border-ivory/20 bg-transparent py-3 placeholder:text-ivory/30 focus:border-gold-light focus:outline-none"
                        />
                        {linkedinErr && (
                          <p role="alert" className="eyebrow mt-1 text-error">
                            {linkedinErr}
                          </p>
                        )}
                        <label className="flex items-start gap-3 mt-4 border-t border-ivory/10 pt-4">
                          <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mt-1 h-4 w-4 shrink-0 rounded border-ivory/30 text-gold-light focus:ring-2 focus:ring-gold focus:ring-offset-2"
                            required
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
                              {ar ? "بإرسال هذا النموذج، أنت تقبل معالجة بياناتك وفقًا لسياسة الخصوصية." : "By submitting this form, you accept processing of your data per the Privacy Policy."}
                            </p>
                          </div>
                        </label>
                      </>
                    )}
                    {step === 1 && (
                      <div className="flex flex-wrap gap-2">
                        {areasShown.map((a, k) => (
                          <label
                            key={a}
                            className={`cursor-pointer border px-3 py-2 text-sm transition ${
                              selAreas.includes(areas[k])
                                ? "border-gold-light bg-gold-light text-navy"
                                : "border-ivory/20"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selAreas.includes(areas[k])}
                              onChange={() => toggleArea(areas[k])}
                              className="sr-only"
                            />
                            {a}
                          </label>
                        ))}
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
                            className="eyebrow mt-3 text-gold-light"
                          >
                            {cvErr}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {expertErr && (
                    <p role="alert" className="eyebrow mt-4 text-gold-light">
                      {expertErr}
                    </p>
                  )}
                  <div className="mt-8 flex justify-between">
                    <button
                      disabled={!step}
                      onClick={() => setStep(step - 1)}
                      className="eyebrow text-ivory/65 disabled:opacity-30"
                    >
                      {ar ? "رجوع →" : "← Back"}
                    </button>
                    <button
                      disabled={sending}
                      onClick={() =>
                        step === 2 ? void finishExpert() : setStep(step + 1)
                      }
                      className="bg-gold-light px-6 py-3 text-xs tracking-cta text-navy uppercase transition hover:bg-ivory disabled:opacity-60 rtl:normal-case rtl:tracking-normal"
                    >
                      {step === 2
                        ? sending
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
                    onClick={() => {
                      setStep(0)

                      setSelAreas([])

                      setName("")

                      setEmail("")

                      setLocation("")

                      setLinkedin("")

                      setCvName("")

                      setCvErr("")
                    }}
                    className="eyebrow mt-6 border-b border-gold-light pb-1"
                  >
                    {ar ? "ابدأ من جديد" : "Start over"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ul key={tab} className="mt-6 divide-y divide-ivory/10">
            {lists[tab].map((row, i) => {
              const rt = rowText(tab, i)

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
      <RequestDialog request={req} onClose={() => setReq(null)} />
    </section>
  )
}
