import { useEffect, useState, type FormEvent } from "react"
import { LockKeyhole } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import { Button, Field, Heading, Input } from "@/pages/dashboard/ui"

/* Landing page for the single-use link in a password-reset email. Rendered
   client-only (see pages/reset-password/+config.ts) so the token stays in the
   URL fragment-free query string and never reaches prerendered HTML. */
export default function ResetPassword() {
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setToken(params.get("token"))
    setReady(true)
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return
    if (password.length < 12) {
      return setError("Choose a password of at least 12 characters.")
    }
    if (password !== confirm) {
      return setError("The two passwords do not match.")
    }
    setBusy(true)
    setError("")
    try {
      await api.resetPassword(token, password)
      setDone(true)
    } catch (ex) {
      setError(
        ex instanceof ApiError
          ? ex.message
          : "Could not reset the password. Request a new link and try again.",
      )
    } finally {
      setBusy(false)
    }
  }

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
              <form onSubmit={submit}>
                <Field
                  label="New password"
                  required
                  hint="At least 12 characters."
                >
                  <Input
                    type="password"
                    autoComplete="new-password"
                    autoFocus
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={12}
                  />
                </Field>
                <Field label="Confirm new password" required>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    required
                    minLength={12}
                  />
                </Field>
                {error && (
                  <p role="alert" className="auth-error text-error">
                    {error}
                  </p>
                )}
                <Button
                  variant="primary"
                  type="submit"
                  className="auth-submit"
                  disabled={busy}
                >
                  <LockKeyhole size={15} />
                  {busy ? "Updating…" : "Update password"}
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
