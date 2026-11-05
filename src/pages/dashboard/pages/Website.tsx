import { useEffect, useState } from "react"
import { LockKeyhole } from "lucide-react"

import { api } from "@/lib/api"

import { Button, Heading, Textarea } from "../ui"

/* Website settings — the site's JSON configuration, edited in place. The
   editor is a plain textarea on purpose: it is a power-user surface, and a
   form would hide keys the CMS does not know about yet. */

export function WebsitePage({ canEdit }: { canEdit: boolean }) {
  const [text, setText] = useState("")
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.siteSettings()
      setText(JSON.stringify(res.data ?? {}, null, 2))
      setUpdatedAt(res.updatedAt)
    } catch {
      setError("Failed to load website settings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async () => {
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(text || "{}")
    } catch {
      setError("Settings must be valid JSON")
      return
    }
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      const res = await api.updateSiteSettings(parsed)
      setUpdatedAt(res.updatedAt)
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>Website settings</Heading>
          <p>
            Contact, legal identity, social links, default SEO and navigation
            order.
          </p>
        </div>
        <Button
          variant="primary"
          disabled={busy || !canEdit}
          onClick={() => void save()}
        >
          {busy ? "Saving…" : "Save settings"}
        </Button>
      </div>

      {!canEdit && (
        <p className="panel-foot">
          <LockKeyhole size={12} />
          Only workspace admins can edit website settings.
        </p>
      )}
      {error && (
        <p className="panel-foot is-error" role="alert">
          {error}
        </p>
      )}
      {saved && <p className="panel-foot is-ok">Website settings saved.</p>}

      {loading ? (
        <div className="m-4 h-80 animate-pulse rounded-lg border border-line bg-ivory-2" />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-5 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-strong">
              settings.json
            </span>
            {updatedAt && (
              <span className="font-mono text-[10px] text-slate-strong">
                Updated {new Date(updatedAt).toLocaleString()}
              </span>
            )}
          </div>
          <Textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setSaved(false)
            }}
            disabled={!canEdit}
            spellCheck={false}
            rows={22}
            className="json-area rounded-none border-0 font-mono text-xs leading-relaxed"
          />
        </>
      )}
    </section>
  )
}
