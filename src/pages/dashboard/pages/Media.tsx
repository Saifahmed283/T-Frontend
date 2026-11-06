import { useCallback, useEffect, useRef, useState } from "react"
import { Image as ImageIcon, Plus, Search } from "lucide-react"

import { SkeletonCard, SkeletonRegion } from "@/components/ui"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { api, type Asset } from "@/lib/api"

import { Button, Field, Input } from "../ui"
import { Empty, formatSize } from "../shared"

/* Media — the shared asset library. Uploads are disabled when the API reports
   that object storage is not configured, and we say so rather than failing
   silently. Search is debounced and the list is paginated, so a large library
   never downloads or renders in one go. */

const PAGE_SIZE = 24

export function MediaPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [storageEnabled, setStorageEnabled] = useState(true)
  const [busy, setBusy] = useState(false)
  /* Alt text is edited locally and written on blur: one request per edit, not
     one per keystroke. English and Arabic are independent. */
  const [altDraft, setAltDraft] = useState<Record<string, { en: string; ar: string }>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const requestId = useRef(0)

  const debouncedSearch = useDebouncedValue(search, 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
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
    } catch {
      if (id !== requestId.current) return
      setError("Failed to load media")
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [debouncedSearch, page])

  useEffect(() => {
    void load()
  }, [load])

  const upload = async (file: File) => {
    setBusy(true)
    try {
      await api.assetUpload(file)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const remove = async (id: string) => {
    setBusy(true)
    try {
      await api.assetDelete(id)
      setAssets((a) => a.filter((x) => x.id !== id))
      // The last item on a page leaves an empty page behind; step back.
      if (assets.length === 1 && page > 1) setPage((p) => p - 1)
      else await load()
    } catch {
      setError("Delete failed")
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
    } catch {
      setError("Could not save alt text")
    }
  }

  return (
    <section className="panel">
      <div className="collection-toolbar">
        <div className="search-field">
          <Search size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media…"
            aria-label="Search media"
          />
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void upload(f)
          }}
        />
        <Button
          variant="primary"
          disabled={busy || !storageEnabled}
          onClick={() => inputRef.current?.click()}
        >
          <Plus size={15} /> Upload
        </Button>
      </div>

      {!storageEnabled && (
        <p className="panel-foot is-error">
          Storage is not configured on this environment, so uploads stay
          disabled.
        </p>
      )}
      {error && (
        <p className="panel-foot is-error" role="alert">
          {error}
        </p>
      )}

      {loading && assets.length === 0 ? (
        <SkeletonRegion label="Loading media" className="media-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} className="h-56" />
          ))}
        </SkeletonRegion>
      ) : assets.length === 0 ? (
        <Empty icon={ImageIcon} title="No files yet">
          Upload images and documents to reuse them across your content.
        </Empty>
      ) : (
        <ul className="media-grid" aria-busy={loading}>
          {assets.map((a) => (
            <li key={a.id} className="media-card">
              <div className="media-thumb">
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
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void remove(a.id)}
                  aria-label={`Delete ${a.filename}`}
                  className="media-delete"
                >
                  Delete
                </Button>
              </div>
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
