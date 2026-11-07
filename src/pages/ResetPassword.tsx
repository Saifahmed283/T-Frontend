import { useEffect, useState } from "react"
import { LockKeyhole } from "lucide-react"
import { api } from "@/lib/api"
import { messageForError } from "@/lib/messages"
import {
  passwordStrength,
  validatePassword,
  validatePasswordMatch,
} from "@/lib/validation"
import { useFormValidation } from "@/lib/useFormValidation"
import { Button, Field, Heading, Input } from "@/pages/dashboard/ui"

/* Landing page for the single-use link in a password-reset email. Rendered
   client-only (see pages/reset-password/+config.ts) so the token stays in the
   URL fragment-free query string and never reaches prerendered HTML. */
export default function ResetPassword() {
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setToken(params.get("token"))
    setReady(true)
  }, [])

  const form = useFormValidation({
    fields: {
      password: {
        initial: "",
        validate: (value) => validatePassword(value, "en"),
      },
      confirm: {
        initial: "",
        validate: (value, values) =>
          validatePasswordMatch(values.password, value, "en"),
      },
    },
    onSubmit: async (values) => {
      if (!token) return
      try {
        await api.resetPassword(token, String(values.password))
        setDone(true)
      } catch (cause) {
        const { message } = messageForError(cause, "en")
        throw new Error(
          message ||
            "Could not reset the password. Request a new link and try again.",
        )
      }
    },
  })

  const password = String(form.values.password ?? "")
  const strength = passwordStrength(password)
  const strengthTone =
    strength.score >= 3
      ? "bg-ok-strong"
      : strength.score === 2
        ? "bg-warn-strong"
        : "bg-error"

  return (
    <div className="tm-workspace">
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="wordmark">
              TERRAMORPH<span className="brand-period">.</span>
            </div>
            <div className="brand-subline">CONTENT WORKSPACE</div>
          </div>

          {!ready ? (
            <p className="auth-lead">Checking your reset link…</p>
          ) : done ? (
            <>
              <Heading level={2}>Password updated</Heading>
              <p className="auth-lead">
                Your password has been changed and every other session has been
                signed out.
              </p>
              <a
                className="button button-primary auth-submit"
                href="/dashboard"
              >
                Continue to sign in
              </a>
            </>
          ) : !token ? (
            <>
              <Heading level={2}>Link not valid</Heading>
              <p role="alert" className="auth-lead text-error">
                This page is missing its reset token. Request a new link from
                the sign-in screen.
              </p>
              <a
                className="button button-primary auth-submit"
                href="/dashboard"
              >
                Back to sign in
              </a>
            </>
          ) : (
            <>
              <Heading level={2}>Choose a new password</Heading>
              <p className="auth-lead">
                Use at least 12 characters. The reset link works once and
                expires shortly after it is sent.
              </p>
              <form {...form.formProps}>
                <Field
                  label="New password"
                  required
                  hint="At least 12 characters."
                  error={form.error("password") ?? undefined}
                >
                  <Input
                    {...form.input("password")}
                    type="password"
                    autoComplete="new-password"
                    autoFocus
                    required
                    minLength={12}
                  />
                </Field>
                {password.length > 0 && (
                  <div
                    className="mt-2 mb-3 flex items-center gap-2"
                    aria-live="polite"
                  >
                    <span className="flex gap-1" aria-hidden="true">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={`h-1 w-8 rounded ${
                            i < strength.score ? strengthTone : "bg-line"
                          }`}
                        />
                      ))}
                    </span>
                    <span className="text-xs text-slate-strong">
                      {strength.label.en}
                    </span>
                  </div>
                )}
                <Field
                  label="Confirm new password"
                  required
                  error={form.error("confirm") ?? undefined}
                >
                  <Input
                    {...form.input("confirm")}
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                  />
                </Field>
                {form.submitError && (
                  <p role="alert" className="auth-error text-error">
                    {form.submitError}
                  </p>
                )}
                <Button
                  variant="primary"
                  type="submit"
                  className="auth-submit"
                  disabled={form.isSubmitting}
                  aria-busy={form.isSubmitting || undefined}
                >
                  <LockKeyhole size={15} />
                  {form.isSubmitting ? "Updating…" : "Update password"}
                </Button>
              </form>
            </>
          )}

          <p className="auth-foot">
            TerraMorph <span className="footer-dot">·</span> Leverage for Good.
          </p>
        </div>
      </div>
    </div>
  )
}
