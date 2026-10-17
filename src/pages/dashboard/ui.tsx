import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react"

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost"
}) {
  return (
    <button
      type="button"
      className={`button button-${variant} ${className}`}
      {...props}
    />
  )
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input ${className}`} {...props} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="input textarea" {...props} />
}

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`input select ${className}`} {...props} />
}

export function Heading({
  level = 2,
  className = "",
  children,
}: {
  level?: 1 | 2 | 3
  className?: string
  children: ReactNode
}) {
  if (level === 1) return <h1 className={className}>{children}</h1>
  if (level === 3) return <h3 className={className}>{children}</h3>
  return <h2 className={className}>{children}</h2>
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: "neutral" | "warning" | "success" | "brand"
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function Field({
  label,
  hint,
  children,
  required = false,
}: {
  label: string
  hint?: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {required && <span className="required"> *</span>}
      </span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return (
    <dialog
      ref={dialog}
      aria-label={title}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="modal-head">
        <Heading level={2}>{title}</Heading>
        <Button
          variant="ghost"
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </Button>
      </div>
      {children}
    </dialog>
  )
}
