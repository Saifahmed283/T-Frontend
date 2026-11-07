import { useEffect, useState } from "react"
import { Dialog } from "@/components/ui"
import { api, type SubmissionKind } from "@/lib/api"
import {
  validateEmail,
  validateMessage,
  validateTerms,
} from "@/lib/validation"
import { useFormValidation } from "@/lib/useFormValidation"

export type RequestConfig = {
  kind: SubmissionKind
  title: string
  intro?: string
  submitLabel?: string
  requireMessage?: boolean
  context?: Record<string, unknown>
}

/* Captures a name/email message and records it as a backend Submission. Used by
   every CTA that needs a human reply: seat reservations, teaming, careers,
   tenders, publications and expert registration. */
export function RequestDialog({
  request,
  onClose,
  lang = "en",
}: {
  request: RequestConfig | null
  onClose: () => void
  lang?: "en" | "ar"
}) {
  const ar = lang === "ar"

  const [done, setDone] = useState(false)

  const open = !!request

  const form = useFormValidation({
    fields: {
      name: { initial: "" },
      email: {
        initial: "",
        validate: (value) => validateEmail(value, lang),
      },
      message: {
        initial: "",
        validate: (value) =>
          request?.requireMessage ? validateMessage(value, lang) : null,
      },
      terms: {
        initial: false,
        validate: (value) => validateTerms(value, lang),
      },
    },
    onSubmit: async (values) => {
      if (!request) return

      const emailVal = String(values.email).trim()

      await api.submit({
        kind: request.kind,
        email: emailVal,
        name: String(values.name).trim() || undefined,
        message: String(values.message).trim() || undefined,
        source: "site",
        payload: request.context,
      })

      setDone(true)

      // Record terms acceptance with backend
      void api
        .termsAcceptanceRecord({
          email: emailVal,
          privacyVersion: "1.0",
          termsVersion: "1.0",
          source: "request-dialog",
        })
        .catch(() => {
          /* non-blocking */
        })
    },
  })

  const close = () => {
    setDone(false)
    form.reset()
    onClose()
  }

  useEffect(() => {
    if (open) {
      setDone(false)
      form.reset()
    }
    // Reset only when the dialog opens; `form.reset` is stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog
      open={open}
      onClose={close}
      onBackdropClick={close}
      labelledBy="request-dialog-title"
      className="grid place-items-center bg-navy-3/70 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`animate-fade-in mx-5 w-[min(520px,92vw)] border border-line bg-ivory shadow-2xl dir-${ar ? "rtl" : "ltr"}`}
      >
        {done ? (
          <div className="p-10 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ok text-ivory">
              ✓
            </span>
            <h3 id="request-dialog-title" className="mt-6 text-3xl font-medium">
              {ar ? "تم استلام طلبك" : "Got it — we're on it."}
            </h3>
            <p className="mt-3 text-navy-2">
              {ar
                ? "سيتواصل معك أحد الشركاء خلال يومَي عمل. لا نشارك بياناتك أبدًا."
                : "A partner will reach out within two working days. We never share your details."}
            </p>
            <button
              onClick={close}
              className="mt-8 border border-navy px-6 py-3 text-xs tracking-cta text-navy uppercase transition hover:bg-navy hover:text-ivory"
            >
              {ar ? "إغلاق" : "Close"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-line px-8 py-5">
              <p className="eyebrow text-gold-strong">{request?.title}</p>
              <button
                onClick={close}
                aria-label={ar ? "إغلاق" : "Close"}
                className="grid h-8 w-8 place-items-center text-navy transition hover:bg-ivory-2"
              >
                ✕
              </button>
            </div>
            <form
              {...form.formProps}
              className="p-8"
              aria-busy={form.isSubmitting || undefined}
            >
              {request?.intro && (
                <p className="text-sm text-slate">{request.intro}</p>
              )}
              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className="eyebrow text-slate">
                    {ar ? "اسمك الكامل" : "Your name"}
                  </span>
                  <input
                    {...form.input("name")}
                    type="text"
                    autoComplete="name"
                    placeholder={ar ? "الاسم الكامل" : "Full name"}
                    className="mt-2 w-full border-b border-navy/30 bg-transparent py-2 focus:border-gold focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow text-slate">
                    {ar ? "البريد الإلكتروني " : "Work email "}
                    <span className="text-gold-strong">*</span>
                  </span>
                  <input
                    {...form.input("email")}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@organisation.org"
                    aria-required="true"
                    className={`mt-2 w-full border-b bg-transparent py-2 focus:border-gold focus:outline-none ${
                      form.error("email") ? "border-error" : "border-navy/30"
                    }`}
                  />
                  {form.error("email") && (
                    <p
                      id={form.errorId("email")}
                      role="alert"
                      className="mt-2 text-xs font-medium text-error"
                    >
                      {form.error("email")}
                    </p>
                  )}
                </label>
                <label className="block">
                  <span className="eyebrow text-slate">
                    {ar ? "رسالة" : "Message "}
                    {request?.requireMessage
                      ? " *"
                      : ar
                        ? " — اختياري"
                        : " — optional"}
                  </span>
                  <textarea
                    {...form.input("message")}
                    rows={3}
                    placeholder={ar ? "أي شيء يجب أن نعلمه للاستعداد؟" : "Anything we should know to prepare?"}
                    aria-required={request?.requireMessage ? "true" : undefined}
                    className={`mt-2 w-full resize-none border-b bg-transparent py-2 focus:border-gold focus:outline-none ${
                      form.error("message") ? "border-error" : "border-navy/30"
                    }`}
                  />
                  {form.error("message") && (
                    <p
                      id={form.errorId("message")}
                      role="alert"
                      className="mt-2 text-xs font-medium text-error"
                    >
                      {form.error("message")}
                    </p>
                  )}
                </label>
              </div>
              <label className="flex items-start gap-3 mt-4 border-t border-line pt-4">
                <input
                  {...form.checkbox("terms")}
                  type="checkbox"
                  className={`mt-1 h-4 w-4 shrink-0 rounded text-gold-strong focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                    form.error("terms")
                      ? "border-error ring-1 ring-error"
                      : "border-navy/30"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <span className="block text-sm text-navy-2">
                    {ar ? "أوافق على " : "I accept the "}
                    <a
                      href="/legal/privacy-policy"
                      className="underline decoration-gold underline-offset-2 hover:text-navy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ar ? "سياسة الخصوصية" : "Privacy Policy"}
                    </a>{" "}
                    {ar ? " و " : " and "}
                    <a
                      href="/legal/terms-of-service"
                      className="underline decoration-gold underline-offset-2 hover:text-navy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ar ? "شروط الخدمة" : "Terms of Service"}
                    </a>
                  </span>
                  <p className="mt-1 text-xs text-slate">
                    {ar ? "بإرسال هذا الطلب، أنت تقبل معالجة بياناتك وفقًا لسياسة الخصوصية." : "By submitting this request, you accept processing of your data per the Privacy Policy."}
                  </p>
                  {form.error("terms") && (
                    <p
                      id={form.errorId("terms")}
                      role="alert"
                      className="mt-2 text-xs font-medium text-error"
                    >
                      {form.error("terms")}
                    </p>
                  )}
                </div>
              </label>
              {form.submitError && (
                <p role="alert" className="eyebrow mt-5 text-error">
                  {form.submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={form.isSubmitting}
                aria-busy={form.isSubmitting || undefined}
                className="mt-8 w-full bg-navy px-6 py-4 text-xs tracking-cta text-ivory uppercase transition hover:bg-navy-2 disabled:opacity-60"
              >
                {form.isSubmitting
                  ? ar
                    ? "جارٍ الإرسال…"
                    : "Sending…"
                  : (request?.submitLabel ?? (ar ? "طلب" : "Request"))}{" "}
                →
              </button>
            </form>
          </>
        )}
      </div>
    </Dialog>
  )
}
