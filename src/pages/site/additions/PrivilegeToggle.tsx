import { useEffect, useRef, useState } from 'react'
import { SplitText } from '@/components/motion/fx'
import { Badge, LiveStatus } from '@/components/ui'
import { useMetrics } from '@/hooks/useMetrics'

/* ——— Access tiers: hold/arm → impact preview → 3s undo ——— */
const levels = ['Viewer', 'Editor', 'Admin'] as const
type Level = (typeof levels)[number]

const Tier: Record<Level, { blurb: string; tone: 'neutral' | 'ok' | 'gold'; can: string[]; cannot: string[] }> = {
  Viewer: {
    blurb: 'Read-only — dashboards, reports, roster.',
    tone: 'neutral',
    can: ['Read assignments and live metrics', 'Download published reports', 'Browse the expert roster'],
    cannot: ['Edit assignments or statuses', 'Change access for other users', 'Approve vendor payments'],
  },
  Editor: {
    blurb: 'Operates assignments, stages and roster.',
    tone: 'ok',
    can: ['Edit assignments, gates and statuses', 'Manage the expert roster', 'Comment on the activity feed'],
    cannot: ['Change user privileges', 'Invite or remove tenants', 'Run migrations / schema DDL'],
  },
  Admin: {
    blurb: 'Full tenant control — still least-privilege.',
    tone: 'gold',
    can: ['Everything Editors can', 'Change user privileges', 'Invite and remove tenant workspaces'],
    cannot: ['Runtime role is least-privilege — no DDL, no CREATEDB'],
  },
}

export function PrivilegeToggle() {
  const [level, setLevel] = useState<Level>('Viewer')
  const [armed, setArmed] = useState<Level | null>(null)
  const [undoActive, setUndoActive] = useState(false)
  const [undoKey, setUndoKey] = useState(0)
  const [announce, setAnnounce] = useState('')
  const commitTimer = useRef<number | null>(null)
  const undoTimeout = useRef<number | null>(null)
  const prevLevel = useRef<Level>('Viewer')
  const held = useRef(false)
  const armedRef = useRef<Level | null>(null)
  const m = useMetrics()

  const notify = (m: string) => { setAnnounce(m); window.setTimeout(() => setAnnounce(''), 3000) }
  const clearArm = () => { if (commitTimer.current !== null) { clearTimeout(commitTimer.current); commitTimer.current = null } }

  const commit = (l: Level) => {
    clearArm()
    armedRef.current = null
    setArmed(null)
    held.current = false
    prevLevel.current = level
    m.bump('priv.commits')
    if (import.meta.env.DEV) console.debug(`[tm] privilege commit: ${l}`)
    setUndoKey((k) => k + 1)
    setUndoActive(true)
    setLevel(l)
    notify(`Access set to ${l} — undo available for 3 seconds`)
    if (undoTimeout.current !== null) clearTimeout(undoTimeout.current)
    undoTimeout.current = window.setTimeout(() => { setUndoActive(false); notify(`Access change to ${l} is locked in`) }, 3000)
  }

  const beginArm = (l: Level, hold: boolean) => {
    if (level === l) { armedRef.current = null; setArmed(null); return }
    if (armedRef.current === l) { commit(l); return }
    clearArm()
    held.current = hold
    armedRef.current = l
    setArmed(l)
    commitTimer.current = window.setTimeout(() => commit(l), 600)
  }

  const doCancel = () => {
    const wasArming = armedRef.current !== null
    if (!wasArming) return
    clearArm()
    armedRef.current = null
    setArmed(null)
    held.current = false
    m.bump('priv.cancels')
    if (import.meta.env.DEV) console.debug('[tm] privilege arm cancelled before commit')
  }
  const release = () => { if (held.current) doCancel() }

  const undo = () => {
    if (undoTimeout.current !== null) clearTimeout(undoTimeout.current)
    m.bump('priv.undos')
    if (import.meta.env.DEV) console.debug(`[tm] privilege undo back to ${prevLevel.current}`)
    armedRef.current = null
    setArmed(null)
    setUndoActive(false)
    setLevel(prevLevel.current)
    notify(`Reverted to ${prevLevel.current}`)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && armed) { e.preventDefault(); doCancel() }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); clearArm() }
  }, [armed])

  const shown = armed ?? level
  return (
    <section id="privilege" className="mx-auto max-w-[1320px] scroll-mt-40 px-5 py-24 md:px-10">
      <LiveStatus message={announce} />
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-gold-strong">Access tiers — feature &amp; privilege control</p>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.4rem)] leading-none font-medium"><SplitText text="Who can do what." /></h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-slate">Every tenant workspace runs on the least-privilege runtime role: a tier change affects exactly the capabilities below, never the schema. Pointer — hold a tier for 600ms to arm. Keyboard — press once to arm, again (or wait) to confirm.</p>
      </div>

      <div className="mt-10 border border-line bg-ivory">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
          <div className="flex items-center gap-3">
            <span className="eyebrow text-slate">Current access</span>
            <Badge pulse tone={Tier[level].tone}>{level}</Badge>
          </div>
          {undoActive && (
            <div className="flex items-center gap-3" role="status">
              <span className="hidden w-24 overflow-hidden bg-ivory-2 sm:block">
                <span key={undoKey} className="block h-1 bg-gold-strong" style={{ animation: 'shrink 3s linear both' }} />
              </span>
              <button onClick={undo} className="eyebrow border border-line px-3 py-2 text-slate transition hover:border-navy hover:text-navy">↩ Undo</button>
            </div>
          )}
        </div>

        <div role="radiogroup" aria-label="Access tier" className="grid gap-px bg-line md:grid-cols-3">
          {levels.map((l) => {
            const isCommitted = level === l
            const isArming = armed === l
            return (
              <button key={l} type="button" role="radio" aria-checked={isCommitted}
                onPointerDown={() => beginArm(l, true)} onPointerUp={release} onPointerLeave={release}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  e.preventDefault()
                  beginArm(l, false)
                }}
                className={`relative overflow-hidden p-6 text-start transition select-none ${isCommitted ? 'bg-navy text-ivory' : 'bg-ivory hover:bg-ivory-2'} ${isArming ? 'ring-2 ring-inset ring-gold' : ''}`}>
                <span className={`absolute inset-x-0 top-0 h-0.5 ${isCommitted ? 'bg-gold-light' : 'bg-line'}`} />
                <span className="flex items-center justify-between gap-3">
                  <span className="font-display text-2xl font-medium">{l}</span>
                  <span aria-hidden className={`text-sm ${isCommitted ? 'text-gold-light' : 'text-gold-strong'}`}>{isCommitted ? '✓' : isArming ? '…' : '⏻'}</span>
                </span>
                <span className={`mt-2 block text-xs leading-relaxed ${isCommitted ? 'text-ivory/70' : 'text-slate'}`}>{Tier[l].blurb}</span>
                {isArming && (
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-gold">
                    <span className="block h-full bg-gold-strong" style={{ animation: 'grow 600ms linear both' }} />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className={`grid transition-[grid-template-rows] duration-500 ${armed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="min-h-0 overflow-hidden">
            <div id="privilege-impact" className="grid gap-6 border-t border-line p-6 sm:grid-cols-2" aria-hidden={!armed}>
              <div>
                <p className="eyebrow text-ok-strong">Can</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {Tier[shown].can.map((c) => <li key={c} className="flex gap-2"><span aria-hidden className="text-ok">✓</span>{c}</li>)}
                </ul>
              </div>
              <div>
                <p className="eyebrow text-risk-strong">Cannot</p>
                <ul className="mt-3 space-y-2 text-sm text-slate">
                  {Tier[shown].cannot.map((c) => <li key={c} className="flex gap-2"><span aria-hidden className="text-slate">—</span>{c}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}