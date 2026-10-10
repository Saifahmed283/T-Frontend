import { useEffect, useMemo, useRef, useState } from 'react'
import { useHead } from '@/hooks/useHead'
import { useMetrics } from '@/hooks/useMetrics'
import { CountUp, Logo, Emblem, Reveal } from '@/components/motion/fx'
import { Badge, EmptyState, LiveStatus, SegmentedControl } from '@/components/ui'
import { method } from '@/content/data'

type Status = 'On track' | 'At risk' | 'Blocked'
const assignments: { id: string; name: string; client: string; sector: string; gate: number; status: Status; lead: string; value: number }[] = [
  { id: 'TM-25-031', name: 'Governorate investment map — phase II', client: 'Assiut Governorate', sector: 'Public sector', gate: 5, status: 'On track', lead: 'M. Baraka', value: 182 },
  { id: 'TM-25-034', name: 'TVET curricula re-tooling', client: 'GIZ programme', sector: 'Development partners', gate: 6, status: 'On track', lead: 'S. Fahmy', value: 240 },
  { id: 'TM-26-002', name: 'Blended-finance cooperative structure', client: 'Delta Impact Fund', sector: 'NGOs', gate: 3, status: 'At risk', lead: 'N. Adel', value: 96 },
  { id: 'TM-26-005', name: 'Investment climate action plan', client: 'Ministry of Planning', sector: 'Public sector', gate: 2, status: 'On track', lead: 'M. Baraka', value: 310 },
  { id: 'TM-26-009', name: 'SME export readiness diagnostic', client: 'Nile Foods Co.', sector: 'Business', gate: 1, status: 'Blocked', lead: 'K. Samir', value: 38 },
  { id: 'TM-26-011', name: 'Teaming bid — regional LED framework', client: 'Landell Mills (prime)', sector: 'Consultancies', gate: 4, status: 'At risk', lead: 'S. Fahmy', value: 145 },
  { id: 'TM-26-014', name: 'Train-the-trainer certification', client: 'AAST Academy', sector: 'Learning', gate: 7, status: 'On track', lead: 'N. Adel', value: 64 },
]
const statusTone: Record<Status, 'ok' | 'warn' | 'risk'> = { 'On track': 'ok', 'At risk': 'warn', Blocked: 'risk' }
const stageColors = ['#0c1d30', '#31455b', '#2e6f9e', '#7fa650', '#c97b2d', '#6b4e94', '#a98a4b', '#5e6772']

const navItems = [
  { k: 'Overview', i: 'M3 12h4l3-8 4 16 3-8h4' },
  { k: 'Assignments', i: 'M4 6h16M4 12h16M4 18h10' },
  { k: 'Expert network', i: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0' },
  { k: 'Knowledge', i: 'M5 4h10l4 4v12H5z' },
  { k: 'Pipeline', i: 'M4 4h16l-6 8v6l-4 2v-8z' },
]

function Icon({ d }: { d: string }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
}

function Spark({ data, color = '#A98A4B' }: { data: number[]; color?: string }) {
  const max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`).join(' ')
  return <svg viewBox="0 0 100 30" className="h-8 w-full" preserveAspectRatio="none" aria-hidden><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-ivory-2 ${className}`} aria-hidden />
}

function Segments() {
  const segs = [
    { l: 'Public sector', v: 42, c: '#2E6F9E' },
    { l: 'Development partners', v: 26, c: '#7FA650' },
    { l: 'Business', v: 14, c: '#C97B2D' },
    { l: 'NGOs', v: 11, c: '#6B4E94' },
    { l: 'Consultancies', v: 7, c: '#31455B' },
  ]
  const [hover, setHover] = useState<number | null>(null)
  let acc = 0
  const R = 52, C = 2 * Math.PI * R
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <svg viewBox="0 0 140 140" className="h-40 w-40 shrink-0 -rotate-90">
        {segs.map((s, i) => {
          const len = (s.v / 100) * C
          const el = <circle key={s.l} cx="70" cy="70" r={R} fill="none" stroke={s.c} strokeWidth={hover === i ? 18 : 13} strokeDasharray={`${len - 1.5} ${C}`} strokeDashoffset={-acc}
            className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
          acc += len
          return el
        })}
        <text x="70" y="70" transform="rotate(90 70 70)" textAnchor="middle" dominantBaseline="middle" className="font-display" fontSize="22" fill="#132B45">{hover === null ? '100%' : `${segs[hover].v}%`}</text>
      </svg>
      <ul className="w-full space-y-2 text-sm">
        {segs.map((s, i) => (
          <li key={s.l} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className={`flex items-center justify-between gap-3 rounded px-2 py-1 transition ${hover === i ? 'bg-ivory-2' : ''}`}>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5" style={{ background: s.c }} />{s.l}</span>
            <span className="tabular-nums text-slate">{s.v}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PortfolioPulse() {
  const total = assignments.length
  const barColor: Record<Status, string> = { 'On track': '#2f6b3a', 'At risk': '#9a6700', Blocked: '#8f1f1f' }
  const byStatus = (['On track', 'At risk', 'Blocked'] as const).map((s) => ({ s, n: assignments.filter((a) => a.status === s).length }))
  const stages = Array.from({ length: method.length }, (_, g) => ({ g, n: assignments.filter((a) => a.gate === g).length }))
  return (
    <section className="border border-line bg-ivory p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium">Portfolio pulse</h2>
          <p className="text-xs text-slate">Status and stage distribution across all tenant engagements</p>
        </div>
        <span className="eyebrow text-slate">7 engagements · all tenants</span>
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

export default function Dashboard() {
  useHead('Client portal', 'TerraMorph engagement portal: assignments, G0–G7 stage progress, expert pipeline and activity.')
  const [view, setView] = useState('Overview')
  const [collapsed, setCollapsed] = useState(false)
  const [filter, setFilter] = useState<'All' | Status>('All')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(assignments[0].id)
  const [workspace, setWorkspace] = useState('All tenants')
  const [ready, setReady] = useState(false)
  const [announce, setAnnounce] = useState('')
  const m = useMetrics()
  const t0 = useRef(0)
  const pending = useRef(false)
  const kpisRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 450)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const el = kpisRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && pending.current) {
        pending.current = false
        const t3t = performance.now() - t0.current
        m.push('t3t', t3t)
        if (import.meta.env.DEV) console.debug(`[tm] time-to-task after tenant switch: ${Math.round(t3t)}ms`)
      }
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const notify = (msg: string) => { setAnnounce(msg); setTimeout(() => setAnnounce(''), 3000) }
  const workspaces = ['All tenants', ...new Set(assignments.map((a) => a.client))]
  const rows = useMemo(() => assignments.filter((a) =>
    (filter === 'All' || a.status === filter) &&
    (workspace === 'All tenants' || a.client === workspace) &&
    (a.name + a.client + a.id).toLowerCase().includes(q.toLowerCase())), [filter, q, workspace])
  const sel = assignments.find((a) => a.id === selected) ?? assignments[0]
  const kpis = [
    { l: 'Active assignments', v: 7, d: [3, 4, 4, 5, 6, 6, 7], delta: '▲ +2 this quarter', tone: 'text-ok-strong' },
    { l: 'Contract value (USD k)', v: 1075, d: [620, 700, 760, 820, 910, 990, 1075], delta: '▲ +18.4% QoQ', tone: 'text-ok-strong' },
    { l: 'Experts on roster', v: 214, d: [140, 152, 160, 171, 188, 201, 214], delta: '31 pending review', tone: 'text-warn-strong' },
    { l: 'Outcomes verified', v: 92, s: '%', d: [80, 84, 83, 87, 89, 90, 92], delta: 'G6 gate pass rate', tone: 'text-slate' },
  ]

  return (
    <div className="flex min-h-screen bg-ivory-2 text-navy">
      <LiveStatus message={announce} />
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 start-0 z-40 hidden flex-col bg-navy text-ivory transition-all duration-500 md:flex ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex h-20 items-center border-b border-ivory/10 px-5">
          {collapsed ? <Emblem className="h-9 w-9" tone="ivory" /> : <Logo tone="ivory" />}
        </div>
        <nav className="mt-6 flex-1 space-y-1 px-3">
          {navItems.map((n) => (
            <button key={n.k} onClick={() => setView(n.k)} title={n.k}
              className={`relative flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm transition ${view === n.k ? 'bg-ivory/10 text-ivory' : 'text-ivory/60 hover:text-ivory'}`}>
              {view === n.k && <span className="absolute inset-y-2 start-0 w-0.5 bg-gold-light" />}
              <Icon d={n.i} />{!collapsed && n.k}
            </button>
          ))}
        </nav>
        <div className="border-t border-ivory/10 p-4">
          <button onClick={() => setCollapsed(!collapsed)} className="eyebrow w-full text-start text-ivory/50 hover:text-ivory">{collapsed ? '→' : '← Collapse'}</button>
          {!collapsed && <a href="/" className="eyebrow mt-4 block text-gold-light hover:text-ivory">↖ Public site</a>}
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-ivory/10 bg-navy text-ivory md:hidden">
        {navItems.map((n) => (
          <button key={n.k} onClick={() => setView(n.k)} className={`flex flex-col items-center gap-1 py-3 text-[0.6rem] ${view === n.k ? 'text-gold-light' : 'text-ivory/60'}`}>
            <Icon d={n.i} />{n.k.split(' ')[0]}
          </button>
        ))}
      </nav>

      <main className={`w-full pb-24 transition-all duration-500 md:pb-10 ${collapsed ? 'md:ms-20' : 'md:ms-64'}`}>
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-line bg-ivory-2/85 px-5 backdrop-blur md:px-10">
          <div>
            <p className="eyebrow text-gold">Engagement portal · Q4 2026</p>
            <h1 className="text-2xl font-medium md:text-3xl">{view}</h1>
          </div>
          <div className="flex items-center gap-4">
            <label className="hidden items-center gap-2 text-xs text-slate sm:flex">
              <span className="sr-only">Tenant workspace</span>
              <select value={workspace} onChange={(e) => { const w = e.target.value; setWorkspace(w); notify(`Switched to ${w}`); t0.current = performance.now(); pending.current = true; if (import.meta.env.DEV) console.debug(`[tm] tenant switch to ${w}`) }} aria-label="Switch tenant workspace"
                className="max-w-44 border border-line bg-transparent px-3 py-2 text-sm text-navy focus-visible:outline-gold-strong">
                {workspaces.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </label>
            <span className="hidden items-center gap-2 text-xs text-slate lg:flex"><span className="pulse-dot h-2 w-2 rounded-full bg-ok" />Live · synced 2m ago</span>
            <Badge tone="gold">Admin</Badge>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-navy font-display text-ivory">MB</div>
          </div>
        </header>

        <div className="space-y-6 px-5 pt-8 md:px-10">
          {/* KPIs */}
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

          <PortfolioPulse />

          <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            {/* Table */}
            <section className="border border-line bg-ivory">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5">
                <h2 className="text-xl font-medium">Assignment ledger{workspace !== 'All tenants' && <span className="ms-2 text-sm text-slate">— {workspace}</span>}</h2>
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
                        <tr key={a.id} onClick={() => setSelected(a.id)} className={`cursor-pointer border-t border-line transition ${selected === a.id ? 'bg-ivory-2' : 'hover:bg-ivory-2/60'}`}>
                          <td className="px-5 py-4">
                            <p className="font-normal text-navy">{a.name}</p>
                            <p className="text-xs text-slate">{a.id} · {a.client}</p>
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex gap-0.5">{method.map((_, i) => <span key={i} className={`h-3 w-1.5 ${i <= a.gate ? 'bg-gold' : 'bg-line'}`} />)}</div>
                            <p className="mt-1 text-xs text-slate">G{a.gate} · {method[a.gate].name}</p>
                          </td>
                          <td className="px-3 py-4"><Badge pulse tone={statusTone[a.status]}>{a.status}</Badge></td>
                          <td className="px-5 py-4 text-end font-mono tabular-nums">{a.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState eyebrow="FILTER" title="No assignments match" body="Try a different search term, status, or tenant scope." />
              )}
            </section>

            {/* Detail */}
            <section className="relative overflow-hidden bg-navy p-6 text-ivory">
              <p className="eyebrow text-gold-light">{sel.id} · {sel.sector}</p>
              <h2 className="mt-3 text-2xl leading-snug font-medium">{sel.name}</h2>
              <p className="mt-1 text-sm text-ivory/60">{sel.client} · Lead {sel.lead}</p>
              <ol className="mt-8 space-y-0">
                {method.map((m, i) => (
                  <li key={m.g} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className={`grid h-6 w-6 place-items-center rounded-full border text-[0.6rem] ${i < sel.gate ? 'border-gold bg-gold text-navy' : i === sel.gate ? 'border-gold-light text-gold-light' : 'border-ivory/20 text-ivory/40'}`}>{i < sel.gate ? '✓' : m.g}</span>
                      {i < 7 && <span className={`h-5 w-px ${i < sel.gate ? 'bg-gold' : 'bg-ivory/15'}`} />}
                    </div>
                    <div className={`text-sm ${i === sel.gate ? 'text-ivory' : 'text-ivory/50'}`}>
                      {m.name}{i === sel.gate && <span className="ms-2 text-xs text-gold-light">— in progress · {m.out}</span>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section className="border border-line bg-ivory p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium">Dashboard of interests</h2>
                <p className="text-xs text-slate">From the "Hello! I am…" intake — who is asking about what, last 30 days</p>
              </div>
              <span className="eyebrow text-gold">312 notes received</span>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead><tr className="eyebrow text-slate"><th className="py-2 text-start font-medium">I am a…</th>{['LED', 'Policy', 'TVET', 'Investment', 'Social ent.'].map((h) => <th key={h} className="py-2 font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {([['Policy maker', [18, 34, 9, 22, 4]], ['Local entity', [41, 12, 15, 8, 10]], ['Development partner', [22, 19, 27, 14, 12]], ['INGO', [9, 8, 6, 3, 25]], ['Consultant', [14, 11, 7, 16, 5]], ['Cause enthusiast', [12, 3, 4, 2, 21]]] as [string, number[]][]).map(([r, vals]) => (
                    <tr key={r} className="border-t border-line">
                      <td className="py-2.5 pe-4">{r}</td>
                      {vals.map((v, k) => (
                        <td key={k} className="p-1">
                          <div title={`${v} notes`} className="grid h-9 place-items-center text-xs font-mono tabular-nums transition hover:scale-105" style={{ background: `rgba(19,43,69,${0.06 + v / 48})`, color: v > 20 ? '#FBF8F1' : '#132B45' }}>{v}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="border border-line bg-ivory p-6">
              <h2 className="text-xl font-medium">Pipeline by audience</h2>
              <p className="mb-6 text-xs text-slate">Share of qualified leads, last 90 days</p>
              <Segments />
            </section>
            <section className="border border-line bg-ivory p-6">
              <h2 className="text-xl font-medium">Expert network</h2>
              <p className="mb-6 text-xs text-slate">Registration funnel — visible to every applicant</p>
              {[['Registered', 214], ['Profile complete', 168], ['Vetted', 102], ['Matched to assignment', 47], ['Deployed', 23]].map(([l, v], i) => (
                <div key={l} className="mb-3">
                  <div className="flex justify-between text-sm"><span>{l}</span><span className="font-mono tabular-nums text-slate">{v}</span></div>
                  <div className="mt-1 h-1.5 bg-ivory-2"><div className="h-full transition-all duration-1000" style={{ width: `${((v as number) / 214) * 100}%`, background: i > 2 ? '#A98A4B' : '#132B45' }} /></div>
                </div>
              ))}
            </section>
            <section className="border border-line bg-ivory p-6">
              <h2 className="text-xl font-medium">Activity</h2>
              <p className="mb-6 text-xs text-slate">Across all engagements — why statuses changed</p>
              <ul className="space-y-5 text-sm">
                {[
                  ['2m', 'Procurement pack downloaded', 'Ministry of Planning · governments hub'],
                  ['1h', 'G5 gate passed', 'TM-25-031 · Assiut Governorate'],
                  ['3h', 'New expert registration', 'Public finance · Amman'],
                  ['Yesterday', 'Policy brief published (AR)', 'Investment climate reform'],
                  ['Yesterday', 'Risk flagged', 'TM-26-002 · term-sheet delay'],
                ].map(([t, a, b]) => (
                  <li key={a + t} className="flex gap-4">
                    <span className="w-16 shrink-0 text-xs text-slate">{t}</span>
                    <div className="border-s border-gold/50 ps-4"><p>{a}</p><p className="text-xs text-slate">{b}</p></div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}