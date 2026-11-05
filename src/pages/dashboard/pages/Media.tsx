import { useEffect, useRef, useState } from "react"
import { Image as ImageIcon, Plus, Search } from "lucide-react"

import { api, type Asset } from "@/lib/api"

import { Button, Field, Input } from "../ui"
import { Empty, formatSize } from "../shared"

/* Media — the shared asset library. Uploads are disabled when the API reports
   that object storage is not configured, and we say so rather than failing
   silently. */

export function MediaPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [storageEnabled, setStorageEnabled] = useState(true)
  const [busy, setBusy] = useState(false)
  /* Alt text is edited locally and written on blur: one request per edit, not
     one per keystroke. English and Arabic are independent. */
  const [altDraft, setAltDraft] = useState<Record<string, { en: string; ar: string }>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.assets({ search: search || undefined, pageSize: 60 })
      setAssets(res.items)
      setStorageEnabled(res.storageEnabled)
    } catch {
      setError("Failed to load media")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

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

      {loading ? (
        <div className="media-grid">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl border border-line bg-ivory-2"
            />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <Empty icon={ImageIcon} title="No files yet">
          Upload images and documents to reuse them across your content.
        </Empty>
      ) : (
        <ul className="media-grid">
          {assets.map((a) => (
            <li key={a.id} className="media-card">
              <div className="media-thumb">
                {a.mimeType.startsWith("image/") ? (
                  <img
                    src={a.url}
                    alt={a.alt?.en ?? a.filename}
                    loading="lazy"
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
    </section>
  )
}
