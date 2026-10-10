import { useEffect, useMemo, useRef, useState } from 'react'
import { Reveal, SplitText, GoldLine, Spotlight, Contours, Emblem, CountUp } from './fx'

const img = (id: string, w = 1400) => `https://images.unsplash.com/${id}?w=${w}&q=75&auto=format&fit=crop`

/* ——— "Hello! I am… I would like to…" — the sentence-builder front door ——— */
const roles = ['change agent', 'local entity', 'policy maker', 'government official', 'development partner', 'INGO', 'consultant', 'expert', 'cause enthusiast']
const intents = ['explain a challenge', 'suggest an idea', 'join the cause', 'partner with the company']
const areas = ['Local economic development', 'Policy', 'TVET & skills', 'Investment climate', 'Social enterprise']
const forward = ['a proper conversation', 'aligning efforts', 'collaborating', 'meeting for coffee']

function Pick({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className="group inline-flex items-baseline gap-2 border-b-2 border-gold px-1 italic text-navy-2 transition hover:text-navy">
        {value}<span className="text-[0.4em] not-italic text-gold transition-transform group-aria-expanded:rotate-180">▼</span>
      </button>
      {open && (
        <span className="absolute start-0 top-full z-30 mt-3 flex w-max max-w-[80vw] flex-col border border-line bg-ivory p-2 font-sans text-base not-italic shadow-[0_24px_60px_-20px_rgba(19,43,69,.35)]">
          {options.map((o) => (
            <button type="button" key={o} onClick={() => { onChange(o); setOpen(false) }}
              className={`px-4 py-2 text-start transition hover:bg-ivory-2 ${o === value ? 'text-gold' : 'text-navy'}`}>{o}</button>
          ))}
        </span>
      )}
    </span>
  )
}

export function HelloIntake() {
  const [role, setRole] = useState(roles[0])
  const [intent, setIntent] = useState(intents[0])
  const [ints, setInts] = useState<string[]>([areas[0]])
  const [fw, setFw] = useState(forward[0])
  const [sent, setSent] = useState(false)
  return (
    <section id="hello" className="relative scroll-mt-40 border-y border-line bg-ivory-2">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10">
        <p className="eyebrow text-gold">Start here — tell us who you are</p>
        {sent ? (
          <Reveal className="mt-10">
            <Emblem className="h-14 w-14" />
            <p className="mt-6 max-w-3xl font-display text-[clamp(2rem,4vw,3.4rem)] leading-tight">Thank you. A partner will reach out within two working days to set up {fw}.</p>
            <button onClick={() => setSent(false)} className="eyebrow mt-8 border-b border-navy pb-1">Write another note</button>
          </Reveal>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
            <p className="mt-10 font-display text-[clamp(2rem,4.6vw,4rem)] leading-[1.3] font-medium">
              Hello! I am a <Pick value={role} options={roles} onChange={setRole} />,
              and I would like to <Pick value={intent} options={intents} onChange={setIntent} />.
              I'm looking forward to <Pick value={fw} options={forward} onChange={setFw} />.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <span className="eyebrow me-3 text-slate">My areas of interest</span>
              {areas.map((a) => {
                const on = ints.includes(a)
                return <button type="button" key={a} aria-pressed={on} onClick={() => setInts(on ? ints.filter((x) => x !== a) : [...ints, a])}
                  className={`border px-4 py-2 text-sm transition ${on ? 'border-navy bg-navy text-ivory' : 'border-line bg-ivory hover:border-navy'}`}>{on ? '✓ ' : ''}{a}</button>
              })}
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-8">
              <input required type="email" placeholder="Your email" className="min-w-0 flex-1 border-b border-navy/30 bg-transparent py-3 text-lg focus:border-gold focus:outline-none" />
              <button className="bg-navy px-8 py-4 text-[0.75rem] font-medium tracking-[0.22em] text-ivory uppercase transition hover:bg-navy-2">Let's collaborate →</button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

/* ——— What's new: swipeable picture banner → description, likes, four actions ——— */
const news = [
  { id: 'photo-1737816149139-ccdb2ce50715', tag: 'Initiative', title: 'Main Street Assiut — a living market pilot', body: 'We are reshaping one street into a working model of local economic development: vendors, municipality and residents designing the place together over twelve weeks.', date: 'Oct 2026', likes: 128 },
  { id: 'photo-1699197671498-ab6931ccce96', tag: 'TerraMorph Learning', title: 'Train-the-trainer cohort 04 opens', body: 'Twenty seats for practitioners who want to carry the G0–G7 method into their own institutions. Certification on completion.', date: 'Nov 2026', likes: 86 },
  { id: 'photo-1731024677293-2ca0c03bbf13', tag: 'Research', title: 'Heritage as an economic asset — field study', body: 'A six-month study on how heritage sites can anchor local jobs without displacing the people who live beside them.', date: 'Sep 2026', likes: 204 },
  { id: 'photo-1709234052084-750ab82a0f26', tag: 'Tender', title: 'Urban mobility diagnostic — expressions of interest', body: 'We are teaming for a regional urban mobility diagnostic and seeking transport economists and GIS specialists.', date: 'Closes 30 Oct', likes: 41 },
]

export function WhatsNew() {
  const [i, setI] = useState(0)
  const [open, setOpen] = useState<number | null>(null)
  const [liked, setLiked] = useState<Record<number, boolean>>({})
  const [toast, setToast] = useState('')
  const startX = useRef<number | null>(null)
  useEffect(() => {
    if (open !== null) return
    const t = setInterval(() => setI((x) => (x + 1) % news.length), 6000)
    return () => clearInterval(t)
  }, [open])
  const go = (d: number) => setI((x) => (x + d + news.length) % news.length)
  const act = (a: string) => { setToast(a); setTimeout(() => setToast(''), 2200) }
  const n = open !== null ? news[open] : null
  return (
    <section id="new" className="mx-auto max-w-[1320px] scroll-mt-40 px-5 py-24 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-gold">What's new — what we're up to</p>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.4rem)] leading-none font-medium"><SplitText text="A whole lot is happening." /></h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => go(-1)} aria-label="Previous" className="grid h-12 w-12 place-items-center border border-line transition hover:border-navy hover:bg-navy hover:text-ivory">←</button>
          <button onClick={() => go(1)} aria-label="Next" className="grid h-12 w-12 place-items-center border border-line transition hover:border-navy hover:bg-navy hover:text-ivory">→</button>
        </div>
      </div>
      <div className="relative mt-10 h-[min(70vh,560px)] touch-pan-y overflow-hidden bg-navy select-none"
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => { if (startX.current === null) return; const dx = e.clientX - startX.current; startX.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1) }}>
        {news.map((s, k) => (
          <button key={s.id} onClick={() => setOpen(k)} aria-hidden={k !== i} tabIndex={k === i ? 0 : -1}
            className="absolute inset-0 text-start transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{ opacity: k === i ? 1 : 0, transform: k === i ? 'scale(1)' : 'scale(1.06)' }}>
            <img src={img(s.id)} alt={s.title} draggable={false} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-3 via-navy/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-ivory md:p-12">
              <p className="eyebrow text-gold-light">{s.tag} · {s.date}</p>
              <h3 className="mt-4 max-w-3xl text-[clamp(1.8rem,4vw,3.6rem)] leading-[1.02] font-medium">{s.title}</h3>
              <span className="eyebrow mt-6 inline-block border-b border-gold-light pb-1">Open the story →</span>
            </div>
          </button>
        ))}
        <div className="absolute top-6 end-6 flex gap-2">
          {news.map((_, k) => (
            <span key={k} className="h-0.5 w-10 overflow-hidden bg-ivory/25">
              <span className="block h-full bg-gold-light" style={{ width: k === i ? '100%' : k < i ? '100%' : '0%', transition: k === i && open === null ? 'width 6s linear' : 'none' }} />
            </span>
          ))}
        </div>
      </div>

      {n && open !== null && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-navy-3/60 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <aside onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-ivory animate-[slidein_.5s_cubic-bezier(.2,.8,.2,1)]">
            <div className="relative h-72 shrink-0 bg-navy">
              <img src={img(n.id, 900)} alt={n.title} className="h-full w-full object-cover" />
              <button onClick={() => setOpen(null)} aria-label="Close" className="absolute top-4 end-4 grid h-10 w-10 place-items-center bg-ivory text-navy">✕</button>
            </div>
            <div className="flex flex-1 flex-col p-8">
              <p className="eyebrow text-gold">{n.tag} · {n.date}</p>
              <h3 className="mt-4 text-4xl leading-tight font-medium">{n.title}</h3>
              <p className="mt-5 text-lg leading-relaxed text-navy-2">{n.body}</p>
              <button onClick={() => setLiked({ ...liked, [open]: !liked[open] })} aria-pressed={!!liked[open]}
                className={`mt-8 inline-flex w-max items-center gap-3 border px-4 py-2 transition ${liked[open] ? 'border-gold bg-gold/10 text-navy' : 'border-line hover:border-navy'}`}>
                <span className={`transition-transform ${liked[open] ? 'scale-125 text-gold' : ''}`}>{liked[open] ? '♥' : '♡'}</span>
                <span className="tabular-nums">{n.likes + (liked[open] ? 1 : 0)}</span> people like this
              </button>
              <div className="mt-auto grid grid-cols-2 gap-px bg-line pt-px">
                {[['Suggest', 'Your suggestion has been noted'], ['Join the cause', 'Welcome — you have joined the cause'], ['Reserve a seat', 'Seat reserved — check your inbox'], ['Pay / contribute', 'Opening secure payment link…']].map(([a, msg], k) => (
                  <button key={a} onClick={() => act(msg)} className={`p-5 text-start transition ${k === 1 ? 'bg-navy text-ivory hover:bg-navy-2' : 'bg-ivory hover:bg-ivory-2'}`}>
                    <span className="eyebrow block text-gold">0{k + 1}</span>
                    <span className="mt-2 block font-display text-xl">{a}</span>
                  </button>
                ))}
              </div>
              {toast && <p className="eyebrow mt-4 text-ok">✓ {toast}</p>}
            </div>
          </aside>
        </div>
      )}
    </section>
  )
}

/* ——— Cause exhibition: a simulated local community that comes alive as people contribute ——— */
export function CauseExhibition() {
  const nodes = useMemo(() => {
    let s = 7
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
    return Array.from({ length: 46 }, (_, k) => ({ x: 40 + r() * 920, y: 40 + r() * 420, k, kind: ['home', 'school', 'shop', 'clinic', 'workshop'][k % 5] }))
  }, [])
  const links = useMemo(() => {
    const out: [number, number][] = []
    nodes.forEach((a, i) => nodes.forEach((b, j) => { if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 140) out.push([i, j]) }))
    return out
  }, [nodes])
  const [lit, setLit] = useState(6)
  const [mode, setMode] = useState<'exhibition' | 'intervention'>('exhibition')
  const trust = Math.round((lit / nodes.length) * 100)
  return (
    <section id="cause" className="relative scroll-mt-40 overflow-hidden bg-navy text-ivory">
      <Contours className="absolute inset-0 h-full w-full" opacity={0.08} />
      <div className="relative mx-auto grid max-w-[1320px] gap-12 px-5 py-24 md:px-10 lg:grid-cols-[1fr_1.5fr]">
        <div className="flex flex-col">
          <p className="eyebrow text-gold-light">The cause exhibition</p>
          <h2 className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)] leading-[1.02] font-medium">A peaceful society, where people trust each other.</h2>
          <p className="mt-6 max-w-md leading-relaxed text-ivory/70">It's not about what people can buy, but about what they feel and what they can dream of — and how that becomes their choices of tomorrow. Add yourself to the picture and watch the community connect.</p>
          <div className="mt-8 inline-flex w-max border border-ivory/20 p-1">
            {(['exhibition', 'intervention'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 text-xs tracking-[0.18em] uppercase transition ${mode === m ? 'bg-gold-light text-navy' : 'text-ivory/70 hover:text-ivory'}`}>{m}</button>
            ))}
          </div>
          <p className="mt-4 text-sm text-ivory/60">{mode === 'exhibition' ? 'See the cause: a local community as it could be.' : 'See the intervention: where small, well-placed force lands.'}</p>
          <div className="mt-auto grid grid-cols-2 gap-6 pt-10">
            <div><p className="font-display text-5xl">{lit}</p><p className="eyebrow mt-2 text-ivory/50">Contributors</p></div>
            <div><p className="font-display text-5xl">{trust}%</p><p className="eyebrow mt-2 text-ivory/50">Trust index</p></div>
          </div>
          <div className="mt-8 flex gap-3">
            <button onClick={() => setLit((l) => Math.min(nodes.length, l + 4))} className="bg-gold-light px-6 py-3 text-[0.72rem] font-medium tracking-[0.2em] text-navy uppercase transition hover:bg-ivory">Contribute to the picture +</button>
            <button onClick={() => setLit(6)} className="eyebrow px-3 text-ivory/50 hover:text-ivory">Reset</button>
          </div>
        </div>
        <div className="relative border border-ivory/10 bg-navy-3/50">
          <svg viewBox="0 0 1000 500" className="h-full w-full" role="img" aria-label={`Community simulation, ${lit} of ${nodes.length} households contributing`}>
            {links.map(([a, b], k) => {
              const on = a < lit && b < lit
              return <line key={k} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={on ? '#C4A868' : '#FBF8F1'} strokeOpacity={on ? 0.7 : 0.06} strokeWidth={on ? 1.2 : 0.6} style={{ transition: 'all 1s ease' }} />
            })}
            {nodes.map((n) => {
              const on = n.k < lit
              const hot = mode === 'intervention' && n.k % 9 === 0
              return (
                <g key={n.k} transform={`translate(${n.x} ${n.y})`} className="cursor-pointer" onClick={() => setLit((l) => Math.max(l, n.k + 1))}>
                  {hot && <circle r="18" fill="none" stroke="#C4A868" strokeOpacity=".6"><animate attributeName="r" values="8;22;8" dur="2.4s" repeatCount="indefinite" /></circle>}
                  <circle r={on ? 6 : 3.5} fill={on ? '#C4A868' : '#FBF8F1'} fillOpacity={on ? 1 : 0.3} style={{ transition: 'all .8s ease' }} />
                </g>
              )
            })}
          </svg>
          <p className="eyebrow absolute bottom-4 start-4 text-ivory/40">Simulation · click any household to join</p>
        </div>
      </div>
    </section>
  )
}

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
    <section id="who" className="mx-auto max-w-[1320px] scroll-mt-40 px-5 py-24 md:px-10">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <Emblem className="h-20 w-20" />
          <p className="eyebrow mt-8 text-gold">Hello! We are TerraMorph</p>
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
              <div className="p-7"><span className="font-display text-sm text-gold">0{k + 1}</span><h3 className="mt-3 text-2xl font-medium">{h}</h3><p className="mt-2 text-sm text-slate">{b}</p></div>
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
              <footer className="eyebrow mt-6 text-gold">— {x.who}</footer>
            </blockquote>
          ))}
          <div className="absolute bottom-0 flex gap-2">{testimonials.map((_, k) => <button key={k} onClick={() => setT(k)} aria-label={`Testimonial ${k + 1}`} className={`h-1 transition-all ${k === t ? 'w-10 bg-navy' : 'w-4 bg-line'}`} />)}</div>
        </div>
        <div>
          <p className="eyebrow text-slate">Awards & certifications</p>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {[['ISO 37001', 'Anti-bribery management', '2026'], ['Devex', 'Registered organisation', '2025'], ['AAST', 'Academic training partner', '2025'], ['Africa LED Award', 'Shortlist — local development', '2024']].map(([a, b, y]) => (
              <li key={a} className="flex items-center justify-between gap-4 py-4"><span><span className="font-display text-xl">{a}</span><span className="ms-3 text-sm text-slate">{b}</span></span><span className="eyebrow text-gold">{y}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ——— Join board: careers, tenders, expert CV registration, tools & resources ——— */
export function JoinBoard() {
  const tabs = ['Careers', 'Tenders', 'Expert CV registration', 'Tools & resources'] as const
  const [tab, setTab] = useState<(typeof tabs)[number]>('Careers')
  const [step, setStep] = useState(0)
  const rows: Record<string, [string, string, string][]> = {
    Careers: [['Senior policy analyst', 'Cairo · Full time', 'Apply'], ['LED field coordinator', 'Assiut · 12 months', 'Apply'], ['Research intern (AAST)', 'Alexandria · 6 months', 'Apply']],
    Tenders: [['Urban mobility diagnostic', 'EOI · closes 30 Oct', 'Team with us'], ['TVET governance review', 'RFP · closes 14 Nov', 'Team with us'], ['SME finance access study', 'Open call · rolling', 'Team with us']],
    'Tools & resources': [['LED diagnostic toolkit', 'PDF · open licence', 'Download'], ['Mandate note template', 'DOCX · free', 'Download'], ['Stakeholder map canvas', 'PDF · AR/EN', 'Download']],
  }
  const steps = ['Profile', 'Expertise', 'CV upload', 'Status']
  return (
    <section id="join-board" className="border-t border-line bg-ivory-2">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10">
        <p className="eyebrow text-gold">Join the company</p>
        <h2 className="mt-4 max-w-3xl text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] font-medium"><SplitText text="Careers, tenders, experts and open tools — in one place." /></h2>
        <div className="no-scrollbar mt-10 flex gap-1 overflow-x-auto border-b border-line">
          {tabs.map((x) => (
            <button key={x} onClick={() => setTab(x)} className={`relative shrink-0 px-5 py-4 text-sm transition ${tab === x ? 'text-navy' : 'text-slate hover:text-navy'}`}>
              {x}{tab === x && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold" />}
            </button>
          ))}
        </div>
        {tab === 'Expert CV registration' ? (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <ol className="space-y-4">
              {steps.map((s, k) => (
                <li key={s} className="flex items-center gap-4">
                  <span className={`grid h-9 w-9 place-items-center rounded-full border text-sm transition ${k < step ? 'border-gold bg-gold text-ivory' : k === step ? 'border-navy text-navy' : 'border-line text-slate'}`}>{k < step ? '✓' : k + 1}</span>
                  <span className={k === step ? 'text-navy' : 'text-slate'}>{s}</span>
                </li>
              ))}
              <p className="pt-4 text-sm text-slate">No dead-end uploads: you always see where your profile stands.</p>
            </ol>
            <div className="border border-line bg-ivory p-8">
              {step < 3 ? (
                <>
                  <p className="font-display text-3xl">{['Who are you?', 'What do you know deeply?', 'Upload your CV'][step]}</p>
                  <div className="mt-6 space-y-4">
                    {step === 0 && <><input placeholder="Full name" className="w-full border-b border-line bg-transparent py-3 focus:border-navy focus:outline-none" /><input placeholder="Country · city" className="w-full border-b border-line bg-transparent py-3 focus:border-navy focus:outline-none" /></>}
                    {step === 1 && <div className="flex flex-wrap gap-2">{areas.map((a) => <label key={a} className="cursor-pointer border border-line px-3 py-2 text-sm has-checked:border-navy has-checked:bg-navy has-checked:text-ivory"><input type="checkbox" className="sr-only" />{a}</label>)}</div>}
                    {step === 2 && <label className="grid h-36 cursor-pointer place-items-center border border-dashed border-navy/30 text-slate transition hover:border-gold hover:bg-ivory-2"><input type="file" className="sr-only" />Drop your CV or click to browse (PDF, DOCX)</label>}
                  </div>
                  <div className="mt-8 flex justify-between">
                    <button disabled={!step} onClick={() => setStep(step - 1)} className="eyebrow text-slate disabled:opacity-30">← Back</button>
                    <button onClick={() => setStep(step + 1)} className="bg-navy px-6 py-3 text-xs tracking-[0.2em] text-ivory uppercase">{step === 2 ? 'Submit' : 'Continue'} →</button>
                  </div>
                </>
              ) : (
                <div>
                  <p className="eyebrow text-ok">● Under review</p>
                  <p className="mt-4 font-display text-3xl">You're in the network.</p>
                  <p className="mt-3 text-slate">Vetting takes about five working days. We'll match you to live assignments and onboard you with the TerraMorph welcome method.</p>
                  <button onClick={() => setStep(0)} className="eyebrow mt-6 border-b border-navy pb-1">Start over</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-line">
            {rows[tab].map(([a, b, c]) => (
              <li key={a}><a href="#" className="group grid items-center gap-2 py-6 transition hover:bg-ivory md:grid-cols-[1fr_260px_160px] md:px-4">
                <span className="font-display text-2xl transition-transform duration-500 group-hover:translate-x-2">{a}</span>
                <span className="text-sm text-slate">{b}</span>
                <span className="eyebrow text-gold md:text-end">{c} →</span>
              </a></li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

/* ——— Contact card ——— */
export function ContactCard() {
  return (
    <section id="contact" className="mx-auto max-w-[1320px] scroll-mt-40 px-5 py-24 md:px-10">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <h2 className="text-[clamp(2.4rem,5vw,4.4rem)] leading-[1] font-medium"><SplitText text="Hello! We are TerraMorph," /><SplitText className="italic text-navy-2" text="and we are consultants." delay={300} /></h2>
        <Reveal>
          <div className="relative -rotate-2 border border-navy bg-ivory p-10 shadow-[16px_16px_0_0_var(--color-gold-light)] transition-transform duration-500 hover:rotate-0">
            <p className="eyebrow text-gold">Contact us</p>
            <ul className="mt-6 space-y-5">
              {[['Website', 'terramorph.com', 'https://terramorph.com'], ['LinkedIn', '/company/terramorph', 'https://linkedin.com'], ['Phone', '+20 100 000 0000', 'tel:+201000000000'], ['Email', 'hello@terramorph.com', 'mailto:hello@terramorph.com']].map(([l, v, h]) => (
                <li key={l} className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
                  <span className="eyebrow text-slate">{l}</span>
                  <a href={h} className="font-display text-xl hover:text-gold md:text-2xl">{v}</a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ——— Learning strip ——— */
export function LearningStrip() {
  return (
    <section id="learning" className="grid scroll-mt-40 lg:grid-cols-[1fr_1fr]">
      <div className="relative min-h-[360px] bg-navy-2">
        <img src={img('photo-1699197671498-ab6931ccce96', 1000)} alt="Practitioners gathered in a learning session" className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-luminosity" />
      </div>
      <div className="flex flex-col justify-center bg-ivory-2 p-10 lg:p-16">
        <p className="eyebrow text-gold">TerraMorph Learning</p>
        <h2 className="mt-4 text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] font-medium">Ready to get more motivated?</h2>
        <p className="mt-4 max-w-md text-slate">Tailored diagnostics, the welcome method for new teams, and a jobs and onboarding framework for institutions that want to keep the gains.</p>
        <div className="mt-8 grid grid-cols-3 gap-6">
          {[[85, 'Trainees certified'], [12, 'Programmes'], [4, 'Open cohorts']].map(([v, l]) => <div key={l}><p className="font-display text-4xl"><CountUp to={v as number} /></p><p className="mt-1 text-xs text-slate">{l}</p></div>)}
        </div>
      </div>
    </section>
  )
}
