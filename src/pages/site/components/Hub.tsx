import { useState } from "react"
import { hubBySlug, hubs, type Hub as HubContent } from "@/content/hubs"
import { localizedHub } from "@/content/hubs.i18n"
import {
  Contours,
  Magnetic,
  Reveal,
  SplitText,
  Spotlight,
} from "@/components/motion/fx"
import { Badge, Figure, LiveStatus } from "@/components/ui"
import {
  mapAudience,
  usePublicItem,
  type LiveAudience,
} from "@/lib/publicContent"
import type { Lang } from "../types"
import { SectionHead } from "./SectionHead"
import { RequestDialog, type RequestConfig } from "./RequestDialog"

const container = "mx-auto max-w-[1320px] px-4 sm:px-5 md:px-10"

function requestConfig(hub: HubContent, lang: Lang): RequestConfig {
  return {
    kind: hub.cta.kind ?? "CONTACT",
    title: hub.cta.title ?? hub.cta.label,
    intro: hub.cta.intro,
    context: { audience: hub.slug },
    submitLabel: lang === "ar" ? "إرسال" : "Send",
  }
}

/* The CMS owns the audience headline, intro, kicker and CTA; the hub's offers,
   stats, proof and FAQ stay in the static module. Only the live fields are
   overlaid, so a half-seeded collection never blanks the page. */
function withLiveAudience(
  hub: HubContent,
  live: LiveAudience,
  ar: boolean,
): HubContent {
  return {
    ...hub,

    label: (ar ? live.ar : live.label) || hub.label,

    kicker: (ar ? live.kickerAr : live.kicker) || hub.kicker,

    line: live.line || hub.line,

    ar: live.lineAr || hub.ar,

    intro: (ar ? live.introAr : live.intro) || hub.intro,

    cta: {
      ...hub.cta,

      label: (ar ? live.actionAr : live.action) || hub.cta.label,
    },
  }
}

function Hub({
  slug,
  lang,
}: {
  slug: string

  lang: Lang
}) {
  const ar = lang === "ar"
  const [req, setReq] = useState<RequestConfig | null>(null)
  const { item } = usePublicItem("audiences", slug)
  const baseHub = localizedHub(hubBySlug[slug] ?? hubs[0], lang)
  const hub = item ? withLiveAudience(baseHub, mapAudience(item), ar) : baseHub

  const primary =
    "inline-flex items-center gap-3 bg-navy px-7 py-4 text-label font-medium tracking-cta text-ivory uppercase transition-colors duration-300 hover:bg-navy-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold rtl:normal-case rtl:tracking-normal"

  return (
    <>
      <LiveStatus
        message={
          item
            ? ar
              ? "تم تحديث محتوى هذه الفئة من مساحة المحتوى."
              : "This audience page is updated from the content workspace."
            : ar
              ? "يُعرض محتوى الفئة الثابت."
              : "Showing the static audience copy."
        }
      />
      {/* Hero — every audience opens on its own headline, intro and figure */}
      <section className="relative overflow-hidden border-b border-line">
        <Contours
          className="absolute inset-0 h-full w-full"
          stroke="#132B45"
          opacity={0.06}
        />
        <div className={`relative ${container} py-12 sm:py-16 md:py-20`}>
          <p className="eyebrow text-slate">
            <a href="/" className="hover:text-navy">
              {ar ? "الرئيسية" : "Home"}
            </a>{" "}
            › <span className="text-gold-strong">{hub.label}</span>
          </p>
          <div className="mt-6 grid gap-8 lg:grid-split-hero lg:items-end lg:gap-12">
            <div>
              <p className="eyebrow text-gold-strong">{hub.kicker}</p>
              <h1 className="mt-3 max-w-4xl text-h1 font-medium sm:mt-5">
                <SplitText text={lang === "ar" ? hub.ar : hub.line} immediate />
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate sm:mt-6 sm:text-lg">
                {hub.intro}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-6">
                {hub.cta.kind ? (
                  <button
                    type="button"
                    onClick={() => setReq(requestConfig(hub, lang))}
                    className={`cursor-pointer ${primary.replace("px-7 py-4", "px-5 py-3 sm:px-7 sm:py-4")} min-h-[44px]`}
                  >
                    {hub.cta.label} <span aria-hidden>↓</span>
                  </button>
                ) : (
                  <Reveal>
                    <Magnetic
                      href={hub.cta.href ?? "/"}
                      className={`mt-0 ${primary.replace("px-7 py-4", "px-5 py-3 sm:px-7 sm:py-4")} min-h-[44px]`}
                    >
                      {hub.cta.label} <span aria-hidden>→</span>
                    </Magnetic>
                  </Reveal>
                )}
                {hub.secondary && (
                  <a
                    href={hub.secondary.href}
                    className="eyebrow border-b border-navy/30 pb-1 text-navy transition-colors hover:border-gold-strong hover:text-gold-strong"
                  >
                    {hub.secondary.label}
                  </a>
                )}
              </div>
            </div>
            <Reveal immediate>
              <Figure
                alt={hub.figure.alt}
                eyebrow={hub.figure.eyebrow}
                title={hub.figure.title}
                caption={hub.figure.caption}
                ratio="4 / 3"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Audience-specific numbers */}
      <section className="border-b border-line">
        <div className={container}>
          <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {hub.stats.map((s, i) => (
              <Reveal
                key={s.label}
                delay={i * 60}
                className="bg-ivory px-6 py-9"
              >
                <p className="font-display text-3xl leading-none text-gold-strong lg:text-4xl">
                  {s.value}
                </p>
                <p className="mt-4 text-sm font-medium text-navy">{s.label}</p>
                {s.note && <p className="mt-1 text-xs text-slate">{s.note}</p>}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What we do / bring / can be bought */}
      <section className="border-b border-line">
        <div className={`${container} py-20`}>
          <SectionHead
            n="—"
            eyebrow={hub.label}
            title={hub.offersHeading}
            aside={
              <p className="max-w-xs text-sm text-slate">{hub.offersAside}</p>
            }
          />
          <div className="mt-12 grid gap-px bg-line md:grid-cols-2">
            {hub.offers.map((o, i) => (
              <Reveal key={o.title} delay={i * 60} className="bg-ivory">
                <Spotlight className="h-full" color="rgba(19,43,69,0.06)">
                  <article className="flex h-full flex-col p-8">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl leading-snug font-medium">
                        {o.title}
                      </h3>
                      {o.meta && <Badge tone="gold">{o.meta}</Badge>}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate">
                      {o.body}
                    </p>
                  </article>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Evidence a reader can check */}
      <section className="border-b border-line bg-ivory-2">
        <div className={`${container} py-20`}>
          <SectionHead
            n="—"
            eyebrow={ar ? "أدلة لا ادّعاءات" : "Proof, not claims"}
            title={hub.proofHeading}
            aside={
              <p className="max-w-xs text-sm text-slate">{hub.proofAside}</p>
            }
          />
          <ul className="mt-12 border-t border-line">
            {hub.proof.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 50}>
                <a
                  href={p.href}
                  className="group grid items-center gap-2 border-b border-line py-6 transition-colors hover:bg-ivory md:grid-feature md:px-4"
                >
                  <span className="font-display text-2xl transition-transform duration-500 group-hover:translate-x-2 rtl:group-hover:-translate-x-2">
                    {p.title}
                  </span>
                  <span className="text-sm text-slate">{p.meta}</span>
                  <span className="eyebrow text-gold-strong md:text-end">
                    {ar ? "افتح ↗" : "Open ↗"}
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Process, tailored per audience */}
      <section className="border-b border-line">
        <div className={`${container} py-20`}>
          <SectionHead
            n="—"
            eyebrow={ar ? "المسار" : "The path"}
            title={hub.stepsHeading}
          />
          <ol className="mt-12 grid gap-px bg-line md:grid-cols-2 lg:grid-cols-4">
            {hub.steps.map((s, i) => (
              <Reveal
                as="li"
                key={s.step}
                delay={i * 60}
                className="flex flex-col bg-ivory p-7"
              >
                <span className="font-display text-3xl leading-none text-gold-strong">
                  {s.step}
                </span>
                <p className="mt-5 font-display text-xl font-medium">
                  {s.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {s.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ, unique per audience */}
      <section className="border-b border-line">
        <div className={`${container} py-20`}>
          <SectionHead
            n="—"
            eyebrow={hub.kicker}
            title={ar ? "أجوبة صريحة." : "Straight answers."}
          />
          <div className="mt-10 divide-y divide-line border-y border-line">
            {hub.faq.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium marker:hidden">
                  <span>{f.q}</span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-navy transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl leading-relaxed text-slate">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16">
        <div className={container}>
          <Reveal className="relative overflow-hidden bg-navy p-10 text-ivory md:p-14">
            <Contours
              className="absolute inset-0 h-full w-full"
              opacity={0.08}
            />
            <div className="relative max-w-2xl">
              <p className="eyebrow text-gold-light">{hub.kicker}</p>
              <h2 className="mt-4 text-3xl leading-tight font-medium">
                {hub.cta.title ?? hub.cta.label}
              </h2>
              {hub.cta.intro && (
                <p className="mt-4 leading-relaxed text-ivory/70">
                  {hub.cta.intro}
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-4">
                {hub.cta.kind ? (
                  <button
                    type="button"
                    onClick={() => setReq(requestConfig(hub, lang))}
                    className="cursor-pointer bg-gold-light px-6 py-3.5 text-xs tracking-cta text-navy uppercase transition hover:bg-ivory rtl:normal-case rtl:tracking-normal"
                  >
                    {hub.cta.label}
                  </button>
                ) : (
                  <a
                    href={hub.cta.href ?? "/"}
                    className="bg-gold-light px-6 py-3.5 text-xs tracking-cta text-navy uppercase transition hover:bg-ivory rtl:normal-case rtl:tracking-normal"
                  >
                    {hub.cta.label}
                  </a>
                )}
                {hub.secondary && (
                  <a
                    href={hub.secondary.href}
                    className="border border-ivory/25 px-6 py-3.5 text-xs tracking-cta uppercase transition hover:border-gold-light rtl:normal-case rtl:tracking-normal"
                  >
                    {hub.secondary.label}
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <RequestDialog request={req} onClose={() => setReq(null)} />
    </>
  )
}

export { Hub }
