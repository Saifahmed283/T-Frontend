import { useEffect, useMemo, useState } from "react"

import {
  ArrowLeft,
  Check,
  Languages,
  LockKeyhole,
  Monitor,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react"

import {
  api,
  approverTargets,
  contentTransitions,
  type ContentItemDetail,
  type ContentStatus,
} from "@/lib/api"

import type { Collection, FieldDefinition } from "./content-model"

import {
  Badge,
  Button,
  Field,
  Heading,
  Input,
  Modal,
  Select,
  Textarea,
} from "./ui"

type Localized = {
  en: string

  ar: string
}

const statusTone: Record<ContentStatus, "neutral" | "warning" | "success" | "brand"> =
  {
    DRAFT: "neutral",

    REVIEW: "warning",

    APPROVED: "brand",

    SCHEDULED: "brand",

    PUBLISHED: "success",

    UNPUBLISHED: "warning",

    ARCHIVED: "neutral",
  }

function emptyData(fields: FieldDefinition[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  for (const f of fields) out[f.key] = f.localized ? { en: "", ar: "" } : ""

  return out
}

function asLocalized(v: unknown): Localized {
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>

    return { en: String(o.en ?? ""), ar: String(o.ar ?? "") }
  }

  return { en: v == null ? "" : String(v), ar: "" }
}

function asSeo(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? { ...v as Record<string, unknown> } : {}
}

export function ContentEditor({
  collection,

  itemId,

  isApprover,

  onClose,

  onSaved,
}: {
  collection: Collection

  itemId?: string

  isApprover: boolean

  onClose: () => void

  onSaved: () => void
}) {
  const isEdit = Boolean(itemId)

  const [detail, setDetail] = useState<ContentItemDetail | null>(null)

  const [data, setData] = useState<Record<string, unknown>>(() =>
    emptyData(collection.fields),
  )

  const [seo, setSeo] = useState<Record<string, unknown>>({})

  const [slug, setSlug] = useState("")

  const [sourceReference, setSourceReference] = useState("")

  const [scheduledPublishAt, setScheduledPublishAt] = useState("")

  const [scheduledUnpublishAt, setScheduledUnpublishAt] = useState("")

  const [language, setLanguage] = useState<"en" | "ar">("en")

  const [tab, setTab] = useState<"Content" | "SEO" | "Publishing">("Content")

  const [preview, setPreview] = useState(false)

  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")

  const [loading, setLoading] = useState(isEdit)

  const [busy, setBusy] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!itemId) {
      setData(emptyData(collection.fields))

      setLoading(false)

      return
    }

    let active = true

    setLoading(true)

    const run = async () => {
      try {
        const item: ContentItemDetail | null = await api.contentGet(
          collection.id,

          itemId,
        )

        if (!active) return

        setDetail(item)

        setData(
          item
            ? { ...emptyData(collection.fields), ...item.data }
            : emptyData(collection.fields),
        )

        setSeo(asSeo(item?.seo))

        setSlug(item?.slug ?? "")

        setSourceReference(item?.sourceReference ?? "")

        setScheduledPublishAt(item?.scheduledPublishAt?.slice(0, 16) ?? "")

        setScheduledUnpublishAt(item?.scheduledUnpublishAt?.slice(0, 16) ?? "")

        setError(item ? null : "Record not found")
      } catch {
        if (active) setError("Failed to load record")
      } finally {
        if (active) setLoading(false)
      }
    }

    void run()

    return () => {
      active = false
    }
  }, [collection, itemId])

  const localizedRequired = collection.fields.filter(
    (f) => f.localized && f.required,
  )

  const languageComplete = (locale: "en" | "ar") =>
    localizedRequired.length > 0 &&
    localizedRequired.every((f) => asLocalized(data[f.key])[locale].trim())

  const titleValue = useMemo(() => {
    const t = asLocalized(data.title)

    return (
      (language === "ar" ? t.ar : t.en) ||
      (language === "ar" ? "عنوان المحتوى" : "Untitled content")
    )
  }, [data, language])

  const setField = (key: string, value: unknown) =>
    setData((d) => ({ ...d, [key]: value }))

  const setLocalized = (key: string, lang: "en" | "ar", value: string) =>
    setData((d) => ({ ...d, [key]: { ...asLocalized(d[key]), [lang]: value } }))

  const setSeoField = (key: string, value: unknown) =>
    setSeo((s) => ({ ...s, [key]: value }))

  const save = async () => {
    setBusy(true)

    setError(null)

    try {
      if (isEdit && itemId) {
        await api.contentUpdate(collection.id, itemId, {
          data,

          seo,

          slug: slug || undefined,

          sourceReference: sourceReference || null,

          scheduledPublishAt: scheduledPublishAt
            ? new Date(scheduledPublishAt).toISOString()
            : null,

          scheduledUnpublishAt: scheduledUnpublishAt
            ? new Date(scheduledUnpublishAt).toISOString()
            : null,
        })
      } else {
        await api.contentCreate(collection.id, {
          data,

          seo,

          slug: slug || undefined,

          sourceReference: sourceReference || null,

          scheduledPublishAt: scheduledPublishAt
            ? new Date(scheduledPublishAt).toISOString()
            : null,

          scheduledUnpublishAt: scheduledUnpublishAt
            ? new Date(scheduledUnpublishAt).toISOString()
            : null,
        })
      }

      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setBusy(false)
    }
  }

  const transition = async (to: ContentStatus) => {
    if (!itemId) return

    setBusy(true)

    setError(null)

    try {
      await api.contentTransition(collection.id, itemId, to)

      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transition failed")
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!itemId) return

    setBusy(true)

    setError(null)

    try {
      await api.contentDelete(collection.id, itemId)

      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed")
    } finally {
      setBusy(false)
    }
  }

  const transitions = detail ? (contentTransitions[detail.status] ?? []) : []

  return (
    <Modal
      wide
      title={
        preview
          ? "Draft layout preview"
          : `${isEdit ? "Edit" : "New"} ${collection.singular.toLowerCase()}`
      }
      onClose={onClose}
    >
      <div className="editor-topline">
        <Badge tone="success">
          {isEdit && detail ? detail.status : "New record"}
        </Badge>
        <span>
          <LockKeyhole size={13} />
          {isEdit && detail ? `slug /${detail.slug}` : "Not saved yet"}
        </span>
      </div>

      <div className="editor-controls">
        <div className="locale-switch">
          <Button
            variant="ghost"
            className={language === "en" ? "selected" : ""}
            onClick={() => setLanguage("en")}
          >
            English{" "}
            <span
              className={languageComplete("en") ? "complete-dot" : "muted-dot"}
            />
          </Button>
          <Button
            variant="ghost"
            className={language === "ar" ? "selected" : ""}
            onClick={() => setLanguage("ar")}
          >
            العربية{" "}
            <span
              className={languageComplete("ar") ? "complete-dot" : "muted-dot"}
            />
          </Button>
        </div>
        {preview ? (
          <div className="locale-switch">
            <Button
              variant="ghost"
              className={device === "desktop" ? "selected" : ""}
              aria-label="Desktop preview"
              onClick={() => setDevice("desktop")}
            >
              <Monitor size={18} />
            </Button>
            <Button
              variant="ghost"
              className={device === "mobile" ? "selected" : ""}
              aria-label="Mobile preview"
              onClick={() => setDevice("mobile")}
            >
              <Smartphone size={18} />
            </Button>
          </div>
        ) : (
          <span className="translation-note">
            <Languages size={15} />
            {language === "en" ? "English" : "Arabic"}:{" "}
            {languageComplete(language)
              ? "Required fields filled"
              : "Incomplete"}
          </span>
        )}
      </div>

      {!preview && (
        <div className="status-tabs editor-tabs">
          {(["Content", "SEO", "Publishing"] as const).map((t) => (
            <Button
              key={t}
              variant="ghost"
              className={tab === t ? "selected" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      )}

      <div className="editor-body">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 w-full animate-pulse bg-ivory-2" />
            ))}
          </div>
        ) : preview ? (
          <div
            className={`draft-preview ${
              device === "mobile" ? "mobile-preview" : ""
            }`}
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <div className="eyebrow">
              TERRAMORPH / {collection.singular.toUpperCase()}
            </div>
            <Heading level={1}>{titleValue}</Heading>
            <div className="preview-rule" />
            {collection.fields

              .filter((f) => f.key !== "title")

              .map((f) => {
                const value = f.localized
                  ? asLocalized(data[f.key])[language]
                  : String(data[f.key] ?? "")

                if (!value) return null

                return (
                  <section key={f.key}>
                    <Heading level={3}>{f.label}</Heading>
                    <p>{value}</p>
                  </section>
                )
              })}
            <div className="preview-note">
              Temporary layout preview only. This is not the public site.
            </div>
          </div>
        ) : tab === "Content" ? (
          <div
            className="editor-fields"
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            {collection.fields.map((f) => {
              if (f.localized) {
                const val = asLocalized(data[f.key])[language]

                return (
                  <Field
                    key={f.key}
                    label={`${f.label} · ${language.toUpperCase()}`}
                    hint={f.hint}
                    required={f.required}
                  >
                    {f.type === "textarea" ? (
                      <Textarea
                        rows={3}
                        value={val}
                        onChange={(e) =>
                          setLocalized(f.key, language, e.target.value)
                        }
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                      />
                    ) : (
                      <Input
                        type={
                          f.type === "url"
                            ? "url"
                            : f.type === "date"
                              ? "date"
                              : f.type === "number"
                                ? "number"
                                : "text"
                        }
                        value={val}
                        onChange={(e) =>
                          setLocalized(f.key, language, e.target.value)
                        }
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                      />
                    )}
                  </Field>
                )
              }

              const value = data[f.key] == null ? "" : String(data[f.key])

              return (
                <Field
                  key={f.key}
                  label={f.label}
                  hint={f.hint}
                  required={f.required}
                >
                  {f.type === "textarea" ? (
                    <Textarea
                      rows={3}
                      value={value}
                      onChange={(e) => setField(f.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      type={
                        f.type === "url"
                          ? "url"
                          : f.type === "date"
                            ? "date"
                            : f.type === "number"
                              ? "number"
                              : "text"
                      }
                      value={value}
                      onChange={(e) => setField(f.key, e.target.value)}
                    />
                  )}
                </Field>
              )
            })}
          </div>
        ) : tab === "SEO" ? (
          <>
            <Field
              label="Slug"
              hint="Leave blank to generate from the title. Changing a saved slug should create a redirect."
            >
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="stable-content-slug"
              />
            </Field>
            <Field label={`SEO title · ${language.toUpperCase()}`}>
              <Input
                maxLength={60}
                value={String(asLocalized(seo.seoTitle)[language] || "")}
                onChange={(e) =>
                  setSeoField("seoTitle", {
                    ...asLocalized(seo.seoTitle),

                    [language]: e.target.value,
                  })
                }
              />
            </Field>
            <Field label={`SEO description · ${language.toUpperCase()}`}>
              <Textarea
                maxLength={160}
                rows={3}
                value={String(asLocalized(seo.seoDescription)[language] || "")}
                onChange={(e) =>
                  setSeoField("seoDescription", {
                    ...asLocalized(seo.seoDescription),

                    [language]: e.target.value,
                  })
                }
              />
            </Field>
            <Field label="Canonical URL">
              <Input
                type="url"
                placeholder="https://"
                value={String(seo.canonical ?? "")}
                onChange={(e) => setSeoField("canonical", e.target.value)}
              />
            </Field>
            <Field label="Search engine visibility">
              <Select
                value={String(seo.index ?? "index")}
                onChange={(e) => setSeoField("index", e.target.value)}
              >
                <option value="index">Allow indexing</option>
                <option value="noindex">Noindex</option>
              </Select>
            </Field>
          </>
        ) : (
          <>
            {isEdit && detail && (
              <div className="editor-section-heading">
                <Heading level={3}>Workflow</Heading>
                <p>
                  Move this record through the publishing states. Approver
                  states are restricted to admin and lead roles.
                </p>
              </div>
            )}
            {isEdit && (
              <div className="publishing-actions">
                {transitions.map((to) => {
                  const needsApprover = approverTargets.includes(to)

                  return (
                    <Button
                      key={to}
                      variant={to === "PUBLISHED" ? "primary" : "secondary"}
                      disabled={busy || (needsApprover && !isApprover)}
                      title={
                        needsApprover && !isApprover
                          ? "Approver action"
                          : undefined
                      }
                      onClick={() => void transition(to)}
                    >
                      {to === "ARCHIVED"
                        ? "Archive"
                        : `Move to ${to.toLowerCase()}`}
                    </Button>
                  )
                })}
              </div>
            )}
            <Field label="Source / permission reference">
              <Input
                value={sourceReference}
                onChange={(e) => setSourceReference(e.target.value)}
                placeholder="Reference or supporting evidence"
              />
            </Field>
            <div className="two-fields">
              <Field label="Scheduled publish date">
                <Input
                  type="datetime-local"
                  value={scheduledPublishAt}
                  onChange={(e) => setScheduledPublishAt(e.target.value)}
                />
              </Field>
              <Field label="Scheduled unpublish date">
                <Input
                  type="datetime-local"
                  value={scheduledUnpublishAt}
                  onChange={(e) => setScheduledUnpublishAt(e.target.value)}
                />
              </Field>
            </div>
          </>
        )}
        {error && (
          <p className="field-hint is-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="editor-footer">
        <span>
          <LockKeyhole size={13} />
          Changes are saved to the live workspace
        </span>
        <div>
          <Button onClick={() => setPreview(!preview)}>
            {preview ? <ArrowLeft size={16} /> : <Monitor size={16} />}
            {preview ? "Back to editor" : "Preview layout"}
          </Button>
          {isEdit && (
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={15} /> Delete
            </Button>
          )}
          <Button
            variant="primary"
            disabled={busy || loading}
            onClick={() => void save()}
          >
            {busy ? (
              "Saving…"
            ) : isEdit ? (
              "Save changes"
            ) : (
              <>
                <Plus size={15} /> Create {collection.singular.toLowerCase()}
              </>
            )}
          </Button>
        </div>
      </div>

      {confirmDelete && (
        <div className="modal-body border-t border-line pt-6 space-y-4" role="alertdialog" aria-label="Confirm deletion">
          <Heading level={3}>Delete this record?</Heading>
          <p className="text-sm text-slate-strong">
            This action cannot be undone. The record will be removed from the
            workspace and the public site.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={busy}
              onClick={() => {
                setConfirmDelete(false)
                void remove()
              }}
            >
              {busy ? "Deleting…" : "Delete permanently"}
            </Button>
          </div>
        </div>
      )}

      {isEdit && detail && detail.activities.length > 0 && (
        <div
          className="modal-body"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <Heading level={3}>History</Heading>
          <ul className="activity-list">
            {detail.activities.map((a) => (
              <li key={a.id}>
                <span>{new Date(a.createdAt).toLocaleString()}</span>
                <div>
                  <p>{a.message}</p>
                  {a.user && <p className="field-hint">{a.user.name}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  )
}

export default ContentEditor
