import { useEffect, useMemo, useRef, useState } from 'react'
import { audiences, cases } from '@/content/data'
import { ledger } from './Evidence'
import { library } from './Knowledge'
import { programmes } from './Learning'

/* ——— Global search (blueprint F1.3): reaches every content type ——— */
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    ref.current?.focus()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  const all = useMemo(() => [
    ...audiences.map((a) => ({ type: 'Audience', title: a.label, href: `/hub/${a.slug}` })),
    ...cases.map((c) => ({ type: 'Case', title: c.title, href: '/#evidence' })),
    ...ledger.map((c) => ({ type: 'Ledger', title: c.title, href: '/#evidence' })),
    ...library.map((k) => ({ type: k.type, title: k.title, href: '/#knowledge' })),
    ...programmes.map((p) => ({ type: 'Course', title: p.title, href: '/#learning' })),
  ], [])
  const res = q.trim() ? all.filter((r) => (r.title + r.type).toLowerCase().includes(q.toLowerCase())) : []
  return (
    <div className="fixed inset-0 z-[70] bg-navy-3/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="mx-auto mt-[10vh] w-[min(760px,92vw)] bg-ivory shadow-2xl" style={{ animation: 'fadeup .3s both' }}>
        <div className="flex items-center gap-4 border-b border-line px-6">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cases, briefs, courses, audiences…" className="w-full bg-transparent py-5 font-display text-2xl focus:outline-none" />
          <button onClick={onClose} className="eyebrow text-slate">Esc</button>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto">
          {res.map((r) => (
            <li key={r.type + r.title}><a href={r.href} onClick={onClose} className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-ivory-2"><span>{r.title}</span><span className="eyebrow shrink-0 text-gold">{r.type}</span></a></li>
          ))}
          {q.trim() && !res.length && (
            <li className="px-6 py-8 text-slate">No results for "{q}". Try one of the audience hubs:
              <div className="mt-4 flex flex-wrap gap-2">{audiences.slice(0, 4).map((a) => <a key={a.slug} href={`/hub/${a.slug}`} onClick={onClose} className="border border-line px-3 py-1.5 text-sm hover:border-navy">{a.label}</a>)}</div>
            </li>
          )}
          {!q.trim() && <li className="eyebrow px-6 py-6 text-slate">Search reaches every content type on the site</li>}
        </ul>
      </div>
    </div>
  )
}