import { useState } from 'react'
import { Contours } from '@/components/motion/fx'
import { Head } from './Head'

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
            <button key={x} onClick={() => setTab(x)} className={`relative shrink-0 px-5 py-4 text-sm transition ${tab === x ? 'text-ivory' : 'text-ivory/65 hover:text-ivory'}`}>
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
                    <p className={`eyebrow mt-3 ${k <= step ? 'text-gold-light' : 'text-ivory/65'}`}>{s}</p>
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
                    <button disabled={!step} onClick={() => setStep(step - 1)} className="eyebrow text-ivory/65 disabled:opacity-30">← Back</button>
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