import { useState } from 'react'
import { audiences } from '@/content/data'
import { useHead } from '@/hooks/useHead'
import { Contours, Magnetic, Reveal, SplitText } from '@/components/motion/fx'
import { Evidence } from '@/pages/site/home'
import type { Lang } from '../types'
import { SectionHead } from './SectionHead'
import { RequestDialog, type RequestConfig } from './RequestDialog'

function ctaRequest(a: (typeof audiences)[number]): RequestConfig | null {
  switch (a.slug) {
    case 'governments': return { kind: 'PUBLICATION_REQUEST', title: 'Download the procurement pack', intro: 'We will email the procurement pack and the compliance summary.', context: { asset: 'procurement pack', audience: a.slug }, submitLabel: 'Send the pack' }
    case 'development-partners': return { kind: 'PUBLICATION_REQUEST', title: 'Request the capability statement', intro: 'Includes registration identifiers, framework eligibility and a ledger extract.', context: { asset: 'capability statement', audience: a.slug }, submitLabel: 'Send the statement' }
    case 'business': return { kind: 'SEAT_RESERVATION', title: 'Book the diagnostic', intro: 'A price-bearing diagnostic with a bookable date — not a sales call.', context: { offer: 'price-bearing diagnostic', audience: a.slug }, submitLabel: 'Book a date' }
    case 'ngos': return { kind: 'PUBLICATION_REQUEST', title: 'Get the free toolkit', intro: 'Free method notes and open-licence tools, emailed directly.', context: { asset: 'free toolkit', audience: a.slug }, submitLabel: 'Send the toolkit' }
    case 'consultancies': return { kind: 'TEAM_PROPOSAL', title: 'Propose a teaming arrangement', intro: 'We bring method, local reach and a clean compliance file to a joint bid.', context: { audience: a.slug }, submitLabel: 'Start a proposal' }
    case 'experts': return { kind: 'EXPERT_REGISTRATION', title: 'Register as an expert', intro: 'Register once, see your status at every step, and get matched to live assignments.', context: { audience: a.slug }, submitLabel: 'Register' }
    default: return null
  }
}

function Hub({ slug, lang }: { slug: string; lang: Lang }) {
  const a = audiences.find((x) => x.slug === slug) ?? audiences[0]
  const [req, setReq] = useState<RequestConfig | null>(null)
  const cta = ctaRequest(a)
  useHead(`${a.label} — what to know first`, `${a.line} TerraMorph answers three questions for ${a.label.replace('For ', '').toLowerCase()}: ${a.q.join(' ')}`)
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <Contours className="absolute inset-0 h-full w-full" stroke="#132B45" opacity={0.06} />
        <div className="relative mx-auto max-w-[1320px] px-5 py-20 md:px-10">
          <p className="eyebrow text-slate"><a href="/" className="hover:text-navy">Home</a> › <span className="text-gold-strong">{a.label}</span></p>
          <h1 className="mt-8 max-w-4xl text-[clamp(2.6rem,6vw,5rem)] leading-[1] font-medium"><SplitText text={lang === 'ar' ? a.ar : a.line} /></h1>
          {cta ? (
            <button type="button" onClick={() => setReq(cta)}
              className="mt-10 inline-flex cursor-pointer items-center gap-3 bg-navy px-7 py-4 text-[0.75rem] font-medium tracking-[0.22em] text-ivory uppercase transition-transform duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
              {a.action} <span>↓</span>
            </button>
          ) : (
            <Reveal delay={500}><Magnetic href="/join" className="mt-10 bg-navy px-7 py-4 text-[0.75rem] font-medium tracking-[0.22em] text-ivory uppercase">{a.action} <span>↓</span></Magnetic></Reveal>
          )}
        </div>
      </section>
      <section className="mx-auto max-w-[1320px] px-5 py-20 md:px-10">
        <SectionHead n="—" eyebrow="Your three questions, answered in order" title="What you need to know first." />
        <div className="mt-12 grid gap-px bg-line md:grid-cols-3">
          {a.q.map((q, i) => (
            <Reveal key={q} delay={i * 100} className="bg-ivory p-8">
              <span className="font-display text-6xl text-gold-strong">{i + 1}</span>
              <h3 className="mt-6 text-2xl font-medium">{q}</h3>
              <p className="mt-3 text-sm text-slate">Answered with evidence from the ledger, filtered to {a.label.replace('For ', '').toLowerCase()} — no duplicate content, just a different lens.</p>
            </Reveal>
          ))}
        </div>
      </section>
      <Evidence />
      <RequestDialog request={req} onClose={() => setReq(null)} />
    </>
  )
}

export { Hub }