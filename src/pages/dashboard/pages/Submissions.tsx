import { useMemo, useState } from "react"
import { Inbox } from "lucide-react"

import type { Submission, SubmissionKind } from "@/lib/api"

import { Badge, Button } from "../ui"
import { Empty, timeAgo } from "../shared"

/* Submissions — incoming contact, tender, registration and newsletter forms
   from the public site. Admin-only. */

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

export function SubmissionsPage({
  submissions,
  isAdmin,
}: {
  submissions: Submission[] | null
  isAdmin: boolean
}) {
  const [kind, setKind] = useState<"All" | SubmissionKind>("All")

  const kindsPresent = useMemo(() => {
    const set = new Set<SubmissionKind>()
    for (const s of submissions ?? []) set.add(s.kind)
    return Array.from(set)
  }, [submissions])

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

  const rows = (submissions ?? []).filter(
    (s) => kind === "All" || s.kind === kind,
  )

  return (
    <section className="panel">
      <div className="status-tabs">
        <Button
          variant="ghost"
          className={kind === "All" ? "selected" : ""}
          onClick={() => setKind("All")}
        >
          All <span>{submissions?.length ?? 0}</span>
        </Button>
        {kindsPresent.map((k) => (
          <Button
            key={k}
            variant="ghost"
            className={kind === k ? "selected" : ""}
            onClick={() => setKind(k)}
          >
            {kindLabel[k]}
            <span>
              {(submissions ?? []).filter((s) => s.kind === k).length}
            </span>
          </Button>
        ))}
      </div>

      {rows.length === 0 ? (
        <Empty icon={Inbox} title="Nothing here yet">
          New submissions from the public site will appear here.
        </Empty>
      ) : (
        <ul>
          {rows.map((s) => (
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
    </section>
  )
}
