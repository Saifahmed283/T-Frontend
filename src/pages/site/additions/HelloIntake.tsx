import { useState } from 'react'
import { Emblem, Reveal } from '@/components/motion/fx'
import { areas } from './shared'

/* ——— "Hello! I am… I would like to…" — the sentence-builder front door ——— */
const roles = ['change agent', 'local entity', 'policy maker', 'government official', 'development partner', 'INGO', 'consultant', 'expert', 'cause enthusiast']
const intents = ['explain a challenge', 'suggest an idea', 'join the cause', 'partner with the company']
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