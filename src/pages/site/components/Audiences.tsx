import { useEffect, useState } from "react"
import { audiences } from "@/content/data"
import { Contours, Magnetic, SplitText } from "@/components/motion/fx"
import type { Lang } from "../types"
import { Globe } from "./Globe"
import { SectionHead } from "./SectionHead"

function Audiences({ lang }: { lang: Lang }) {
  const ar = lang === "ar"
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    if (!auto) return
    const id = setInterval(
      () => setActive((x) => (x + 1) % audiences.length),
      4200,
    )
    return () => clearInterval(id)
  }, [auto])
  const pick = (i: number) => {
    setAuto(false)
    setActive(i)
  }
  const a = audiences[active]
  const n = audiences.length
  const angle = (i: number) => (i / n) * 360 - 90
  return (
    <section className="relative overflow-hidden">
      <Contours
        className="absolute inset-0 h-full w-full"
        stroke="#132B45"
        opacity={0.05}
      />
      <div className="relative mx-auto max-w-[1320px] px-5 py-24 md:px-10">
        <SectionHead
          id="for"
          n="01"
          eyebrow={ar ? "لمن هذا" : "Who this is for"}
          title={
            ar
              ? "سبعة قرّاء. سؤال واحد لكلٍّ منهم. وخطوة تالية واحدة."
              : "Seven readers. One question each. One next step."
          }
        />

        <div className="mt-14 grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
          {/* Orbit */}
          <div className="orbit-wrap relative mx-auto hidden aspect-square w-full max-w-[620px] md:block">
            {/* static rings */}
            <div className="absolute inset-[6%] rounded-full border border-line" />
            <div className="absolute inset-[18%] rounded-full border border-dashed border-gold/40" />
            {/* globe */}
            <div className="absolute inset-[27%] transition-transform duration-700 hover:scale-[1.03]">
              <div className="absolute inset-0 rounded-full bg-gold-light/20 blur-2xl" />
              <Globe />
            </div>
            {/* rotating ring of doors */}
            <div className="orbit absolute inset-0">
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 h-full w-full overflow-visible"
                aria-hidden
              >
                {audiences.map((_, i) => {
                  const r = (angle(i) * Math.PI) / 180
                  const on = i === active
                  const pt = (radius: number) =>
                    Math.round((50 + Math.cos(r) * radius) * 100) / 100
                  const ptY = (radius: number) =>
                    Math.round((50 + Math.sin(r) * radius) * 100) / 100
                  return (
                    <line
                      key={i}
                      x1={pt(24)}
                      y1={ptY(24)}
                      x2={pt(39)}
                      y2={ptY(39)}
                      stroke={on ? "#A98A4B" : "#132B45"}
                      strokeOpacity={on ? 1 : 0.12}
                      strokeWidth={on ? 0.4 : 0.2}
                      strokeDasharray={on ? "none" : "0.6 0.8"}
                      style={{ transition: "all .6s" }}
                    />
                  )
                })}
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#A98A4B"
                  strokeWidth=".25"
                  strokeDasharray={`${Math.round(((2 * Math.PI * 44) / n) * 100) / 100} ${2 * Math.PI * 44}`}
                  transform={`rotate(${angle(active) - 180 / n} 50 50)`}
                  style={{
                    transition: "transform .8s cubic-bezier(.2,.8,.2,1)",
                  }}
                />
              </svg>
              {audiences.map((x, i) => {
                const r = (angle(i) * Math.PI) / 180
                const on = i === active
                const left = Math.round((50 + Math.cos(r) * 44) * 100) / 100
                const top = Math.round((50 + Math.sin(r) * 44) * 100) / 100
                return (
                  <div
                    key={x.slug}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${left}%`, top: `${top}%` }}
                  >
                    <div className="orbit-rev">
                      <button
                        onClick={() => pick(i)}
                        onMouseEnter={() => pick(i)}
                        aria-pressed={on}
                        className={`group/b flex w-[8.5rem] flex-col items-center gap-2 text-center transition-all duration-500 ${
                          on ? "scale-110" : "hover:scale-105"
                        }`}
                      >
                        <span
                          className={`relative grid h-14 w-14 place-items-center rounded-full border font-display text-lg transition-all duration-500 ${
                            on
                              ? "border-gold bg-navy text-gold-light shadow-[0_0_0_6px_rgba(196,168,104,.18)]"
                              : "border-navy/20 bg-ivory text-navy group-hover/b:border-navy"
                          }`}
                        >
                          {on && (
                            <span className="absolute inset-0 animate-ping rounded-full border border-gold/60" />
                          )}
                          0{i + 1}
                        </span>
                        <span
                          className={`text-[0.78rem] leading-tight tracking-wide transition-colors ${
                            on ? "text-navy" : "text-slate"
                          }`}
                        >
                          {lang === "ar" ? x.ar : x.label}
                        </span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile chips */}
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:hidden">
            {audiences.map((x, i) => (
              <button
                key={x.slug}
                onClick={() => pick(i)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                  i === active
                    ? "border-navy bg-navy text-ivory"
                    : "border-line"
                }`}
              >
                {lang === "ar" ? x.ar : x.label}
              </button>
            ))}
          </div>

          {/* Detail */}
          <div key={a.slug} className="relative">
            <div className="flex items-center gap-4">
              <span className="font-display text-7xl leading-none text-gold-strong">
                0{active + 1}
              </span>
              <span className="h-px flex-1 bg-line" />
              <span className="eyebrow text-slate">
                {ar ? "من 07" : "of 07"}
              </span>
            </div>
            <h3 className="mt-6 text-[clamp(2.2rem,4vw,3.6rem)] leading-[1] font-medium">
              <SplitText text={lang === "ar" ? a.ar : a.label} />
            </h3>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-navy-2 animate-[slideup_.8s_.2s_both]">
              {lang === "ar" ? a.lineAr : a.line}
            </p>
            <ul className="mt-8 space-y-3 border-s border-gold/50 ps-5">
              {(lang === "ar" ? a.qAr : a.q).map((q, k) => (
                <li
                  key={q}
                  className="text-sm text-slate"
                  style={{ animation: `slideup .7s ${0.3 + k * 0.1}s both` }}
                >
                  <span className="me-3 font-display text-gold-strong">
                    {k + 1}.
                  </span>
                  {q}
                </li>
              ))}
            </ul>
            <div
              className="mt-10 flex flex-wrap items-center gap-6"
              style={{ animation: "slideup .7s .6s both" }}
            >
              <Magnetic
                href={`/hub/${a.slug}`}
                className="group bg-navy px-7 py-4 text-[0.75rem] font-medium tracking-[0.22em] text-ivory uppercase rtl:normal-case rtl:tracking-normal"
              >
                {lang === "ar" ? a.actionAr : a.action}
                <span className="inline-block h-px w-6 bg-gold-light transition-all group-hover:w-10" />
              </Magnetic>
              <button
                onClick={() => pick((active + 1) % n)}
                className="eyebrow text-slate hover:text-navy"
              >
                {ar ? "القارئ التالي ←" : "Next reader →"}
              </button>
            </div>
            {auto && (
              <div className="mt-8 h-px w-full bg-line">
                <div
                  key={active}
                  className="h-full bg-gold"
                  style={{ animation: "grow 4.2s linear both" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export { Audiences }
