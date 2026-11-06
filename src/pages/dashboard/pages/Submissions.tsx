import { Inbox } from "lucide-react"

import type { SubmissionKind } from "@/lib/api"
import { SkeletonRegion, SkeletonRows } from "@/components/ui"

import { useSubmissions } from "../hooks/useSubmissions"
import { Badge, Button } from "../ui"
import { Empty, timeAgo } from "../shared"

/* Submissions — incoming contact, tender, registration and newsletter forms
   from the public site. Admin-only.

   The inbox is fetched one page at a time and only once an admin opens this
   view, so the rest of the workspace never pays for it. */

const kindLabel: Record<SubmissionKind, string> = {
  CONTACT: "Contact",
  EXPERT_REGISTRATION: "Expert",
  SEAT_RESERVATION: "Seat",
  TENDER_INTEREST: "Tender",
  TEAM_PROPOSAL: "Team",
  JOB_APPLICATION: "Job",
  PUBLICATION_REQUEST: "Publication",
  NEWSLETTER: "Newsletter",
  CONTRIBUTION: "Contribution",
}

export function SubmissionsPage({ isAdmin }: { isAdmin: boolean }) {
  const {
    items,
    loading,
    error,
    kind,
    setKind,
    page,
    setPage,
    totalPages,
    reload,
  } = useSubmissions(isAdmin)

  if (!isAdmin) {
    return (
      <section className="panel">
        <Empty icon={Inbox} title="Submissions are private">
          Sign in as an admin to read incoming contact, tender and registration
          submissions.
        </Empty>
      </section>
    )
  }

  return (
    <section className="panel">
      <div className="status-tabs">
        <Button
          variant="ghost"
          className={kind === undefined ? "selected" : ""}
          onClick={() => setKind(undefined)}
        >
          All
        </Button>
        {(Object.keys(kindLabel) as SubmissionKind[]).map((k) => (
          <Button
            key={k}
            variant="ghost"
            className={kind === k ? "selected" : ""}
            onClick={() => setKind(k)}
          >
            {kindLabel[k]}
          </Button>
        ))}
      </div>

      {error && (
        <p className="panel-foot is-error" role="alert">
          {error}.{" "}
          <Button variant="ghost" onClick={() => void reload()}>
            Retry
          </Button>
        </p>
      )}

      {loading && items.length === 0 ? (
        <SkeletonRegion label="Loading submissions">
          <SkeletonRows rows={6} />
        </SkeletonRegion>
      ) : items.length === 0 ? (
        <Empty icon={Inbox} title="Nothing here yet">
          New submissions from the public site will appear here.
        </Empty>
      ) : (
        <ul aria-busy={loading}>
          {items.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium">{s.name ?? "Anonymous"}</p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-slate-strong">
                  {s.email ?? "—"}
                </p>
              </div>
              <Badge>{kindLabel[s.kind]}</Badge>
              <p className="hidden max-w-md flex-1 truncate text-[11.5px] text-slate-strong md:block">
                {s.message ?? "—"}
              </p>
              <span className="font-mono text-[10px] text-slate-strong">
                {timeAgo(s.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="panel-foot" style={{ justifyContent: "space-between" }}>
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
