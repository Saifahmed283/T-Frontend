import { Reveal } from '@/components/motion/fx'
import { Badge, SegmentedControl } from '@/components/ui'
import type { ContentCounts } from '@/lib/api'
import { collections } from '../content-model'

export function Overview({ counts, activity, onNavigate }: { counts: ContentCounts | null; activity: [string, string, string][]; onNavigate: (v: string, opts?: any) => void }) {
  const pipeline = [
    { status: 'DRAFT', label: 'Draft' },
    { status: 'REVIEW', label: 'Review' },
    { status: 'APPROVED', label: 'Approved' },
    { status: 'SCHEDULED', label: 'Scheduled' },
    { status: 'PUBLISHED', label: 'Published' },
    { status: 'UNPUBLISHED', label: 'Unpublished' },
    { status: 'ARCHIVED', label: 'Archived' },
  ] as const

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {pipeline.slice(0, 4).map((p, i) => (
          <Reveal key={p.status} delay={i * 80} className="border border-line bg-ivory p-6">
            <p className="eyebrow text-slate">{p.label}</p>
            <p className="mt-4 font-display text-4xl">{counts?.byStatus?.[p.status] ?? 0}</p>
          </Reveal>
        ))}
      </div>

      <section className="border border-line bg-ivory">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-lg font-medium">Content collections</h2>
            <p className="text-xs text-slate">The building blocks of your website</p>
          </div>
          <button type="button" onClick={() => onNavigate('content')} className="text-sm text-slate hover:text-navy">
            View all →
          </button>
        </div>
        <div className="divide-y divide-line">
          {collections.slice(0, 6).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onNavigate('content', { collectionId: c.id })}
              className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-ivory-2"
            >
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-slate">{c.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate">{counts?.byKind?.[c.id]?.total ?? 0} records</span>
                <Badge tone="neutral">EN · AR</Badge>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="border border-line bg-ivory p-6">
        <h2 className="text-lg font-medium">Recent activity</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {activity.slice(0, 5).map(([t, a, b]) => (
            <li key={a + t} className="flex gap-4">
              <span className="w-16 text-xs text-slate">{t}</span>
              <div className="border-s border-gold/40 ps-4">
                <p>{a}</p>
                {b && <p className="text-xs text-slate">{b}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}