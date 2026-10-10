import type { ReactNode } from 'react'

const tones = {
  ok: 'bg-ok/10 text-ok-strong ring-ok/25',
  warn: 'bg-warn/10 text-warn-strong ring-warn/25',
  risk: 'bg-risk/10 text-risk-strong ring-risk/25',
  neutral: 'bg-slate/10 text-slate ring-slate/25',
  gold: 'bg-gold/10 text-gold-strong ring-gold/25',
} as const

export function Badge({ tone = 'neutral', pulse = false, className = '', children }: { tone?: keyof typeof tones; pulse?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tones[tone]} ${className}`}>
      {pulse && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current pulse-dot" />}
      {children}
    </span>
  )
}