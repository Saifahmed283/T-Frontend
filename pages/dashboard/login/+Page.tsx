import { useState } from "react"

import { api, ApiError } from "@/lib/api"
import { messageForError, getMessage } from "@/lib/messages"

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
      await api.login(email, password)
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
