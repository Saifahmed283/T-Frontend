import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  Clock3,
  Database,
  FolderOpen,
  LockKeyhole,
  Network,
  ShieldCheck,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react"

import type { ActivityItem, ContentCounts } from "@/lib/api"

import { collections } from "../content-model"
import { Button, Heading } from "../ui"
import {
  collectionIcons,
  Empty,
  IconTile,
  timeAgo,
} from "../shared"

/* Overview — the pulse of the workspace.

   The band at the top is the only place we let the brand speak: it states what
   the workspace is for and shows four numbers that are read straight from the
   content API. Nothing here is illustrative; every figure is live. */

export function OverviewPage({
  counts,
  activity,
  onNavigate,
  onOpenEditor,
}: {
  counts: ContentCounts | null
  activity: ActivityItem[]
  onNavigate: (id: string) => void
  onOpenEditor: (collectionId: string) => void
}) {
  const metrics: {
    name: string
    icon: LucideIcon
    detail: string
    id: string
    value: number
  }[] = [
    {
      name: "Case studies",
      icon: FolderOpen,
      detail: "Evidence ready to share",
      id: "cases",
      value: counts?.byKind?.cases?.total ?? 0,
    },
    {
      name: "Publications",
      icon: BookOpen,
      detail: "Knowledge in the making",
      id: "publications",
      value: counts?.byKind?.publications?.total ?? 0,
    },
    {
      name: "Instruments",
      icon: Network,
      detail: "Methods in practice",
      id: "instruments",
      value: counts?.byKind?.instruments?.total ?? 0,
    },
    {
      name: "Experts",
      icon: Users,
      detail: "Advisory & delivery network",
      id: "experts",
      value: counts?.byKind?.experts?.total ?? 0,
    },
  ]

  const pipeline = [
    { status: "DRAFT", label: "Draft" },
    { status: "REVIEW", label: "In review" },
    { status: "APPROVED", label: "Approved" },
    { status: "SCHEDULED", label: "Scheduled" },
    { status: "PUBLISHED", label: "Published" },
    { status: "UNPUBLISHED", label: "Unpublished" },
    { status: "ARCHIVED", label: "Archived" },
  ] as const

  const stats = [
    { label: "Records", value: counts?.total ?? 0 },
    { label: "Published", value: counts?.byStatus?.PUBLISHED ?? 0 },
    { label: "In review", value: counts?.byStatus?.REVIEW ?? 0 },
    { label: "Collections", value: collections.length },
  ]

  return (
    <>
      <section className="pulse">
        <div className="pulse-copy">
          <div className="eyebrow">Good content. Lasting impact.</div>
          <h2>
            Your evidence, <em>connected.</em>
          </h2>
          <p>
            From the first draft to the published page — one place to hold the
            TerraMorph story and the proof behind it.
          </p>
          <Button
            className="pulse-link"
            variant="ghost"
            onClick={() => onNavigate("content")}
          >
            Explore your content
            <ArrowRight size={15} />
          </Button>
        </div>

        <div className="pulse-stats">
          {stats.map((s) => (
            <div className="pulse-stat" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="connection-notice">
        <span className="notice-mark">
          <Database size={15} />
        </span>
        <p>
          <strong>Live workspace connected.</strong> Edits you save here are
          written to the content API and become available to the public site.
        </p>
      </div>

      <div className="section-label">
        <span>Content at a glance</span>
        <span className="live-label">
          <span className="complete-dot" />
          Live
        </span>
      </div>

      <div className="metric-grid">
        {metrics.map((m) => (
          <Button
            variant="ghost"
            className="metric-card"
            key={m.id}
            onClick={() => onNavigate(m.id)}
          >
            <div className="metric-top">
              <span>{m.name}</span>
              <m.icon size={17} strokeWidth={1.5} />
            </div>
            <strong className="metric-value">{m.value}</strong>
            <div className="metric-bottom">
              <span>{m.detail}</span>
              <ArrowUpRight size={14} />
            </div>
          </Button>
        ))}
      </div>

      <div className="dashboard-columns">
        <div className="content-column">
          <section className="panel collections-panel">
            <div className="panel-heading">
              <div>
                <Heading level={2}>Content collections</Heading>
                <p>The building blocks of your website.</p>
              </div>
              <Button
                variant="ghost"
                className="text-link"
                onClick={() => onNavigate("content")}
              >
                View all
                <ArrowRight size={14} />
              </Button>
            </div>

            <div className="collection-table">
              <div className="collection-table-head">
                <span>Collection</span>
                <span>Records</span>
                <span>Languages</span>
                <span />
              </div>
              {collections.slice(0, 5).map((c) => (
                <Button
                  variant="ghost"
                  className="collection-row"
                  key={c.id}
                  onClick={() => onNavigate(c.id)}
                >
                  <div className="collection-title">
                    <IconTile small icon={collectionIcons[c.id]} />
                    <div>
                      <strong>{c.name}</strong>
                      <span>{c.description}</span>
                    </div>
                  </div>
                  <span className="record-count">
                    {counts?.byKind?.[c.id]?.total ?? 0}
                  </span>
                  <ChevronRight size={15} />
                </Button>
              ))}
            </div>

            <div className="panel-foot">
              <LockKeyhole size={12} />
              <span>Records are read from the content API.</span>
            </div>
          </section>

          <section className="panel workflow-panel">
            <div className="panel-heading">
              <div>
                <Heading level={2}>Publishing pipeline</Heading>
                <p>A considered path from draft to public.</p>
              </div>
              <Workflow size={18} strokeWidth={1.5} />
            </div>

            <div className="pipeline">
              {pipeline.map((s, i) => (
                <div className="pipeline-step" key={s.status}>
                  <div className={`pipeline-dot step-${i}`} />
                  <strong>{counts?.byStatus?.[s.status] ?? 0}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="pipeline-footer">
              <span>
                <Clock3 size={13} />
                Schedule publishes from any record
              </span>
              <Button
                variant="ghost"
                className="text-link"
                onClick={() => onNavigate("workflow")}
              >
                View workflow
                <ArrowRight size={13} />
              </Button>
            </div>
          </section>
        </div>

        <div className="right-column">
          <section className="panel activity-panel">
            <div className="panel-heading">
              <div>
                <Heading level={2}>Recent activity</Heading>
                <p>The audit trail, newest first.</p>
              </div>
              <Button
                variant="ghost"
                className="icon-button"
                aria-label="View activity log"
                onClick={() => onNavigate("activity")}
              >
                <ArrowUpRight size={16} />
              </Button>
            </div>

            {activity.length > 0 ? (
              <ul className="activity-list">
                {activity.slice(0, 4).map((a) => (
                  <li key={a.id}>
                    <span>{timeAgo(a.createdAt)}</span>
                    <div>
                      <p>{a.message}</p>
                      {a.user?.name && (
                        <p className="field-hint">
                          {a.user.name}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon={Clock3} title="Your story starts here">
                Edits, reviews and publishing activity will appear here.
              </Empty>
            )}
          </section>

          <section className="publishing-card">
            <div className="publishing-card-title">
              <ShieldCheck size={18} strokeWidth={1.5} />
              <span>Publish with confidence</span>
            </div>
            <h2>
              A little care.
              <br />A stronger publication.
            </h2>
            <div className="checklist">
              {[
                "Add English and Arabic content",
                "Connect related evidence",
                "Verify sources and permissions",
                "Preview, review, then publish",
              ].map((s, i) => (
                <div key={s}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </div>
              ))}
            </div>
            <Button variant="ghost" onClick={() => onOpenEditor("cases")}>
              Start a case study
              <ArrowUpRight size={14} />
            </Button>
          </section>
        </div>
      </div>

      <div className="network-strip">
        <div>
          <Users size={18} strokeWidth={1.5} />
          <span>
            <strong>Your network, in one place</strong>
            <span>Manage people, partnerships and learning.</span>
          </span>
        </div>
        {[
          { name: "Courses", id: "courses" },
          { name: "Experts", id: "experts" },
          { name: "Partners", id: "partners" },
        ].map((item) => (
          <Button
            variant="ghost"
            key={item.id}
            onClick={() => onNavigate(item.id)}
          >
            <span>{item.name}</span>
            <strong>{counts?.byKind?.[item.id]?.total ?? 0}</strong>
            <ArrowUpRight size={13} />
          </Button>
        ))}
      </div>
    </>
  )
}
