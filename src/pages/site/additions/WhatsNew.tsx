import { useEffect, useRef, useState } from 'react'
import { SplitText } from '@/components/motion/fx'
import { Dialog } from '@/components/ui'
import { img } from './shared'

/* ——— What's new: swipeable picture banner → description, likes, four actions ——— */
const news = [
  { id: 'photo-1737816149139-ccdb2ce50715', tag: 'Initiative', title: 'Main Street Assiut — a living market pilot', body: 'We are reshaping one street into a working model of local economic development: vendors, municipality and residents designing the place together over twelve weeks.', date: 'Oct 2026', likes: 128 },
  { id: 'photo-1699197671498-ab6931ccce96', tag: 'TerraMorph Learning', title: 'Train-the-trainer cohort 04 opens', body: 'Twenty seats for practitioners who want to carry the G0–G7 method into their own institutions. Certification on completion.', date: 'Nov 2026', likes: 86 },
  { id: 'photo-1731024677293-2ca0c03bbf13', tag: 'Research', title: 'Heritage as an economic asset — field study', body: 'A six-month study on how heritage sites can anchor local jobs without displacing the people who live beside them.', date: 'Sep 2026', likes: 204 },
  { id: 'photo-1709234052084-750ab82a0f26', tag: 'Tender', title: 'Urban mobility diagnostic — expressions of interest', body: 'We are teaming for a regional urban mobility diagnostic and seeking transport economists and GIS specialists.', date: 'Closes 30 Oct', likes: 41 },
]

export function WhatsNew() {
  const [i, setI] = useState(0)
  const [open, setOpen] = useState<number | null>(null)
  const [liked, setLiked] = useState<Record<number, boolean>>({})
  const [toast, setToast] = useState('')
  const startX = useRef<number | null>(null)
  useEffect(() => {
    if (open !== null) return
    const t = setInterval(() => setI((x) => (x + 1) % news.length), 6000)
    return () => clearInterval(t)
  }, [open])
  const go = (d: number) => setI((x) => (x + d + news.length) % news.length)
  const act = (a: string) => { setToast(a); setTimeout(() => setToast(''), 2200) }
  const n = open !== null ? news[open] : null
  return (
    <section id="new" className="mx-auto max-w-[1320px] scroll-mt-40 px-5 py-24 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-gold-strong">What's new — what we're up to</p>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.4rem)] leading-none font-medium"><SplitText text="A whole lot is happening." /></h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => go(-1)} aria-label="Previous" className="grid h-12 w-12 place-items-center border border-line transition hover:border-navy hover:bg-navy hover:text-ivory">←</button>
          <button onClick={() => go(1)} aria-label="Next" className="grid h-12 w-12 place-items-center border border-line transition hover:border-navy hover:bg-navy hover:text-ivory">→</button>
        </div>
      </div>
      <div className="relative mt-10 h-[min(70vh,560px)] touch-pan-y overflow-hidden bg-navy select-none"
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => { if (startX.current === null) return; const dx = e.clientX - startX.current; startX.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1) }}>
        {news.map((s, k) => (
          <button key={s.id} onClick={() => setOpen(k)} aria-hidden={k !== i} tabIndex={k === i ? 0 : -1}
            className="absolute inset-0 text-start transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{ opacity: k === i ? 1 : 0, transform: k === i ? 'scale(1)' : 'scale(1.06)' }}>
            <img src={img(s.id)} alt={s.title} draggable={false} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-3 via-navy/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-ivory md:p-12">
              <p className="eyebrow text-gold-light">{s.tag} · {s.date}</p>
              <h3 className="mt-4 max-w-3xl text-[clamp(1.8rem,4vw,3.6rem)] leading-[1.02] font-medium">{s.title}</h3>
              <span className="eyebrow mt-6 inline-block border-b border-gold-light pb-1">Open the story →</span>
            </div>
          </button>
        ))}
        <div className="absolute top-6 end-6 flex gap-2">
          {news.map((_, k) => (
            <span key={k} className="h-0.5 w-10 overflow-hidden bg-ivory/25">
              <span className="block h-full bg-gold-light" style={{ width: k === i ? '100%' : k < i ? '100%' : '0%', transition: k === i && open === null ? 'width 6s linear' : 'none' }} />
            </span>
          ))}
        </div>
      </div>

      {n && open !== null && (
        <Dialog open onClose={() => setOpen(null)} onBackdropClick={() => setOpen(null)} labelledBy={`whatsnew-title-${open}`} className="flex justify-end bg-navy-3/60 backdrop-blur-sm">
          <aside onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-ivory animate-[slidein_.5s_cubic-bezier(.2,.8,.2,1)]">
            <div className="relative h-72 shrink-0 bg-navy">
              <img src={img(n.id, 900)} alt={n.title} className="h-full w-full object-cover" />
              <button onClick={() => setOpen(null)} aria-label="Close" className="absolute top-4 end-4 grid h-10 w-10 place-items-center bg-ivory text-navy">✕</button>
            </div>
            <div className="flex flex-1 flex-col p-8">
              <p className="eyebrow text-gold-strong">{n.tag} · {n.date}</p>
              <h3 id={`whatsnew-title-${open}`} className="mt-4 text-4xl leading-tight font-medium">{n.title}</h3>
              <p className="mt-5 text-lg leading-relaxed text-navy-2">{n.body}</p>
              <button onClick={() => setLiked({ ...liked, [open]: !liked[open] })} aria-pressed={!!liked[open]}
                className={`mt-8 inline-flex w-max items-center gap-3 border px-4 py-2 transition ${liked[open] ? 'border-gold bg-gold/10 text-navy' : 'border-line hover:border-navy'}`}>
                <span className={`transition-transform ${liked[open] ? 'scale-125 text-gold-strong' : ''}`}>{liked[open] ? '♥' : '♡'}</span>
                <span className="tabular-nums">{n.likes + (liked[open] ? 1 : 0)}</span> people like this
              </button>
              <div className="mt-auto grid grid-cols-2 gap-px bg-line pt-px">
                {[['Suggest', 'Your suggestion has been noted'], ['Join the cause', 'Welcome — you have joined the cause'], ['Reserve a seat', 'Seat reserved — check your inbox'], ['Pay / contribute', 'Opening secure payment link…']].map(([a, msg], k) => (
                  <button key={a} onClick={() => act(msg)} className={`p-5 text-start transition ${k === 1 ? 'bg-navy text-ivory hover:bg-navy-2' : 'bg-ivory hover:bg-ivory-2'}`}>
                    <span className={`eyebrow block ${k === 1 ? 'text-gold-light' : 'text-gold-strong'}`}>0{k + 1}</span>
                    <span className="mt-2 block font-display text-xl">{a}</span>
                  </button>
                ))}
              </div>
              {toast && <p role="status" className="eyebrow mt-4 text-ok">✓ {toast}</p>}
            </div>
          </aside>
        </Dialog>
      )}
    </section>
  )
}