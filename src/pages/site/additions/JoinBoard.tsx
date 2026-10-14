import { useState } from 'react'
import { SplitText } from '@/components/motion/fx'
import { areas } from './shared'

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
        <p className="eyebrow text-gold-strong">Join the company</p>
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
              <li key={a}><a href="/contact" className="group grid items-center gap-2 py-6 transition hover:bg-ivory md:grid-cols-[1fr_260px_160px] md:px-4">
                <span className="font-display text-2xl transition-transform duration-500 group-hover:translate-x-2">{a}</span>
                <span className="text-sm text-slate">{b}</span>
                <span className="eyebrow text-gold-strong md:text-end">{c} →</span>
              </a></li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}