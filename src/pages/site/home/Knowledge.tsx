import { useState } from 'react'
import { knowledge } from '@/content/data'
import { Contours } from '@/components/motion/fx'
import { Head } from './Head'
import { RequestDialog, type RequestConfig } from '@/pages/site/components/RequestDialog'

/* ——— 05 Knowledge: mixed types, type + language named, free toolkit folded in ——— */
export const library = [
  ...knowledge.map((k) => ({ ...k, free: false })),
  { type: 'Toolkit', lang: 'AR/EN', title: 'LED diagnostic toolkit — open licence', meta: 'PDF · 32 pp', free: true },
  { type: 'Toolkit', lang: 'EN', title: 'Mandate note template', meta: 'DOCX · 4 pp', free: true },
]
export function Knowledge() {
  const types = ['All', ...new Set(library.map((k) => k.type))]
  const [f, setF] = useState('All')
  const [lang, setLang] = useState<'All' | 'AR' | 'EN'>('All')
  const list = library.filter((k) => (f === 'All' || k.type === f) && (lang === 'All' || k.lang.includes(lang)))
  const [hover, setHover] = useState(0)
  const [req, setReq] = useState<RequestConfig | null>(null)
  const feat = list[hover] ?? list[0]
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10">
        <Head id="knowledge" n="04" eyebrow="Knowledge" title="The library — type and language named on every item." />
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {types.map((t) => <button key={t} onClick={() => { setF(t); setHover(0) }} className={`border px-4 py-2 text-xs tracking-[0.14em] uppercase transition ${f === t ? 'border-navy bg-navy text-ivory' : 'border-line hover:border-navy'}`}>{t}</button>)}
          </div>
          <div className="inline-flex border border-line p-0.5">
            {(['All', 'AR', 'EN'] as const).map((l) => <button key={l} onClick={() => { setLang(l); setHover(0) }} className={`px-3 py-1.5 text-xs transition ${lang === l ? 'bg-gold-light text-navy' : 'text-slate hover:text-navy'}`}>{l}</button>)}
          </div>
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y divide-line border-y border-line">
            {list.map((k, i) => (
              <li key={k.title} onMouseEnter={() => setHover(i)}>
                <button type="button" onClick={() => setReq({ kind: 'PUBLICATION_REQUEST', title: `Request: ${k.title}`, context: { asset: k.title, free: k.free }, submitLabel: k.free ? 'Send a download link' : 'Request a copy' })}
                  className={`group grid w-full cursor-pointer items-center gap-3 py-6 text-start transition-colors md:grid-cols-[160px_1fr_32px] md:px-4 ${i === hover ? 'bg-ivory-2' : ''}`}>
                  <span className="eyebrow text-gold-strong">{k.type} · <span className="text-navy">{k.lang}</span>{k.free && <span className="ms-2 bg-ok px-1.5 py-0.5 text-ivory">Free</span>}</span>
                  <span dir={k.lang === 'AR' ? 'rtl' : undefined} className="font-display text-2xl font-medium transition-transform duration-500 group-hover:translate-x-2">{k.title}</span>
                  <span className="hidden text-end transition-transform group-hover:-translate-y-0.5 md:block">↗</span>
                </button>
              </li>
            ))}
            {!list.length && <li className="py-10 text-center text-slate">Nothing in this combination yet — try another language.</li>}
          </ul>
          {feat && (
            <aside className="relative hidden overflow-hidden bg-navy p-8 text-ivory lg:flex lg:flex-col">
              <Contours className="absolute inset-0 h-full w-full" opacity={0.1} />
              <p className="eyebrow relative text-gold-light">{feat.type} · {feat.lang}</p>
              <p key={feat.title} dir={feat.lang === 'AR' ? 'rtl' : undefined} className="relative mt-6 font-display text-3xl leading-snug" style={{ animation: 'fadeup .5s both' }}>{feat.title}</p>
              <p className="relative mt-auto pt-10 text-sm text-ivory/60">{feat.meta}</p>
              <button type="button" onClick={() => setReq({ kind: 'PUBLICATION_REQUEST', title: `Request: ${feat.title}`, context: { asset: feat.title, free: feat.free }, submitLabel: feat.free ? 'Send a download link' : 'Request a copy' })}
                className="eyebrow relative mt-4 self-start cursor-pointer border-b border-gold-light pb-1">{feat.free ? 'Download free' : 'Read'} →</button>
            </aside>
          )}
        </div>
      </div>
      <RequestDialog request={req} onClose={() => setReq(null)} />
    </section>
  )
}