import { useEffect, useMemo, useRef, useState } from 'react'
import { audiences, cases, knowledge } from '@/content/data'
import { SplitText, Reveal, Spotlight, GoldLine, Contours, Emblem } from '@/components/motion/fx'

export function Head({ id, n, eyebrow, title, aside, dark }: { id?: string; n: string; eyebrow: string; title: string; aside?: React.ReactNode; dark?: boolean }) {
  return (
    <div id={id} className="scroll-mt-40">
      <div className="flex items-center gap-4">
        <span className={`eyebrow ${dark ? 'text-gold-light' : 'text-gold'}`}>{n}</span>
        <span className={`eyebrow ${dark ? 'text-ivory/50' : 'text-slate'}`}>{eyebrow}</span>
      </div>
      <GoldLine className="mt-4" />
      <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <h2 className="max-w-3xl text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] font-medium"><SplitText text={title} /></h2>
        {aside}
      </div>
    </div>
  )
}

/* ——— 03 Evidence: three cases up top, the full ledger beneath, sector as a filter ——— */
const ledger = [
  { y: 2026, sector: 'Social enterprise', title: 'Blended-finance structure, women-led agri cooperative', client: 'Delta Impact Fund', geo: 'Egypt', size: '< USD 100k' },
  { y: 2026, sector: 'Investment climate', title: 'Investment climate action plan', client: 'Ministry of Planning', geo: 'Egypt', size: 'USD 250–500k' },
  { y: 2025, sector: 'Local economic development', title: 'Governorate investment map, phase I–II', client: 'Assiut Governorate', geo: 'Egypt', size: 'USD 100–250k' },
  { y: 2025, sector: 'Local economic development', title: 'Main-street LED pilot design', client: 'Municipal authority', geo: 'Egypt', size: '< USD 100k' },
  { y: 2024, sector: 'TVET & skills', title: 'Employer-validated curricula for 14 schools', client: 'GIZ programme', geo: 'Egypt', size: 'USD 100–250k' },
  { y: 2024, sector: 'Policy', title: 'SME regulatory burden review', client: 'Chamber of commerce', geo: 'Jordan', size: '< USD 100k' },
  { y: 2023, sector: 'TVET & skills', title: 'Train-the-trainer certification framework', client: 'AAST Academy', geo: 'Egypt', size: '< USD 100k' },
]
const sectors = ['All sectors', ...new Set(ledger.map((l) => l.sector))]

export function Evidence() {
  const [sec, setSec] = useState('All sectors')
  const [open, setOpen] = useState(false)
  const rows = ledger.filter((l) => sec === 'All sectors' || l.sector === sec)
  return (
    <section className="mx-auto max-w-[1320px] px-5 py-24 md:px-10">
      <Head id="evidence" n="02" eyebrow="Evidence" title="Three cases, then the whole ledger."
        aside={<p className="max-w-xs text-sm text-slate">Every claim links to a dated, named assignment. A procurement reader can check all of it.</p>} />
      <div className="mt-14 grid gap-px bg-line lg:grid-cols-3">
        {cases.map((c, i) => (
          <Reveal key={i} delay={i * 120} className="bg-ivory">
            <Spotlight className="h-full" color="rgba(19,43,69,0.06)">
              <article className="flex h-full min-h-[340px] flex-col p-8">
                <div className="flex justify-between"><span className="eyebrow text-gold">{c.sector}</span><span className="eyebrow text-slate">{c.year}</span></div>
                <div className="relative my-7 h-24 border-y border-line">
                  <svg viewBox="0 0 300 100" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
                    <path d={['M0 80 Q60 75 100 60 T200 35 T300 10', 'M0 70 L50 66 L100 50 L150 52 L200 30 L250 26 L300 12', 'M0 85 C80 85 120 50 170 45 S260 20 300 18'][i]}
                      fill="none" stroke="#A98A4B" strokeWidth="1.5" strokeDasharray="400" strokeDashoffset="400" className="transition-[stroke-dashoffset] duration-[1600ms] group-hover:[stroke-dashoffset:0]" />
                    <path d={['M0 80 Q60 75 100 60 T200 35 T300 10', 'M0 70 L50 66 L100 50 L150 52 L200 30 L250 26 L300 12', 'M0 85 C80 85 120 50 170 45 S260 20 300 18'][i]} fill="none" stroke="#132B45" strokeOpacity=".12" strokeWidth="1.5" />
                  </svg>
                  <span className="eyebrow absolute right-0 bottom-2 text-slate">Baseline → Verified</span>
                </div>
                <h3 className="text-2xl leading-snug font-medium">{c.title}</h3>
                <p className="mt-auto pt-8 text-sm text-slate">{c.client}</p>
              </article>
            </Spotlight>
          </Reveal>
        ))}
      </div>

      <div className="mt-px border border-line bg-ivory-2">
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-8 py-6 text-start transition hover:bg-ivory">
          <span><span className="eyebrow text-gold">Assignment ledger</span><span className="ms-4 font-display text-2xl">{ledger.length} entries shown</span></span>
          <span className={`grid h-10 w-10 place-items-center rounded-full border border-navy transition-transform duration-500 ${open ? 'rotate-45 bg-navy text-ivory' : ''}`}>+</span>
        </button>
        <div className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-8 pb-4">
              {sectors.map((s) => <button key={s} onClick={() => setSec(s)} className={`shrink-0 border px-3 py-1.5 text-xs tracking-wide transition ${sec === s ? 'border-navy bg-navy text-ivory' : 'border-line bg-ivory hover:border-navy'}`}>{s}</button>)}
            </div>
            <div className="overflow-x-auto px-8 pb-8">
              <table className="w-full min-w-[720px] text-sm">
                <thead><tr className="eyebrow text-slate">{['Year', 'Assignment', 'Client', 'Country', 'Size'].map((h) => <th key={h} className="py-3 text-start font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.title} className="border-t border-line transition hover:bg-ivory">
                      <td className="py-3 pe-4 font-display text-lg text-gold">{r.y}</td>
                      <td className="py-3 pe-4"><p>{r.title}</p><p className="text-xs text-slate">{r.sector}</p></td>
                      <td className="py-3 pe-4 text-navy-2">{r.client}</td>
                      <td className="py-3 pe-4 text-slate">{r.geo}</td>
                      <td className="py-3 text-slate">{r.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ——— 05 Knowledge: mixed types, type + language named, free toolkit folded in ——— */
const library = [
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
                <a href="#" className={`group grid items-center gap-3 py-6 transition-colors md:grid-cols-[160px_1fr_32px] md:px-4 ${i === hover ? 'bg-ivory-2' : ''}`}>
                  <span className="eyebrow text-gold">{k.type} · <span className="text-navy">{k.lang}</span>{k.free && <span className="ms-2 bg-ok px-1.5 py-0.5 text-ivory">Free</span>}</span>
                  <span dir={k.lang === 'AR' ? 'rtl' : undefined} className="font-display text-2xl font-medium transition-transform duration-500 group-hover:translate-x-2">{k.title}</span>
                  <span className="hidden text-end transition-transform group-hover:-translate-y-0.5 md:block">↗</span>
                </a>
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
              <a href="#" className="eyebrow relative mt-4 border-b border-gold-light pb-1 self-start">{feat.free ? 'Download free' : 'Read'} →</a>
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}

/* ——— 06 Learning: price-bearing, bookable programmes ——— */
const programmes = [
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
            <Reveal key={p.title} delay={i * 80}>
              <li className="group grid items-center gap-4 border-b border-navy/10 py-6 transition-colors hover:bg-ivory md:grid-cols-[90px_1fr_180px_180px] md:px-4">
                <div className="flex items-baseline gap-2 md:block"><span className="font-display text-5xl leading-none">{p.d}</span><span className="eyebrow text-gold md:mt-1 md:block">{p.m}</span></div>
                <div><p className="font-display text-2xl font-medium">{p.title}</p><p className="mt-1 text-sm text-slate">{p.fmt}</p></div>
                <div><p className="text-lg">{p.price}</p>{p.seats > 0 && <p className={`text-xs ${p.seats < 5 ? 'text-warn' : 'text-slate'}`}>{p.seats} seats left</p>}</div>
                <button onClick={() => setBooked(p.title)} className={`justify-self-start border px-5 py-3 text-xs tracking-[0.18em] uppercase transition md:justify-self-end ${booked === p.title ? 'border-ok bg-ok text-ivory' : 'border-navy group-hover:bg-navy group-hover:text-ivory'}`}>
                  {booked === p.title ? '✓ Reserved' : p.seats ? 'Reserve seat' : 'Start now'}
                </button>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ——— 08 Join: two doors (partners, experts) + careers & tenders, one place ——— */
export function Join() {
  const tabs = ['Expert network', 'Team with us', 'Careers', 'Tenders'] as const
  const [tab, setTab] = useState<(typeof tabs)[number]>('Expert network')
  const [step, setStep] = useState(0)
  const steps = ['Profile', 'Expertise', 'CV', 'Status']
  const lists: Record<string, [string, string, string][]> = {
    'Team with us': [['Specialist sub-partner for LED & policy lots', 'Method + local reach + compliance file', 'Propose teaming'], ['Capability statement — consultancies', 'PDF · v3.1 · Sep 2026', 'Download'], ['Compliance pack', 'Registration, tax ID, ISO 37001', 'Download']],
    Careers: [['Senior policy analyst', 'Cairo · Full time', 'Apply'], ['LED field coordinator', 'Assiut · 12 months', 'Apply'], ['Research intern (AAST)', 'Alexandria · 6 months', 'Apply']],
    Tenders: [['Urban mobility diagnostic', 'EOI · closes 30 Oct', 'Express interest'], ['TVET governance review', 'RFP · closes 14 Nov', 'Express interest'], ['SME finance access study', 'Open call · rolling', 'Express interest']],
  }
  return (
    <section id="join-board" className="relative scroll-mt-40 overflow-hidden bg-navy text-ivory">
      <Contours className="absolute inset-0 h-full w-full" opacity={0.08} />
      <div className="relative mx-auto max-w-[1320px] px-5 py-24 md:px-10">
        <Head dark n="07" eyebrow="Join" title="Experts, partners, people and tenders — one door each." />
        <div className="no-scrollbar mt-10 flex gap-1 overflow-x-auto border-b border-ivory/15">
          {tabs.map((x) => (
            <button key={x} onClick={() => setTab(x)} className={`relative shrink-0 px-5 py-4 text-sm transition ${tab === x ? 'text-ivory' : 'text-ivory/50 hover:text-ivory'}`}>
              {x}{tab === x && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold-light" />}
            </button>
          ))}
        </div>
        {tab === 'Expert network' ? (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="max-w-sm text-ivory/70">Register once. See your status at every step. Get matched to live assignments — never a dead-end CV upload.</p>
              <ol className="mt-8 flex gap-2">
                {steps.map((s, k) => (
                  <li key={s} className="flex-1">
                    <div className="h-0.5 bg-ivory/15"><div className="h-full bg-gold-light transition-all duration-700" style={{ width: k <= step ? '100%' : '0%' }} /></div>
                    <p className={`eyebrow mt-3 ${k <= step ? 'text-gold-light' : 'text-ivory/40'}`}>{s}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="border border-ivory/15 bg-navy-3/60 p-8">
              {step < 3 ? (
                <>
                  <p className="font-display text-3xl">{['Who are you?', 'What do you know deeply?', 'Upload your CV'][step]}</p>
                  <div className="mt-6 space-y-4">
                    {step === 0 && ['Full name', 'Country · city', 'LinkedIn URL'].map((p) => <input key={p} placeholder={p} className="w-full border-b border-ivory/20 bg-transparent py-3 placeholder:text-ivory/30 focus:border-gold-light focus:outline-none" />)}
                    {step === 1 && <div className="flex flex-wrap gap-2">{['Local economic development', 'Policy', 'TVET & skills', 'Investment climate', 'Social enterprise', 'Public finance', 'GIS & data'].map((a) => <label key={a} className="cursor-pointer border border-ivory/20 px-3 py-2 text-sm transition has-checked:border-gold-light has-checked:bg-gold-light has-checked:text-navy"><input type="checkbox" className="sr-only" />{a}</label>)}</div>}
                    {step === 2 && <label className="grid h-36 cursor-pointer place-items-center border border-dashed border-ivory/30 text-ivory/60 transition hover:border-gold-light"><input type="file" className="sr-only" />Drop your CV or click to browse (PDF, DOCX)</label>}
                  </div>
                  <div className="mt-8 flex justify-between">
                    <button disabled={!step} onClick={() => setStep(step - 1)} className="eyebrow text-ivory/50 disabled:opacity-30">← Back</button>
                    <button onClick={() => setStep(step + 1)} className="bg-gold-light px-6 py-3 text-xs tracking-[0.2em] text-navy uppercase transition hover:bg-ivory">{step === 2 ? 'Submit' : 'Continue'} →</button>
                  </div>
                </>
              ) : (
                <div style={{ animation: 'fadeup .6s both' }}>
                  <p className="eyebrow text-gold-light"><span className="pulse-dot me-2 inline-block h-2 w-2 rounded-full bg-gold-light" />Under review · ~5 working days</p>
                  <p className="mt-4 font-display text-3xl">You're in the network.</p>
                  <p className="mt-3 text-ivory/60">We'll match you to live assignments and onboard you with the TerraMorph welcome method.</p>
                  <button onClick={() => setStep(0)} className="eyebrow mt-6 border-b border-gold-light pb-1">Start over</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ul key={tab} className="mt-6 divide-y divide-ivory/10">
            {lists[tab].map(([a, b, c], i) => (
              <li key={a} style={{ animation: `fadeup .5s ${i * 0.08}s both` }}>
                <a href="#" className="group grid items-center gap-2 py-6 transition hover:bg-ivory/5 md:grid-cols-[1fr_280px_180px] md:px-4">
                  <span className="font-display text-2xl transition-transform duration-500 group-hover:translate-x-2">{a}</span>
                  <span className="text-sm text-ivory/55">{b}</span>
                  <span className="eyebrow text-gold-light md:text-end">{c} →</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

/* ——— 09 Conversation: one front door — "Hello! I am…" + which lists + contact ——— */
const roles = ['policy maker', 'government official', 'local entity', 'development partner', 'INGO', 'consultant', 'business owner', 'change agent', 'cause enthusiast']
const intents = ['explain a challenge', 'suggest an idea', 'join the cause', 'partner with the company', 'book the diagnostic']
const forward = ['a proper conversation', 'aligning efforts', 'collaborating', 'meeting for coffee']
const lists = ['Public sector briefs (AR)', 'Development partner digest', 'Business & investment', 'NGO toolkit drops', 'Expert opportunities']

function Pick({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const off = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', off)
    return () => document.removeEventListener('mousedown', off)
  }, [open])
  return (
    <span ref={ref} className="relative inline-block">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className="inline-flex items-baseline gap-2 border-b-2 border-gold-light px-1 italic text-gold-light transition hover:text-ivory">
        {value}<span className={`text-[0.35em] not-italic transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <span className="absolute start-0 top-full z-30 mt-3 flex w-max max-w-[80vw] flex-col border border-line bg-ivory p-2 font-sans text-base not-italic text-navy shadow-[0_24px_60px_-20px_rgba(0,0,0,.5)]" style={{ animation: 'fadeup .25s both' }}>
          {options.map((o) => <button type="button" key={o} onClick={() => { onChange(o); setOpen(false) }} className={`px-4 py-2 text-start transition hover:bg-ivory-2 ${o === value ? 'text-gold' : ''}`}>{o}</button>)}
        </span>
      )}
    </span>
  )
}

const roleToList: Record<string, string> = { 'policy maker': lists[0], 'government official': lists[0], 'local entity': lists[0], 'development partner': lists[1], INGO: lists[3], consultant: lists[4], 'business owner': lists[2], 'change agent': lists[3], 'cause enthusiast': lists[3] }

export function Conversation() {
  const [role, setRole] = useState(roles[0])
  const [intent, setIntent] = useState(intents[0])
  const [fw, setFw] = useState(forward[0])
  const [sel, setSel] = useState<string[]>([lists[0]])
  const [sent, setSent] = useState(false)
  const pickRole = (r: string) => { setRole(r); setSel([roleToList[r]]) }
  return (
    <section id="contact" className="relative scroll-mt-40 overflow-hidden bg-navy-3 text-ivory">
      <Contours className="absolute inset-0 h-full w-full" opacity={0.1} />
      <div className="relative mx-auto grid max-w-[1320px] gap-14 px-5 py-24 md:px-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="eyebrow text-gold-light">08 · Start a conversation</p>
          {sent ? (
            <div className="mt-10" style={{ animation: 'fadeup .7s both' }}>
              <Emblem className="h-14 w-14" tone="ivory" />
              <p className="mt-6 max-w-2xl font-display text-[clamp(2rem,4vw,3.2rem)] leading-tight">Thank you. A partner will reach out within two working days to set up {fw}.</p>
              {!!sel.length && <p className="mt-4 text-ivory/60">You'll also receive: {sel.join(' · ')}.</p>}
              <button onClick={() => setSent(false)} className="eyebrow mt-8 border-b border-gold-light pb-1">Write another note</button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
              <p className="mt-8 font-display text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.35] font-medium">
                Hello! I am a <Pick value={role} options={roles} onChange={pickRole} />, and I would like to <Pick value={intent} options={intents} onChange={setIntent} />. I'm looking forward to <Pick value={fw} options={forward} onChange={setFw} />.
              </p>
              <div className="mt-10">
                <p className="eyebrow text-ivory/50">Also write to me on — pick only what you'd read</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {lists.map((l) => {
                    const on = sel.includes(l)
                    return <button type="button" key={l} aria-pressed={on} onClick={() => setSel(on ? sel.filter((x) => x !== l) : [...sel, l])}
                      className={`border px-4 py-2 text-sm transition ${on ? 'border-gold-light bg-gold-light text-navy' : 'border-ivory/20 text-ivory/75 hover:border-ivory/60'}`}>{on ? '✓ ' : '+ '}{l}</button>
                  })}
                </div>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-4 border-b border-ivory/30 focus-within:border-gold-light">
                <input required type="email" placeholder="you@organisation.org" className="min-w-0 flex-1 bg-transparent py-4 text-lg placeholder:text-ivory/30 focus:outline-none" />
                <button className="eyebrow py-4 text-gold-light transition hover:text-ivory">Let's collaborate →</button>
              </div>
            </form>
          )}
        </div>
        <aside className="self-end border border-ivory/15 p-8">
          <p className="eyebrow text-gold-light">Or reach us directly</p>
          <ul className="mt-6 space-y-4">
            {[['Phone', '+20 100 000 0000', 'tel:+201000000000'], ['Email', 'hello@terramorph.com', 'mailto:hello@terramorph.com'], ['LinkedIn', '/company/terramorph', 'https://linkedin.com'], ['Office', 'New Cairo, Egypt', '#']].map(([l, v, h]) => (
              <li key={l} className="flex items-baseline justify-between gap-4 border-b border-ivory/10 pb-4">
                <span className="eyebrow text-ivory/45">{l}</span>
                <a href={h} className="font-display text-xl transition hover:text-gold-light">{v}</a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}

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
