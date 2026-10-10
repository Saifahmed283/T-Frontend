import { useState } from 'react'
import { Reveal } from '@/components/motion/fx'
import { Head } from './Head'

/* ——— 06 Learning: price-bearing, bookable programmes ——— */
export const programmes = [
  { d: '12', m: 'Nov', title: 'Local economic development — practitioner course', fmt: 'In person · Cairo · 3 days', price: 'EGP 9,500', seats: 6 },
  { d: '03', m: 'Dec', title: 'Train-the-trainer: the TerraMorph method', fmt: 'Hybrid · 5 days · certification', price: 'EGP 18,000', seats: 3 },
  { d: '14', m: 'Jan', title: 'Tailored diagnostics for public institutions', fmt: 'Online · 4 × 2 h', price: 'EGP 4,200', seats: 14 },
  { d: '—', m: 'Open', title: 'Welcome method — onboarding for new teams', fmt: 'Self-paced · AR/EN', price: 'Free for NGOs', seats: 0 },
]
export function Learning() {
  const [booked, setBooked] = useState<string | null>(null)
  return (
    <section id="learning" className="scroll-mt-40 bg-ivory-2">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10">
        <Head n="05" eyebrow="TerraMorph Learning" title="Ready to get more motivated? Pick a date."
          aside={<p className="max-w-xs text-sm text-slate">Every programme carries a price and a date — no "contact us for details".</p>} />
        <ul className="mt-12 border-t border-navy/20">
          {programmes.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 80} className="group grid items-center gap-4 border-b border-navy/10 py-6 transition-colors hover:bg-ivory md:grid-cols-[90px_1fr_180px_180px] md:px-4">
              <div className="flex items-baseline gap-2 md:block"><span className="font-display text-5xl leading-none">{p.d}</span><span className="eyebrow text-gold-strong md:mt-1 md:block">{p.m}</span></div>
              <div><p className="font-display text-2xl font-medium">{p.title}</p><p className="mt-1 text-sm text-slate">{p.fmt}</p></div>
              <div><p className="text-lg">{p.price}</p>{p.seats > 0 && <p className={`text-xs ${p.seats < 5 ? 'text-warn-strong' : 'text-slate'}`}>{p.seats} seats left</p>}</div>
              <button onClick={() => setBooked(p.title)} className={`justify-self-start border px-5 py-3 text-xs tracking-[0.18em] uppercase transition md:justify-self-end ${booked === p.title ? 'border-ok bg-ok text-ivory' : 'border-navy group-hover:bg-navy group-hover:text-ivory'}`}>
                {booked === p.title ? '✓ Reserved' : p.seats ? 'Reserve seat' : 'Start now'}
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}