import { useEffect, useRef, useState } from "react"

import { Contours, CountUp, Reveal, SplitText } from "@/components/motion/fx"

import { ledger } from "@/pages/site/home/Evidence"

import { library } from "@/pages/site/home/Knowledge"

import { usePublicCollection } from "@/lib/publicContent"

import type { Lang } from "../types"

import { RequestDialog, type RequestConfig } from "./RequestDialog"

/* Hero — dark editorial ground. A vast emblem-globe rises from the horizon like a
   planet over a plain; the headline sits on it. Pointer moves the light, not the
   layout. Blueprint §10: one sentence, two buttons, four checkable numbers. */

function Hero({ lang }: { lang: Lang }) {
  const ar = lang === "ar"

  const sec = useRef<HTMLElement>(null)

  const globe = useRef<HTMLDivElement>(null)

  const [req, setReq] = useState<RequestConfig | null>(null)

  /* The four proof numbers are live counts from the content workspace. The
     static arrays stay as the prerender/fallback value, so the strip never
     renders zero while the public API is cold. Ask for the same page size the
     sections below use, so the shared request cache serves both from one call. */

  const assignments = usePublicCollection("assignments", { pageSize: 100 })

  const publications = usePublicCollection("publications", { pageSize: 50 })

  const instruments = usePublicCollection("instruments", { pageSize: 50 })

  const courses = usePublicCollection("courses", { pageSize: 50 })

  const experts = usePublicCollection("experts", { pageSize: 50 })

  const count = (live: boolean, total: number, fallback: number) =>
    live ? total : fallback

  const knowledgeCount =
    publications.live && instruments.live
      ? publications.total + instruments.total
      : library.length

  /* Drive the globe parallax off a ref, not state — a state update here would
     re-render the whole Hero (meridians, contours, proof strip) every scroll
     frame, which is the main source of jank while scrolling the page. */

  useEffect(() => {
    let raf = 0

    let ticking = false

    const on = () => {
      if (ticking) return

      ticking = true

      raf = requestAnimationFrame(() => {
        ticking = false

        const el = globe.current

        if (!el) return

        const p = Math.min(
          1,

          window.scrollY / (sec.current?.offsetHeight || 800),
        )

        el.style.transform = `translate(${ar ? "50%" : "-50%"}, ${p * 18}%)`
      })
    }

    window.addEventListener("scroll", on, { passive: true })

    on()

    return () => {
      window.removeEventListener("scroll", on)

      cancelAnimationFrame(raf)
    }
  }, [])

  /* Fetch course count from the content workspace — admin manages courses in
     the dashboard, never hard-coded in the frontend. */

  /* The light follows a real pointer only, and at most once per frame. Touch
     drags fire pointermove as well, so without this guard every mobile scroll
     gesture paid for a getBoundingClientRect plus a full-viewport gradient
     repaint — in the middle of the scroll itself. */

  const lightRaf = useRef(0)

  const light = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return

    const el = sec.current

    if (!el || lightRaf.current) return

    const x = e.clientX

    const y = e.clientY

    lightRaf.current = requestAnimationFrame(() => {
      lightRaf.current = 0

      const s = sec.current

      if (!s) return

      const r = s.getBoundingClientRect()

      s.style.setProperty("--mx", `${((x - r.left) / r.width) * 100}%`)

      s.style.setProperty("--my", `${((y - r.top) / r.height) * 100}%`)
    })
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
      n: count(assignments.live, assignments.total, ledger.length),

      en: "Dated assignments on the ledger",

      ar: "مهام موثّقة بالتاريخ في السجل",

      to: "/evidence",
    },

    {
      n: knowledgeCount,

      en: "Publications & open toolkits",

      ar: "إصدارات وأدوات مفتوحة",

      to: "/knowledge",
    },

    {
      n: count(courses.live, courses.total, 0),

      en: "Price-bearing learning programmes",

      ar: "برامج تدريبية بأسعار معلنة",

      to: "/learning",
    },

    {
      n: count(experts.live, experts.total, 6),

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
        className="relative isolate flex min-h-[calc(100svh-90px)] flex-col overflow-hidden bg-navy-3 text-ivory [--mx:70%] [--my:30%] sm:min-h-[calc(100svh-110px)]"
      >
        {/* light that follows the pointer — no `transition-[background]`: it only
            served to keep repainting the gradient after each pointer move */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 glow-spotlight"
        />
        <Contours
          className="absolute inset-0 -z-10 h-full w-full"
          stroke="#FBF8F1"
          opacity={0.05}
        />

        {/* the rising globe */}
        <div
          ref={globe}
          aria-hidden
          className="pointer-events-none absolute start-1/2 hero-cue-top -z-10 aspect-square w-[min(1150px,160vw)] will-change-transform"
          style={{ transform: `translate(${ar ? "50%" : "-50%"}, 0%)` }}
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
              {/* These are full circles (rx === ry): the old `meridian-slow`
                  animation only flipped scaleX about their own centre, which is
                  geometrically a no-op — eight infinite SVG transform animations
                  per hero, producing no visible change at all. Kept static. */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <ellipse
                  key={i}
                  cx="200"
                  cy="200"
                  rx="198"
                  ry="198"
                  strokeOpacity=".07"
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
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[75%] hero-vignette"
        />

        <div className="relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col items-center justify-center px-4 pt-[6vh] text-center sm:px-5 sm:pt-[8vh] md:px-10 md:pt-[10vh]">
          <Reveal immediate>
            <p className="eyebrow text-gold-light">
              {ar
                ? "الاستراتيجية · السياسات · التحوّل"
                : "Strategy · Policy · Transformation"}
            </p>
          </Reveal>
          <h1
            className={`mt-4 max-w-5xl font-medium sm:mt-6 ${
              ar
                ? "text-[clamp(2rem,8vw,5rem)] leading-[1.25]"
                : "text-[clamp(2.2rem,9vw,6.8rem)] leading-[0.95] tracking-tight"
            }`}
          >
            {ar ? (
              <SplitText
                text="نُعيد تشكيل الأرض التي تقوم عليها الاقتصادات."
                immediate
              />
            ) : (
              <>
                <SplitText text="We reshape the ground" immediate />
                {""}
                <span className="block">
                  <SplitText text="on which" immediate />
                  {""}
                  <SplitText
                    className="italic text-gold-light"
                    text="Economies stand."
                    immediate
                  />
                </span>
              </>
            )}
          </h1>
          <Reveal immediate>
            <p className="mx-auto mt-6 max-w-xl px-2 text-sm leading-relaxed text-ivory/80 sm:mt-8 sm:text-base md:text-lg">
              {ar
                ? "استشارات في الاستراتيجية والسياسات والتحول للحكومات والمؤسسات والمشاريع الاجتماعية."
                : "Advisory for governments, institutions and social enterprises — a small, well-placed force for large public outcomes."}
            </p>
          </Reveal>

          {/* Two buttons — the diagnostic for people exploring, the evidence for people checking */}
          <Reveal immediate>
            <div className="mt-8 flex w-full flex-col items-center gap-2 px-2 sm:mt-10 sm:w-auto sm:flex-row sm:justify-center sm:gap-3">
              <button
                type="button"
                onClick={openDiagnostic}
                className="group inline-flex w-full items-center justify-center gap-3 bg-gold-light px-5 py-3 text-label font-medium tracking-cta text-navy uppercase transition hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-light min-h-[44px] sm:w-auto sm:px-7 sm:py-4"
              >
                {ar ? "ابدأ تشخيص الجاهزية" : "Start the readiness diagnostic"}
                <span
                  aria-hidden
                  className="inline-block h-px w-6 bg-navy transition-all duration-500 group-hover:w-10"
                />
              </button>
              <a
                href="/evidence"
                className="group inline-flex w-full items-center justify-center gap-3 border border-ivory/25 px-5 py-3 text-label font-medium tracking-cta text-ivory uppercase transition hover:border-gold-light hover:text-gold-light min-h-[44px] sm:w-auto sm:px-7 sm:py-4"
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
        <div className="relative mx-auto w-full max-w-[1320px] px-3 pb-4 sm:px-5 sm:pb-6 md:px-10">
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
                  className="group flex h-full flex-col items-center gap-2 px-2 py-4 text-center transition hover:bg-ivory/[0.04] min-h-[90px] sm:items-start sm:px-4 sm:py-6 sm:text-start"
                >
                  <span className="font-display text-3xl leading-none text-ivory sm:text-4xl md:text-5xl">
                    <CountUp to={x.n} />
                  </span>
                  <span className="text-[11px] leading-snug text-ivory/65 transition group-hover:text-ivory/85 sm:text-xs">
                    {ar ? x.ar : x.en}
                  </span>
                  <span
                    aria-hidden
                    className="eyebrow mt-auto pt-1 text-gold-light opacity-0 transition-opacity group-hover:opacity-100 sm:pt-2"
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
