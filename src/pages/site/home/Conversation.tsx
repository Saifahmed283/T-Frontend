import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Contours, Emblem } from '@/components/motion/fx'
import { api, ApiError } from '@/lib/api'

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
          {options.map((o) => <button type="button" key={o} onClick={() => { onChange(o); setOpen(false) }} className={`px-4 py-2 text-start transition hover:bg-ivory-2 ${o === value ? 'text-gold-strong' : ''}`}>{o}</button>)}
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
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const pickRole = (r: string) => { setRole(r); setSel([roleToList[r]]) }
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      await api.submit({
        kind: 'CONTACT',
        email,
        source: 'site',
        message: `I am a ${role}, and I would like to ${intent}. I'm looking forward to ${fw}.`,
        payload: { role, intent, forward: fw, lists: sel },
      })
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }
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
              <button onClick={() => { setSent(false); setEmail('') }} className="eyebrow mt-8 border-b border-gold-light pb-1">Write another note</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p className="mt-8 font-display text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.35] font-medium">
                Hello! I am a <Pick value={role} options={roles} onChange={pickRole} />, and I would like to <Pick value={intent} options={intents} onChange={setIntent} />. I'm looking forward to <Pick value={fw} options={forward} onChange={setFw} />.
              </p>
              <div className="mt-10">
                <p className="eyebrow text-ivory/65">Also write to me on — pick only what you'd read</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {lists.map((l) => {
                    const on = sel.includes(l)
                    return <button type="button" key={l} aria-pressed={on} onClick={() => setSel(on ? sel.filter((x) => x !== l) : [...sel, l])}
                      className={`border px-4 py-2 text-sm transition ${on ? 'border-gold-light bg-gold-light text-navy' : 'border-ivory/20 text-ivory/75 hover:border-ivory/60'}`}>{on ? '✓ ' : '+ '}{l}</button>
                  })}
                </div>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-4 border-b border-ivory/30 focus-within:border-gold-light">
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@organisation.org" className="min-w-0 flex-1 bg-transparent py-4 text-lg placeholder:text-ivory/30 focus:outline-none" />
                <button type="submit" disabled={sending} className="cursor-pointer eyebrow py-4 text-gold-light transition hover:text-ivory disabled:opacity-60">{sending ? 'Sending…' : "Let's collaborate →"}</button>
              </div>
              {error && <p role="alert" className="eyebrow mt-4 text-gold-light">{error}</p>}
            </form>
          )}
        </div>
        <aside className="self-end border border-ivory/15 p-8">
          <p className="eyebrow text-gold-light">Or reach us directly</p>
          <ul className="mt-6 space-y-4">
            {[['Phone', '+20 100 000 0000', 'tel:+201000000000'], ['Email', 'hello@terramorph.com', 'mailto:hello@terramorph.com'], ['LinkedIn', '/company/terramorph', 'https://linkedin.com'], ['Office', 'New Cairo, Egypt', 'https://www.google.com/maps/search/New+Cairo,+Egypt']].map(([l, v, h]) => (
              <li key={l} className="flex items-baseline justify-between gap-4 border-b border-ivory/10 pb-4">
                <span className="eyebrow text-ivory/65">{l}</span>
                <a href={h} className="font-display text-xl transition hover:text-gold-light">{v}</a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}