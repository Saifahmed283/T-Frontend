import { useEffect, useState } from "react"
import { ShieldCheck, Trash2, Edit3, Pause } from "lucide-react"

import { api, type Member, type MemberRole } from "@/lib/api"

import { Badge, Button, Field, Heading, Input, Modal, Select } from "../ui"
import { Empty, initials } from "../shared"

/* Users & roles — who can access this workspace, what they can do, and how
   an admin manages them: edit info, change role, suspend, delete. */

const tone: Record<MemberRole, "brand" | "warning" | "neutral"> = {
  admin: "brand",
  lead: "warning",
  member: "neutral",
}

export function UsersPage({ canEdit }: { canEdit: boolean }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editBusy, setEditBusy] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const [suspendBusy, setSuspendBusy] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.members()
      setMembers(res.items)
    } catch {
      setError("Failed to load members")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setRole = async (m: Member, role: MemberRole) => {
    setMembers((list) =>
      list.map((x) => (x.userId === m.userId ? { ...x, role } : x)),
    )
    try {
      await api.updateMemberRole(m.userId, role)
    } catch {
      setError("Could not update role")
      void load()
    }
  }

  const editInfo = async (m: Member) => {
    setEditMember(m)
    setEditName(m.name)
    setEditEmail(m.email)
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!editMember) return
    setEditBusy(true)
    try {
      await api.updateMemberInfo(editMember.userId, {
        name: editName,
        email: editEmail,
      })
      setMembers((list) =>
        list.map((x) =>
          x.userId === editMember!.userId
            ? { ...x, name: editName, email: editEmail }
            : x,
        ),
      )
      setEditOpen(false)
    } catch {
      setError("Could not save changes")
    } finally {
      setEditBusy(false)
    }
  }

  const suspendMember = async (m: Member) => {
    setSuspendBusy(m.userId)
    try {
      await api.suspendMember(m.userId)
      setMembers((list) =>
        list.map((x) =>
          x.userId === m.userId ? { ...x, role: "member" as MemberRole } : x,
        ),
      )
    } catch {
      setError("Could not suspend member")
    } finally {
      setSuspendBusy(null)
    }
  }

  const confirmDelete = (userId: string) => {
    setDeleteTarget(userId)
    setDeleteOpen(true)
  }

  const doDelete = async () => {
    if (!deleteTarget) return
    setDeleteBusy(true)
    try {
      await api.deleteMember(deleteTarget)
      setMembers((list) => list.filter((x) => x.userId !== deleteTarget))
      setDeleteOpen(false)
    } catch {
      setError("Could not delete member")
    } finally {
      setDeleteBusy(false)
      setDeleteTarget(null)
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>Users & roles</Heading>
          <p>Who can access this workspace and what they can do.</p>
        </div>
        <ShieldCheck size={18} strokeWidth={1.5} />
      </div>

      {error ? (
        <p className="panel-foot is-error" role="alert">
          {error}
        </p>
      ) : loading ? (
        <div className="p-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="mb-3 h-12 w-full animate-pulse rounded-lg border border-line bg-ivory-2"
            />
          ))}
        </div>
      ) : members.length === 0 ? (
        <Empty icon={ShieldCheck} title="Only you so far">
          Invite teammates from your account settings to collaborate here.
        </Empty>
      ) : (
        <ul>
          {members.map((m) => (
            <li
              key={m.userId}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 last:border-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-line bg-surface-2 font-mono text-[10px] tracking-wide text-gold-strong">
                  {initials(m.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{m.name}</p>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-slate-strong">
                    {m.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={tone[m.role]}>{m.role}</Badge>
                {canEdit && (
                  <>
                    <Button
                      variant="ghost"
                      className="icon-button"
                      disabled={editBusy}
                      onClick={() => editInfo(m)}
                      aria-label={`Edit ${m.name}`}
                    >
                      <Edit3 size={15} />
                    </Button>
                    <Select
                      value={m.role}
                      disabled={!canEdit}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        void setRole(m, e.target.value as MemberRole)
                      }
                      aria-label={`Role for ${m.name}`}
                    >
                      <option value="admin">Admin</option>
                      <option value="lead">Lead</option>
                      <option value="member">Member</option>
                    </Select>
                    <Button
                      variant="ghost"
                      disabled={suspendBusy === m.userId || !canEdit}
                      onClick={() => suspendMember(m)}
                      aria-label={`Suspend ${m.name}`}
                    >
                      {suspendBusy === m.userId ? (
                        <span className="animate-pulse" />
                      ) : (
                        <>
                          <Pause size={15} />
                          Suspend
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-danger"
                      disabled={deleteBusy || !canEdit}
                      onClick={() => confirmDelete(m.userId)}
                      aria-label={`Delete ${m.name}`}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {editOpen && editMember && (
        <Modal title={`Edit ${editMember.name}`} onClose={() => setEditOpen(false)}>
          <div className="modal-body">
            <Field label="Name" required>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={editBusy}
              />
            </Field>
            <Field label="Email" required>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                disabled={editBusy}
              />
            </Field>
          </div>
          <div className="modal-foot">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={editBusy || !editName || !editEmail}
              onClick={() => void saveEdit()}
            >
              {editBusy ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </Modal>
      )}

      {deleteOpen && deleteTarget && (
        <Modal title="Remove member" onClose={() => setDeleteOpen(false)}>
          <div className="modal-body">
            <p>
              Remove this member from the workspace? They will lose access and
              their records will be unassigned.
            </p>
          </div>
          <div className="modal-foot">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="ghost"
              className="text-danger"
              disabled={deleteBusy}
              onClick={() => void doDelete()}
            >
              {deleteBusy ? "Removing…" : "Delete member"}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  )
}
