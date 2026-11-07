import { useEffect, useRef, useState } from "react"

import { Contours, Emblem } from "@/components/motion/fx"

import { api } from "@/lib/api"
import {
  validateEmail,
  validateTerms,
} from "@/lib/validation"
import { useFormValidation } from "@/lib/useFormValidation"

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

  const form = useFormValidation({
    fields: {
      email: {
        initial: "",
        validate: (value) => validateEmail(value, lang),
      },
      terms: {
        initial: false,
        validate: (value) => validateTerms(value, lang),
      },
    },
    onSubmit: async (values) => {
      await api.submit({
        kind: "CONTACT",
        email: String(values.email).trim(),
        source: "site",
        message: ar
          ? `أنا ${role}، وأود أن ${intent}. أتطلّع إلى ${fw}.`
          : `I am a ${role}, and I would like to ${intent}. I'm looking forward to ${fw}.`,
        payload: { role, intent, forward: fw, lists: sel },
      })

      setSent(true)

      // Record terms acceptance with backend (non-blocking)
      void api
        .termsAcceptanceRecord({
          email: String(values.email).trim(),
          privacyVersion: "1.0",
          termsVersion: "1.0",
          source: "conversation",
        })
        .catch(() => {
          /* non-blocking */
        })
    },
  })

  const pickRole = (r: string) => {
    setRole(r)

    // Marketing consent is explicit opt-in only — never pre-select a list.
  }

  return (
    <section
      id="contact"
      className="relative scroll-mt-40 overflow-hidden bg-navy-3 text-ivory"
    >
      <Contours className="absolute inset-0 h-full w-full" opacity={0.1} />
      <div className="relative mx-auto grid max-w-[1320px] gap-8 px-4 py-12 sm:gap-10 sm:px-5 sm:py-16 md:px-10 md:py-24 lg:grid-split-wide lg:gap-14">
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
                  form.setValue("email", "")
                  form.markTouched("email")
                }}
                className="eyebrow mt-8 border-b border-gold-light pb-1"
              >
                {ar ? "اكتب رسالة أخرى" : "Write another note"}
              </button>
            </div>
          ) : (
            <form {...form.formProps}>
              {ar ? (
                <p className="mt-6 font-display text-h2 font-medium sm:mt-8">
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
                <p className="mt-6 font-display text-h2 font-medium sm:mt-8">
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
              <div className="mt-6 sm:mt-10">
                <p className="eyebrow text-ivory/65">
                  {ar
                    ? "راسلني أيضًا عبر — اختر ما تقرؤه فقط"
                    : "Also write to me on — pick only what you'd read"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
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
                        className={`border px-3 py-1.5 text-xs transition min-h-[40px] sm:px-4 sm:py-2 sm:text-sm ${
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
              <label className="flex items-start gap-3 mt-4 border-t border-ivory/30 pt-4">
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
                    {ar ? "بإرسال هذا النموذج، أنت تقبل معالجة بياناتك وفقًا لسياسة الخصوصية." : "By submitting this form, you accept processing of your data per the Privacy Policy."}
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
              <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-ivory/30 focus-within:border-gold-light sm:mt-10 sm:gap-4">
                <input
                  {...form.input("email")}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@organisation.org"
                  className="min-w-0 flex-1 bg-transparent py-3 text-base placeholder:text-ivory/30 focus:outline-none sm:py-4 sm:text-lg"
                />
                {form.error("email") && (
                  <p
                    id={form.errorId("email")}
                    role="alert"
                    className="eyebrow mt-2 text-error-light"
                  >
                    {form.error("email")}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={form.isSubmitting}
                  aria-busy={form.isSubmitting || undefined}
                  className="cursor-pointer eyebrow py-3 text-gold-light transition hover:text-ivory disabled:opacity-60 min-h-[44px] sm:py-4"
                >
                  {form.isSubmitting
                    ? ar
                      ? "جارٍ الإرسال…"
                      : "Sending…"
                    : ar
                      ? "لنتعاون ←"
                      : "Let's collaborate →"}
                </button>
              </div>
              {form.submitError && (
                <p role="alert" className="eyebrow mt-4 text-error-light">
                  {form.submitError}
                </p>
              )}
            </form>
          )}
        </div>
        <aside className="self-start border border-ivory/15 p-5 sm:self-end sm:p-6 md:p-8">
          <p className="eyebrow text-gold-light">
            {ar ? "أو تواصل معنا مباشرة" : "Or reach us directly"}
          </p>
          <ul className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
            {(ar
              ? [
                  ["هاتف", "+20 115 000 0984", "tel:+201150000984"],

                  [
                    "المسؤول",
                    "mbaraka@askterramorph.com",
                    "mailto:mbaraka@askterramorph.com",
                  ],

                  [
                    "لينكد إن",
                    "terramorph LLC",
                    "https://linkedin.com/company/terramorph",
                  ],

                  [
                    "المكتب",

                    "5 بغداد، هليوبوليس، القاهرة، EGY",

                    "https://www.google.com/maps/search/5+Baghdad+St.+Heliopolis+Cairo+Egypt",
                  ],
                ]
              : [
                  ["Phone", "+20 115 000 0984", "tel:+201150000984"],

                  [
                    "Admin",
                    "mbaraka@askterramorph.com",
                    "mailto:mbaraka@askterramorph.com",
                  ],

                  [
                    "LinkedIn",
                    "terramorph LLC",
                    "https://linkedin.com/company/terramorph",
                  ],

                  [
                    "Office",

                    "5 Baghdad St., Heliopolis, Cairo, EGY",

                    "https://www.google.com/maps/search/5+Baghdad+St.+Heliopolis+Cairo+Egypt",
                  ],
                ]
            )

              .map(([l, v, h]) => (
                <li
                  key={l}
                  className="flex flex-col items-start gap-1 border-b border-ivory/10 pb-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 sm:pb-4"
                >
                  <span className="eyebrow text-ivory/65">{l}</span>
                  <a
                    href={h}
                    className="font-display text-lg transition hover:text-gold-light sm:text-xl"
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
