import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}) {
  const base = 'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-strong disabled:cursor-not-allowed disabled:opacity-50'
  const styles = {
    primary: 'bg-navy text-ivory hover:bg-navy-2',
    secondary: 'border border-line bg-ivory text-navy hover:bg-ivory-2',
    ghost: 'text-navy hover:bg-ivory-2',
  } as const
  return <button type="button" className={`${base} ${styles[variant]} ${className}`} {...props} />
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`w-full border border-line bg-ivory px-3 py-2 text-sm text-navy focus:border-gold-strong focus:outline-none ${className}`} {...props} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="w-full border border-line bg-ivory px-3 py-2 text-sm text-navy focus:border-gold-strong focus:outline-none" {...props} />
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`w-full border border-line bg-ivory px-3 py-2 text-sm text-navy focus:border-gold-strong focus:outline-none ${className}`} {...props} />
}

export function Field({
  label,
  hint,
  required = false,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium text-slate">
        {label}
        {required && <span className="ms-1 text-error">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-slate">{hint}</span>}
    </label>
  )
}

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`w-full max-h-[90vh] overflow-auto border border-line bg-ivory ${wide ? 'max-w-4xl' : 'max-w-2xl'}`}>
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="modal-title" className="text-lg font-medium">{title}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-ivory-2" aria-label="Close">
            ×
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}