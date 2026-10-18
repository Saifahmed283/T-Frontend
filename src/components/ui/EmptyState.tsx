import type { ReactNode } from "react"
import { Contours, Emblem, Magnetic } from "@/components/motion/fx"

const cta =
  "inline-flex items-center gap-3 bg-navy px-5 py-3 text-sm font-medium text-ivory transition hover:bg-navy-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-strong"

export function EmptyState({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string
  title: string
  body: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}) {
  return (
    <div className="relative grid place-items-center overflow-hidden border border-line bg-ivory-2 py-20 text-center">
      <Contours className="absolute inset-0 h-full w-full" opacity={0.05} />
      <div className="relative mx-auto max-w-md px-6">
        <Emblem className="mx-auto h-14 w-14 opacity-40" tone="ivory" />
        <p className="eyebrow mt-6 text-gold-strong">{eyebrow}</p>
        <h3 className="mt-3 text-2xl font-medium">{title}</h3>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate">
          {body}
        </p>
        {action &&
          (action.href ? (
            <Magnetic
              href={action.href}
              onClick={action.onClick}
              className={`mt-6 ${cta}`}
            >
              {action.label}
            </Magnetic>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className={`mt-6 ${cta}`}
            >
              {action.label}
            </button>
          ))}
      </div>
    </div>
  )
}
