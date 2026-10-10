import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Intro from './Intro'
import { useHead } from '@/hooks/useHead'
import { WhatsNew, CauseExhibition } from '@/pages/site/additions'
import { Evidence, Knowledge, Learning, Join, Conversation, SearchOverlay } from '@/pages/site/home'
import { audiences, method, cases, knowledge, footer } from '@/content/data'
import { SplitText, Reveal, CountUp, Spotlight, Magnetic, GoldLine, Decrypt, Contours, Logo, Emblem } from '@/components/motion/fx'

export type Lang = 'en' | 'ar'
type Props = { lang: Lang; setLang: (l: Lang) => void; hub?: string }

const nav = [
  { id: 'evidence', en: 'Evidence', ar: 'الأدلة' },
  { id: 'cause', en: 'Method', ar: 'المنهج' },
  { id: 'knowledge', en: 'Knowledge', ar: 'المعرفة' },
  { id: 'learning', en: 'Learning', ar: 'التعلّم' },
  { id: 'new', en: 'About', ar: 'من نحن' },
  { id: 'join-board', en: 'Join', ar: 'انضم' },
]

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    const t = setTimeout(() => ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) }), 400)
    return () => { clearTimeout(t); io.disconnect() }
  }, [ids])
  return active
}

function LangSwitch({ lang, setLang, dark }: { lang: Lang; setLang: (l: Lang) => void; dark?: boolean }) {
  return (
    <div role="group" aria-label="Language" className={`relative grid grid-cols-2 rounded-full border p-0.5 text-[0.72rem] ${dark ? 'border-ivory/20' : 'border-navy/20'}`}>
      <span aria-hidden className={`absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full bg-gold-light transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${lang === 'ar' ? 'translate-x-full rtl:-translate-x-full' : ''} start-0.5`} />
      {(['en', 'ar'] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
          className={`relative z-10 min-w-12 px-3 py-1.5 transition-colors ${lang === l ? 'text-navy' : dark ? 'text-ivory/60 hover:text-ivory' : 'text-slate hover:text-navy'}`}>
          {l === 'en' ? 'EN' : 'عربي'}
        </button>
      ))}
    </div>
  )
}

function Header({ lang, setLang }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(false)
  const active = useActiveSection(useMemo(() => nav.map((n) => n.id), []))
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(true) } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])
  const ar = lang === 'ar'
  return (
    <>
      <header className={`sticky top-0 z-50 text-ivory transition-colors duration-500 ${scrolled ? 'bg-navy-3/85 shadow-[0_10px_40px_-20px_rgba(0,0,0,.6)] backdrop-blur-xl' : 'bg-navy-3'}`}>
        <div className={`mx-auto flex max-w-[1320px] items-center gap-6 px-5 transition-[padding] duration-500 md:px-10 ${scrolled ? 'py-3' : 'py-5'}`}>
          <a href="/" aria-label="TerraMorph home" className="shrink-0"><Logo tone="ivory" /></a>
          <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
            {nav.map((n) => {
              const on = active === n.id
              return (
                <a key={n.id} href={`/#${n.id}`} aria-current={on ? 'true' : undefined}
                  className={`group relative px-4 py-2 text-[0.8rem] tracking-[0.14em] uppercase transition-colors ${on ? 'text-ivory' : 'text-ivory/60 hover:text-ivory'} ${ar ? 'font-sans tracking-normal text-[0.95rem] normal-case' : ''}`}>
                  {ar ? n.ar : n.en}
                  <span className={`absolute inset-x-4 -bottom-0.5 h-px bg-gold-light transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${on ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </a>
              )
            })}
          </nav>
          <div className="ms-auto flex items-center gap-3 lg:ms-0">
            <button onClick={() => setSearch(true)} aria-label="Search (Ctrl K)" className="grid h-9 w-9 place-items-center rounded-full border border-ivory/20 text-ivory/70 transition hover:border-gold-light hover:text-ivory">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            </button>
            <div className="hidden sm:block"><LangSwitch lang={lang} setLang={setLang} dark /></div>
            <a href="/#contact" className="hidden bg-gold-light px-5 py-2.5 text-[0.72rem] font-medium tracking-[0.2em] text-navy uppercase transition hover:bg-ivory xl:block">{ar ? 'تواصل' : 'Contact'}</a>
            <button className="grid h-9 w-9 place-items-center lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
              <span className="relative block h-3 w-6">
                <span className={`absolute inset-x-0 top-0 h-px bg-ivory transition duration-300 ${open ? 'top-1.5 rotate-45' : ''}`} />
                <span className={`absolute inset-x-0 bottom-0 h-px bg-ivory transition duration-300 ${open ? 'bottom-1.5 -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>
        {/* Audience rail — collapses once you start reading */}
        <div className={`grid border-t border-ivory/10 transition-[grid-template-rows,opacity] duration-500 ${scrolled ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr]'}`}>
          <div className="overflow-hidden">
            <div className="no-scrollbar mx-auto flex max-w-[1320px] items-center gap-1 overflow-x-auto px-5 md:px-10">
              <span className="eyebrow shrink-0 py-2.5 pe-3 text-gold-light">{ar ? 'أنا…' : 'I am'}</span>
              {audiences.map((a) => (
                <a key={a.slug} href={`/hub/${a.slug}`} className="shrink-0 rounded-full px-3 py-1.5 text-[0.78rem] text-ivory/60 transition hover:bg-ivory/10 hover:text-ivory">
                  {ar ? a.ar : a.label}
                </a>
              ))}
              <a href="/dashboard" className="ms-auto shrink-0 ps-4 text-[0.72rem] tracking-[0.16em] text-ivory/50 uppercase hover:text-gold-light">{ar ? 'بوابة العملاء' : 'Client portal'} ↗</a>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 bg-navy-3 pt-24 text-ivory transition-[clip-path] duration-700 ease-[cubic-bezier(.76,0,.24,1)] lg:hidden ${open ? '[clip-path:inset(0)]' : 'pointer-events-none [clip-path:inset(0_0_100%_0)]'}`}>
        <nav className="flex h-full flex-col overflow-y-auto px-6 pb-10">
          {nav.map((n, i) => (
            <a key={n.id} href={`/#${n.id}`} onClick={() => setOpen(false)}
              className="flex items-baseline gap-4 border-b border-ivory/10 py-4 font-display text-4xl transition-[transform,opacity] duration-700"
              style={{ transitionDelay: open ? `${150 + i * 50}ms` : '0ms', transform: open ? 'none' : 'translateY(20px)', opacity: open ? 1 : 0 }}>
              <span className="eyebrow text-gold-light">0{i + 1}</span>{ar ? n.ar : n.en}
            </a>
          ))}
          <div className="mt-8 flex flex-wrap gap-2">
            {audiences.map((a) => <a key={a.slug} href={`/hub/${a.slug}`} onClick={() => setOpen(false)} className="rounded-full border border-ivory/15 px-3 py-1.5 text-sm text-ivory/70">{ar ? a.ar : a.label}</a>)}
          </div>
          <div className="mt-auto flex items-center justify-between pt-10">
            <LangSwitch lang={lang} setLang={setLang} dark />
            <a href="/#contact" onClick={() => setOpen(false)} className="bg-gold-light px-5 py-3 text-xs tracking-[0.2em] text-navy uppercase">{ar ? 'تواصل' : 'Contact'}</a>
          </div>
        </nav>
      </div>
      {search && <SearchOverlay onClose={() => setSearch(false)} />}
    </>
  )
}

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
      className="relative isolate flex min-h-[calc(100svh-108px)] flex-col overflow-hidden bg-navy-3 text-ivory [--mx:70%] [--my:30%]">
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
        <a href="/#for" aria-label="Scroll" className="absolute -top-14 start-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ivory/40 transition hover:text-ivory md:flex rtl:translate-x-1/2">
          <span className="relative h-8 w-px overflow-hidden bg-ivory/15"><span className="scroll-cue absolute inset-0 bg-gold-light" /></span>
        </a>
      </div>
    </section>
  )
}

function SectionHead({ id, n, eyebrow, title, aside }: { id?: string; n: string; eyebrow: string; title: string; aside?: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-40">
      <div className="flex items-center gap-4">
        <span className="eyebrow text-gold">{n}</span>
        <span className="eyebrow text-slate">{eyebrow}</span>
      </div>
      <GoldLine className="mt-4" />
      <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <h2 className="max-w-3xl text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] font-medium"><SplitText text={title} /></h2>
        {aside}
      </div>
    </div>
  )
}

function Globe() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="globe-fill" cx="38%" cy="32%" r="75%"><stop offset="0" stopColor="#31455B" /><stop offset="1" stopColor="#0C1D30" /></radialGradient>
        <clipPath id="globe-clip"><circle cx="100" cy="100" r="78" /></clipPath>
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="#A98A4B" strokeWidth=".6" strokeDasharray="1 5" />
      <circle cx="100" cy="100" r="78" fill="url(#globe-fill)" />
      <g clipPath="url(#globe-clip)" fill="none" stroke="#C4A868" strokeWidth=".6">
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <ellipse key={k} cx="100" cy="100" rx="78" ry="78" opacity=".55">
            <animate attributeName="rx" values="78;0;78" dur="12s" begin={`${-k * 2}s`} repeatCount="indefinite" />
          </ellipse>
        ))}
        {[-52, -26, 0, 26, 52].map((y) => <ellipse key={y} cx="100" cy={100 + y} rx={Math.sqrt(78 * 78 - y * y)} ry={6 - Math.abs(y) / 14} opacity=".45" />)}
      </g>
      <circle cx="100" cy="100" r="78" fill="none" stroke="#C4A868" strokeWidth="1" />
      <g transform="translate(68 64) scale(1)" fill="#FBF8F1">
        <rect x="6" y="0" width="52" height="7" /><rect x="11" y="9" width="42" height="3" />
        {[15, 25, 35, 45].map((x) => <rect key={x} x={x} y="15" width="4" height="48" />)}
        <rect x="9" y="65" width="46" height="3" /><rect x="4" y="70" width="56" height="7" />
      </g>
    </svg>
  )
}

function Audiences({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => setActive((x) => (x + 1) % audiences.length), 4200)
    return () => clearInterval(id)
  }, [auto])
  const pick = (i: number) => { setAuto(false); setActive(i) }
  const a = audiences[active]
  const n = audiences.length
  const angle = (i: number) => (i / n) * 360 - 90
  return (
    <section className="relative overflow-hidden">
      <Contours className="absolute inset-0 h-full w-full" stroke="#132B45" opacity={0.05} />
      <div className="relative mx-auto max-w-[1320px] px-5 py-24 md:px-10">
        <SectionHead id="for" n="01" eyebrow="Who this is for" title="Seven readers. One question each. One next step." />

        <div className="mt-14 grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
          {/* Orbit */}
          <div className="orbit-wrap relative mx-auto hidden aspect-square w-full max-w-[620px] md:block">
            {/* static rings */}
            <div className="absolute inset-[6%] rounded-full border border-line" />
            <div className="absolute inset-[18%] rounded-full border border-dashed border-gold/40" />
            {/* globe */}
            <div className="absolute inset-[27%] transition-transform duration-700 hover:scale-[1.03]">
              <div className="absolute inset-0 rounded-full bg-gold-light/20 blur-2xl" />
              <Globe />
            </div>
            {/* rotating ring of doors */}
            <div className="orbit absolute inset-0">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
                {audiences.map((_, i) => {
                  const r = (angle(i) * Math.PI) / 180
                  const on = i === active
                  return <line key={i} x1={50 + Math.cos(r) * 24} y1={50 + Math.sin(r) * 24} x2={50 + Math.cos(r) * 39} y2={50 + Math.sin(r) * 39}
                    stroke={on ? '#A98A4B' : '#132B45'} strokeOpacity={on ? 1 : 0.12} strokeWidth={on ? 0.4 : 0.2} strokeDasharray={on ? 'none' : '0.6 0.8'} style={{ transition: 'all .6s' }} />
                })}
                <circle cx="50" cy="50" r="44" fill="none" stroke="#A98A4B" strokeWidth=".25"
                  strokeDasharray={`${(2 * Math.PI * 44) / n} ${2 * Math.PI * 44}`}
                  transform={`rotate(${angle(active) - 180 / n} 50 50)`} style={{ transition: 'transform .8s cubic-bezier(.2,.8,.2,1)' }} />
              </svg>
              {audiences.map((x, i) => {
                const r = (angle(i) * Math.PI) / 180
                const on = i === active
                return (
                  <div key={x.slug} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${50 + Math.cos(r) * 44}%`, top: `${50 + Math.sin(r) * 44}%` }}>
                    <div className="orbit-rev">
                      <button onClick={() => pick(i)} onMouseEnter={() => pick(i)} aria-pressed={on}
                        className={`group/b flex w-[8.5rem] flex-col items-center gap-2 text-center transition-all duration-500 ${on ? 'scale-110' : 'hover:scale-105'}`}>
                        <span className={`relative grid h-14 w-14 place-items-center rounded-full border font-display text-lg transition-all duration-500 ${on ? 'border-gold bg-navy text-gold-light shadow-[0_0_0_6px_rgba(196,168,104,.18)]' : 'border-navy/20 bg-ivory text-navy group-hover/b:border-navy'}`}>
                          {on && <span className="absolute inset-0 animate-ping rounded-full border border-gold/60" />}
                          0{i + 1}
                        </span>
                        <span className={`text-[0.78rem] leading-tight tracking-wide transition-colors ${on ? 'text-navy' : 'text-slate'}`}>{lang === 'ar' ? x.ar : x.label}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile chips */}
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:hidden">
            {audiences.map((x, i) => (
              <button key={x.slug} onClick={() => pick(i)} className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${i === active ? 'border-navy bg-navy text-ivory' : 'border-line'}`}>{lang === 'ar' ? x.ar : x.label}</button>
            ))}
          </div>

          {/* Detail */}
          <div key={a.slug} className="relative">
            <div className="flex items-center gap-4">
              <span className="font-display text-7xl leading-none text-gold">0{active + 1}</span>
              <span className="h-px flex-1 bg-line" />
              <span className="eyebrow text-slate">of 07</span>
            </div>
            <h3 className="mt-6 text-[clamp(2.2rem,4vw,3.6rem)] leading-[1] font-medium"><SplitText text={lang === 'ar' ? a.ar : a.label} /></h3>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-navy-2 animate-[fadeup_.8s_.2s_both]">{a.line}</p>
            <ul className="mt-8 space-y-3 border-s border-gold/50 ps-5">
              {a.q.map((q, k) => (
                <li key={q} className="text-sm text-slate" style={{ animation: `fadeup .7s ${0.3 + k * 0.1}s both` }}>
                  <span className="me-3 font-display text-gold">{k + 1}.</span>{q}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-6" style={{ animation: 'fadeup .7s .6s both' }}>
              <Magnetic href={`/hub/${a.slug}`} className="group bg-navy px-7 py-4 text-[0.75rem] font-medium tracking-[0.22em] text-ivory uppercase">
                {a.action}<span className="inline-block h-px w-6 bg-gold-light transition-all group-hover:w-10" />
              </Magnetic>
              <button onClick={() => pick((active + 1) % n)} className="eyebrow text-slate hover:text-navy">Next reader →</button>
            </div>
            {auto && <div className="mt-8 h-px w-full bg-line"><div key={active} className="h-full bg-gold" style={{ animation: 'grow 4.2s linear both' }} /></div>}
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-line bg-ivory">
      <div className="mx-auto max-w-[1320px] px-5 pt-20 pb-10 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Logo />
          <p className="max-w-sm font-display text-xl italic text-navy-2">Reshaping the ground on which economies stand.</p>
        </div>
        <GoldLine className="mt-10" />
        <div className="mt-12 grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">
          {Object.entries(footer).map(([h, ls]) => (
            <div key={h}>
              <p className="eyebrow text-gold">{h}</p>
              <ul className="mt-5 space-y-2.5 text-sm text-navy-2">
                {ls.map((l) => <li key={l}><a href="#" className="hover:text-navy hover:underline decoration-gold underline-offset-4">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-6 border-t border-line pt-8 text-xs text-slate md:grid-cols-4">
          <div><p className="eyebrow text-navy">Legal identity</p><p className="mt-2">TerraMorph Advisory LLC</p></div>
          <div><p className="eyebrow text-navy">Commercial reg.</p><p className="mt-2">CR No. 184 562 · Cairo</p></div>
          <div><p className="eyebrow text-navy">Tax ID</p><p className="mt-2">TIN 742-118-903</p></div>
          <div><p className="eyebrow text-navy">Registered address</p><p className="mt-2">New Cairo, Egypt</p></div>
        </div>
        <p className="eyebrow mt-10 text-slate">© 2026 TerraMorph · Leverage for good</p>
      </div>
    </footer>
  )
}

function Hub({ slug, lang }: { slug: string; lang: Lang }) {
  const a = audiences.find((x) => x.slug === slug) ?? audiences[0]
  useHead(`${a.label} — what to know first`, `${a.line} TerraMorph answers three questions for ${a.label.replace('For ', '').toLowerCase()}: ${a.q.join(' ')}`)
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <Contours className="absolute inset-0 h-full w-full" stroke="#132B45" opacity={0.06} />
        <div className="relative mx-auto max-w-[1320px] px-5 py-20 md:px-10">
          <p className="eyebrow text-slate"><a href="/" className="hover:text-navy">Home</a> › <span className="text-gold">{a.label}</span></p>
          <h1 className="mt-8 max-w-4xl text-[clamp(2.6rem,6vw,5rem)] leading-[1] font-medium"><SplitText text={lang === 'ar' ? a.ar : a.line} /></h1>
          <Reveal delay={500}><Magnetic className="mt-10 bg-navy px-7 py-4 text-[0.75rem] font-medium tracking-[0.22em] text-ivory uppercase">{a.action} <span>↓</span></Magnetic></Reveal>
        </div>
      </section>
      <section className="mx-auto max-w-[1320px] px-5 py-20 md:px-10">
        <SectionHead n="—" eyebrow="Your three questions, answered in order" title="What you need to know first." />
        <div className="mt-12 grid gap-px bg-line md:grid-cols-3">
          {a.q.map((q, i) => (
            <Reveal key={q} delay={i * 100} className="bg-ivory p-8">
              <span className="font-display text-6xl text-gold">{i + 1}</span>
              <h3 className="mt-6 text-2xl font-medium">{q}</h3>
              <p className="mt-3 text-sm text-slate">Answered with evidence from the ledger, filtered to {a.label.replace('For ', '').toLowerCase()} — no duplicate content, just a different lens.</p>
            </Reveal>
          ))}
        </div>
      </section>
      <Evidence />
    </>
  )
}

function HomeHead() {
  useHead('TerraMorph — Strategy, Policy & Transformation Advisory | Egypt', 'TerraMorph advises governments, institutions and social enterprises in Egypt and across borders on strategy, policy and transformation — with a dated, named assignment ledger behind every claim.')
  return null
}

export default function Site(props: Props) {
  const [intro, setIntro] = useState(() => !props.hub && !sessionStorage.getItem('tm-intro'))
  const [heroReady, setHeroReady] = useState(!intro)
  const lift = useCallback(() => setHeroReady(true), [])
  const done = useCallback(() => { sessionStorage.setItem('tm-intro', '1'); setIntro(false) }, [])
  return (
    <div dir={props.lang === 'ar' ? 'rtl' : 'ltr'}>
      {intro && <Intro onDone={done} onLift={lift} />}
      {!props.hub && <HomeHead />}
      <Header {...props} />
      <main id="main">
        {props.hub ? <Hub slug={props.hub} lang={props.lang} /> : (
          <>
            {!heroReady ? <div className="min-h-[calc(100svh-108px)]" /> : <Hero lang={props.lang} />}
            <Audiences lang={props.lang} />
            <WhatsNew />
            <Evidence />
            <CauseExhibition />
            <Knowledge />
            <Learning />
            <Join />
            <Conversation />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
