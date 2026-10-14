import { useEffect, useRef, useState, createElement, type ReactNode, type MouseEvent, type CSSProperties } from 'react'

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen] as const
}

/* Word-by-word rise, masked — after ReactBits SplitText */
export function SplitText({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.1)
  const settle = seen || reduced()
  /* Arabic is connected script — per-word overflow masks clip glyphs and the
     `&nbsp;` padding breaks joining. Fade the whole line instead. */
  if (/[\u0600-\u06FF]/.test(text)) {
    return (
      <span ref={ref} className={className} role="img" aria-label={text}>
        <span
          className="inline-block transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ transform: settle ? 'none' : 'translateY(16px)', opacity: settle ? 1 : 0, transitionDelay: `${delay}ms` }}
        >
          {text}
        </span>
      </span>
    )
  }
  return (
    <span ref={ref} className={className} role="img" aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom pb-[0.08em]">
          <span
            className="inline-block transition-[transform,opacity] duration-[1100ms] ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{ transform: settle ? 'none' : 'translateY(105%)', opacity: settle ? 1 : 0, transitionDelay: `${delay + i * 55}ms` }}
          >
            {w}&nbsp;
          </span>
        </span>
      ))}
    </span>
  )
}

export function Reveal({ as = 'div', children, className = '', delay = 0 }: { as?: 'div' | 'li'; children: ReactNode; className?: string; delay?: number }) {
  const [ref, seen] = useInView<HTMLElement>(0.12)
  const settle = seen || reduced()
  return createElement(
    as,
    {
      ref,
      className: `transition-[transform,opacity,filter] duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] ${className}`,
      style: { transform: settle ? 'none' : 'translateY(28px)', opacity: settle ? 1 : 0, filter: settle ? 'none' : 'blur(6px)', transitionDelay: `${delay}ms` } as CSSProperties,
    },
    children,
  )
}

export function CountUp({ to, decimals = 0, suffix = '', prefix = '' }: { to: number; decimals?: number; suffix?: string; prefix?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.4)
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!seen) return
    if (reduced()) return setV(to)
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1800)
      setV(to * (1 - Math.pow(1 - p, 4)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to])
  return <span ref={ref} className="tabular-nums">{prefix}{v.toFixed(decimals)}{suffix}</span>
}

/* Cursor-following radial light — after ReactBits SpotlightCard */
export function Spotlight({ children, className = '', color = 'rgba(196,168,104,0.18)' }: { children: ReactNode; className?: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    ref.current!.style.setProperty('--x', `${e.clientX - r.left}px`)
    ref.current!.style.setProperty('--y', `${e.clientY - r.top}px`)
  }
  return (
    <div ref={ref} onMouseMove={move} className={`group relative overflow-hidden ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(420px circle at var(--x) var(--y), ${color}, transparent 60%)` } as CSSProperties}
      />
      <div className="relative">{children}</div>
    </div>
  )
}

export function Magnetic({ children, className = '', onClick, href }: { children: ReactNode; className?: string; onClick?: () => void; href?: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const move = (e: MouseEvent) => {
    if (reduced()) return
    const r = ref.current!.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * 0.25
    const y = (e.clientY - r.top - r.height / 2) * 0.35
    ref.current!.style.transform = `translate(${x}px, ${y}px)`
  }
  const leave = () => { ref.current!.style.transform = '' }
  return (
    <a ref={ref} href={href} onClick={onClick} onMouseMove={move} onMouseLeave={leave}
      className={`inline-flex items-center gap-3 transition-transform duration-300 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${className}`}>
      {children}
    </a>
  )
}

export function GoldLine({ className = '' }: { className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.5)
  return (
    <div ref={ref} className={`gold-rule origin-left transition-transform duration-[1600ms] ease-[cubic-bezier(.6,0,.2,1)] ${className}`}
      style={{ transform: seen ? 'scaleX(1)' : 'scaleX(0)' }} />
  )
}

/* Scrambles characters before settling — used for eyebrows */
export function Decrypt({ text, className = '' }: { text: string; className?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.6)
  const [out, setOut] = useState(text)
  useEffect(() => {
    if (!seen || reduced()) return
    const chars = 'ΣΔΛΞΠΦΨΩ01·/—'
    let f = 0
    const id = setInterval(() => {
      f++
      setOut(text.split('').map((c, i) => (c === ' ' || i < f / 1.5 ? c : chars[Math.floor(Math.random() * chars.length)])).join(''))
      if (f / 1.5 > text.length) clearInterval(id)
    }, 30)
    return () => clearInterval(id)
  }, [seen, text])
  return <span ref={ref} className={className}>{out}</span>
}

/* Topographic contour field — terra being reshaped */
export function Contours({ className = '', stroke = '#C4A868', opacity = 0.18 }: { className?: string; stroke?: string; opacity?: number }) {
  const paths = Array.from({ length: 22 }, (_, i) => {
    const r = 40 + i * 34
    const wob = 18 + i * 1.4
    return `M ${600 - r} 400 C ${600 - r} ${400 - r - wob}, ${600 + r + wob} ${400 - r}, ${600 + r} 400 S ${600 - r - wob} ${400 + r + wob}, ${600 - r} 400 Z`
  })
  return (
    <svg className={`pointer-events-none ${className}`} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g className="contour-bg" fill="none" stroke={stroke} strokeWidth="0.8" opacity={opacity}>
        {paths.map((d, i) => <path key={i} d={d} transform={`rotate(${i * 7} 600 400)`} />)}
      </g>
    </svg>
  )
}

export function Emblem({ className = '', tone = 'navy' }: { className?: string; tone?: 'navy' | 'ivory' }) {
  const main = tone === 'navy' ? '#132B45' : '#FBF8F1'
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="30" fill="none" stroke={main} strokeWidth="1.5" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="#A98A4B" strokeWidth="0.75" />
      <ellipse cx="32" cy="32" rx="12" ry="26" fill="none" stroke="#A98A4B" strokeWidth="0.5" opacity=".7" />
      <line x1="6" y1="32" x2="58" y2="32" stroke="#A98A4B" strokeWidth="0.5" opacity=".7" />
      <rect x="22" y="16" width="20" height="3" fill={main} />
      <rect x="24" y="19.5" width="16" height="1.5" fill={main} />
      {[25.5, 29.5, 33.5, 37.5].map((x) => <rect key={x} x={x} y="22" width="1.6" height="22" fill={main} />)}
      <rect x="23" y="44.5" width="18" height="1.5" fill={main} />
      <rect x="21" y="46.5" width="22" height="3" fill={main} />
    </svg>
  )
}

export function Logo({ tone = 'navy', className = '' }: { tone?: 'navy' | 'ivory'; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Emblem className="h-9 w-9 shrink-0" tone={tone} />
      <span className="leading-none">
        <span className={`block font-display text-xl font-semibold tracking-[0.22em] ${tone === 'navy' ? 'text-navy' : 'text-ivory'}`}>TERRAMORPH</span>
        <span className={`mt-1 block text-[0.55rem] font-medium tracking-[0.42em] ${tone === 'navy' ? 'text-gold-strong' : 'text-gold-light'}`}>LEVERAGE FOR GOOD</span>
      </span>
    </span>
  )
}
