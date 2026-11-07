import { cloneElement, isValidElement, type ReactNode } from "react"

export function Field({
  label,
  hint,
  error,
  children,
  required = false,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
  required?: boolean
}) {
  const errorId = error ? `field-error-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined
  const hintId = hint ? `field-hint-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined

  return (
    <label className="field">
      <span className="field-label">
        {label}
        {required && <span className="required"> *</span>}
      </span>
      {isValidElement(children) ? (
        cloneElement(children as React.ReactElement<{ "aria-invalid"?: string; "aria-describedby"?: string }>, {
          "aria-invalid": error ? "true" : "false",
          "aria-describedby": describedBy,
        })
      ) : (
        children
      )}
      {hint && !error && <span id={hintId} className="field-hint">{hint}</span>}
      {error && <span id={errorId} className="field-error">{error}</span>}
    </label>
  )
}