import { useMemo, useState } from 'react'
import { Contours } from '@/components/motion/fx'
import type { Lang } from '../types'

/* ——— Cause exhibition: a simulated local community that comes alive as people contribute ——— */
export function CauseExhibition({ lang }: { lang: Lang }) {
  const ar = lang === 'ar'
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
          <p className="eyebrow text-gold-light">{ar ? 'معرض القضية' : 'The cause exhibition'}</p>
          <h2 className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)] leading-[1.02] font-medium">{ar ? 'مجتمع مسالم، يثق فيه الناس بعضهم ببعض.' : 'A peaceful society, where people trust each other.'}</h2>
          <p className="mt-6 max-w-md leading-relaxed text-ivory/70">{ar ? 'الأمر لا يتعلق بما يمكن للناس شراؤه، بل بما يشعرون به وما يحلمون به — وكيف يتحوّل ذلك إلى خياراتهم في الغد. أضِف نفسك إلى الصورة وشاهد المجتمع يتّصل.' : "It's not about what people can buy, but about what they feel and what they can dream of — and how that becomes their choices of tomorrow. Add yourself to the picture and watch the community connect."}</p>
          <div className="mt-8 inline-flex w-max border border-ivory/20 p-1">
            {(['exhibition', 'intervention'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 text-xs tracking-[0.18em] uppercase transition rtl:normal-case rtl:tracking-normal ${mode === m ? 'bg-gold-light text-navy' : 'text-ivory/70 hover:text-ivory'}`}>{ar ? (m === 'exhibition' ? 'العرض' : 'التدخل') : m}</button>
            ))}
          </div>
          <p className="mt-4 text-sm text-ivory/60">{mode === 'exhibition' ? (ar ? 'انظر القضية: مجتمع محلي كما يمكن أن يكون.' : 'See the cause: a local community as it could be.') : (ar ? 'انظر التدخل: حيث تقع القوة الصغيرة المحكمة.' : 'See the intervention: where small, well-placed force lands.')}</p>
          <div className="mt-auto grid grid-cols-2 gap-6 pt-10">
            <div><p className="font-display text-5xl">{lit}</p><p className="eyebrow mt-2 text-ivory/65">{ar ? 'المساهمون' : 'Contributors'}</p></div>
            <div><p className="font-display text-5xl">{trust}%</p><p className="eyebrow mt-2 text-ivory/65">{ar ? 'مؤشر الثقة' : 'Trust index'}</p></div>
          </div>
          <div className="mt-8 flex gap-3">
            <button onClick={() => setLit((l) => Math.min(nodes.length, l + 4))} className="bg-gold-light px-6 py-3 text-[0.72rem] font-medium tracking-[0.2em] text-navy uppercase transition hover:bg-ivory rtl:normal-case rtl:tracking-normal">{ar ? 'أضِف إلى الصورة +' : 'Contribute to the picture +'}</button>
            <button onClick={() => setLit(6)} className="eyebrow px-3 text-ivory/65 hover:text-ivory">{ar ? 'إعادة' : 'Reset'}</button>
          </div>
        </div>
        <div className="relative border border-ivory/10 bg-navy-3/50">
          <svg viewBox="0 0 1000 500" className="h-full w-full" role="img" aria-label={ar ? `محاكاة مجتمعية، ${lit} من ${nodes.length} منزلًا يساهم` : `Community simulation, ${lit} of ${nodes.length} households contributing`}>
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
          <p className="eyebrow absolute bottom-4 start-4 text-ivory/65">{ar ? 'محاكاة · انقر أي منزل للانضمام' : 'Simulation · click any household to join'}</p>
        </div>
      </div>
    </section>
  )
}