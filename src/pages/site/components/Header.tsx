import { useEffect, useMemo, useState } from 'react'
import { audiences } from '@/content/data'
import { Logo } from '@/components/motion/fx'
import { SearchOverlay } from '@/pages/site/home'
import type { Lang } from '../types'

const nav = [
  { id: 'evidence', path: '/evidence', en: 'Evidence', ar: 'الأدلة' },
  { id: 'cause', path: '/method', en: 'Method', ar: 'المنهج' },
  { id: 'knowledge', path: '/knowledge', en: 'Knowledge', ar: 'المعرفة' },
  { id: 'learning', path: '/learning', en: 'Learning', ar: 'التعلّم' },
  { id: 'about', path: '/about', en: 'About', ar: 'من نحن' },
  { id: 'join-board', path: '/join', en: 'Join', ar: 'انضم' },
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

function Header({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
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
      {/* Constant-height header: nothing here animates layout on scroll, so there
          is no stutter. The audience rail stays visible; only the drop shadow and
          background finish fade in via opacity (compositor-friendly). */}
      <header className="sticky top-0 z-50 bg-navy-3/85 text-ivory backdrop-blur-xl">
        <div aria-hidden className={`pointer-events-none absolute inset-0 shadow-[0_10px_40px_-20px_rgba(0,0,0,.6)] transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
        <div className="mx-auto flex max-w-[1320px] items-center gap-6 px-5 py-4 md:px-10">
          <a href="/" className="shrink-0"><Logo tone="ivory" /></a>
          <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
            {nav.map((n) => {
              const on = active === n.id
              return (
                <a key={n.id} href={n.path} aria-current={on ? 'true' : undefined}
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
            <a href="/contact" className="hidden bg-gold-light px-5 py-2.5 text-[0.72rem] font-medium tracking-[0.2em] text-navy uppercase transition hover:bg-ivory xl:block">{ar ? 'تواصل' : 'Contact'}</a>
            <button className="grid h-9 w-9 place-items-center lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
              <span className="relative block h-3 w-6">
                <span className={`absolute inset-x-0 top-0 h-px bg-ivory transition duration-300 ${open ? 'top-1.5 rotate-45' : ''}`} />
                <span className={`absolute inset-x-0 bottom-0 h-px bg-ivory transition duration-300 ${open ? 'bottom-1.5 -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>
        {/* Audience rail — the second row that never collapses, so the header height stays fixed */}
        <div className="border-t border-ivory/10">
          <div className="no-scrollbar mx-auto flex max-w-[1320px] items-center gap-1 overflow-x-auto px-5 md:px-10">
            <span className="eyebrow shrink-0 py-2.5 pe-3 text-gold-light">{ar ? 'أنا…' : 'I am'}</span>
            {audiences.map((a) => (
              <a key={a.slug} href={`/hub/${a.slug}`} className="shrink-0 rounded-full px-3 py-1.5 text-[0.78rem] text-ivory/60 transition hover:bg-ivory/10 hover:text-ivory">
                {ar ? a.ar : a.label}
              </a>
            ))}
            <a href="/dashboard" className="ms-auto shrink-0 ps-4 text-[0.72rem] tracking-[0.16em] text-ivory/65 uppercase hover:text-gold-light">{ar ? 'بوابة العملاء' : 'Client portal'} ↗</a>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 bg-navy-3 pt-24 text-ivory transition-[clip-path] duration-700 ease-[cubic-bezier(.76,0,.24,1)] lg:hidden ${open ? '[clip-path:inset(0)]' : 'pointer-events-none [clip-path:inset(0_0_100%_0)]'}`}>
        <nav className="flex h-full flex-col overflow-y-auto px-6 pb-10">
          {nav.map((n, i) => (
            <a key={n.id} href={n.path} onClick={() => setOpen(false)}
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
            <a href="/contact" onClick={() => setOpen(false)} className="bg-gold-light px-5 py-3 text-xs tracking-[0.2em] text-navy uppercase">{ar ? 'تواصل' : 'Contact'}</a>
          </div>
        </nav>
      </div>
      {search && <SearchOverlay onClose={() => setSearch(false)} />}
    </>
  )
}

export { Header }