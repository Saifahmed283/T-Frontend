import { useEffect, useRef, useState } from 'react'
import { Contours, Reveal, SplitText } from '@/components/motion/fx'
import type { Lang } from '../types'

/* Hero — dark editorial ground. A vast emblem-globe rises from the horizon like a
   planet over a plain; the headline sits on it. Pointer moves the light, not the layout. */
function Hero({ lang }: { lang: Lang }) {
  const ar = lang === 'ar'
  const sec = useRef<HTMLElement>(null)
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setP(Math.min(1, window.scrollY / (sec.current?.offsetHeight || 800)))) }
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])
  const light = (e: React.PointerEvent) => {
    const r = sec.current!.getBoundingClientRect()
    sec.current!.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    sec.current!.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }
  const pillars = [
    { en: 'Strategy', ar: 'الاستراتيجية', d: ar ? 'خطط استثمار ومحافظ قابلة للتنفيذ.' : 'Investment plans and portfolios that survive contact with budgets.' },
    { en: 'Policy', ar: 'السياسات', d: ar ? 'إصلاحات مبنية على الأدلة ومُصممة للتطبيق.' : 'Evidence-led reform drafted to be implemented, not shelved.' },
    { en: 'Transformation', ar: 'التحوّل', d: ar ? 'من التشخيص إلى نتائج مُتحقق منها.' : 'From diagnostic to verified outcome, gate by gate.' },
  ]
  return (
    <section ref={sec} onPointerMove={light}
      className="relative isolate flex min-h-[calc(100svh-110px)] flex-col overflow-hidden bg-navy-3 text-ivory [--mx:70%] [--my:30%]">
      {/* light that follows the pointer */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_circle_at_var(--mx)_var(--my),rgba(196,168,104,.12),transparent_60%)] transition-[background] duration-300" />
      <Contours className="absolute inset-0 -z-10 h-full w-full" stroke="#FBF8F1" opacity={0.05} />

      {/* the rising globe */}
      <div aria-hidden className="pointer-events-none absolute start-1/2 top-[66%] -z-10 aspect-square w-[min(1150px,160vw)]"
        style={{ transform: `translate(${ar ? '50%' : '-50%'}, ${p * 18}%)` }}>
        <svg viewBox="0 0 400 400" className="h-full w-full">
          <defs>
            <radialGradient id="hg" cx="50%" cy="0%" r="70%"><stop offset="0" stopColor="#31455B" /><stop offset="1" stopColor="#0C1D30" /></radialGradient>
            <linearGradient id="rim" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#C4A868" /><stop offset=".25" stopColor="#C4A868" stopOpacity="0" /></linearGradient>
            <clipPath id="hc"><circle cx="200" cy="200" r="198" /></clipPath>
          </defs>
          <circle cx="200" cy="200" r="198" fill="url(#hg)" />
          <g clipPath="url(#hc)" fill="none" stroke="#FBF8F1" strokeWidth=".35">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <ellipse key={i} cx="200" cy="200" rx="198" ry="198" strokeOpacity=".07" className="meridian-slow" style={{ animationDuration: '40s', animationDelay: `${-i * 5}s` }} />)}
            {[-150, -100, -50, 0].map((y) => <ellipse key={y} cx="200" cy={200 + y} rx={Math.sqrt(198 ** 2 - y ** 2)} ry={Math.sqrt(198 ** 2 - y ** 2) * 0.12} strokeOpacity=".1" />)}
          </g>
          <circle cx="200" cy="200" r="198" fill="none" stroke="url(#rim)" strokeWidth="1.2" pathLength={1} className="intro-draw" style={{ animationDuration: '2.4s' }} />
          <circle cx="200" cy="200" r="186" fill="none" stroke="#C4A868" strokeOpacity=".25" strokeWidth=".4" strokeDasharray=".6 3" />
        </svg>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[75%] bg-[radial-gradient(ellipse_60%_70%_at_50%_35%,#0C1D30_45%,transparent_100%)]" />
      <div className="relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col items-center px-5 pt-[9vh] text-center md:px-10">
        <h1 className={`mt-8 max-w-5xl font-medium ${ar ? 'text-[clamp(2.4rem,6vw,5rem)] leading-[1.25]' : 'text-[clamp(2.8rem,7.4vw,6.8rem)] leading-[0.95] tracking-[-0.02em]'}`}>
          {ar ? <SplitText text="نُعيد تشكيل الأرض التي تقوم عليها الاقتصادات." delay={200} /> : (
            <>
              <SplitText text="We reshape the ground" delay={200} />{' '}
              <span className="block"><SplitText text="on which" delay={420} /> <SplitText className="italic text-gold-light" text="economies stand." delay={560} /></span>
            </>
          )}
        </h1>
        <Reveal delay={900}><p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ivory/80 md:text-lg">
          {ar ? 'استشارات في الاستراتيجية والسياسات والتحول للحكومات والمؤسسات والمشاريع الاجتماعية.' : 'Advisory for governments, institutions and social enterprises — small, well-placed force for large public outcomes.'}
        </p></Reveal>
      </div>

      {/* three pillars on the horizon */}
      <div className="relative mx-auto mt-16 w-full max-w-[1320px] px-5 pb-8 md:px-10">
        <div className="grid border-t border-ivory/15 sm:grid-cols-3 [&>*:last-child>div]:border-e-0">
          {pillars.map((x, i) => (
            <Reveal key={x.en} delay={1100 + i * 120}>
              <div className="group relative border-ivory/15 py-6 sm:border-e sm:px-6">
                <span className="absolute -top-px start-0 h-px w-0 bg-gold-light transition-all duration-700 group-hover:w-full" />
                <div className="flex items-baseline gap-3"><span className="eyebrow text-gold-light">0{i + 1}</span><span className="font-display text-2xl md:text-3xl">{ar ? x.ar : x.en}</span></div>
                <p className="mt-2 max-w-xs text-sm text-ivory/70 transition-colors group-hover:text-ivory/80">{x.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <a href="/for" aria-label="Scroll" className="absolute -top-14 start-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ivory/65 transition hover:text-ivory md:flex rtl:translate-x-1/2">
          <span className="relative h-8 w-px overflow-hidden bg-ivory/15"><span className="scroll-cue absolute inset-0 bg-gold-light" /></span>
        </a>
      </div>
    </section>
  )
}

export { Hero }