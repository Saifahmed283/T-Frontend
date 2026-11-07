import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
  createContext,
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react"

import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react"

export function Button({
  variant = "secondary",
  className = "",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }
  return (
    <button
      type="button"
      className={`button button-${variant} ${sizes[size]} ${className}`}
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

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`input textarea ${className}`} {...props} />
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
  tone?: "neutral" | "warning" | "success" | "brand" | "error"
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>
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

// Remove the first Field export (lines 78-99) - keeping the enhanced version below
type Tone = "error" | "warning" | "success" | "info"

const TONE_ICONS: Record<Tone, ReactNode> = {
  error: <AlertCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  success: <CheckCircle size={16} />,
  info: <Info size={16} />,
}

const TONE_CLASSES: Record<Tone, string> = {
  error: "alert-error",
  warning: "alert-warning",
  success: "alert-success",
  info: "alert-info",
}

export interface AlertProps {
  tone: Tone
  title: string
  body?: ReactNode
  retry?: () => void
  retryLabel?: string
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export function Alert({ tone, title, body, retry, retryLabel = "Retry", dismissible = false, onDismiss, className = "" }: AlertProps) {
  const handleDismiss = useCallback(() => {
    onDismiss?.()
  }, [onDismiss])

  return (
    <div className={`alert ${TONE_CLASSES[tone]} ${className}`} role={tone === "error" || tone === "warning" ? "alert" : "status"}>
      <div className="alert-icon" aria-hidden="true">
        {TONE_ICONS[tone]}
      </div>
      <div className="alert-content">
        <div className="alert-title">{title}</div>
        {body && <div className="alert-body">{body}</div>}
        {retry && (
          <Button variant="secondary" className="alert-retry" onClick={retry}>
            {retryLabel}
            <Loader2 size={14} className="animate-spin" />
          </Button>
        )}
      </div>
      {dismissible && (
        <Button variant="ghost" className="icon-button alert-dismiss" onClick={handleDismiss} aria-label="Dismiss">
          <X size={14} />
        </Button>
      )}
    </div>
  )
}

interface Toast {
  id: number
  tone: Tone
  title: string
  body?: ReactNode
  dismissible: boolean
  duration?: number
  action?: { label: string; onClick: () => void }
}

const ToastContext = createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: number) => void
} | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev.slice(-2), { ...toast, id }]) // max 3
    if (toast.duration !== 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), toast.duration ?? (toast.tone === "success" ? 5000 : 8000))
    }
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <ToastElement key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastElement({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const handleAction = useCallback(() => {
    toast.action?.onClick()
    onRemove(toast.id)
  }, [toast.action, onRemove])

  return (
    <div className={`toast toast-${toast.tone}`} role={toast.tone === "error" || toast.tone === "warning" ? "alert" : "status"}>
      <div className="toast-icon" aria-hidden="true">
        {TONE_ICONS[toast.tone]}
      </div>
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        {toast.body && <div className="toast-body">{toast.body}</div>}
      </div>
      {toast.action && (
        <Button variant="ghost" className="toast-action" onClick={handleAction}>
          {toast.action.label}
        </Button>
      )}
      {toast.dismissible && (
        <Button variant="ghost" className="icon-button toast-dismiss" onClick={() => onRemove(toast.id)} aria-label="Dismiss">
          <X size={14} />
        </Button>
      )}
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

export function useToastActions() {
  const { addToast } = useToast()
  return {
    success: (title: string, body?: ReactNode, options?: { action?: { label: string; onClick: () => void }; duration?: number }) =>
      addToast({ tone: "success", title, body, dismissible: true, duration: options?.duration, action: options?.action }),
    error: (title: string, body?: ReactNode, options?: { action?: { label: string; onClick: () => void }; duration?: number }) =>
      addToast({ tone: "error", title, body, dismissible: true, duration: options?.duration, action: options?.action }),
    warning: (title: string, body?: ReactNode, options?: { action?: { label: string; onClick: () => void }; duration?: number }) =>
      addToast({ tone: "warning", title, body, dismissible: true, duration: options?.duration, action: options?.action }),
    info: (title: string, body?: ReactNode, options?: { action?: { label: string; onClick: () => void }; duration?: number }) =>
      addToast({ tone: "info", title, body, dismissible: true, duration: options?.duration, action: options?.action }),
  }
}

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
      {error && <span id={errorId} className="field-hint is-error" role="alert">{error}</span>}
    </label>
  )
}

export function ConfirmDialog({
  title,
  body,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
}: {
  title: string
  body: ReactNode
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return (
    <dialog ref={dialog} aria-label={title} className="modal confirm-dialog">
      <div className="modal-head">
        <Heading level={2}>{title}</Heading>
        <Button
          variant="ghost"
          className="icon-button"
          onClick={onCancel}
          aria-label="Close dialog"
        >
          <X size={14} />
        </Button>
      </div>
      <div className="modal-body">{body}</div>
      <div className="modal-foot">
        <Button variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={destructive ? "primary" : "primary"} className={destructive ? "text-danger" : ""} onClick={() => { onConfirm(); dialog.current?.close() }}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
