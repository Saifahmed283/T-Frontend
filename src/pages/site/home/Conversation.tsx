import { useEffect, useRef, useState, type FormEvent } from "react"

import { Contours, Emblem } from "@/components/motion/fx"

import { api, ApiError } from "@/lib/api"

import type { Lang } from "../types"

// Conversation: one front door — "Hello! I am…" + which lists + contact

const roles = [
  "policy maker",

  "government official",

  "local entity",

  "development partner",

  "INGO",

  "consultant",

  "business owner",

  "change agent",

  "cause enthusiast",
]

const rolesAr = [
  "صانع سياسات",

  "مسؤول حكومي",

  "جهة محلية",

  "شريك تنمية",

  "منظمة دولية",

  "مستشار",

  "صاحب عمل",

  "عامل تغيير",

  "متحمّس للقضية",
]

const intents = [
  "explain a challenge",

  "suggest an idea",

  "join the cause",

  "partner with the company",

  "book the diagnostic",
]

const intentsAr = [
  "أشرح تحديًا",

  "أقترح فكرة",

  "أنضم إلى القضية",

  "أشارك الشركة",

  "أحجز التشخيص",
]

const forward = [
  "a proper conversation",

  "aligning efforts",

  "collaborating",

  "meeting for coffee",
]

const forwardAr = [
  "محادثة جدية",

  "توحيد الجهود",

  "التعاون",

  "اللقاء على القهوة",
]

const lists = [
  "Public sector briefs (AR)",

  "Development partner digest",

  "Business & investment",

  "NGO toolkit drops",

  "Expert opportunities",
]

const listsAr = [
  "موجزات القطاع العام (عربي)",

  "نشرة شركاء التنمية",

  "الأعمال والاستثمار",

  "حِزم أدوات المنظمات",

  "فرص الخبراء",
]

function Pick({
  value,

  options,

  onChange,
}: {
  value: string

  options: string[]

  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)

  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return

    const off = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }

    document.addEventListener("mousedown", off)

    return () => document.removeEventListener("mousedown", off)
  }, [open])

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="inline-flex items-baseline gap-2 border-b-2 border-gold-light px-1 italic text-gold-light transition hover:text-ivory"
      >
        {value}
        <span
          className={`text-[0.35em] not-italic transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>
      {open && (
        <span className="animate-fade-in absolute start-0 top-full z-30 mt-3 flex w-max max-w-[80vw] flex-col border border-line bg-ivory p-2 font-sans text-base not-italic text-navy shadow-card">
          {options.map((o) => (
            <button
              type="button"
              key={o}
              onClick={() => {
                onChange(o)

                setOpen(false)
              }}
              className={`px-4 py-2 text-start transition hover:bg-ivory-2 ${
                o === value ? "text-gold-strong" : ""
              }`}
            >
              {o}
            </button>
          ))}
        </span>
      )}
    </span>
  )
}

/* which list each role is matched to, by index */

const roleListIdx = [0, 0, 0, 1, 3, 4, 2, 3, 3]

export function Conversation({ lang }: { lang: Lang }) {
  const ar = lang === "ar"

  const rolesShown = ar ? rolesAr : roles

  const intentsShown = ar ? intentsAr : intents

  const forwardShown = ar ? forwardAr : forward

  const listsShown = ar ? listsAr : lists

  const [role, setRole] = useState(rolesShown[0])

  const [intent, setIntent] = useState(intentsShown[0])

  const [fw, setFw] = useState(forwardShown[0])

  // Mailing lists are opt-in marketing consent — default to none selected.

  const [sel, setSel] = useState<string[]>([])

  const [sent, setSent] = useState(false)

  const [email, setEmail] = useState("")

  const [sending, setSending] = useState(false)

  const [error, setError] = useState("")

  const pickRole = (r: string) => {
    setRole(r)

    setSel([listsShown[roleListIdx[rolesShown.indexOf(r)]]])
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()

    setError("")

    setSending(true)

    try {
      await api.submit({
        kind: "CONTACT",

        email,

        source: "site",

        message: ar
          ? `أنا ${role}، وأود أن ${intent}. أتطلّع إلى ${fw}.`
          : `I am a ${role}, and I would like to ${intent}. I'm looking forward to ${fw}.`,

        payload: { role, intent, forward: fw, lists: sel },
      })

      setSent(true)
    } catch (err) {
      setError(
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
      id="contact"
      className="relative scroll-mt-40 overflow-hidden bg-navy-3 text-ivory"
    >
      <Contours className="absolute inset-0 h-full w-full" opacity={0.1} />
      <div className="relative mx-auto grid max-w-[1320px] gap-14 px-5 py-24 md:px-10 lg:grid-split-wide">
        <div>
          <p className="eyebrow text-gold-light">
            {ar ? "08 · ابدأ محادثة" : "08 · Start a conversation"}
          </p>
          {sent ? (
            <div className="animate-fade-up mt-10">
              <Emblem className="h-14 w-14" tone="ivory" />
              <p className="mt-6 max-w-2xl font-display text-h2">
                {ar
                  ? `شكرًا لك. سيتواصل أحد الشركاء خلال يومي عمل لترتيب ${fw}.`
                  : `Thank you. A partner will reach out within two working days to set up ${fw}.`}
              </p>
              {!!sel.length && (
                <p className="mt-4 text-ivory/60">
                  {ar ? "ستتلقّى أيضًا: " : "You'll also receive: "}
                  {sel.join(" · ")}.
                </p>
              )}
              <button
                onClick={() => {
                  setSent(false)

                  setEmail("")
                }}
                className="eyebrow mt-8 border-b border-gold-light pb-1"
              >
                {ar ? "اكتب رسالة أخرى" : "Write another note"}
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              {ar ? (
                <p className="mt-8 font-display text-h2 font-medium">
                  مرحبًا! أنا{" "}
                  <Pick value={role} options={rolesShown} onChange={pickRole} />
                  ، وأود أن{" "}
                  <Pick
                    value={intent}
                    options={intentsShown}
                    onChange={setIntent}
                  />
                  . أتطلّع إلى{" "}
                  <Pick value={fw} options={forwardShown} onChange={setFw} />.
                </p>
              ) : (
                <p className="mt-8 font-display text-h2 font-medium">
                  Hello! I am a{" "}
                  <Pick value={role} options={rolesShown} onChange={pickRole} />
                  , and I would like to{" "}
                  <Pick
                    value={intent}
                    options={intentsShown}
                    onChange={setIntent}
                  />
                  . I'm looking forward to{" "}
                  <Pick value={fw} options={forwardShown} onChange={setFw} />.
                </p>
              )}
              <div className="mt-10">
                <p className="eyebrow text-ivory/65">
                  {ar
                    ? "راسلني أيضًا عبر — اختر ما تقرؤه فقط"
                    : "Also write to me on — pick only what you'd read"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {listsShown.map((l) => {
                    const on = sel.includes(l)

                    return (
                      <button
                        type="button"
                        key={l}
                        aria-pressed={on}
                        onClick={() =>
                          setSel(on ? sel.filter((x) => x !== l) : [...sel, l])
                        }
                        className={`border px-4 py-2 text-sm transition ${
                          on
                            ? "border-gold-light bg-gold-light text-navy"
                            : "border-ivory/20 text-ivory/75 hover:border-ivory/60"
                        }`}
                      >
                        {on ? "✓ " : "+ "}
                        {l}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-4 border-b border-ivory/30 focus-within:border-gold-light">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organisation.org"
                  className="min-w-0 flex-1 bg-transparent py-4 text-lg placeholder:text-ivory/30 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="cursor-pointer eyebrow py-4 text-gold-light transition hover:text-ivory disabled:opacity-60"
                >
                  {sending
                    ? ar
                      ? "جارٍ الإرسال…"
                      : "Sending…"
                    : ar
                      ? "لنتعاون ←"
                      : "Let's collaborate →"}
                </button>
              </div>
              {error && (
                <p role="alert" className="eyebrow mt-4 text-gold-light">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
        <aside className="self-end border border-ivory/15 p-8">
          <p className="eyebrow text-gold-light">
            {ar ? "أو تواصل معنا مباشرة" : "Or reach us directly"}
          </p>
          <ul className="mt-6 space-y-4">
            {(ar
              ? [
                  ["هاتف", "+20 115 000 0984", "tel:+201150000984"],

                  [
                    "البريد",

                    "hello@askterramorph.com",

                    "mailto:hello@askterramorph.com",
                  ],

                  ["LinkedIn", "/company/terramorph", "https://linkedin.com"],

                  [
                    "المكتب",

                    "القاهرة الجديدة، مصر",

                    "https://www.google.com/maps/search/New+Cairo,+Egypt",
                  ],
                ]
              : [
                  ["Phone", "+20 115 000 0984", "tel:+201150000984"],

                  [
                    "Email",

                    "hello@askterramorph.com",

                    "mailto:hello@askterramorph.com",
                  ],

                  ["LinkedIn", "/company/terramorph", "https://linkedin.com"],

                  [
                    "Office",

                    "New Cairo, Egypt",

                    "https://www.google.com/maps/search/New+Cairo,+Egypt",
                  ],
                ]
            )

              .map(([l, v, h]) => (
                <li
                  key={l}
                  className="flex items-baseline justify-between gap-4 border-b border-ivory/10 pb-4"
                >
                  <span className="eyebrow text-ivory/65">{l}</span>
                  <a
                    href={h}
                    className="font-display text-xl transition hover:text-gold-light"
                  >
                    {v}
                  </a>
                </li>
              ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}
