import { useCallback, useEffect, useRef, useState } from "react"
import { Image as ImageIcon, Plus, Search, Copy, X, ChevronLeft, ChevronRight } from "lucide-react"

import { SkeletonCard, SkeletonRegion } from "@/components/ui"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { api, type Asset } from "@/lib/api"
import { messageForError } from "@/lib/messages"
import posthog from "@/lib/posthog.client"
import { useToastActions } from "../ui"

import { Alert, Button, Field, Heading, Input, Modal } from "../ui"
import { Empty, formatSize } from "../shared"

const PAGE_SIZE = 24
// Keep these in sync with the server (assets.service.ts): a client that accepts
// more than the API does only turns a local check into a confusing 4xx later.
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
]

export function MediaPage({ canEdit }: { canEdit: boolean }) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [storageEnabled, setStorageEnabled] = useState(true)
  const [busy, setBusy] = useState(false)
  const [altDraft, setAltDraft] = useState<Record<string, { en: string; ar: string }>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)
  const requestId = useRef(0)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null)

  const { success, error: toastError } = useToastActions()

  const debouncedSearch = useDebouncedValue(search, 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    try {
      const res = await api.assets({
        search: debouncedSearch || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      if (id !== requestId.current) return
      setAssets(res.items)
      setTotalPages(res.pagination.totalPages)
      setStorageEnabled(res.storageEnabled)
    } catch (ex) {
      if (id !== requestId.current) return
      const { message } = messageForError(ex)
      toastError(message)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [debouncedSearch, page])

  useEffect(() => {
    void load()
  }, [load])

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type ${file.type || "unknown"} is not allowed. Allowed: images and PDF files.`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size ${formatSize(file.size)} exceeds the 15 MB limit.`
    }
    return null
  }

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const invalid = fileArray.map(validateFile).filter(Boolean)
    if (invalid.length > 0) {
      toastError(invalid.join("\n"))
      return
    }
    setBusy(true)
    try {
      for (const file of fileArray) {
        await api.assetUpload(file)
      }
      posthog.capture("media_uploaded", {
        file_count: fileArray.length,
        mime_types: [...new Set(fileArray.map((file) => file.type))],
      })
      success("Files uploaded")
      await load()
    } catch (e) {
      const { message } = messageForError(e)
      toastError(message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files
    if (f?.length) void uploadFiles(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files
    if (f?.length) void uploadFiles(f)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const remove = async (id: string) => {
    if (!canEdit) return
    setBusy(true)
    try {
      await api.assetDelete(id)
      setAssets((a) => a.filter((x) => x.id !== id))
      if (assets.length === 1 && page > 1) setPage((p) => p - 1)
      else await load()
      posthog.capture("media_deleted")
      success("File deleted")
    } catch (e) {
      const { message } = messageForError(e)
      toastError(message)
    } finally {
      setBusy(false)
    }
  }

  const saveAlt = async (asset: Asset, lang: "en" | "ar", value: string) => {
    if (value === (asset.alt?.[lang] ?? "")) return
    const alt = { ...(asset.alt ?? {}), [lang]: value }
    setAssets((a) => a.map((x) => (x.id === asset.id ? { ...x, alt } : x)))
    try {
      await api.assetUpdateAlt(asset.id, alt)
      success("Alt text saved")
    } catch (e) {
      const { message } = messageForError(e)
      toastError(message)
    }
  }

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      success("URL copied to clipboard")
    } catch {
      toastError("Could not copy URL")
    }
  }

  const openPreview = (asset: Asset) => {
    setPreviewAsset(asset)
    setPreviewOpen(true)
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>Media library</Heading>
          <p>Upload and manage images and documents for your content.</p>
        </div>
        <div className="panel-heading-actions">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(",")}
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="primary"
            disabled={busy || !storageEnabled || !canEdit}
            onClick={() => inputRef.current?.click()}
          >
            <Plus size={15} /> Upload
          </Button>
        </div>
      </div>

      {!storageEnabled && (
        <Alert
          tone="warning"
          title="Media storage not configured"
          body="Storage is not configured on this environment, so uploads stay disabled."
        />
      )}

      <div
        ref={dropzoneRef}
        className={`dropzone ${busy ? "dropzone-busy" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
      >
        {loading && assets.length === 0 ? (
          <SkeletonRegion label="Loading media" className="media-grid">
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonCard key={i} className="h-56" />
            ))}
          </SkeletonRegion>
        ) : assets.length === 0 ? (
          <Empty icon={ImageIcon} title="No files yet">
            <p>Drag and drop files here, or click to upload.</p>
            <p className="text-xs text-slate-strong mt-1">
              Allowed: JPEG, PNG, GIF, WebP, SVG and PDF (max 15 MB)
            </p>
          </Empty>
        ) : (
          <ul className="media-grid" aria-busy={loading}>
            {assets.map((a) => (
              <li key={a.id} className="media-card">
                <div className="media-thumb" onClick={() => openPreview(a)}>
                  {a.mimeType.startsWith("image/") ? (
                    <img
                      src={a.url}
                      alt={a.alt?.en ?? a.filename}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <ImageIcon size={24} strokeWidth={1.4} />
                  )}
                </div>
                <div className="media-body">
                  <p className="media-name" title={a.filename}>
                    {a.filename}
                  </p>
                  <p className="media-meta">
                    {formatSize(a.size)} · {a.mimeType.split("/")[1] ?? "file"}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Alt text · EN">
                      <Input
                        value={altDraft[a.id]?.en ?? a.alt?.en ?? ""}
                        onChange={(e) =>
                          setAltDraft((d) => ({
                            ...d,
                            [a.id]: {
                              ...(d[a.id] ?? { en: "", ar: "" }),
                              en: e.target.value,
                            },
                          }))
                        }
                        onBlur={(e) => void saveAlt(a, "en", e.target.value)}
                        placeholder="Describe the image"
                      />
                    </Field>
                    <Field label="Alt text · AR">
                      <Input
                        value={altDraft[a.id]?.ar ?? a.alt?.ar ?? ""}
                        onChange={(e) =>
                          setAltDraft((d) => ({
                            ...d,
                            [a.id]: {
                              ...(d[a.id] ?? { en: "", ar: "" }),
                              ar: e.target.value,
                            },
                          }))
                        }
                        onBlur={(e) => void saveAlt(a, "ar", e.target.value)}
                        placeholder="وصف الصورة"
                        dir="rtl"
                        lang="ar"
                      />
                    </Field>
                  </div>
                  <div className="media-actions">
                    <Button
                      variant="ghost"
                      onClick={() => copyUrl(a.url)}
                      aria-label="Copy URL"
                      title="Copy URL"
                    >
                      <Copy size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => openPreview(a)}
                      aria-label="Preview"
                      title="Preview"
                    >
                      <ImageIcon size={14} />
                    </Button>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        className="text-danger"
                        disabled={busy}
                        onClick={() => void remove(a.id)}
                        aria-label={`Delete ${a.filename}`}
                      >
                        <X size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {previewOpen && previewAsset && (
        <Modal title={previewAsset.filename} onClose={() => setPreviewOpen(false)} wide>
          <div className="modal-body" style={{ textAlign: "center" }}>
            {previewAsset.mimeType.startsWith("image/") ? (
              <img
                src={previewAsset.url}
                alt={previewAsset.alt?.en ?? previewAsset.filename}
                style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: "4px" }}
              />
            ) : (
              <div className="media-preview-placeholder">
                <ImageIcon size={48} strokeWidth={1.4} />
                <p className="mt-2 text-slate-strong">{previewAsset.filename}</p>
                <p className="text-xs text-slate-strong">{previewAsset.mimeType}</p>
              </div>
            )}
            <div className="mt-4 flex gap-2 justify-center">
              <Button variant="secondary" onClick={() => copyUrl(previewAsset.url)}>
                <Copy size={14} /> Copy URL
              </Button>
              <Button variant="primary" onClick={() => window.open(previewAsset.url, "_blank")}>
                Open in new tab
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  )
}