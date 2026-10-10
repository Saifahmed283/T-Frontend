import { useRef, type KeyboardEvent } from 'react'

export function SegmentedControl<T extends string>({ options, value, onChange, label }: { options: readonly { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = options.findIndex((o) => o.value === value)
    let next = i
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % options.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + options.length) % options.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = options.length - 1
    else return
    e.preventDefault()
    onChange(options[next].value)
    ref.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus()
  }
  return (
    <div ref={ref} role="radiogroup" aria-label={label} className="inline-flex border border-line bg-ivory-2 p-1">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={o.value === value} tabIndex={o.value === value ? 0 : -1}
          onClick={() => onChange(o.value)}
          onKeyDown={onKeyDown}
          className={`px-4 py-1.5 text-sm transition ${o.value === value ? 'bg-navy text-ivory' : 'text-slate hover:text-navy'}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}