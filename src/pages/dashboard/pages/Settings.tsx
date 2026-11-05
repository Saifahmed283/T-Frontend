import { useState } from "react"

import { api } from "@/lib/api"

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
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const changePassword = async () => {
    if (next.length < 8)
      return setError("New password must be at least 8 characters")
    if (next !== confirm) return setError("New passwords do not match")
    setBusy(true)
    setError(null)
    setDone(false)
    try {
      await api.changePassword(current, next)
      setDone(true)
      setCurrent("")
      setNext("")
      setConfirm("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not change password")
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
          <Field label="New password" required hint="At least 8 characters.">
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
          {error && (
            <p role="alert" className="is-error mb-3 text-xs">
              {error}
            </p>
          )}
          {done && <p className="is-ok mb-3 text-xs">Password updated.</p>}
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
