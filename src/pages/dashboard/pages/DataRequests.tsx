import { useCallback, useEffect, useState } from "react"
import { Plus, Search, X, FileText, Download, Trash2, AlertCircle, CheckCircle, Clock, RefreshCw, AlertTriangle } from "lucide-react"

import { api, type DataSubjectRequest, type DataRequestType } from "@/lib/api"
import { messageForError } from "@/lib/messages"
import { useToastActions } from "../ui"

import { Badge, Button, Field, Heading, Input, Modal, Select, Textarea } from "../ui"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui"
import { Empty } from "../shared"

const TYPE_LABELS: Record<DataRequestType, string> = {
  ACCESS: "Access my data",
  RECTIFICATION: "Correct my data",
  ERASURE: "Delete my data",
  RESTRICTION: "Restrict processing",
  PORTABILITY: "Port my data",
  OBJECTION: "Object to processing",
  WITHDRAW_CONSENT: "Withdraw consent",
}

const STATUS_LABELS: Record<DataSubjectRequest["status"], string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
}

const STATUS_TONES: Record<DataSubjectRequest["status"], "neutral" | "warning" | "success" | "brand" | "error"> = {
  PENDING: "warning",
  IN_PROGRESS: "brand",
  COMPLETED: "success",
  REJECTED: "error",
}

const PAGE_SIZE = 20

export function DataRequestsPage({ canEdit }: { canEdit: boolean }) {
  const [requests, setRequests] = useState<DataSubjectRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<DataSubjectRequest | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DataSubjectRequest | null>(null)

  const [formData, setFormData] = useState<{
    type: DataRequestType
    email: string
    name: string
    details: string
  }>({
    type: "ACCESS",
    email: "",
    name: "",
    details: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { success, error: toastError } = useToastActions()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.dataRequests({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      setRequests(res.items)
      setTotalPages(res.pagination.totalPages)
      setTotal(res.pagination.total)
    } catch (e) {
      const { message } = messageForError(e)
      toastError(message)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    if (canEdit) {
      void load()
    } else {
      setLoading(false)
    }
  }, [load, canEdit])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.email) errors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Enter a valid email address"
    if (!formData.type) errors.type = "Select a request type"
    if (formData.type === "RECTIFICATION" && !formData.details) {
      errors.details = "Details are required for rectification requests"
    }
    if (formData.type === "ERASURE" && !formData.details) {
      errors.details = "Please explain the reason for erasure request"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setFormData((prev) => ({ ...prev, email: prev.email.trim() }))

    try {
      if (editing) {
        await api.dataRequestUpdate(editing.id, formData)
        success("Request updated")
      } else {
        await api.dataRequestCreate(formData)
        success("Request submitted")
      }
      setShowCreate(false)
      setEditing(null)
      setFormData({ type: "ACCESS", email: "", name: "", details: "" })
      setFormErrors({})
      await load()
    } catch (e) {
      const { message } = messageForError(e)
      toastError(message)
    }
  }

  const handleDelete = async (id: string) => {
    const req = requests.find(r => r.id === id)
    if (req) {
      setDeleteConfirm(req)
      return
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(deleteConfirm.id)
    try {
      await api.dataRequestDelete(deleteConfirm.id)
      success("Request deleted")
      await load()
    } catch (e) {
      const { message } = messageForError(e)
      toastError(message)
    } finally {
      setDeleting(null)
      setDeleteConfirm(null)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setFormData({ type: "ACCESS", email: "", name: "", details: "" })
    setFormErrors({})
    setShowCreate(true)
  }

  const openEdit = (request: DataSubjectRequest) => {
    setEditing(request)
    setFormData({
      type: request.type,
      email: request.email,
      name: request.name ?? "",
      details: request.details ?? "",
    })
    setFormErrors({})
    setShowCreate(true)
  }

  const exportRequest = async (request: DataSubjectRequest) => {
    try {
      // Trigger a data export for this request
      const data = await api.dataRequestExport(request.id)

      // Create and download the export file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `terramorph-data-export-${request.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      success(`Data export downloaded for ${request.email}`)
    } catch (e) {
      const { message } = messageForError(e)
      toastError(message)
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>Data Subject Requests</Heading>
          <p>Manage GDPR/PDPL data subject requests: access, rectification, erasure, and more.</p>
        </div>
        {canEdit && (
          <Button variant="primary" onClick={openCreate}>
            <Plus size={15} /> New Request
          </Button>
        )}
      </div>

      <div className="collection-toolbar">
        <div className="search-field">
          <Search size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests..."
            aria-label="Search data requests"
          />
        </div>
        <Field label="Status">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </Select>
        </Field>
      </div>

      {loading && requests.length === 0 ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 w-full animate-pulse bg-ivory-2 rounded" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Empty icon={FileText} title="No requests yet">
          <p>Data subject requests will appear here.</p>
          {canEdit && (
            <Button className="mt-2" onClick={openCreate}>
              <Plus size={15} /> Submit your first request
            </Button>
          )}
        </Empty>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <span className="font-medium text-navy">{TYPE_LABELS[req.type]}</span>
                    </TableCell>
                    <TableCell>{req.email}</TableCell>
                    <TableCell>{req.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge tone={STATUS_TONES[req.status]}>
                        {STATUS_LABELS[req.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] tracking-wide text-slate-strong">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(req)}
                            aria-label={`Edit ${TYPE_LABELS[req.type]}`}
                          >
                            <FileText size={14} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportRequest(req)}
                          aria-label="Export data"
                        >
                          <Download size={14} />
                        </Button>
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger"
                            disabled={deleting === req.id || (deleteConfirm !== null && deleteConfirm.id !== req.id)}
                            onClick={() => handleDelete(req.id)}
                            aria-label={`Delete ${TYPE_LABELS[req.type]}`}
                          >
                            {deleteConfirm?.id === req.id ? (
                              <>
                                <AlertTriangle size={14} className="animate-pulse" /> Confirm
                              </>
                            ) : deleting === req.id ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="panel-foot" style={{ justifyContent: "space-between" }}>
              <span>
                Page {page} of {totalPages} · {total} total
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
        </>
      )}

      {showCreate && (
        <Modal
          title={editing ? "Edit Request" : "New Data Subject Request"}
          onClose={() => {
            setShowCreate(false)
            setEditing(null)
            setFormData({ type: "ACCESS", email: "", name: "", details: "" })
            setFormErrors({})
          }}
          wide
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Request Type" error={formErrors.type} required>
              <Select
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as DataRequestType }))}
              >
                <option value="ACCESS">Access my data</option>
                <option value="RECTIFICATION">Correct my data</option>
                <option value="ERASURE">Delete my data</option>
                <option value="RESTRICTION">Restrict processing</option>
                <option value="PORTABILITY">Port my data</option>
                <option value="OBJECTION">Object to processing</option>
                <option value="WITHDRAW_CONSENT">Withdraw consent</option>
              </Select>
            </Field>

            <Field label="Email" error={formErrors.email} required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </Field>

            <Field label="Name" error={formErrors.name}>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
              />
            </Field>

            <Field label="Details" error={formErrors.details} hint="Required for rectification and erasure requests">
              <Textarea
                rows={4}
                value={formData.details}
                onChange={(e) => setFormData((prev) => ({ ...prev, details: e.target.value }))}
                placeholder="Additional context or specific data points..."
              />
            </Field>

            <div className="flex justify-end gap-2 pt-4 border-t border-line">
              <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {editing ? "Save Changes" : "Submit Request"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal
          title="Confirm Deletion"
          onClose={() => setDeleteConfirm(null)}
          wide
        >
          <div className="space-y-4">
            <p>Are you sure you want to delete this data subject request?</p>
            <p className="text-sm text-navy-2">
              <strong>Type:</strong> {TYPE_LABELS[deleteConfirm.type]} &nbsp;|&nbsp;
              <strong>Email:</strong> {deleteConfirm.email}
            </p>
            <p className="text-sm text-slate">
              This action cannot be undone. The request record will be permanently removed.
            </p>
            <div className="flex justify-end gap-2 pt-4 border-t border-line">
              <Button type="button" variant="secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button type="button" variant="secondary" disabled={deleting === deleteConfirm?.id} onClick={confirmDelete}>
                {deleting === deleteConfirm?.id ? (
                  <span className="flex items-center gap-2"><RefreshCw size={14} className="animate-spin" /> Deleting...</span>
                ) : (
                  "Delete Request"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  )
}

export default DataRequestsPage