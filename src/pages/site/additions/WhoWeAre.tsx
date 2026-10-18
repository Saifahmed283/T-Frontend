import { useEffect, useState } from "react"
import { Emblem, GoldLine, Reveal, Spotlight } from "@/components/motion/fx"
import { labelPath } from "@/content/pages"
import type { Lang } from "../types"

/* ——— Who we are: logo + 3–5 lines, philosophy, partnerships, people, testimonials, awards ——— */
const testimonials = [
  {
    q: "They worked inside our rules from day one. The procurement file was the cleanest we received.",
    qAr: "عملوا داخل قواعدنا من اليوم الأول. كان ملف المشتريات الأكثر نظافة ممّا استلمناه.",
    who: "Director, governorate planning unit",
    whoAr: "مدير، وحدة تخطيط المحافظة",
  },
  {
    q: "Small team, serious method. We extended the contract twice.",
    qAr: "فريق صغير، منهج جاد. مدّدنا العقد مرتين.",
    who: "Programme lead, development partner",
    whoAr: "قائد برنامج، شريك تنمية",
  },
  {
    q: "Easy to work with, and impossible to rush into a bad decision.",
    qAr: "سهل التعامل معهم، ويصعب جرّهم إلى قرار سيئ.",
    who: "Founder, social enterprise",
    whoAr: "مؤسس، مشروع اجتماعي",
  },
]

/* Each pillar links to the page that proves it, so the hover is real navigation. */
const pillars: [string, string, string, string, string][] = [
  [
    "Philosophy",
    "الفلسفة",
    "Leverage for good: small, well-placed force for large public outcomes.",
    "رافعة للخير: قوة صغيرة محكمة لنتائج عامة كبيرة.",
    labelPath["Why a small firm"] ?? "/about",
  ],
  [
    "Partnerships",
    "الشراكات",
    "Development partners, academies and primes who team with us on bids.",
    "شركاء تنمية وأكاديميات وشركات كبرى تتحالف معنا في المناقصات.",
    labelPath["Associates & experts"] ?? "/about",
  ],
  [
    "People",
    "الأفراد",
    "A named founder, a vetted associate bench and 214 experts on roster.",
    "مؤسس مسمّى، ومجموعة شركاء معتمدة، و214 خبيرًا في السجل.",
    labelPath["Founder & team"] ?? "/about",
  ],
  [
    "Clients",
    "العملاء",
    "Governorates, ministries, funds and enterprises across 11 countries.",
    "محافظات ووزارات وصناديق ومؤسسات في 11 دولة.",
    labelPath["Clients & references"] ?? "/evidence",
  ],
]

const awards = [
  ["ISO 37001", "Anti-bribery management", "إدارة مكافحة الرشوة", "2026"],
  ["Devex", "Registered organisation", "منظمة مسجّلة", "2025"],
  ["AAST", "Academic training partner", "شريك تدريب أكاديمي", "2025"],
  [
    "Africa LED Award",
    "Shortlist — local development",
    "قائمة مختصرة — التنمية المحلية",
    "2024",
  ],
]

export function WhoWeAre({ lang }: { lang: Lang }) {
  const ar = lang === "ar"
  const [t, setT] = useState(0)
  useEffect(() => {
    const id = setInterval(
      () => setT((x) => (x + 1) % testimonials.length),
      5500,
    )
    return () => clearInterval(id)
  }, [])
  return (
    <section
      id="about"
      className="mx-auto max-w-[1320px] scroll-mt-40 px-5 py-24 md:px-10"
    >
      <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <Emblem className="h-20 w-20" />
          <p className="eyebrow mt-8 text-gold-strong">
            {ar ? "مرحبًا! نحن TerraMorph" : "Hello! We are TerraMorph"}
          </p>
          <h2 className="mt-4 text-[clamp(2.2rem,4.4vw,3.8rem)] leading-[1.02] font-medium">
            {ar
              ? "نحن مستشارون — سهل التعامل معنا جدًا، لكن يصعب خداعنا."
              : "We are consultants — and we are very easy to deal with, but very tough to mess with."}
          </h2>
          <p className="mt-6 max-w-lg leading-relaxed text-navy-2">
            {ar
              ? "تقدّم TerraMorph المشورة للحكومات والمؤسسات والمشروعات الاجتماعية في الاستراتيجية والسياسات والتحوّل. نجمع المكان والناس، وندعوهم للانضمام، ونساعدهم على بناء ما يتخيّلونه بالفعل."
              : "TerraMorph advises governments, institutions and social enterprises on strategy, policy and transformation. We bring the place and the people together, invite them in, and help them build what they can already imagine."}
          </p>
        </Reveal>
        <div className="grid gap-px self-start bg-line sm:grid-cols-2">
          {pillars.map(([h, hAr, b, bAr, to], k) => (
            <a
              key={h}
              href={to}
              className="group/p block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              <Spotlight
                className="h-full bg-ivory"
                color="rgba(19,43,69,0.06)"
              >
                <div className="p-7">
                  <span className="font-display text-sm text-gold-strong">
                    0{k + 1}
                  </span>
                  <h3 className="mt-3 flex items-center gap-2 text-2xl font-medium">
                    {ar ? hAr : h}
                    <span
                      aria-hidden
                      className="text-gold-strong opacity-0 transition-all duration-300 group-hover/p:translate-x-1 group-hover/p:opacity-100 rtl:group-hover/p:-translate-x-1"
                    >
                      →
                    </span>
                  </h3>
                  <p className="mt-2 text-sm text-slate">{ar ? bAr : b}</p>
                </div>
              </Spotlight>
            </a>
          ))}
        </div>
      </div>
      <GoldLine className="mt-16" />
      <div className="mt-14 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div className="relative min-h-[220px]">
          <p className="eyebrow text-slate">
            {ar ? "آراء العملاء" : "Testimonials"}
          </p>
          {testimonials.map((x, k) => (
            <blockquote
              key={k}
              className="absolute inset-x-0 top-10 transition-transform duration-700"
              style={{
                opacity: k === t ? 1 : 0,
                transform: k === t ? "none" : "translateY(12px)",
              }}
              aria-hidden={k !== t}
            >
              <p className="font-display text-[clamp(1.6rem,3vw,2.6rem)] leading-snug italic">
                "{ar ? x.qAr : x.q}"
              </p>
              <footer className="eyebrow mt-6 text-gold-strong">
                — {ar ? x.whoAr : x.who}
              </footer>
            </blockquote>
          ))}
          <div className="absolute bottom-0 flex gap-2">
            {testimonials.map((_, k) => (
              <button
                key={k}
                onClick={() => setT(k)}
                aria-label={ar ? `رأي ${k + 1}` : `Testimonial ${k + 1}`}
                className={`h-1 transition-all ${
                  k === t ? "w-10 bg-navy" : "w-4 bg-line"
                }`}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow text-slate">
            {ar ? "الجوائز والاعتمادات" : "Awards & certifications"}
          </p>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {awards.map(([a, b, bAr, y]) => (
              <li
                key={a}
                className="flex items-center justify-between gap-4 py-4"
              >
                <span>
                  <span className="font-display text-xl">{a}</span>
                  <span className="ms-3 text-sm text-slate">
                    {ar ? bAr : b}
                  </span>
                </span>
                <span className="eyebrow text-gold-strong">{y}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
