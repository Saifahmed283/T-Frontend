import { useEffect, useState } from "react"
import { Inbox, Download, Trash2, ChevronLeft, ChevronRight, Eye, X } from "lucide-react"

import type { Submission, SubmissionKind, SubmissionStatus } from "@/lib/api"
import { api } from "@/lib/api"
import { useSubmissions } from "../hooks/useSubmissions"
import { messageForError } from "@/lib/messages"
import { useToastActions } from "../ui"
import { SkeletonRegion, SkeletonRows } from "@/components/ui"
import { Badge, Button, Field, Heading, Modal, Textarea } from "../ui"
import { Empty, timeAgo } from "../shared"

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

const statusOrder: SubmissionStatus[] = ["NEW", "IN_REVIEW", "APPROVED", "REJECTED", "ARCHIVED"]

const statusTone: Record<SubmissionStatus, "neutral" | "warning" | "success" | "brand"> = {
  NEW: "brand",
  IN_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "neutral",
  ARCHIVED: "neutral",
}

export function SubmissionsPage({ isAdmin }: { isAdmin: boolean }) {
  const {
    items,
    loading,
    error: hookError,
    kind,
    setKind,
    status,
    setStatus,
    page,
    setPage,
    totalPages,
    reload,
  } = useSubmissions(isAdmin)

  const [stats, setStats] = useState<Record<string, number>>({})
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<Submission | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [statusBusy, setStatusBusy] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState<string | null>(null)
  const [exportBusy, setExportBusy] = useState(false)

  const { success, error: toastError } = useToastActions()

  // Load stats on mount
  useEffect(() => {
    if (isAdmin) {
      api.submissionStats().then(setStats).catch(() => {})
    }
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <section className="panel">
        <Empty icon={Inbox} title="Submissions are private">
          Sign in as an admin to read incoming contact, tender and registration submissions.
        </Empty>
      </section>
    )
  }

  const openDetail = async (s: typeof items[0]) => {
    setDetailItem(s)
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const full = await api.submissionGet(s.id)
      setDetailItem(full)
    } catch (e) {
      const { message } = messageForError(e)
      toastError(message)
    } finally {
      setDetailLoading(false)
    }
  }

  const changeStatus = async (newStatus: SubmissionStatus) => {
    if (!detailItem) return
    setStatusBusy(detailItem.id)
    try {
      await api.submissionUpdateStatus(detailItem.id, newStatus)
      setDetailItem((prev) => (prev ? { ...prev, status: newStatus } : null))
      await reload()
      const newStats = await api.submissionStats()
      setStats(newStats)
      success("Status updated")
    } catch (e) {
      const { message } = messageForError(e)
      toastError(message)
    } finally {
      setStatusBusy(null)
    }
  }

  const doDelete = async () => {
    if (!detailItem) return
    setDeleteBusy(detailItem.id)
    try {
      await api.submissionDelete(detailItem.id)
      setDetailOpen(false)
      await reload()
      const newStats = await api.submissionStats()
      setStats(newStats)
      success("Submission deleted")
    } catch (e) {
      const { message } = messageForError(e)
      toastError(message)
    } finally {
      setDeleteBusy(null)
    }
  }

  const exportCsv = async () => {
    setExportBusy(true)
    try {
      const all = await api.submissions({ kind, pageSize: 10000 })
      if (all.items.length === 0) {
        toastError("No submissions match the current filters")
        return
      }
      const headers = ["ID", "Kind", "Status", "Name", "Email", "Message", "Source", "Created At"]
      const rows = all.items.map((s) => [
        s.id,
        kindLabel[s.kind],
        s.status,
        s.name ?? "",
        s.email ?? "",
        (s.message ?? "").replace(/\n/g, " "),
        s.source ?? "",
        s.createdAt,
      ])
      const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `submissions-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      success("CSV exported")
    } catch (e) {
      const { message } = messageForError(e)
      toastError(message)
    } finally {
      setExportBusy(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>Submissions inbox</Heading>
          <p>Incoming contact, tender, registration and newsletter forms from the public site.</p>
        </div>
        <div className="panel-heading-actions">
          <Button variant="secondary" onClick={exportCsv} disabled={exportBusy}>
            {exportBusy ? "Exporting…" : <Download size={15} />}
          </Button>
        </div>
      </div>

      {/* Status tabs with counts */}
      <div className="status-tabs">
        <Button
          variant="ghost"
          className={status === undefined ? "selected" : ""}
          onClick={() => setStatus(undefined)}
        >
          All <span>{stats.NEW + stats.IN_REVIEW + stats.APPROVED + stats.REJECTED + stats.ARCHIVED || 0}</span>
        </Button>
        {statusOrder.map((st) => (
          <Button
            key={st}
            variant="ghost"
            className={status === st ? "selected" : ""}
            onClick={() => setStatus(st)}
          >
            {st} <span>{stats[st] ?? 0}</span>
          </Button>
        ))}
      </div>

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
              className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 last:border-0 cursor-pointer hover:bg-ivory-2"
              onClick={() => openDetail(s)}
            >
              <div className="min-w-0">
                <p className="text-xs font-medium">{s.name ?? "Anonymous"}</p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-slate-strong">
                  {s.email ?? "—"}
                </p>
              </div>
              <Badge>{kindLabel[s.kind]}</Badge>
              <Badge tone={statusTone[s.status]}>{s.status}</Badge>
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
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1 || loading}>
              <ChevronLeft size={14} />
            </Button>
            <Button variant="secondary" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages || loading}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {detailOpen && detailItem && (
        <Modal title={`${kindLabel[detailItem.kind]} — ${detailItem.name ?? "Anonymous"}`} onClose={() => setDetailOpen(false)} wide>
          {detailLoading ? (
            <div className="modal-body">
              <SkeletonRows rows={8} />
            </div>
          ) : (
            <div className="modal-body space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Kind"><p className="text-sm">{kindLabel[detailItem.kind]}</p></Field>
                <Field label="Status">
                  <Badge tone={statusTone[detailItem.status]}>{detailItem.status}</Badge>
                </Field>
                <Field label="Name"><p className="text-sm">{detailItem.name ?? "—"}</p></Field>
                <Field label="Email"><p className="text-sm">{detailItem.email ?? "—"}</p></Field>
                <Field label="Source"><p className="text-sm">{detailItem.source ?? "—"}</p></Field>
                <Field label="Created"><p className="text-sm">{new Date(detailItem.createdAt).toLocaleString()}</p></Field>
              </div>
              <Field label="Message">
                <p className="whitespace-pre-wrap text-sm">{detailItem.message ?? "—"}</p>
              </Field>
              {(() => {
                const payloadStr = detailItem.payload ? JSON.stringify(detailItem.payload as object, null, 2) : null
                return payloadStr ? (
                  <Field label="Payload">
                    <pre className="text-[10px] overflow-auto rounded border border-line bg-ivory-2 p-3 max-h-60">
                      {payloadStr}
                    </pre>
                  </Field>
                ) : null
              })()}
            </div>
          )}
          <div className="modal-foot">
            <div className="flex gap-2">
              {statusOrder.map((status) => (
                <Button
                  key={status}
                  variant={detailItem.status === status ? "primary" : "secondary"}
                  disabled={statusBusy === detailItem.id}
                  onClick={() => changeStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" onClick={() => setDetailOpen(false)}>
                <X size={15} /> Close
              </Button>
              <Button variant="ghost" className="text-danger" disabled={deleteBusy === detailItem.id} onClick={doDelete}>
                {deleteBusy === detailItem.id ? "Deleting…" : <Trash2 size={15} />}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  )
}