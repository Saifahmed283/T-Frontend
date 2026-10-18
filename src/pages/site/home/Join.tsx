import { useState } from "react"
import { Contours } from "@/components/motion/fx"
import { Head } from "./Head"
import { api, ApiError, type SubmissionKind } from "@/lib/api"
import {
  RequestDialog,
  type RequestConfig,
} from "@/pages/site/components/RequestDialog"
import type { Lang } from "../types"

/* ——— 08 Join: two doors (partners, experts) + careers & tenders, one place ——— */
const lists: Record<string, {
  title: string
  meta: string
  cta: string
  kind: SubmissionKind
}[]> = {
  "Team with us": [
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
  Tenders: [
    {
      title: "Urban mobility diagnostic",
      meta: "EOI · closes 30 Oct",
      cta: "Express interest",
      kind: "TENDER_INTEREST",
    },
    {
      title: "TVET governance review",
      meta: "RFP · closes 14 Nov",
      cta: "Express interest",
      kind: "TENDER_INTEREST",
    },
    {
      title: "SME finance access study",
      meta: "Open call · rolling",
      cta: "Express interest",
      kind: "TENDER_INTEREST",
    },
  ],
}

const listLabel: Record<string, string> = {
  "Expert network": "شبكة الخبراء",
  "Team with us": "شاركنا الفريق",
  Careers: "الوظائف",
  Tenders: "المناقصات",
}

const listsAr: Record<
  string,
  {
    title: string
    meta: string
    cta: string
  }[]
> = {
  "Team with us": [
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
  Tenders: [
    {
      title: "تشخيص التنقل الحضري",
      meta: "إبداء اهتمام · يُغلق 30 أكتوبر",
      cta: "أبدِ اهتمامك",
    },
    {
      title: "مراجعة حوكمة التعليم الفني",
      meta: "RFP · يُغلق 14 نوفمبر",
      cta: "أبدِ اهتمامك",
    },
    {
      title: "دراسة الوصول إلى تمويل المشروعات الصغيرة والمتوسطة",
      meta: "دعوة مفتوحة · مستمرة",
      cta: "أبدِ اهتمامك",
    },
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
  const [sending, setSending] = useState(false)
  const [req, setReq] = useState<RequestConfig | null>(null)

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

  const finishExpert = async () => {
    if (!email.trim()) {
      setExpertErr(
        ar ? "البريد الإلكتروني مطلوب." : "An email address is required.",
      )
      return
    }
    setExpertErr("")
    setSending(true)
    try {
      await api.submit({
        kind: "EXPERT_REGISTRATION",
        email: email.trim(),
        name: name.trim() || undefined,
        source: "site",
        payload: { location, linkedin, areas: selAreas },
      })
      setStep(3)
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
              ? "خبراء وشركاء وأفراد ومناقصات — باب واحد لكلٍّ."
              : "Experts, partners, people and tenders — one door each."
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
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
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
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          placeholder="you@example.com"
                          className="w-full border-b border-ivory/20 bg-transparent py-3 placeholder:text-ivory/30 focus:border-gold-light focus:outline-none"
                        />
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
                      <label className="grid h-36 cursor-pointer place-items-center border border-dashed border-ivory/30 text-ivory/60 transition hover:border-gold-light">
                        <input type="file" className="sr-only" />
                        {ar
                          ? "أفلت سيرتك الذاتية أو انقر للتصفّح (PDF، DOCX)"
                          : "Drop your CV or click to browse (PDF, DOCX)"}
                      </label>
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
                      className="bg-gold-light px-6 py-3 text-xs tracking-[0.2em] text-navy uppercase transition hover:bg-ivory disabled:opacity-60 rtl:normal-case rtl:tracking-normal"
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
                <div style={{ animation: "fadeup .6s both" }}>
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
                  style={{ animation: `fadeup .5s ${i * 0.08}s both` }}
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
                    className="group grid w-full cursor-pointer items-center gap-2 py-6 text-start transition hover:bg-ivory/5 md:grid-cols-[1fr_280px_180px] md:px-4"
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
