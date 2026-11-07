import { useState } from "react"

import { api } from "@/lib/api"
import { messageForError } from "@/lib/messages"
import { useToastActions } from "../ui"

import { Button, Field, Heading, Input } from "../ui"
import { useFormValidation } from "@/lib/useFormValidation"
import { validatePassword, validatePasswordMatch } from "@/lib/validation"

/* Settings — workspace identity and the account password. */

type Session = {
  user: { name: string; email: string }
  workspace: { slug: string }
  role: string
} | null

export function SettingsPage({ session }: { session: Session }) {
  const { success, error: toastError } = useToastActions()

  const form = useFormValidation({
    fields: {
      current: {
        initial: "",
        validate: (value) => validatePassword(value, "en"),
      },
      next: {
        initial: "",
        validate: (value) => validatePassword(value, "en"),
      },
      confirm: {
        initial: "",
        validate: (value, values) => validatePasswordMatch(values.next, value, "en"),
      },
    },
    onSubmit: async (values) => {
      setBusy(true)
      setDone(false)
      try {
        await api.changePassword(String(values.current), String(values.next))
        success("Password updated")
        form.reset()
        setDone(true)
      } catch (cause) {
        const { message } = messageForError(cause)
        throw new Error(message || "Could not update the password. Try again.")
      } finally {
        setBusy(false)
      }
    },
  })

  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

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
          <form {...form.formProps} noValidate>
            <Field
              label="Current password"
              required
              error={form.error("current") ?? undefined}
            >
              <Input
                {...form.input("current")}
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
            {form.error("current") && (
              <p id={form.errorId("current")} role="alert" className="text-error mt-2">
                {form.error("current")}
              </p>
            )}
            <Field
              label="New password"
              required
              hint="12+ chars: upper, lower, number, special."
              error={form.error("next") ?? undefined}
            >
              <Input
                {...form.input("next")}
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
              />
            </Field>
            {form.error("next") && (
              <p id={form.errorId("next")} role="alert" className="text-error mt-2">
                {form.error("next")}
              </p>
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
            {form.error("confirm") && (
              <p id={form.errorId("confirm")} role="alert" className="text-error mt-2">
                {form.error("confirm")}
              </p>
            )}
            {form.submitError && (
              <p role="alert" className="text-error mt-4">
                {form.submitError}
              </p>
            )}
            <Button
              variant="primary"
              type="submit"
              disabled={form.isSubmitting || busy}
              aria-busy={form.isSubmitting || busy || undefined}
            >
              {busy || form.isSubmitting ? "Updating…" : "Update password"}
            </Button>
          </form>
          {done && (
            <p className="mt-4 text-ok">
              ✓ Your password was updated and every other session was signed out.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
