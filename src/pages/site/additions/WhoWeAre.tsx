import { useEffect, useState } from 'react'
import { Emblem, GoldLine, Reveal, Spotlight } from '@/components/motion/fx'

/* ——— Who we are: logo + 3–5 lines, philosophy, partnerships, people, testimonials, awards ——— */
const testimonials = [
  { q: 'They worked inside our rules from day one. The procurement file was the cleanest we received.', who: 'Director, governorate planning unit' },
  { q: 'Small team, serious method. We extended the contract twice.', who: 'Programme lead, development partner' },
  { q: 'Easy to work with, and impossible to rush into a bad decision.', who: 'Founder, social enterprise' },
]
export function WhoWeAre() {
  const [t, setT] = useState(0)
  useEffect(() => { const id = setInterval(() => setT((x) => (x + 1) % testimonials.length), 5500); return () => clearInterval(id) }, [])
  return (
    <section id="about" className="mx-auto max-w-[1320px] scroll-mt-40 px-5 py-24 md:px-10">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <Emblem className="h-20 w-20" />
          <p className="eyebrow mt-8 text-gold-strong">Hello! We are TerraMorph</p>
          <h2 className="mt-4 text-[clamp(2.2rem,4.4vw,3.8rem)] leading-[1.02] font-medium">We are consultants — and we are very easy to deal with, but very tough to mess with.</h2>
          <p className="mt-6 max-w-lg leading-relaxed text-navy-2">TerraMorph advises governments, institutions and social enterprises on strategy, policy and transformation. We bring the place and the people together, invite them in, and help them build what they can already imagine.</p>
        </Reveal>
        <div className="grid gap-px self-start bg-line sm:grid-cols-2">
          {[
            ['Philosophy', 'Leverage for good: small, well-placed force for large public outcomes.'],
            ['Partnerships', 'Development partners, academies and primes who team with us on bids.'],
            ['People', 'A named founder, a vetted associate bench and 214 experts on roster.'],
            ['Clients', 'Governorates, ministries, funds and enterprises across 11 countries.'],
          ].map(([h, b], k) => (
            <Spotlight key={h} className="bg-ivory" color="rgba(19,43,69,0.06)">
              <div className="p-7"><span className="font-display text-sm text-gold-strong">0{k + 1}</span><h3 className="mt-3 text-2xl font-medium">{h}</h3><p className="mt-2 text-sm text-slate">{b}</p></div>
            </Spotlight>
          ))}
        </div>
      </div>
      <GoldLine className="mt-20" />
      <div className="mt-14 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div className="relative min-h-[220px]">
          <p className="eyebrow text-slate">Testimonials</p>
          {testimonials.map((x, k) => (
            <blockquote key={k} className="absolute inset-x-0 top-10 transition-all duration-700" style={{ opacity: k === t ? 1 : 0, transform: k === t ? 'none' : 'translateY(12px)' }} aria-hidden={k !== t}>
              <p className="font-display text-[clamp(1.6rem,3vw,2.6rem)] leading-snug italic">"{x.q}"</p>
              <footer className="eyebrow mt-6 text-gold-strong">— {x.who}</footer>
            </blockquote>
          ))}
          <div className="absolute bottom-0 flex gap-2">{testimonials.map((_, k) => <button key={k} onClick={() => setT(k)} aria-label={`Testimonial ${k + 1}`} className={`h-1 transition-all ${k === t ? 'w-10 bg-navy' : 'w-4 bg-line'}`} />)}</div>
        </div>
        <div>
          <p className="eyebrow text-slate">Awards & certifications</p>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {[['ISO 37001', 'Anti-bribery management', '2026'], ['Devex', 'Registered organisation', '2025'], ['AAST', 'Academic training partner', '2025'], ['Africa LED Award', 'Shortlist — local development', '2024']].map(([a, b, y]) => (
              <li key={a} className="flex items-center justify-between gap-4 py-4"><span><span className="font-display text-xl">{a}</span><span className="ms-3 text-sm text-slate">{b}</span></span><span className="eyebrow text-gold-strong">{y}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}