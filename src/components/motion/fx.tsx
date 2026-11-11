import {
  useEffect,
  useRef,
  useState,
  createElement,
  type ReactNode,
  type MouseEvent,
  type CSSProperties,
} from "react"

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/* One shared IntersectionObserver per distinct threshold instead of one per
   element. The homepage mounts hundreds of reveals, so a single observer per
   threshold keeps observer count constant and trims main-thread work. */
type SeenCallback = () => void
const observers = new Map<number, IntersectionObserver>()
const seenCallbacks = new WeakMap<Element, SeenCallback>()

function observeOnce(el: Element, threshold: number, cb: SeenCallback) {
  let io = observers.get(threshold)
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const fn = seenCallbacks.get(entry.target)
          if (!fn) continue
          seenCallbacks.delete(entry.target)
          io!.unobserve(entry.target)
          fn()
        }
      },
      { threshold },
    )
    observers.set(threshold, io)
  }
  seenCallbacks.set(el, cb)
  io.observe(el)
  return () => {
    seenCallbacks.delete(el)
    io?.unobserve(el)
  }
}

export function useInView<T extends Element>(threshold = 0.2, enabled = true) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return
    /* Reduced-motion users must still be "seen": consumers gate content and
       counters on `seen`, so bailing out here left CountUp stuck at 0 and
       GoldLine invisible forever for anyone with the preference set. */
    if (reduced()) {
      setSeen(true)
      return
    }
    return observeOnce(el, threshold, () => setSeen(true))
  }, [threshold, enabled])
  return [ref, seen] as const
}

/* Word-by-word rise, masked — after ReactBits SplitText */
export function SplitText({
  text,
  className = "",
  delay = 0,
  immediate = false,
}: {
  text: string
  className?: string
  delay?: number
  immediate?: boolean
}) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.1, !immediate)
  /* `immediate` renders the final state in the prerendered HTML so
     above-the-fold text (the LCP candidate) is painted without waiting for
     hydration + IntersectionObserver. */
  const settle = immediate || seen || reduced()
  /* Arabic is connected script — per-word overflow masks clip glyphs and the
     `&nbsp;` padding breaks joining. Fade the whole line instead. */
  if (/[\u0600-\u06FF]/.test(text)) {
    return (
      <span ref={ref} className={className} role="img" aria-label={text}>
        <span
          className="inline-block transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{
            transform: settle ? "none" : "translateY(16px)",
            opacity: settle ? 1 : 0,
            transitionDelay: `${delay}ms`,
          }}
        >
          {text}
        </span>
      </span>
    )
  }
  return (
    <span ref={ref} className={className} role="img" aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden align-bottom pb-[0.08em]"
        >
          <span
            className="inline-block transition-[transform,opacity] duration-[1100ms] ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{
              transform: settle ? "none" : "translateY(105%)",
              opacity: settle ? 1 : 0,
              transitionDelay: `${delay + i * 55}ms`,
              willChange: settle ? "auto" : "transform, opacity",
            }}
          >
            {w}&nbsp;
          </span>
        </span>
      ))}
    </span>
  )
}

export function Reveal({
  as = "div",
  children,
  className = "",
  delay = 0,
  immediate = false,
}: {
  as?: "div" | "li"
  children: ReactNode
  className?: string
  delay?: number
  immediate?: boolean
}) {
  const [ref, seen] = useInView<HTMLElement>(0.12, !immediate)
  const settle = immediate || seen || reduced()
  return createElement(
    as,
    {
      ref,
      className: `transition-[transform,opacity] duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] ${className}`,
      style: {
        transform: settle ? "none" : "translateY(28px)",
        opacity: settle ? 1 : 0,
        transitionDelay: `${delay}ms`,
        willChange: settle ? "auto" : "transform, opacity",
      } as CSSProperties,
    },
    children,
  )
}

export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  prefix = "",
}: {
  to: number
  decimals?: number
  suffix?: string
  prefix?: string
}) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.4)
  /* Start at the true value, not 0: the prerendered HTML (and the first client
     paint) must show the real figure so a slow connection, a failed script or a
     reduced-motion preference never leaves a credibility counter reading "0".
     When motion is allowed the first requestAnimationFrame tick — which runs
     before the browser paints — resets it and eases back up.

     The value is written straight to the DOM node rather than through state:
     setState here re-rendered a React component on every frame for 1.8s, and
     the hero runs four of these at once. */
  const fmt = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`
  useEffect(() => {
    const el = ref.current
    if (!seen || !el) return
    if (reduced()) {
      el.textContent = fmt(to)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1800)
      el.textContent = fmt(to * (1 - Math.pow(1 - p, 4)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to, decimals, prefix, suffix])
  return (
    <span ref={ref} className="tabular-nums">
      {fmt(to)}
    </span>
  )
}

/* Cursor-following radial light — after ReactBits SpotlightCard.
   The handler is rAF-throttled and skipped outright for reduced-motion users:
   a raw mousemove does a getBoundingClientRect (layout read) plus two style
   writes, and on a card grid that fires for every pixel the cursor travels. */
export function Spotlight({
  children,
  className = "",
  color = "rgba(196,168,104,0.18)",
}: {
  children: ReactNode
  className?: string
  color?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  const move = (e: MouseEvent) => {
    if (reduced() || raf.current) return
    const x = e.clientX
    const y = e.clientY
    raf.current = requestAnimationFrame(() => {
      raf.current = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty("--x", `${x - r.left}px`)
      el.style.setProperty("--y", `${y - r.top}px`)
    })
  }
  return (
    <div
      ref={ref}
      onMouseMove={move}
      className={`group relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={
          {
            background: `radial-gradient(420px circle at var(--x) var(--y), ${color}, transparent 60%)`,
          } as CSSProperties
        }
      />
      <div className="relative">{children}</div>
    </div>
  )
}

export function Magnetic({
  children,
  className = "",
  onClick,
  href,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  href?: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const raf = useRef(0)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  const move = (e: MouseEvent) => {
    if (reduced() || raf.current) return
    const x = e.clientX
    const y = e.clientY
    raf.current = requestAnimationFrame(() => {
      raf.current = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.transform = `translate(${(x - r.left - r.width / 2) * 0.25}px, ${(y - r.top - r.height / 2) * 0.35}px)`
    })
  }
  const leave = () => {
    ref.current!.style.transform = ""
  }
  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={move}
      onMouseLeave={leave}
      className={`inline-flex items-center gap-3 transition-transform duration-300 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${className}`}
    >
      {children}
    </a>
  )
}

export function GoldLine({ className = "" }: { className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.5)
  return (
    <div
      ref={ref}
      className={`gold-rule origin-left transition-transform duration-[1600ms] ease-[cubic-bezier(.6,0,.2,1)] ${className}`}
      style={{ transform: seen ? "scaleX(1)" : "scaleX(0)" }}
    />
  )
}

/* Scrambles characters before settling — used for eyebrows */
export function Decrypt({
  text,
  className = "",
}: {
  text: string
  className?: string
}) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.6)
  /* Scrambles straight into the DOM node: going through setState re-rendered
     the component 33×/s for the length of the effect. */
  useEffect(() => {
    const el = ref.current
    if (!seen || !el || reduced()) return
    const chars = "ΣΔΛΞΠΦΨΩ01·/—"
    let f = 0
    const id = setInterval(() => {
      f++
      el.textContent = text
        .split("")
        .map((c, i) =>
          c === " " || i < f / 1.5
            ? c
            : chars[Math.floor(Math.random() * chars.length)],
        )
        .join("")
      if (f / 1.5 > text.length) clearInterval(id)
    }, 30)
    return () => clearInterval(id)
  }, [seen, text])
  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}

/* Topographic contour field — terra being reshaped */
export function Contours({
  className = "",
  stroke = "#C4A868",
  opacity = 0.18,
}: {
  className?: string
  stroke?: string
  opacity?: number
}) {
  const paths = Array.from({ length: 22 }, (_, i) => {
    const r = 40 + i * 34
    const wob = 18 + i * 1.4
    return `M ${600 - r} 400 C ${600 - r} ${400 - r - wob}, ${600 + r + wob} ${400 - r}, ${600 + r} 400 S ${600 - r - wob} ${400 + r + wob}, ${600 - r} 400 Z`
  })
  return (
    <svg
      className={`pointer-events-none ${className}`}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g
        className="contour-bg"
        fill="none"
        stroke={stroke}
        strokeWidth="0.8"
        opacity={opacity}
      >
        {paths.map((d, i) => (
          <path key={i} d={d} transform={`rotate(${i * 7} 600 400)`} />
        ))}
      </g>
    </svg>
  )
}

export function Emblem({
  className = "",
  tone = "navy",
}: {
  className?: string
  tone?: "navy" | "ivory"
}) {
  const main = tone === "navy" ? "#132B45" : "#FBF8F1"
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke={main}
        strokeWidth="1.5"
      />
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke="#A98A4B"
        strokeWidth="0.75"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="12"
        ry="26"
        fill="none"
        stroke="#A98A4B"
        strokeWidth="0.5"
        opacity=".7"
      />
      <line
        x1="6"
        y1="32"
        x2="58"
        y2="32"
        stroke="#A98A4B"
        strokeWidth="0.5"
        opacity=".7"
      />
      <rect x="22" y="16" width="20" height="3" fill={main} />
      <rect x="24" y="19.5" width="16" height="1.5" fill={main} />
      {[25.5, 29.5, 33.5, 37.5].map((x) => (
        <rect key={x} x={x} y="22" width="1.6" height="22" fill={main} />
      ))}
      <rect x="23" y="44.5" width="18" height="1.5" fill={main} />
      <rect x="21" y="46.5" width="22" height="3" fill={main} />
    </svg>
  )
}

export function Logo({
  tone = "navy",
  className = "",
  wordmark = "sm",
}: {
  tone?: "navy" | "ivory"
  className?: string
  /** "sm" hides the wordmark on phones (footer, 404); "always" keeps it visible. */
  wordmark?: "sm" | "always"
}) {
  const always = wordmark === "always"
  return (
    <span className={`inline-flex items-center gap-2 sm:gap-3 ${className}`}>
      <Emblem className="h-9 w-9 shrink-0" tone={tone} />
      {/* The wordmark is visually hidden below `sm` so the header reflows at
          320px (WCAG 1.4.10) but still names the logo link for screen readers;
          the emblem alone stays as the brand mark. The header opts into
          `wordmark="always"` and uses a tighter mobile size that still fits. */}
      <span
        className={
          always
            ? "block min-w-0 leading-none"
            : "sr-only leading-none sm:not-sr-only sm:block"
        }
      >
        <span
          className={`block whitespace-nowrap font-display font-semibold ${
            always
              ? "text-lg tracking-[0.12em] sm:text-xl sm:tracking-cta"
              : "text-xl tracking-cta"
          } ${tone === "navy" ? "text-navy" : "text-ivory"}`}
        >
          TERRAMORPH
        </span>
        {/* The header opts into `wordmark="always"`, so the tagline has to fit
            the ~150px column left beside the controls at 320px. Tighter tracking
            below `sm` keeps it on one line without truncating the phrase. */}
        <span
          className={`mt-1 block text-micro font-medium ${
            always ? "tracking-[0.14em] sm:tracking-[0.42em]" : "tracking-[0.42em]"
          } ${tone === "navy" ? "text-gold-strong" : "text-gold-light"}`}
        >
          LEVERAGE FOR GOOD
        </span>
      </span>
    </span>
  )
}
