import { CountUp } from '@/components/motion/fx'
import { img } from './shared'

/* ——— Learning strip ——— */
export function LearningStrip() {
  return (
    <section id="learning" className="grid scroll-mt-40 lg:grid-cols-[1fr_1fr]">
      <div className="relative min-h-[360px] bg-navy-2">
        <img src={img('photo-1699197671498-ab6931ccce96', 1000)} alt="Practitioners gathered in a learning session" className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-luminosity" />
      </div>
      <div className="flex flex-col justify-center bg-ivory-2 p-10 lg:p-16">
        <p className="eyebrow text-gold-strong">TerraMorph Learning</p>
        <h2 className="mt-4 text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] font-medium">Ready to get more motivated?</h2>
        <p className="mt-4 max-w-md text-slate">Tailored diagnostics, the welcome method for new teams, and a jobs and onboarding framework for institutions that want to keep the gains.</p>
        <div className="mt-8 grid grid-cols-3 gap-6">
          {[[85, 'Trainees certified'], [12, 'Programmes'], [4, 'Open cohorts']].map(([v, l]) => <div key={l}><p className="font-display text-4xl"><CountUp to={v as number} /></p><p className="mt-1 text-xs text-slate">{l}</p></div>)}
        </div>
      </div>
    </section>
  )
}