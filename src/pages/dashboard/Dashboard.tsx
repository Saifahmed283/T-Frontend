import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useHead } from '@/hooks/useHead'
import { useDashboard } from '@/hooks/useDashboard'
import { useMetrics } from '@/hooks/useMetrics'
import { CountUp, Logo, Emblem, Reveal } from '@/components/motion/fx'
import { Badge, EmptyState, LiveStatus, SegmentedControl } from '@/components/ui'
import { method } from '@/content/data'
import { api, ApiError, type ApiStage, type ApiStatus, type Assignment, type AssignmentDetail, type ExpertStatus, type SubmissionKind } from '@/lib/api'

type Status = 'On track' | 'At risk' | 'Blocked'
type Row = { id: string; name: string; client: string; sector: string; gate: number; status: Status; lead: string; value: number }

const demoRows: Row[] = [
  { id: 'TM-25-031', name: 'Governorate investment map — phase II', client: 'Assiut Governorate', sector: 'Public sector', gate: 5, status: 'On track', lead: 'M. Baraka', value: 182 },
  { id: 'TM-25-034', name: 'TVET curricula re-tooling', client: 'GIZ programme', sector: 'Development partners', gate: 6, status: 'On track', lead: 'S. Fahmy', value: 240 },
  { id: 'TM-26-002', name: 'Blended-finance cooperative structure', client: 'Delta Impact Fund', sector: 'NGOs', gate: 3, status: 'At risk', lead: 'N. Adel', value: 96 },
  { id: 'TM-26-005', name: 'Investment climate action plan', client: 'Ministry of Planning', sector: 'Public sector', gate: 2, status: 'On track', lead: 'M. Baraka', value: 310 },
  { id: 'TM-26-009', name: 'SME export readiness diagnostic', client: 'Nile Foods Co.', sector: 'Business', gate: 1, status: 'Blocked', lead: 'K. Samir', value: 38 },
  { id: 'TM-26-011', name: 'Teaming bid — regional LED framework', client: 'Landell Mills (prime)', sector: 'Consultancies', gate: 4, status: 'At risk', lead: 'S. Fahmy', value: 145 },
  { id: 'TM-26-014', name: 'Train-the-trainer certification', client: 'AAST Academy', sector: 'Learning', gate: 7, status: 'On track', lead: 'N. Adel', value: 64 },
]

const demoActivity: [string, string, string][] = [
  ['2m', 'Procurement pack downloaded', 'Ministry of Planning · governments hub'],
  ['1h', 'G5 gate passed', 'TM-25-031 · Assiut Governorate'],
  ['3h', 'New expert registration', 'Public finance · Amman'],
  ['Yesterday', 'Policy brief published (AR)', 'Investment climate reform'],
  ['Yesterday', 'Risk flagged', 'TM-26-002 · term-sheet delay'],
]

const demoFunnel = [214, 168, 102, 47, 23]

const palette = ['#2E6F9E', '#7FA650', '#C97B2D', '#6B4E94', '#31455B', '#A98A4B', '#5E6772']

const statusTone: Record<Status, 'ok' | 'warn' | 'risk'> = { 'On track': 'ok', 'At risk': 'warn', Blocked: 'risk' }
const stageColors = ['#0c1d30', '#31455b', '#2e6f9e', '#7fa650', '#c97b2d', '#6b4e94', '#a98a4b', '#5e6772']
const statusLabel: Record<ApiStatus, Status> = { ON_TRACK: 'On track', AT_RISK: 'At risk', BLOCKED: 'Blocked' }
const gateOf = (stage: ApiStage) => Number(stage.slice(1))
const toRow = (a: Assignment): Row => ({ id: a.id, name: a.name, client: a.client, sector: a.sector, gate: gateOf(a.stage), status: statusLabel[a.status], lead: a.lead?.name ?? '—', value: a.value })

const expertOrder: ExpertStatus[] = ['REGISTERED', 'PROFILE_COMPLETE', 'VETTED', 'MATCHED', 'DEPLOYED']
const expertStageLabel: Record<ExpertStatus, string> = {
  REGISTERED: 'Registered',
  PROFILE_COMPLETE: 'Profile complete',
  VETTED: 'Vetted',
  MATCHED: 'Matched',
  DEPLOYED: 'Deployed',
  REJECTED: 'Rejected',
}
const expertTone: Record<ExpertStatus, 'ok' | 'warn' | 'risk' | 'gold' | 'neutral'> = {
  REGISTERED: 'neutral',
  PROFILE_COMPLETE: 'neutral',
  VETTED: 'gold',
  MATCHED: 'gold',
  DEPLOYED: 'ok',
  REJECTED: 'risk',
}

const kindLabel: Record<SubmissionKind, string> = {
  CONTACT: 'Contact',
  EXPERT_REGISTRATION: 'Expert registration',
  SEAT_RESERVATION: 'Seat reservation',
  TENDER_INTEREST: 'Tender interest',
  TEAM_PROPOSAL: 'Team proposal',
  JOB_APPLICATION: 'Job application',
  PUBLICATION_REQUEST: 'Publication request',
  NEWSLETTER: 'Newsletter',
  CONTRIBUTION: 'Contribution',
}

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  if (s < 172800) return 'Yesterday'
  return `${Math.floor(s / 86400)}d`
}

function Icon({ d }: { d: string }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
}

const navIcons: Record<string, string> = {
  Overview: 'M3 12h4l3-8 4 16 3-8h4',
  Assignments: 'M4 6h16M4 12h16M4 18h10',
  Experts: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  Submissions: 'M4 5h16v14H4zM4 6l8 6 8-6',
  Activity: 'M12 8v4l3 2m6-2a9 9 0 1 1-9-9',
  Settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.1l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-1.9-1.1L14.6 3h-4l-.4 2.8a7.5 7.5 0 0 0-1.9 1.1l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.2l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 1.9 1.1l.4 2.8h4l.4-2.8a7.5 7.5 0 0 0 1.9-1.1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1.1Z',
}

function Spark({ data, color = '#A98A4B' }: { data: number[]; color?: string }) {
  const max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`).join(' ')
  return <svg viewBox="0 0 100 30" className="h-8 w-full" preserveAspectRatio="none" aria-hidden><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-ivory-2 ${className}`} aria-hidden />
}

function Donut({ segs, total }: { segs: { l: string; v: number; c: string }[]; total: number }) {
  const [hover, setHover] = useState<number | null>(null)
  let acc = 0
  const R = 52, C = 2 * Math.PI * R
  const sum = segs.reduce((s, x) => s + x.v, 0) || 1
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <svg viewBox="0 0 140 140" className="h-40 w-40 shrink-0 -rotate-90">
        {segs.map((s, i) => {
          const len = (s.v / sum) * C
          const el = <circle key={s.l} cx="70" cy="70" r={R} fill="none" stroke={s.c} strokeWidth={hover === i ? 18 : 13} strokeDasharray={`${len - 1.5} ${C}`} strokeDashoffset={-acc}
            className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
          acc += len
          return el
        })}
        <text x="70" y="70" transform="rotate(90 70 70)" textAnchor="middle" dominantBaseline="middle" className="font-display" fontSize="20" fill="#132B45">{hover === null ? total : segs[hover].v}</text>
      </svg>
      <ul className="w-full space-y-2 text-sm">
        {segs.map((s, i) => (
          <li key={s.l} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className={`flex items-center justify-between gap-3 rounded px-2 py-1 transition ${hover === i ? 'bg-ivory-2' : ''}`}>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5" style={{ background: s.c }} />{s.l}</span>
            <span className="tabular-nums text-slate">{Math.round((s.v / sum) * 100)}%</span>
          </li>
        ))}
        {!segs.length && <li className="text-sm text-slate">No engagements in scope.</li>}
      </ul>
    </div>
  )
}

function PortfolioPulse({ rows }: { rows: Row[] }) {
  const total = rows.length || 1
  const barColor: Record<Status, string> = { 'On track': '#2f6b3a', 'At risk': '#9a6700', Blocked: '#8f1f1f' }
  const byStatus = (['On track', 'At risk', 'Blocked'] as const).map((s) => ({ s, n: rows.filter((r) => r.status === s).length }))
  const stages = method.map((_, g) => ({ g, n: rows.filter((r) => r.gate === g).length }))
  return (
    <section className="border border-line bg-ivory p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium">Portfolio pulse</h2>
          <p className="text-xs text-slate">Status and stage distribution across the current scope</p>
        </div>
        <span className="eyebrow text-slate">{rows.length} engagements</span>
      </div>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <p className="eyebrow text-gold-strong">By status</p>
          <div className="mt-4 space-y-3">
            {byStatus.map(({ s, n }) => (
              <div key={s} className="flex items-center gap-4">
                <Badge tone={statusTone[s]} className="w-24 justify-center">{s}</Badge>
                <div className="h-2 flex-1 bg-ivory-2">
                  <div className="h-full transition-all duration-1000" style={{ width: `${(n / total) * 100}%`, background: barColor[s] }} />
                </div>
                <span className="w-8 text-end text-sm font-mono tabular-nums text-slate">{n}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow text-gold-strong">By gate — G0 to G7</p>
          <div className="mt-4 flex items-end gap-0.5">
            {stages.map(({ g, n }) => (
              <div key={g} className="flex flex-1 flex-col items-center gap-1" title={`Gate G${g} — ${n} ${n === 1 ? 'assignment' : 'assignments'}`}>
                <span className="text-xs tabular-nums text-slate">{n || ''}</span>
                <div className="flex h-32 w-full items-end bg-ivory-2">
                  <div className="w-full transition-all duration-1000" style={{ height: `${(n / total) * 100}%`, background: stageColors[g] }} />
                </div>
                <span className="text-[0.6rem] text-slate">G{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ExpertFunnel({ counts }: { counts: number[] }) {
  const labels = ['Registered', 'Profile complete', 'Vetted', 'Matched to assignment', 'Deployed']
  const top = counts[0] || 1
  return (
    <div>
      {labels.map((l, i) => (
        <div key={l} className="mb-3">
          <div className="flex justify-between text-sm"><span>{l}</span><span className="font-mono tabular-nums text-slate">{counts[i]}</span></div>
          <div className="mt-1 h-1.5 bg-ivory-2"><div className="h-full transition-all duration-1000" style={{ width: `${(counts[i] / top) * 100}%`, background: i > 2 ? '#A98A4B' : '#132B45' }} /></div>
        </div>
      ))}
    </div>
  )
}

function PortalStub() {
  const cols = [
    { t: 'Deliverables', d: 'Signed mandate notes, diagnostics and design packs' },
    { t: 'Milestones', d: 'G0–G7 gate dates and payment triggers' },
    { t: 'Documents', d: 'Shared briefs, minutes and published results' },
  ]
  return (
    <div className="mt-8 border border-ivory/15 bg-ivory/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow text-gold-light">Client workspace · preview</p>
        <Badge tone="warn">Pending</Badge>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {cols.map((c) => (
          <div key={c.t}>
            <p className="text-sm text-ivory">{c.t}</p>
            <p className="mt-1 text-xs leading-relaxed text-ivory/65">{c.d}</p>
            <p className="mt-2 text-xs text-ivory/60">No items yet</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-ivory/55">Deliverables, milestones and documents open to clients in a later release.</p>
    </div>
  )
}

function SignIn({ onLogin, hint }: { onLogin: (email: string, password: string) => Promise<void>; hint: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await onLogin(email, password)
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Sign-in failed')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="border border-line bg-ivory p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium">Sign in to the portal</h2>
          <p className="text-xs text-slate">{hint}</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-5 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-slate">
          Email
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="portal@terramorph.local"
            className="w-56 border-b-2 border-navy/20 bg-transparent px-1 py-2 text-sm text-navy focus:border-gold-strong focus:outline-none" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate">
          Password
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-56 border-b-2 border-navy/20 bg-transparent px-1 py-2 text-sm text-navy focus:border-gold-strong focus:outline-none" />
        </label>
        <button type="submit" disabled={busy} className="bg-navy px-5 py-2.5 text-sm text-ivory transition hover:bg-navy-2 disabled:opacity-50">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        {err && <p role="alert" className="text-sm text-error">{err}</p>}
      </form>
    </section>
  )
}

function PasswordCard() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'risk'; text: string } | null>(null)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (next !== confirm) { setMsg({ tone: 'risk', text: 'New passwords do not match' }); return }
    setBusy(true)
    setMsg(null)
    try {
      await api.changePassword(current, next)
      setMsg({ tone: 'ok', text: 'Password updated' })
      setCurrent(''); setNext(''); setConfirm('')
    } catch (ex) {
      setMsg({ tone: 'risk', text: ex instanceof ApiError ? ex.message : 'Could not update password' })
    } finally {
      setBusy(false)
    }
  }
  const field = 'w-full border border-line bg-transparent px-3 py-2 text-sm text-navy focus-visible:outline-gold-strong'
  return (
    <section className="border border-line bg-ivory p-6">
      <h2 className="text-xl font-medium">Password</h2>
      <p className="mb-5 text-xs text-slate">Rotate your portal credentials. You stay signed in on this device.</p>
      <form onSubmit={submit} className="grid max-w-md gap-4">
        <label className="flex flex-col gap-1 text-xs text-slate">Current password
          <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required className={field} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate">New password
          <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={12} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate">Confirm new password
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className={field} />
        </label>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={busy} className="bg-navy px-5 py-2.5 text-sm text-ivory transition hover:bg-navy-2 disabled:opacity-50">{busy ? 'Updating…' : 'Update password'}</button>
          {msg && <p role="status" className={`text-sm ${msg.tone === 'ok' ? 'text-ok-strong' : 'text-error'}`}>{msg.text}</p>}
        </div>
      </form>
    </section>
  )
}

export default function Dashboard() {
  useHead('Client portal', 'TerraMorph engagement portal: assignments, G0–G7 stage progress, expert pipeline and activity.')
  const { data, source, loading, error, needsAuth, isAdmin, reload, login, logout } = useDashboard()
  const [view, setView] = useState('Overview')
  const [collapsed, setCollapsed] = useState(false)
  const [filter, setFilter] = useState<'All' | Status>('All')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState('')
  const [scope, setScope] = useState('All clients')
  const [announce, setAnnounce] = useState('')
  const [expertFilter, setExpertFilter] = useState<'All' | ExpertStatus>('All')
  const [expertQ, setExpertQ] = useState('')
  const [kindFilter, setKindFilter] = useState<'All' | SubmissionKind>('All')
  const [detail, setDetail] = useState<AssignmentDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const m = useMetrics()
  const t0 = useRef(0)
  const pending = useRef(false)
  const kpisRef = useRef<HTMLDivElement>(null)

  const navItems = useMemo(() => {
    const items = ['Overview', 'Assignments', 'Experts']
    if (!data || isAdmin) items.push('Submissions')
    items.push('Activity', 'Settings')
    if (data && !isAdmin) items.splice(3, 0, 'Submissions')
    return [...new Set(items)]
  }, [data, isAdmin])

  const ready = !loading
  const baseRows = useMemo(() => (data ? data.assignments.map(toRow) : demoRows), [data])
  const clients = useMemo(() => ['All clients', ...new Set(baseRows.map((r) => r.client))], [baseRows])
  const rows = useMemo(() => baseRows.filter((a) =>
    (filter === 'All' || a.status === filter) &&
    (scope === 'All clients' || a.client === scope) &&
    (a.name + a.client + a.id).toLowerCase().includes(q.toLowerCase())), [baseRows, filter, q, scope])
  const sel = useMemo(() => rows.find((a) => a.id === selected) ?? rows[0] ?? baseRows[0], [rows, selected, baseRows])
  const activity: [string, string, string][] = data
    ? data.activity.items.map((i) => [timeAgo(i.createdAt), i.message, i.assignment?.name ?? i.user?.name ?? ''])
    : demoActivity

  const sectorTotals = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of baseRows) map.set(r.sector, (map.get(r.sector) ?? 0) + r.value)
    return [...map.entries()].map(([l, v], i) => ({ l, v, c: palette[i % palette.length] })).sort((a, b) => b.v - a.v)
  }, [baseRows])

  const funnel = useMemo(() => {
    if (!data) return demoFunnel
    return expertOrder.map((stage) => {
      const si = expertOrder.indexOf(stage)
      return data.experts.filter((e) => e.status !== 'REJECTED' && expertOrder.indexOf(e.status) >= si).length
    })
  }, [data])

  const experts = useMemo(() => {
    const list = data?.experts ?? []
    return list.filter((e) =>
      (expertFilter === 'All' || e.status === expertFilter) &&
      (e.name + e.email + e.sector + (e.country ?? '')).toLowerCase().includes(expertQ.toLowerCase()))
  }, [data, expertFilter, expertQ])

  const submissions = useMemo(() => {
    const list = data?.submissions ?? []
    return list.filter((s) => kindFilter === 'All' || s.kind === kindFilter)
  }, [data, kindFilter])

  const kpis: { l: string; v: number; s?: string; d: number[]; delta: string; tone: string }[] = data ? [
    { l: 'Active assignments', v: data.summary.activeAssignments, d: [3, 4, 4, 5, 6, 6, 7], delta: `${data.summary.statuses.AT_RISK ?? 0} at risk · ${data.summary.statuses.BLOCKED ?? 0} blocked`, tone: 'text-warn-strong' },
    { l: 'Contract value (USD k)', v: data.summary.contractValue, d: [620, 700, 760, 820, 910, 990, 1075], delta: 'sum across active engagements', tone: 'text-slate' },
    { l: 'Experts on roster', v: data.summary.expertsOnRoster, d: [140, 152, 160, 171, 188, 201, 214], delta: `${data.summary.notesReceived} intake notes received`, tone: 'text-slate' },
    { l: 'Outcomes verified', v: data.summary.outcomesVerified, s: '%', d: [80, 84, 83, 87, 89, 90, 92], delta: 'G6/G7 gate pass rate', tone: 'text-ok-strong' },
  ] : [
    { l: 'Active assignments', v: 7, d: [3, 4, 4, 5, 6, 6, 7], delta: '▲ +2 this quarter', tone: 'text-ok-strong' },
    { l: 'Contract value (USD k)', v: 1075, d: [620, 700, 760, 820, 910, 990, 1075], delta: '▲ +18.4% QoQ', tone: 'text-ok-strong' },
    { l: 'Experts on roster', v: 214, d: [140, 152, 160, 171, 188, 201, 214], delta: '31 pending review', tone: 'text-warn-strong' },
    { l: 'Outcomes verified', v: 92, s: '%', d: [80, 84, 83, 87, 89, 90, 92], delta: 'G6 gate pass rate', tone: 'text-slate' },
  ]

  useEffect(() => {
    const el = kpisRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && pending.current) {
        pending.current = false
        const t3t = performance.now() - t0.current
        m.push('t3t', t3t)
        if (import.meta.env.DEV) console.debug(`[tm] time-to-task after scope switch: ${Math.round(t3t)}ms`)
      }
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!data || !selected) { setDetail(null); return }
    let active = true
    setDetailLoading(true)
    api.assignment(selected)
      .then((d) => { if (active) setDetail(d) })
      .catch(() => { if (active) setDetail(null) })
      .finally(() => { if (active) setDetailLoading(false) })
    return () => { active = false }
  }, [data, selected])

  const notify = (msg: string) => { setAnnounce(msg); setTimeout(() => setAnnounce(''), 3000) }

  const kpiGrid = (
    <div ref={kpisRef} className="grid grid-cols-2 gap-px bg-line xl:grid-cols-4" aria-busy={!ready}>
      {kpis.map((k, i) => (
        <Reveal key={k.l} delay={i * 80} className="bg-ivory p-6">
          {ready ? (
            <>
              <p className="eyebrow text-slate">{k.l}</p>
              <p className="mt-4 font-display text-5xl leading-none font-medium"><CountUp to={k.v} suffix={k.s} /></p>
              <div className="mt-4"><Spark data={k.d} /></div>
              <p className={`mt-2 inline-flex items-center gap-1.5 text-xs ${k.tone}`}>{k.delta}</p>
            </>
          ) : (
            <>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-4 h-10 w-36" />
              <Skeleton className="mt-4 h-8 w-full" />
              <Skeleton className="mt-2 h-3 w-28" />
            </>
          )}
        </Reveal>
      ))}
    </div>
  )

  const ledger = (
    <section className="border border-line bg-ivory">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5">
        <h2 className="text-xl font-medium">Assignment ledger{scope !== 'All clients' && <span className="ms-2 text-sm text-slate">— {scope}</span>}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, client…" aria-label="Search assignments"
            className="w-44 border-b-2 border-navy/20 bg-transparent px-1 py-2 text-sm focus:border-gold-strong focus:outline-none" />
          <SegmentedControl
            options={[{ value: 'All', label: 'All' }, { value: 'On track', label: 'On track' }, { value: 'At risk', label: 'At risk' }, { value: 'Blocked', label: 'Blocked' }]}
            value={filter} onChange={(f) => setFilter(f as 'All' | Status)} label="Filter by status" />
        </div>
      </div>
      {!ready ? (
        <div className="space-y-4 p-5">
          {[0, 1, 2, 3].map((r) => (
            <div key={r} className="flex items-center gap-6">
              <Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-16" /><Skeleton className="h-6 w-20" /><Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      ) : rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="eyebrow text-start text-slate">
                <th className="px-5 py-3 text-start font-medium">Assignment</th>
                <th className="px-3 py-3 text-start font-medium">Gate</th>
                <th className="px-3 py-3 text-start font-medium">Status</th>
                <th className="px-5 py-3 text-end font-medium">USD k</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} onClick={() => setSelected(a.id)} className={`cursor-pointer border-t border-line transition ${sel?.id === a.id ? 'bg-ivory-2' : 'hover:bg-ivory-2/60'}`}>
                  <td className="px-5 py-4">
                    <p className="font-normal text-navy">{a.name}</p>
                    <p className="text-xs text-slate">{a.id} · {a.client}</p>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex gap-0.5">{method.map((_, i) => <span key={i} className={`h-3 w-1.5 ${i <= a.gate ? 'bg-gold' : 'bg-line'}`} />)}</div>
                    <p className="mt-1 text-xs text-slate">G{a.gate} · {method[a.gate]?.name}</p>
                  </td>
                  <td className="px-3 py-4"><Badge pulse tone={statusTone[a.status]}>{a.status}</Badge></td>
                  <td className="px-5 py-4 text-end font-mono tabular-nums">{a.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState eyebrow="FILTER" title="No assignments match" body="Try a different search term, status, or client scope." />
      )}
    </section>
  )

  const detailPanel = (
    <section className="relative overflow-hidden bg-navy p-6 text-ivory">
      {sel ? (
        <>
          <p className="eyebrow text-gold-light">{sel.id} · {sel.sector}</p>
          <h2 className="mt-3 text-2xl leading-snug font-medium">{sel.name}</h2>
          <p className="mt-1 text-sm text-ivory/60">{sel.client} · Lead {sel.lead}</p>
          <ol className="mt-8 space-y-0">
            {method.map((mm, i) => (
              <li key={mm.g} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className={`grid h-6 w-6 place-items-center rounded-full border text-[0.6rem] ${i < sel.gate ? 'border-gold bg-gold text-navy' : i === sel.gate ? 'border-gold-light text-gold-light' : 'border-ivory/20 text-ivory/65'}`}>{i < sel.gate ? '✓' : mm.g}</span>
                  {i < 7 && <span className={`h-5 w-px ${i < sel.gate ? 'bg-gold' : 'bg-ivory/15'}`} />}
                </div>
                <div className={`text-sm ${i === sel.gate ? 'text-ivory' : 'text-ivory/65'}`}>
                  {mm.name}{i === sel.gate && <span className="ms-2 text-xs text-gold-light">— in progress · {mm.out}</span>}
                </div>
              </li>
            ))}
          </ol>
          {data && (
            <div className="mt-8">
              <p className="eyebrow text-gold-light">Recent activity</p>
              {detailLoading ? (
                <p className="mt-3 text-xs text-ivory/55">Loading…</p>
              ) : detail?.activities?.length ? (
                <ul className="mt-3 space-y-3 text-sm">
                  {detail.activities.slice(0, 4).map((ev) => (
                    <li key={ev.id} className="flex gap-3">
                      <span className="w-12 shrink-0 text-xs text-ivory/60">{timeAgo(ev.createdAt)}</span>
                      <span className="text-ivory/85">{ev.message}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-ivory/55">No activity recorded yet.</p>
              )}
            </div>
          )}
          <PortalStub />
        </>
      ) : (
        <p className="text-sm text-ivory/60">Select an assignment to see its G0–G7 stage detail.</p>
      )}
    </section>
  )

  return (
    <div className="flex min-h-screen bg-ivory-2 text-navy">
      <LiveStatus message={announce} />
      <aside className={`fixed inset-y-0 start-0 z-40 hidden flex-col bg-navy text-ivory transition-all duration-500 md:flex ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex h-20 items-center border-b border-ivory/10 px-5">
          {collapsed ? <Emblem className="h-9 w-9" tone="ivory" /> : <Logo tone="ivory" />}
        </div>
        <nav className="mt-6 flex-1 space-y-1 px-3">
          {navItems.map((n) => (
            <button key={n} onClick={() => setView(n)} title={n}
              className={`relative flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm transition ${view === n ? 'bg-ivory/10 text-ivory' : 'text-ivory/60 hover:text-ivory'}`}>
              {view === n && <span className="absolute inset-y-2 start-0 w-0.5 bg-gold-light" />}
              <Icon d={navIcons[n]} />{!collapsed && n}
            </button>
          ))}
        </nav>
        <div className="border-t border-ivory/10 p-4">
          <button onClick={() => setCollapsed(!collapsed)} className="eyebrow w-full text-start text-ivory/65 hover:text-ivory">{collapsed ? '→' : '← Collapse'}</button>
          {data && <button onClick={() => void logout()} className="eyebrow mt-4 block text-ivory/60 hover:text-ivory">Sign out</button>}
          {!collapsed && <a href="/" className="eyebrow mt-4 block text-gold-light hover:text-ivory">↖ Public site</a>}
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid border-t border-ivory/10 bg-navy text-ivory md:hidden" style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
        {navItems.map((n) => (
          <button key={n} onClick={() => setView(n)} className={`flex flex-col items-center gap-1 py-3 text-[0.6rem] ${view === n ? 'text-gold-light' : 'text-ivory/60'}`}>
            <Icon d={navIcons[n]} />{n.split(' ')[0]}
          </button>
        ))}
      </nav>

      <main className={`w-full pb-24 transition-all duration-500 md:pb-10 ${collapsed ? 'md:ms-20' : 'md:ms-64'}`}>
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-line bg-ivory-2/85 px-5 backdrop-blur md:px-10">
          <div>
            <p className="eyebrow text-gold-strong">Engagement portal · {source === 'live' ? 'Live' : 'Sample'}</p>
            <h1 className="text-2xl font-medium md:text-3xl">{view}</h1>
          </div>
          <div className="flex items-center gap-4">
            {view === 'Assignments' || view === 'Overview' ? (
              <label className="hidden items-center gap-2 text-xs text-slate sm:flex">
                <span className="sr-only">Client scope</span>
                <select value={scope} onChange={(e) => { const w = e.target.value; setScope(w); notify(`Scoped to ${w}`); t0.current = performance.now(); pending.current = true; if (import.meta.env.DEV) console.debug(`[tm] scope switch to ${w}`) }} aria-label="Filter by client"
                  className="max-w-44 border border-line bg-transparent px-3 py-2 text-sm text-navy focus-visible:outline-gold-strong">
                  {clients.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </label>
            ) : null}
            {data
              ? <Badge pulse tone="ok" className="hidden sm:inline-flex">Live · {data.session?.role ?? 'member'}</Badge>
              : <Badge tone="warn" className="hidden sm:inline-flex">Demo data</Badge>}
            <div className="grid h-10 w-10 place-items-center rounded-full bg-navy font-display text-ivory">{(data?.session?.user.name ?? 'Guest').slice(0, 2).toUpperCase()}</div>
          </div>
        </header>

        <div className="space-y-6 px-5 pt-8 md:px-10">
          {error && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-risk/30 bg-risk/5 px-5 py-3 text-sm">
              <span className="text-risk-strong">Could not load live data — {error}. Showing sample data.</span>
              <button onClick={() => void reload()} className="eyebrow border border-line px-3 py-1.5 text-slate transition hover:border-navy hover:text-navy">Retry</button>
            </div>
          )}
          {needsAuth && (
            <SignIn onLogin={login} hint="The API is scoped per tenant. Sign in with a seeded portal account to replace the sample data with live assignments. The seed password is in the backend .env." />
          )}

          {view === 'Overview' && (
            <>
              {kpiGrid}
              <PortfolioPulse rows={baseRows} />
              <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
                {ledger}
                {detailPanel}
              </div>
            </>
          )}

          {view === 'Assignments' && (
            <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              {ledger}
              {detailPanel}
            </div>
          )}

          {view === 'Experts' && (
            <>
              <div className="grid gap-6 lg:grid-cols-3">
                <section className="border border-line bg-ivory p-6 lg:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-medium">Expert network</h2>
                      <p className="text-xs text-slate">{data ? `${data.experts.length} experts on roster` : 'Sample roster'}</p>
                    </div>
                    <input value={expertQ} onChange={(e) => setExpertQ(e.target.value)} placeholder="Search name, sector…" aria-label="Search experts"
                      className="w-44 border-b-2 border-navy/20 bg-transparent px-1 py-2 text-sm focus:border-gold-strong focus:outline-none" />
                  </div>
                  <div className="mt-4">
                    <SegmentedControl
                      options={[{ value: 'All', label: 'All' }, ...expertOrder.map((s) => ({ value: s, label: expertStageLabel[s] })), { value: 'REJECTED', label: 'Rejected' }]}
                      value={expertFilter} onChange={(v) => setExpertFilter(v as 'All' | ExpertStatus)} label="Filter experts by status" />
                  </div>
                  {!ready ? (
                    <div className="mt-5 space-y-3">{[0, 1, 2, 3].map((r) => <Skeleton key={r} className="h-10 w-full" />)}</div>
                  ) : data ? (
                    experts.length ? (
                      <div className="mt-5 overflow-x-auto">
                        <table className="w-full min-w-[560px] text-sm">
                          <thead><tr className="eyebrow text-slate"><th className="py-2 text-start font-medium">Expert</th><th className="py-2 text-start font-medium">Sector</th><th className="py-2 text-start font-medium">Country</th><th className="py-2 text-start font-medium">Status</th></tr></thead>
                          <tbody>
                            {experts.map((e) => (
                              <tr key={e.id} className="border-t border-line">
                                <td className="py-3 pe-4"><p>{e.name}</p><p className="text-xs text-slate">{e.email}</p></td>
                                <td className="py-3 pe-4 text-slate">{e.sector}</td>
                                <td className="py-3 pe-4 text-slate">{e.country ?? '—'}</td>
                                <td className="py-3"><Badge tone={expertTone[e.status]}>{expertStageLabel[e.status]}</Badge></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <EmptyState eyebrow="ROSTER" title="No experts match" body="Adjust the search or status filter to see more of the roster." />
                  ) : <EmptyState eyebrow="ROSTER" title="Roster is private" body="Sign in to load the live expert network behind the sample view." />}
                </section>
                <section className="border border-line bg-ivory p-6">
                  <h2 className="text-xl font-medium">Registration funnel</h2>
                  <p className="mb-6 text-xs text-slate">Cumulative, excluding declined profiles</p>
                  <ExpertFunnel counts={funnel} />
                </section>
              </div>
            </>
          )}

          {view === 'Submissions' && (
            <section className="border border-line bg-ivory p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-medium">Submissions inbox</h2>
                  <p className="text-xs text-slate">Public intake across contact, registration and tender forms</p>
                </div>
                {data?.submissions && (
                  <SegmentedControl
                    options={[{ value: 'All', label: 'All' }, ...(Object.keys(kindLabel) as SubmissionKind[]).map((k) => ({ value: k, label: kindLabel[k] }))]}
                    value={kindFilter} onChange={(v) => setKindFilter(v as 'All' | SubmissionKind)} label="Filter submissions by kind" />
                )}
              </div>
              {!ready ? (
                <div className="mt-5 space-y-3">{[0, 1, 2, 3].map((r) => <Skeleton key={r} className="h-10 w-full" />)}</div>
              ) : data?.submissions ? (
                submissions.length ? (
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead><tr className="eyebrow text-slate"><th className="py-2 text-start font-medium">Kind</th><th className="py-2 text-start font-medium">From</th><th className="py-2 text-start font-medium">Message</th><th className="py-2 text-start font-medium">When</th></tr></thead>
                      <tbody>
                        {submissions.map((s) => (
                          <tr key={s.id} className="border-t border-line align-top">
                            <td className="py-3 pe-4"><Badge tone="neutral">{kindLabel[s.kind]}</Badge></td>
                            <td className="py-3 pe-4"><p>{s.name ?? 'Anonymous'}</p><p className="text-xs text-slate">{s.email ?? '—'}</p></td>
                            <td className="max-w-sm py-3 pe-4 text-slate">{s.message ?? '—'}</td>
                            <td className="py-3 text-xs text-slate whitespace-nowrap">{timeAgo(s.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <EmptyState eyebrow="INBOX" title="Nothing here yet" body="New submissions from the public site will appear here." />
              ) : (
                <div className="mt-5">
                  <EmptyState eyebrow="RESTRICTED" title={data ? 'Admins only' : 'Sign in to review'} body={data ? 'This inbox is limited to workspace administrators. Ask an admin for access.' : 'Sign in with an administrator account to open the submissions inbox.'} />
                </div>
              )}
            </section>
          )}

          {view === 'Activity' && (
            <section className="border border-line bg-ivory p-6">
              <h2 className="text-xl font-medium">Activity</h2>
              <p className="mb-6 text-xs text-slate">{data ? 'Live audit trail from the API' : 'Sample trail across all engagements'}</p>
              <ul className="space-y-5 text-sm">
                {activity.map(([t, a, b]) => (
                  <li key={a + t} className="flex gap-4">
                    <span className="w-16 shrink-0 text-xs text-slate">{t}</span>
                    <div className="border-s border-gold/50 ps-4"><p>{a}</p>{b && <p className="text-xs text-slate">{b}</p>}</div>
                  </li>
                ))}
                {!activity.length && <li className="text-sm text-slate">No activity recorded yet.</li>}
              </ul>
            </section>
          )}

          {view === 'Settings' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="border border-line bg-ivory p-6">
                <h2 className="text-xl font-medium">Session</h2>
                <p className="mb-5 text-xs text-slate">The workspace and role this browser is signed into.</p>
                {data ? (
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-slate">User</dt><dd>{data.session?.user.name}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate">Email</dt><dd>{data.session?.user.email}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate">Workspace</dt><dd className="font-mono">{data.session?.workspace.slug}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate">Role</dt><dd><Badge tone={isAdmin ? 'gold' : 'neutral'}>{data.session?.role ?? 'member'}</Badge></dd></div>
                  </dl>
                ) : (
                  <p className="text-sm text-slate">Sample view — sign in to see your session, or use the seed account from the backend .env.</p>
                )}
                <div className="mt-6 flex gap-3">
                  <button onClick={() => void reload()} className="border border-line px-4 py-2 text-sm text-slate transition hover:border-navy hover:text-navy">Refresh</button>
                  {data && <button onClick={() => void logout()} className="bg-navy px-4 py-2 text-sm text-ivory transition hover:bg-navy-2">Sign out</button>}
                </div>
              </section>
              {data ? <PasswordCard /> : (
                <section className="border border-line bg-ivory p-6">
                  <h2 className="text-xl font-medium">Password</h2>
                  <p className="text-xs text-slate">Available once you are signed in.</p>
                </section>
              )}
            </div>
          )}

          {view !== 'Overview' && view !== 'Assignments' && view !== 'Experts' && view !== 'Submissions' && view !== 'Activity' && view !== 'Settings' && (
            <EmptyState eyebrow="COMING SOON" title={`${view} is on the way`} body="This section is being built. Head back to the overview for the live engagement deck." action={{ label: 'Open overview', onClick: () => setView('Overview') }} />
          )}

          {(view === 'Overview') && (
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="border border-line bg-ivory p-6">
                <h2 className="text-xl font-medium">Contract value by sector</h2>
                <p className="mb-6 text-xs text-slate">USD k across the current scope</p>
                <Donut segs={sectorTotals} total={baseRows.reduce((s, r) => s + r.value, 0)} />
              </section>
              <section className="border border-line bg-ivory p-6">
                <h2 className="text-xl font-medium">Expert network</h2>
                <p className="mb-6 text-xs text-slate">Registration funnel — visible to every applicant</p>
                <ExpertFunnel counts={funnel} />
              </section>
              <section className="border border-line bg-ivory p-6">
                <h2 className="text-xl font-medium">Recent activity</h2>
                <p className="mb-6 text-xs text-slate">{data ? 'Why statuses changed — live from the API' : 'Across all engagements — why statuses changed'}</p>
                <ul className="space-y-5 text-sm">
                  {activity.slice(0, 5).map(([t, a, b]) => (
                    <li key={a + t} className="flex gap-4">
                      <span className="w-16 shrink-0 text-xs text-slate">{t}</span>
                      <div className="border-s border-gold/50 ps-4"><p>{a}</p>{b && <p className="text-xs text-slate">{b}</p>}</div>
                    </li>
                  ))}
                  {!activity.length && <li className="text-sm text-slate">No activity recorded yet.</li>}
                </ul>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
