import { useEffect, useState } from 'react'

/* Intro: the emblem is constructed — ring, meridians, columns rise one by one,
   wordmark resolves, then the navy ground lifts away like a lever releasing. */
export default function Intro({ onDone, onLift }: { onDone: () => void; onLift: () => void }) {
  const [phase, setPhase] = useState<'draw' | 'word' | 'lift'>('draw')
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { onLift(); onDone(); return }
    document.body.style.overflow = 'hidden'
    const t = [setTimeout(() => setPhase('word'), 1500), setTimeout(() => { setPhase('lift'); onLift() }, 2900), setTimeout(onDone, 3900)]
    return () => { t.forEach(clearTimeout); document.body.style.overflow = '' }
  }, [onDone, onLift])
  const skip = () => { setPhase('lift'); onLift(); setTimeout(onDone, 900) }

  return (
    <div role="presentation" onClick={skip}
      className={`fixed inset-0 z-[100] grid cursor-pointer place-items-center bg-navy-3 text-ivory transition-[clip-path] duration-[900ms] ease-[cubic-bezier(.76,0,.24,1)] ${phase === 'lift' ? '[clip-path:inset(0_0_100%_0)]' : '[clip-path:inset(0_0_0_0)]'}`}>
      <div className="absolute inset-x-0 top-1/2 h-px origin-left bg-gold-light/30" style={{ animation: 'grow 1.4s cubic-bezier(.2,.8,.2,1) both' }} />
      <div className={`relative flex flex-col items-center transition-transform duration-[900ms] ease-[cubic-bezier(.76,0,.24,1)] ${phase === 'lift' ? '-translate-y-24 opacity-0' : ''}`} style={{ transitionProperty: 'transform, opacity' }}>
        <svg viewBox="0 0 64 64" className="h-32 w-32 md:h-40 md:w-40" aria-hidden>
          <circle cx="32" cy="32" r="30" fill="none" stroke="#FBF8F1" strokeWidth="1" className="intro-draw" style={{ animationDelay: '0s' }} pathLength={1} />
          <circle cx="32" cy="32" r="26" fill="none" stroke="#C4A868" strokeWidth=".6" className="intro-draw" style={{ animationDelay: '.25s' }} pathLength={1} />
          {[0, 1, 2].map((i) => <ellipse key={i} cx="32" cy="32" rx="12" ry="26" fill="none" stroke="#C4A868" strokeWidth=".4" className="meridian" style={{ animationDelay: `${-i * 1.3}s`, opacity: 0.7 }} />)}
          <line x1="6" y1="32" x2="58" y2="32" stroke="#C4A868" strokeWidth=".4" className="intro-draw" style={{ animationDelay: '.5s' }} pathLength={1} />
          <g className="intro-rise" style={{ animationDelay: '.7s' }}><rect x="22" y="16" width="20" height="3" fill="#FBF8F1" /><rect x="24" y="19.5" width="16" height="1.5" fill="#FBF8F1" /></g>
          {[25.5, 29.5, 33.5, 37.5].map((x, i) => <rect key={x} x={x} y="22" width="1.6" height="22" fill="#FBF8F1" className="intro-col" style={{ animationDelay: `${0.85 + i * 0.1}s` }} />)}
          <g className="intro-rise" style={{ animationDelay: '.75s' }}><rect x="23" y="44.5" width="18" height="1.5" fill="#FBF8F1" /><rect x="21" y="46.5" width="22" height="3" fill="#FBF8F1" /></g>
        </svg>
        <p className="mt-8 flex overflow-hidden font-display text-3xl font-semibold tracking-[0.3em] md:text-5xl" aria-label="TerraMorph">
          {'TERRAMORPH'.split('').map((c, i) => (
            <span key={i} className="inline-block transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
              style={{ transitionDelay: `${i * 45}ms`, transform: phase === 'draw' ? 'translateY(110%)' : 'none', opacity: phase === 'draw' ? 0 : 1, filter: phase === 'draw' ? 'blur(6px)' : 'none' }}>{c}</span>
          ))}
        </p>
        <p className={`mt-4 text-[0.65rem] font-medium tracking-[0.6em] text-gold-light transition-all delay-500 duration-700 ${phase === 'draw' ? 'tracking-[1.2em] opacity-0' : ''}`}>LEVERAGE FOR GOOD</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); skip() }} className="eyebrow absolute right-6 bottom-6 text-ivory/40 transition hover:text-ivory">Skip intro</button>
    </div>
  )
}
