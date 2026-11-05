import { Workflow } from "lucide-react"

import type { ContentItem, WorkflowBoardPayload } from "@/lib/api"

import { Button, Heading } from "../ui"
import { statusLabel, statusOrder } from "../shared"

/* Workflow — every record, grouped by where it sits in the publishing path. */

export function WorkflowPage({
  board,
  onOpenItem,
}: {
  board: WorkflowBoardPayload | null
  onOpenItem: (item: ContentItem) => void
}) {
  const columns = board?.columns ?? {}
  const keys = statusOrder.filter((s) => columns[s] !== undefined)

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>From draft to publication</Heading>
          <p>Every record, grouped by where it sits in the workflow.</p>
        </div>
        <Workflow size={18} strokeWidth={1.5} />
      </div>

      <div className="workflow-board">
        {(keys.length ? keys : statusOrder.slice(0, 4)).map((key) => {
          const items: ContentItem[] = columns[key] ?? []
          return (
            <div key={key}>
              <h3>
                {statusLabel(key)}
                <span>{items.length}</span>
              </h3>
              {items.length === 0 ? (
                <div className="board-empty">Nothing here yet</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {items.map((it) => (
                    <Button
                      key={it.id}
                      variant="ghost"
                      onClick={() => onOpenItem(it)}
                      className="w-full flex-col items-start gap-1 rounded-lg border border-line bg-surface px-3 py-3 text-left"
                    >
                      <p className="w-full truncate text-xs font-medium">
                        {it.title || "Untitled"}
                      </p>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-strong">
                        {statusLabel(it.kind)}
                      </p>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
