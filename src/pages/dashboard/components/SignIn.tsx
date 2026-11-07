import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react"

import { api } from "@/lib/api"
import { ensureArabicFonts } from "@/lib/fonts"
import { messageForError, getMessage } from "@/lib/messages"
import { VALIDATION_MESSAGES, validateEmail } from "@/lib/validation"

import "@/styles/dashboard.css"

import {
  Mail,
  LockKeyhole,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"

/* SignInPage — the login screen at /dashboard/login.

   Design concept: "the ground floor." TerraMorph is Terra + Morph, so the
   brand panel is a cartographic field — nested contour lines that draw
   themselves on entry and then drift, a single gold lever node, and a rail of
   the real method stages (Diagnose / Design / Deliver) from src/content/data.ts.

   The form panel is deliberately quiet: one column, 52px fields, a gold focus
   ring, Caps Lock detection and a gold shimmer on submit. Under 860px the
   brand panel folds away and the wordmark takes its place.

   No testimonial, statistic or placeholder claim is rendered here. */

type Pt = [number, number]

/* Closed Catmull-Rom spline → cubic Béziers. Deterministic, so the markup is
   identical on every render. */
function smoothClosed(points: Pt[]): string {
  const n = points.length
  let d = `M ${points[0][0]} ${points[0][1]}`

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]

    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6

    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }

  return `${d} Z`
}

function contour(cx: number, cy: number, r: number, seed: number): string {
  const n = 64
  const points: Pt[] = []

  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const wobble =
      1 +
      0.1 * Math.sin(3 * a + seed) +
      0.055 * Math.cos(5 * a - seed * 1.7) +
      0.028 * Math.sin(7 * a + seed * 0.6)

    points.push([
      Math.round((cx + Math.cos(a) * r * wobble) * 10) / 10,
      Math.round((cy + Math.sin(a) * r * wobble * 0.88) * 10) / 10,
    ])
  }

  return smoothClosed(points)
}

const CONTOURS = Array.from({ length: 9 }, (_, i) => ({
  d: contour(212 + i * 2, 202 - i * 2, 172 - i * 17, i * 1.37),
  opacity: Math.max(0.1, 0.5 - i * 0.045),
}))

const EN = {
  langLabel: "Language",
  secure: "Secure session",
  pitchA: "The ground",
  pitchB: "beneath the work.",
  steps: [
    { n: "01", name: "Diagnose", line: "Name the binding constraint." },
    { n: "02", name: "Design", line: "Cost the options, owners and sequence." },
    { n: "03", name: "Deliver", line: "Report against agreed indicators." },
  ],
  note: "Advisory for organisations creating measurable social impact.",
  noteBy: "TerraMorph · Leverage for Good",
  edge: "TerraMorph · Workspace",
  eyebrow: "Sign in",
  welcome: "Welcome back.",
  sub: "Enter your credentials to open the workspace.",
  resetTitle: "Reset your password.",
  resetSub: "We'll email a reset link if the account exists.",
  email: "Work email",
  password: "Password",
  remember: "Remember me",
  forgot: "Forgot password?",
  signIn: "Sign in",
  signingIn: "Signing in",
  send: "Send reset link",
  sending: "Sending",
  caps: "Caps Lock is on.",
  emailError: "Enter a valid email address.",
  back: "Back to sign in",
  sent: "If an account exists for that address, a reset link is on its way.",
  resetFailed: "Could not send the link. Please try again.",
  hide: "Hide password",
  show: "Show password",
  backToSite: "Back to the site",
  leverage: "Leverage for Good",
} as const

const AR = {
  langLabel: "اللغة",
  secure: "جلسة آمنة",
  pitchA: "الأرض التي",
  pitchB: "يقف عليها العمل.",
  steps: [
    { n: "01", name: "تشخيص", line: "حدّد القيد الحاكم." },
    { n: "02", name: "تصميم", line: "سعّر الخيارات والمالكين والتسلسل." },
    { n: "03", name: "تنفيذ", line: "قدّم تقارير مقابل المؤشرات المتفق عليها." },
  ],
  note: "استشارات للمؤسسات التي تصنع أثراً اجتماعياً قابلاً للقياس.",
  noteBy: "TerraMorph · نفعٌ للخير",
  edge: "TerraMorph · Workspace",
  eyebrow: "تسجيل الدخول",
  welcome: "مرحباً بعودتك.",
  sub: "أدخل بياناتك لفتح مساحة العمل.",
  resetTitle: "إعادة تعيين كلمة المرور.",
  resetSub: "سنرسل رابط إعادة التعيين إن وُجد الحساب.",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  remember: "تذكّرني",
  forgot: "نسيت كلمة المرور؟",
  signIn: "تسجيل الدخول",
  signingIn: "جارٍ تسجيل الدخول",
  send: "إرسال رابط التعيين",
  sending: "جارٍ الإرسال",
  caps: "مفتاح Caps Lock مفعّل.",
  emailError: "أدخل بريداً إلكترونياً صالحاً.",
  back: "العودة لتسجيل الدخول",
  sent: "إن وُجد حساب بهذا البريد، فرابط إعادة التعيين في طريقه إليك.",
  resetFailed: "تعذّر إرسال الرابط. حاول مرة أخرى.",
  hide: "إخفاء كلمة المرور",
  show: "إظهار كلمة المرور",
  backToSite: "العودة إلى الموقع",
  leverage: "نفعٌ للخير",
} as const

export function SignInPage({
  onLogin,
  busy,
  error,
}: {
  onLogin: (email: string, password: string) => Promise<void>

  busy?: boolean

  error?: string
}) {
  const [lang, setLang] = useState<"en" | "ar">("en")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState<"signin" | "forgot">("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [touched, setTouched] = useState<{
    email: boolean
    password: boolean
  }>({ email: false, password: false })
  const [attempted, setAttempted] = useState(false)
  const [notice, setNotice] = useState("")
  const [resetError, setResetError] = useState("")
  const [resetBusy, setResetBusy] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const ar = lang === "ar"
  const t = ar ? AR : EN

  useEffect(() => {
    if (ar) ensureArabicFonts()
  }, [ar])

  const emailValid = validateEmail(email, lang) === null
  const emailRequired = ar
    ? VALIDATION_MESSAGES.emailRequired.ar
    : VALIDATION_MESSAGES.emailRequired.en
  const emailInvalid = ar
    ? VALIDATION_MESSAGES.emailInvalid.ar
    : VALIDATION_MESSAGES.emailInvalid.en
  const passwordRequired = ar
    ? VALIDATION_MESSAGES.passwordRequired.ar
    : VALIDATION_MESSAGES.passwordRequired.en

  const emailMessage = email.trim().length === 0 ? emailRequired : emailValid ? null : emailInvalid
  const passwordMessage =
    mode === "signin" && password.trim().length === 0 ? passwordRequired : null

  const showEmailError = (attempted || touched.email) && emailMessage !== null
  const showPasswordError =
    mode === "signin" && (attempted || touched.password) && passwordMessage !== null

  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      setAttempted(true)

      if (emailMessage || passwordMessage) {
        requestAnimationFrame(() => {
          formRef.current
            ?.querySelector<HTMLElement>('[aria-invalid="true"]')
            ?.focus()
        })
        return
      }

      if (mode === "signin") {
        void onLogin(email.trim(), password)
        return
      }

      setResetBusy(true)
      setNotice("")
      setResetError("")

      api
        .forgotPassword(email.trim())
        .then(() => setNotice(t.sent))
        .catch((ex) => {
          const { message } = messageForError(ex, ar ? "ar" : "en")
          setResetError(message)
        })
        .finally(() => setResetBusy(false))
    },
    [
      ar,
      email,
      emailMessage,
      mode,
      onLogin,
      password,
      passwordMessage,
      t.resetFailed,
      t.sent,
    ],
  )

  const readCaps = (e: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(e.getModifierState("CapsLock"))

  const resetValidation = () => {
    setAttempted(false)
    setTouched({ email: false, password: false })
  }

  const toSignIn = () => {
    setMode("signin")
    setNotice("")
    setResetError("")
    resetValidation()
  }

  const toForgot = () => {
    setMode("forgot")
    setNotice("")
    setResetError("")
    resetValidation()
  }

  const Arrow = ar ? ArrowLeft : ArrowRight

  return (
    <div className="tm-login" dir={ar ? "rtl" : "ltr"} lang={ar ? "ar" : "en"}>
      <section className="tm-login__shell">
        <aside className="tm-login__brand">
          <div className="tm-login__contours" aria-hidden="true">
            <svg
              viewBox="0 0 420 400"
              preserveAspectRatio="xMidYMid slice"
              focusable="false"
            >
              {CONTOURS.map((c) => (
                <path
                  key={c.d}
                  className="tm-login__contour"
                  d={c.d}
                  pathLength={1}
                  strokeOpacity={c.opacity}
                />
              ))}
            </svg>
          </div>

          <span className="tm-login__lever" aria-hidden="true" />
          <span className="tm-login__edge" aria-hidden="true">
            {t.edge}
          </span>

          <div className="tm-login__brandbody">
            <div className="tm-login__logo">
              <img src="/logo.svg" alt="TerraMorph" width={178} height={61} />
            </div>

            <h2 className="tm-login__pitch">
              {t.pitchA} <span>{t.pitchB}</span>
            </h2>

            <ol className="tm-login__rail">
              {t.steps.map((step) => (
                <li key={step.n}>
                  <span className="tm-login__rail-n">{step.n}</span>
                  <span>
                    <span className="tm-login__rail-name">{step.name}</span>
                    <span className="tm-login__rail-line">{step.line}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="tm-login__note">
              <p>{t.note}</p>
              <span>{t.noteBy}</span>
            </div>
          </div>
        </aside>

        <div className="tm-login__panel">
          <div className="tm-login__topbar">
            <span className="tm-login__secure">
              <i aria-hidden="true" />
              {t.secure}
            </span>

            <div className="tm-lang" role="group" aria-label={t.langLabel}>
              <button
                type="button"
                aria-pressed={!ar}
                onClick={() => setLang("en")}
              >
                EN
              </button>
              <button
                type="button"
                aria-pressed={ar}
                onClick={() => setLang("ar")}
                lang="ar"
              >
                ع
              </button>
            </div>
          </div>

          <div className="tm-login__wordmark" aria-hidden="true">
            TerraMorph<span>.</span>
          </div>

          <form
            ref={formRef}
            className="tm-login__form"
            onSubmit={submit}
            noValidate
          >
            <p className="tm-login__eyebrow">{t.eyebrow}</p>

            <h1 className="tm-login__h">
              {mode === "forgot" ? t.resetTitle : t.welcome}
            </h1>
            <p className="tm-login__sub">
              {mode === "forgot" ? t.resetSub : t.sub}
            </p>

            {mode === "forgot" && (
              <button type="button" className="tm-login__back" onClick={toSignIn}>
                <ArrowLeft size={14} strokeWidth={1.7} aria-hidden="true" />
                {t.back}
              </button>
            )}

            <div className="tm-login__field">
              <label className="tm-login__label" htmlFor="tm-login-email">
                <span>{t.email}</span>
                <em aria-hidden="true">*</em>
              </label>
              <div className="tm-login__control" data-invalid={showEmailError}>
                <Mail
                  className="tm-login__icon"
                  size={16}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <input
                  id="tm-login-email"
                  className="tm-login__input"
                  type="email"
                  name="email"
                  autoComplete="username"
                  inputMode="email"
                  spellCheck={false}
                  placeholder="you@askterramorph.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, email: true }))
                  }
                  aria-invalid={showEmailError || undefined}
                  aria-describedby={
                    showEmailError ? "tm-login-email-error" : undefined
                  }
                  disabled={busy || resetBusy}
                  autoFocus
                  required
                />
                {emailValid && !showEmailError && (
                  <CheckCircle2
                    className="tm-login__valid"
                    size={16}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                )}
              </div>
              {showEmailError && (
                <p className="tm-login__hint" id="tm-login-email-error" role="alert">
                  <AlertCircle size={12} strokeWidth={1.8} aria-hidden="true" />
                  {emailMessage}
                </p>
              )}
            </div>

            {mode === "signin" && (
              <>
                <div className="tm-login__field">
                  <label className="tm-login__label" htmlFor="tm-login-password">
                    <span>{t.password}</span>
                    <em aria-hidden="true">*</em>
                  </label>
                  <div
                    className="tm-login__control"
                    data-invalid={showPasswordError}
                  >
                    <LockKeyhole
                      className="tm-login__icon"
                      size={16}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <input
                      id="tm-login-password"
                      className="tm-login__input"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, password: true }))
                      }
                      onKeyDown={readCaps}
                      onKeyUp={readCaps}
                      aria-invalid={showPasswordError || undefined}
                      aria-describedby={
                        [
                          showPasswordError ? "tm-login-password-error" : null,
                          capsLock ? "tm-login-caps" : null,
                        ]
                          .filter(Boolean)
                          .join(" ") || undefined
                      }
                      disabled={busy}
                      required
                    />
                    <button
                      type="button"
                      className="tm-login__reveal"
                      aria-label={showPassword ? t.hide : t.show}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={busy}
                    >
                      {showPassword ? (
                        <EyeOff size={16} strokeWidth={1.5} />
                      ) : (
                        <Eye size={16} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                  {showPasswordError && (
                    <p
                      className="tm-login__hint"
                      id="tm-login-password-error"
                      role="alert"
                    >
                      <AlertCircle
                        size={12}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      {passwordMessage}
                    </p>
                  )}
                  {capsLock && (
                    <p className="tm-login__hint" id="tm-login-caps" role="status">
                      <AlertCircle size={12} strokeWidth={1.8} aria-hidden="true" />
                      {t.caps}
                    </p>
                  )}
                </div>

                <div className="tm-login__options">
                  <label className="tm-login__remember">
                    <input type="checkbox" name="remember" />
                    {t.remember}
                  </label>
                  <button type="button" className="tm-login__link" onClick={toForgot}>
                    {t.forgot}
                  </button>
                </div>
              </>
            )}

            {error && mode === "signin" && (
              <p role="alert" className="tm-login__alert">
                <AlertCircle size={15} strokeWidth={1.7} aria-hidden="true" />
                {error}
              </p>
            )}

            {resetError && mode === "forgot" && (
              <p role="alert" className="tm-login__alert">
                <AlertCircle size={15} strokeWidth={1.7} aria-hidden="true" />
                {resetError}
              </p>
            )}

            {notice && mode === "forgot" && !resetError && (
              <p role="status" className="tm-login__ok">
                <CheckCircle2 size={15} strokeWidth={1.7} aria-hidden="true" />
                {notice}
              </p>
            )}

            <button
              type="submit"
              className="tm-login__submit"
              disabled={busy || resetBusy}
              aria-busy={busy || resetBusy || undefined}
            >
              {busy || resetBusy ? (
                <>
                  <span className="tm-login__spinner" aria-hidden="true" />
                  {mode === "forgot" ? t.sending : t.signingIn}
                </>
              ) : (
                <>
                  {mode === "forgot" ? t.send : t.signIn}
                  <Arrow size={16} strokeWidth={1.8} aria-hidden="true" />
                </>
              )}
            </button>

            <p className="tm-login__foot">
              <a href="/">{t.backToSite}</a>
              <span>{t.leverage}</span>
            </p>
          </form>
        </div>
      </section>
    </div>
  )
}
