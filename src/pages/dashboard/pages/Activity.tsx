import { Clock3 } from "lucide-react"

import type { ActivityItem } from "@/lib/api"

import { Heading } from "../ui"
import { Empty, timeAgo } from "../shared"

/* Activity — the full audit trail. Read-only by design. */

export function ActivityPage({
  items,
  loading,
}: {
  items: ActivityItem[]
  loading: boolean
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>Activity log</Heading>
          <p>The audit trail across the workspace.</p>
        </div>
        <Clock3 size={18} strokeWidth={1.5} />
      </div>

      {loading ? (
        <div className="p-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="mb-3 h-12 w-full animate-pulse rounded-lg border border-line bg-ivory-2"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty icon={Clock3} title="No activity yet">
          Actions across content and members will be recorded here.
        </Empty>
      ) : (
        <ul className="activity-list">
          {items.map((a) => (
            <li key={a.id}>
              <span>{timeAgo(a.createdAt)}</span>
              <div>
                <p>{a.message}</p>
                <p className="field-hint">
                  {[a.user?.name, a.assignment?.name]
                    .filter(Boolean)
                    .join(" · ") || a.type}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
