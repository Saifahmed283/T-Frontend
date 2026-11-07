import { useState } from "react"

import { api } from "@/lib/api"
import { messageForError } from "@/lib/messages"
import posthog from "@/lib/posthog.client"
import { useToastActions } from "../ui"

import { Button, Field, Heading, Input } from "../ui"

/* Settings — workspace identity and the account password. */

type Session = {
  user: { name: string; email: string }
  workspace: { slug: string }
  role: string
} | null

export function SettingsPage({ session }: { session: Session }) {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const { success, error: toastError } = useToastActions()

  const changePassword = async () => {
    // Match backend: 12+ chars, upper, lower, digit, special
    if (next.length < 12) return toastError("New password must be at least 12 characters")
    if (!/[A-Z]/.test(next)) return toastError("New password must contain an uppercase letter")
    if (!/[a-z]/.test(next)) return toastError("New password must contain a lowercase letter")
    if (!/[0-9]/.test(next)) return toastError("New password must contain a number")
    if (!/[^A-Za-z0-9]/.test(next)) return toastError("New password must contain a special character")
    if (next !== confirm) return toastError("New passwords do not match")
    setBusy(true)
    setDone(false)
    try {
      await api.changePassword(current, next)
      posthog.capture("password_changed")
      success("Password updated")
      setCurrent("")
      setNext("")
      setConfirm("")
    } catch (e) {
      const { message } = messageForError(e)
      toastError(message)
    } finally {
      setBusy(false)
    }
  }

  const rows: [string, string][] = [
    ["Workspace", session?.workspace.slug ?? "—"],
    ["Signed in as", session?.user.name ?? "—"],
    ["Email", session?.user.email ?? "—"],
    ["Role", session?.role ?? "member"],
  ]

  return (
    <div className="dashboard-columns">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <Heading level={2}>Workspace</Heading>
            <p>Workspace and account details.</p>
          </div>
        </div>
        <dl className="modal-body">
          {rows.map(([k, v]) => (
            <div
              key={k}
              className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-0"
            >
              <dt className="font-mono text-[9.5px] uppercase tracking-widest text-slate-strong">
                {k}
              </dt>
              <dd className="truncate text-xs">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <Heading level={2}>Change password</Heading>
            <p>Update the password for your account.</p>
          </div>
        </div>
        <div className="modal-body">
          <Field label="Current password" required>
            <Input
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </Field>
          <Field label="New password" required hint="12+ chars: upper, lower, number, special.">
            <Input
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </Field>
          <Field label="Confirm new password" required>
            <Input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
          <Button
            variant="primary"
            disabled={busy}
            onClick={() => void changePassword()}
          >
            {busy ? "Updating…" : "Update password"}
          </Button>
        </div>
      </section>
    </div>
  )
}
