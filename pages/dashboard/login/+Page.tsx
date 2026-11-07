import { useState } from "react"

import { api, ApiError } from "@/lib/api"
import { messageForError, getMessage } from "@/lib/messages"
import posthog from "@/lib/posthog.client"
import { logPosthogInfo } from "@/lib/posthog.logs"

import { SignInPage } from "@/pages/dashboard/components/SignIn"

/* Dedicated login route at /dashboard/login. Unauthenticated visitors are
   redirected here from /dashboard. After a successful sign-in the visitor is
   sent back to the `return` query parameter (default: /dashboard). */
export default function LoginPage() {
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const params = new URLSearchParams(window.location.search)
  const returnTo = params.get("return") ?? "/dashboard"

  const handleLogin = async (email: string, password: string) => {
    setBusy(true)
    setError("")
    try {
      const session = await api.login(email, password)
      posthog.identify(session.user.id, {
        email: session.user.email,
        name: session.user.name,
        role: session.role,
      })
      posthog.capture("user_logged_in", { role: session.role })
      logPosthogInfo("dashboard_login_succeeded", { role: session.role })
      window.location.replace(returnTo)
    } catch (ex) {
      setBusy(false)
      const { message } = messageForError(ex)
      setError(message)
    }
  }

  return (
    <SignInPage onLogin={handleLogin} busy={busy} error={error || undefined} />
  )
}
