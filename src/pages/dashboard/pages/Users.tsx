import { useEffect, useState } from "react"
import { ShieldCheck, Trash2, Edit3, Pause, Play, UserPlus, X } from "lucide-react"

import { api, type Member, type MemberRole } from "@/lib/api"
import { messageForError } from "@/lib/messages"
import { useToastActions } from "../ui"

import { Badge, Button, Field, Heading, Input, Modal, Select } from "../ui"
import { Empty, initials } from "../shared"

const tone: Record<MemberRole, "brand" | "warning" | "neutral"> = {
  admin: "brand",
  lead: "warning",
  member: "neutral",
}

export function UsersPage({ canEdit }: { canEdit: boolean }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const [editOpen, setEditOpen] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editBusy, setEditBusy] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const [suspendBusy, setSuspendBusy] = useState<string | null>(null)

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteBusy, setInviteBusy] = useState(false)
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<MemberRole>("member")
  const [inviteResult, setInviteResult] = useState<{ tempPassword: string | null } | null>(null)

  const { success, error: toastError } = useToastActions()

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.members()
      setMembers(res.items)
    } catch (ex) {
      const { message } = messageForError(ex)
      toastError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const setRole = async (m: Member, role: MemberRole) => {
    setMembers((list) =>
      list.map((x) => (x.userId === m.userId ? { ...x, role } : x)),
    )
    try {
      await api.updateMemberRole(m.userId, role)
      success("Role updated")
    } catch (ex) {
      const { message } = messageForError(ex)
      toastError(message)
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
      success("Changes saved")
      setEditOpen(false)
    } catch (ex) {
      const { message } = messageForError(ex)
      toastError(message)
    } finally {
      setEditBusy(false)
    }
  }

  const doSuspend = async (m: Member) => {
    setSuspendBusy(m.userId)
    try {
      const res = await api.suspendMember(m.userId)
      setMembers((list) =>
        list.map((x) =>
          x.userId === m.userId ? { ...x, suspendedAt: res.suspendedAt } : x,
        ),
      )
      success("Member suspended")
    } catch (ex) {
      const { message } = messageForError(ex)
      toastError(message)
    } finally {
      setSuspendBusy(null)
    }
  }

  const doResume = async (m: Member) => {
    setSuspendBusy(m.userId)
    try {
      const res = await api.resumeMember(m.userId)
      setMembers((list) =>
        list.map((x) =>
          x.userId === m.userId ? { ...x, suspendedAt: res.suspendedAt } : x,
        ),
      )
      success("Member resumed")
    } catch (ex) {
      const { message } = messageForError(ex)
      toastError(message)
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
      success("Member removed")
      setDeleteOpen(false)
    } catch (ex) {
      const { message } = messageForError(ex)
      toastError(message)
    } finally {
      setDeleteBusy(false)
      setDeleteTarget(null)
    }
  }

  const openInvite = () => {
    setInviteName("")
    setInviteEmail("")
    setInviteRole("member")
    setInviteResult(null)
    setInviteOpen(true)
  }

  const doInvite = async () => {
    if (!inviteName || !inviteEmail) return
    setInviteBusy(true)
    try {
      const res = await api.inviteMember({ email: inviteEmail, name: inviteName, role: inviteRole })
      setInviteResult({ tempPassword: res.tempPassword })
      success(res.tempPassword ? "Invitation sent — share the temporary password securely" : "Member added")
      await load()
    } catch (ex) {
      const { message } = messageForError(ex)
      toastError(message)
    } finally {
      setInviteBusy(false)
    }
  }

  const isSelf = (m: Member) => m.userId === members.find((x) => x.email === m.email)?.userId

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>Users & roles</Heading>
          <p>Who can access this workspace and what they can do.</p>
        </div>
        {canEdit && (
          <Button variant="primary" onClick={openInvite}>
            <UserPlus size={15} />
            Invite member
          </Button>
        )}
        <ShieldCheck size={18} strokeWidth={1.5} />
      </div>

      {loading ? (
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
          {canEdit ? (
            <Button variant="primary" onClick={openInvite}>
              <UserPlus size={15} />
              Invite your first teammate
            </Button>
          ) : (
            <p>Ask an admin to invite teammates.</p>
          )}
        </Empty>
      ) : (
        <ul>
          {members.map((m) => (
            <li
              key={m.userId}
              className={`flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 last:border-0 ${m.suspendedAt ? "opacity-50" : ""}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-line bg-surface-2 font-mono text-[10px] tracking-wide text-gold-strong">
                  {initials(m.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">
                    {m.name}
                    {m.suspendedAt && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded bg-warning/10 px-1.5 py-0.5 text-xs text-warning-strong">
                        <Pause size={10} /> Suspended
                      </span>
                    )}
                  </p>
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
                      disabled={editBusy || !!m.suspendedAt}
                      onClick={() => editInfo(m)}
                      aria-label={`Edit ${m.name}`}
                    >
                      <Edit3 size={15} />
                    </Button>
                    {!m.suspendedAt ? (
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
                    ) : null}
                    {!m.suspendedAt ? (
                      <Button
                        variant="ghost"
                        disabled={suspendBusy === m.userId || !canEdit}
                        onClick={() => doSuspend(m)}
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
                    ) : (
                      <Button
                        variant="ghost"
                        disabled={suspendBusy === m.userId || !canEdit}
                        onClick={() => doResume(m)}
                        aria-label={`Resume ${m.name}`}
                      >
                        {suspendBusy === m.userId ? (
                          <span className="animate-pulse" />
                        ) : (
                          <>
                            <Play size={15} />
                            Resume
                          </>
                        )}
                      </Button>
                    )}
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

      {inviteOpen && (
        <Modal title="Invite member" onClose={() => setInviteOpen(false)}>
          {inviteResult ? (
            <div className="modal-body space-y-4">
              <div className="p-4 rounded border border-line bg-ivory-2">
                <p className="text-sm font-medium">Invitation sent!</p>
                <p className="mt-1 text-xs text-slate-strong">
                  {inviteResult.tempPassword ? (
                    <>
                      A temporary password has been generated. Share it securely with the new member:
                      <div className="mt-2 flex items-center gap-2">
                        <code className="flex-1 rounded border border-line bg-ivory px-2 py-1 font-mono text-xs">
                          {inviteResult.tempPassword}
                        </code>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(inviteResult.tempPassword || "")
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </>
                  ) : (
                    "The user already had an account. They can sign in with their existing password."
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="modal-body space-y-4">
              <Field label="Name" required>
                <Input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  disabled={inviteBusy}
                  autoFocus
                />
              </Field>
              <Field label="Email" required>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={inviteBusy}
                />
              </Field>
              <Field label="Role" required>
                <Select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                  disabled={inviteBusy}
                >
                  <option value="member">Member</option>
                  <option value="lead">Lead</option>
                  <option value="admin">Admin</option>
                </Select>
              </Field>
              <p className="text-xs text-slate-strong">
                {inviteResult === null && (
                  <>
                    If the email is new, a temporary password will be generated and shown once.
                    If the user exists, they will be added with their existing password.
                  </>
                )}
              </p>
            </div>
          )}
          <div className="modal-foot">
            {inviteResult ? (
              <Button variant="primary" onClick={() => setInviteOpen(false)}>
                Done
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={inviteBusy || !inviteName || !inviteEmail}
                  onClick={() => void doInvite()}
                >
                  {inviteBusy ? "Inviting…" : "Send invitation"}
                </Button>
              </>
            )}
          </div>
        </Modal>
      )}
    </section>
  )
}