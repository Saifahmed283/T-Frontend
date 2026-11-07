import { useEffect, useState, type FormEvent } from "react"
import { Dialog } from "@/components/ui"
import { api, ApiError, type SubmissionKind } from "@/lib/api"

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

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [phase, setPhase] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  )
  const [error, setError] = useState("")

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const open = !!request

  useEffect(() => {
    if (open) {
      setName("")
      setEmail("")
      setMessage("")
      setPhase("idle")
      setError("")
    }
  }, [open])

  const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value.trim())

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!request) return

    setError("")

    if (!isValidEmail(email)) {
      setError(
        ar ? "يرجى إدخال عنوان بريد إلكتروني صحيح." : "Please enter a valid email address.",
      )

      return
    }

    if (!termsAccepted) {
      setError(
        ar
          ? "يرجى قبول سياسة الخصوصية وشروط الخدمة للمتابعة."
          : "Please accept the Privacy Policy and Terms of Service to continue.",
      )

      return
    }

    setPhase("sending")
    try {
      await api.submit({
        kind: request.kind,
        email,
        name: name.trim() || undefined,
        message: message.trim() || undefined,
        source: "site",
        payload: request.context,
      })
      setPhase("done")

      // Record terms acceptance with backend
      void api.termsAcceptanceRecord({
        email,
        privacyVersion: '1.0',
        termsVersion: '1.0',
        source: 'request-dialog',
      }).catch(() => { /* non-blocking */ })
    } catch (err) {
      setPhase("error")
      setError(
        err instanceof ApiError
          ? err.message
          : ar
            ? "حدث خطأ ما. حاول مرة أخرى."
            : "Something went wrong. Please try again.",
      )
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onBackdropClick={onClose}
      labelledBy="request-dialog-title"
      className="grid place-items-center bg-navy-3/70 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`animate-fade-in mx-5 w-[min(520px,92vw)] border border-line bg-ivory shadow-2xl dir-${ar ? "rtl" : "ltr"}`}
      >
        {phase === "done" ? (
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
              onClick={onClose}
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
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center text-navy transition hover:bg-ivory-2"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={submit}
              className="p-8"
              aria-busy={phase === "sending"}
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    name="name"
                    autoComplete="name"
                    placeholder={ar ? "الاسم الكامل" : "Full name"}
                    className="mt-2 w-full border-b border-navy/30 bg-transparent py-2 focus:border-gold focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow text-slate">
                    {ar ? "البريد الإلكتروني ×" : "Work email "}
                    <span className="text-gold-strong">*</span>
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@organisation.org"
                    className="mt-2 w-full border-b border-navy/30 bg-transparent py-2 focus:border-gold focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow text-slate">
                    {ar ? "رسالة" : "Message "}
                    {request?.requireMessage ? " *" : " — optional"}
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required={request?.requireMessage}
                    name="message"
                    rows={3}
                    placeholder={ar ? "أي شيء يجب أن نعلمه للاستعداد؟" : "Anything we should know to prepare?"}
                    className="mt-2 w-full resize-none border-b border-navy/30 bg-transparent py-2 focus:border-gold focus:outline-none"
                  />
                </label>
              </div>
              <label className="flex items-start gap-3 mt-4 border-t border-line pt-4">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-navy/30 text-gold-strong focus:ring-2 focus:ring-gold focus:ring-offset-2"
                  required
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
                </div>
              </label>
              {phase === "error" && (
                <p role="alert" className="eyebrow mt-5 text-error">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={phase === "sending"}
                className="mt-8 w-full bg-navy px-6 py-4 text-xs tracking-cta text-ivory uppercase transition hover:bg-navy-2 disabled:opacity-60"
              >
                {phase === "sending"
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
