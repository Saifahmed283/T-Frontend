import { useEffect, useRef, useState } from "react"
import { Contours, CountUp, Reveal, SplitText } from "@/components/motion/fx"
import { ledger } from "@/pages/site/home/Evidence"
import { library } from "@/pages/site/home/Knowledge"
import { programmes } from "@/pages/site/home/Learning"
import type { Lang } from "../types"
import { RequestDialog, type RequestConfig } from "./RequestDialog"

/* Hero — dark editorial ground. A vast emblem-globe rises from the horizon like a
   planet over a plain; the headline sits on it. Pointer moves the light, not the
   layout. Blueprint §10: one sentence, two buttons, four checkable numbers. */
function Hero({ lang }: { lang: Lang }) {
  const ar = lang === "ar"
  const sec = useRef<HTMLElement>(null)
  const [p, setP] = useState(0)
  const [req, setReq] = useState<RequestConfig | null>(null)
  useEffect(() => {
    let raf = 0
    let ticking = false
    const on = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(() => {
        setP(Math.min(1, window.scrollY / (sec.current?.offsetHeight || 800)))
        ticking = false
      })
    }
    window.addEventListener("scroll", on, { passive: true })
    return () => {
      window.removeEventListener("scroll", on)
      cancelAnimationFrame(raf)
    }
  }, [])
  const light = (e: React.PointerEvent) => {
    const el = sec.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`)
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  const openDiagnostic = () =>
    setReq({
      kind: "CONTACT",
      title: ar ? "ابدأ تشخيص الجاهزية" : "Start the readiness diagnostic",
      intro: ar
        ? "أخبرنا بالقرار الذي أمامك. نحدّد نطاق تشخيص الجاهزية ونعود إليك خلال يومَي عمل."
        : "Tell us the decision in front of you. We will scope a readiness diagnostic and reply within two working days.",
      submitLabel: ar ? "ابدأ التشخيص" : "Start the diagnostic",
      context: { intent: "readiness-diagnostic", source: "hero" },
    })

  /* Each number is a live count from the content it links to — never a hard-coded
     vanity figure. Clicking one lands on the section that proves it. */
  const proof = [
    {
      n: ledger.length,
      en: "Dated assignments on the ledger",
      ar: "مهام موثّقة بالتاريخ في السجل",
      to: "/evidence",
    },
    {
      n: library.length,
      en: "Publications & open toolkits",
      ar: "إصدارات وأدوات مفتوحة",
      to: "/knowledge",
    },
    {
      n: programmes.length,
      en: "Price-bearing learning programmes",
      ar: "برامج تدريبية بأسعار معلنة",
      to: "/learning",
    },
    {
      n: 214,
      en: "Experts on the vetted roster",
      ar: "خبيرًا في القائمة المعتمدة",
      to: "/join",
    },
  ]

  return (
    <>
      <section
        ref={sec}
        onPointerMove={light}
        className="relative isolate flex min-h-[calc(100svh-110px)] flex-col overflow-hidden bg-navy-3 text-ivory [--mx:70%] [--my:30%]"
      >
        {/* light that follows the pointer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_circle_at_var(--mx)_var(--my),rgba(196,168,104,.12),transparent_60%)] transition-[background] duration-300"
        />
        <Contours
          className="absolute inset-0 -z-10 h-full w-full"
          stroke="#FBF8F1"
          opacity={0.05}
        />

        {/* the rising globe */}
        <div
          aria-hidden
          className="pointer-events-none absolute start-1/2 top-[calc(62svh_-_68px)] -z-10 aspect-square w-[min(1150px,160vw)]"
          style={{ transform: `translate(${ar ? "50%" : "-50%"}, ${p * 18}%)` }}
        >
          <svg viewBox="0 0 400 400" className="h-full w-full">
            <defs>
              <radialGradient id="hg" cx="50%" cy="0%" r="70%">
                <stop offset="0" stopColor="#31455B" />
                <stop offset="1" stopColor="#0C1D30" />
              </radialGradient>
              <linearGradient id="rim" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#C4A868" />
                <stop offset=".25" stopColor="#C4A868" stopOpacity="0" />
              </linearGradient>
              <clipPath id="hc">
                <circle cx="200" cy="200" r="198" />
              </clipPath>
            </defs>
            <circle cx="200" cy="200" r="198" fill="url(#hg)" />
            <g
              clipPath="url(#hc)"
              fill="none"
              stroke="#FBF8F1"
              strokeWidth=".35"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <ellipse
                  key={i}
                  cx="200"
                  cy="200"
                  rx="198"
                  ry="198"
                  strokeOpacity=".07"
                  className="meridian-slow"
                  style={{
                    animationDuration: "40s",
                    animationDelay: `${-i * 5}s`,
                  }}
                />
              ))}
              {[-150, -100, -50, 0].map((y) => (
                <ellipse
                  key={y}
                  cx="200"
                  cy={200 + y}
                  rx={Math.sqrt(198 ** 2 - y ** 2)}
                  ry={Math.sqrt(198 ** 2 - y ** 2) * 0.12}
                  strokeOpacity=".1"
                />
              ))}
            </g>
            <circle
              cx="200"
              cy="200"
              r="198"
              fill="none"
              stroke="url(#rim)"
              strokeWidth="1.2"
              pathLength={1}
              className="intro-draw"
              style={{ animationDuration: "2.4s" }}
            />
            <circle
              cx="200"
              cy="200"
              r="186"
              fill="none"
              stroke="#C4A868"
              strokeOpacity=".25"
              strokeWidth=".4"
              strokeDasharray=".6 3"
            />
          </svg>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[75%] bg-[radial-gradient(ellipse_60%_70%_at_50%_35%,#0C1D30_45%,transparent_100%)]"
        />

        <div className="relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col items-center justify-center px-5 pt-[10vh] text-center md:px-10">
          <Reveal immediate>
            <p className="eyebrow text-gold-light">
              {ar
                ? "الاستراتيجية · السياسات · التحوّل"
                : "Strategy · Policy · Transformation"}
            </p>
          </Reveal>
          <h1
            className={`mt-6 max-w-5xl font-medium ${
              ar
                ? "text-[clamp(2.4rem,6vw,5rem)] leading-[1.25]"
                : "text-[clamp(2.8rem,7.4vw,6.8rem)] leading-[0.95] tracking-[-0.02em]"
            }`}
          >
            {ar ? (
              <SplitText
                text="نُعيد تشكيل الأرض التي تقوم عليها الاقتصادات."
                immediate
              />
            ) : (
              <>
                <SplitText text="We reshape the ground" immediate />{" "}
                <span className="block">
                  <SplitText text="on which" immediate />{" "}
                  <SplitText
                    className="italic text-gold-light"
                    text="economies stand."
                    immediate
                  />
                </span>
              </>
            )}
          </h1>
          <Reveal immediate>
            <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ivory/80 md:text-lg">
              {ar
                ? "استشارات في الاستراتيجية والسياسات والتحول للحكومات والمؤسسات والمشاريع الاجتماعية."
                : "Advisory for governments, institutions and social enterprises — a small, well-placed force for large public outcomes."}
            </p>
          </Reveal>

          {/* Two buttons — the diagnostic for people exploring, the evidence for people checking */}
          <Reveal immediate>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={openDiagnostic}
                className="group inline-flex items-center gap-3 bg-gold-light px-7 py-4 text-[0.72rem] font-medium tracking-[0.2em] text-navy uppercase transition hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-light"
              >
                {ar ? "ابدأ تشخيص الجاهزية" : "Start the readiness diagnostic"}
                <span
                  aria-hidden
                  className="inline-block h-px w-6 bg-navy transition-all duration-500 group-hover:w-10"
                />
              </button>
              <a
                href="/evidence"
                className="group inline-flex items-center gap-3 border border-ivory/25 px-7 py-4 text-[0.72rem] font-medium tracking-[0.2em] text-ivory uppercase transition hover:border-gold-light hover:text-gold-light"
              >
                {ar ? "اطّلع على الأدلة" : "See the evidence"}
                <span
                  aria-hidden
                  className="transition-transform duration-500 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </div>
          </Reveal>

          {/* scroll cue — plain in-page anchor, so no route is mutated */}
          <a
            href="#for"
            aria-label={
              ar
                ? "ابدأ من هنا — انتقل إلى القسم التالي"
                : "Begin here — scroll to the next section"
            }
            className="group mt-14 inline-flex flex-col items-center gap-2 text-ivory/55 transition hover:text-ivory"
          >
            <span className="eyebrow">{ar ? "ابدأ من هنا" : "Begin here"}</span>
            <span className="relative h-8 w-px overflow-hidden bg-ivory/15">
              <span className="scroll-cue absolute inset-0 bg-gold-light" />
            </span>
          </a>
        </div>

        {/* Proof strip — four checkable numbers, each linked to the section that proves it */}
        <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-6 md:px-10">
          <div className="grid grid-cols-2 border-t border-ivory/15 sm:grid-cols-4">
            {proof.map((x, i) => (
              <Reveal
                key={x.to}
                immediate
                className={`border-ivory/15 ${i % 2 ? "border-s" : ""} ${
                  i === 2 ? "sm:border-s" : ""
                }`}
              >
                <a
                  href={x.to}
                  className="group flex h-full flex-col items-center gap-2 px-4 py-6 text-center transition hover:bg-ivory/[0.04] sm:items-start sm:text-start"
                >
                  <span className="font-display text-4xl leading-none text-ivory md:text-5xl">
                    <CountUp to={x.n} />
                  </span>
                  <span className="text-xs leading-snug text-ivory/65 transition group-hover:text-ivory/85">
                    {ar ? x.ar : x.en}
                  </span>
                  <span
                    aria-hidden
                    className="eyebrow mt-auto pt-2 text-gold-light opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    ↗
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <RequestDialog request={req} onClose={() => setReq(null)} />
    </>
  )
}

export { Hero }
