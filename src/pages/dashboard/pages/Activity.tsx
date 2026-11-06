import { useCallback, useEffect, useState } from "react"
import { Clock3, ChevronDown } from "lucide-react"

import { api, type ActivityFeed, type ActivityItem } from "@/lib/api"
import { Button, Heading } from "../ui"
import { Empty, timeAgo } from "../shared"

const PAGE_SIZE = 20

export function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const load = useCallback(async (before?: string) => {
    try {
      const res = await api.activity({ limit: PAGE_SIZE, before })
      if (before) {
        setItems((prev) => [...prev, ...res.items])
      } else {
        setItems(res.items)
      }
      setNextCursor(res.nextCursor ?? null)
      setHasMore(!!res.nextCursor)
    } catch {
      setError("Failed to load activity")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const loadMore = () => {
    if (nextCursor && !loadingMore) {
      setLoadingMore(true)
      load(nextCursor)
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>Activity log</Heading>
          <p>The audit trail across the workspace.</p>
        </div>
        <Clock3 size={18} strokeWidth={1.5} />
      </div>

      {error && (
        <p className="panel-foot is-error" role="alert">
          {error}.{" "}
          <Button variant="ghost" onClick={() => load()}>
            Retry
          </Button>
        </p>
      )}

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
        <>
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
          {hasMore && (
            <div className="panel-foot">
              <Button
                variant="secondary"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load more"}
                <ChevronDown size={14} />
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}