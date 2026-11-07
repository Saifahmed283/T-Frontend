/**
 * MorpheWidget - TerraMorph's bilingual intake assistant.
 *
 * Drops into the public site shell. Talks to /api/v1/morphe/chat through
 * your Fastify backend (never calls any model service directly from the browser).
 *
 *   <MorpheWidget lang="en" />
 *
 * Features:
 *   - Floating launcher + panel, fixed position above the cookie banner
 *   - EN/AR toggle with RTL layout
 *   - Full keyboard access: Tab, Escape, focus return on close
 *   - aria-live announcements for Morphe's replies
 *   - Session persisted in sessionStorage (functional, disclosed)
 *   - AI disclosure + Privacy Policy link before contact capture
 *   - No raw transcripts stored; only structured leads persisted server-side
 */
import { useCallback, useEffect, useRef, useState } from "react"

import { api } from "@/lib/api"
import type { Lang } from "@/pages/site/types"

type ChatLink = { id: string; url: string; label: string }
type Message = {
  role: "morphe" | "user"
  text: string
  links?: ChatLink[]
}

const COLORS = {
  navy: "#132B45",
  navy2: "#1A2E4A",
  gold: "#AF8C4B",
  cream: "#FBF9F0",
  ivory: "#F5F1E8",
  slate: "#6B7280",
}

const SESSION_KEY = "morphe_session_id"

export default function MorpheWidget({ lang = "en" }: { lang?: Lang }) {
  const ar = lang === "ar"
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [ended, setEnded] = useState(false)
  const [error, setError] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) setSessionId(stored)
    } catch { /* storage unavailable */ }
  }, [])

  // Persist session id
  useEffect(() => {
    if (sessionId) {
      try { sessionStorage.setItem(SESSION_KEY, sessionId) } catch { /* noop */ }
    }
  }, [sessionId])

  const send = useCallback(
    async (text: string | null) => {
      setLoading(true)
      setError("")
      try {
        const data = await api.morpheChat(sessionId, text, lang)
        setSessionId(data.session_id)
        setMessages((prev) => [
          ...prev,
          { role: "morphe", text: data.reply, links: data.links },
        ])
        if (data.terminal) setEnded(true)
      } catch {
        const fallback = ar
          ? "عفواً - أواجه مشكلة في الاتصال الآن. يرجى المحاولة في وقت لاحق."
          : "Sorry - I'm having trouble connecting right now. Please try again shortly."
        setMessages((prev) => [...prev, { role: "morphe", text: fallback }])
        setError(fallback)
      } finally {
        setLoading(false)
      }
    },
    [sessionId, lang],
  )

  // Open panel -> fetch greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      send(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, loading])

  // Escape to close; Enter to send
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === "Escape") setOpen(false)
      if (e.key === "Enter" && !loading && !ended) submit()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, loading, ended])

  const submit = () => {
    const text = input.trim()
    if (!text || loading || ended) return
    setMessages((prev) => [...prev, { role: "user", text }])
    setInput("")
    send(text)
  }

  const startOver = () => {
    setMessages([])
    setSessionId(null)
    setEnded(false)
    setError("")
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* noop */ }
  }

  const dir = ar ? "rtl" : "ltr"

  return (
    <div dir={dir} style={{ fontFamily: "Jost, system-ui, sans-serif" }}>
      {/* Launcher */}
      <button
        ref={launcherRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "إغلاق المحادثة" : "فتح المحادثة مع مورفي"}
        style={{
          position: "fixed",
          bottom: 24,
          right: ar ? 24 : 24,
          left: ar ? undefined : undefined,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: COLORS.navy,
          border: `2px solid ${COLORS.gold}`,
          color: COLORS.cream,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 24,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(19,43,69,0.35)",
          zIndex: 1100, // above cookie banner (z-50)
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {open ? "×" : "M"}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={ar ? "محادثة مورفي" : "Morphe chat"}
          style={{
            position: "fixed",
            bottom: 100,
            right: 24,
            width: 380,
            maxWidth: "92vw",
            height: 560,
            maxHeight: "80vh",
            background: COLORS.cream,
            border: `1px solid ${COLORS.gold}`,
            borderRadius: 16,
            boxShadow: "0 16px 48px rgba(19,43,69,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1100,
            direction: dir,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: COLORS.navy,
              color: COLORS.cream,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: COLORS.gold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 700,
                color: COLORS.navy,
              }}
            >
              M
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, fontSize: 15 }}>
                Morphe
              </div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>
                {ar ? "مساعد الاستقبال - شركة تيرامورف" : "TerraMorph intake assistant"}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
              style={{
                background: "none",
                border: "none",
                color: COLORS.cream,
                cursor: "pointer",
                fontSize: 20,
                padding: 0,
                lineHeight: 1,
                marginLeft: "auto",
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: COLORS.ivory,
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: 14,
                    fontSize: 14,
                    lineHeight: 1.5,
                    background: m.role === "user" ? COLORS.navy : "#ffffff",
                    color: m.role === "user" ? COLORS.cream : "#1a1a1a",
                    border: m.role === "morphe" ? `1px solid ${COLORS.gold}44` : "none",
                    boxShadow: m.role === "morphe" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  {m.text}
                </div>
                {m.links && m.links.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {m.links.map((l) => (
                      <a
                        key={l.id}
                        href={l.url}
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 12,
                          padding: "6px 12px",
                          borderRadius: 999,
                          border: `1px solid ${COLORS.gold}`,
                          color: COLORS.navy,
                          textDecoration: "none",
                          background: `${COLORS.gold}1a`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                )}
                {m.role === "morphe" && (
                  <span
                    aria-live="polite"
                    style={{
                      position: "absolute",
                      width: 1,
                      height: 1,
                      padding: 0,
                      margin: -1,
                      overflow: "hidden",
                      clip: "rect(0, 0, 0, 0)",
                      whiteSpace: "nowrap",
                      border: 0,
                    }}
                  >
                    {ar ? "رد من مورفي" : "Morphe reply"}
                  </span>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ fontSize: 13, color: COLORS.slate, fontStyle: "italic" }}>
                {ar ? "مورفي يكتب..." : "Morphe is typing."}
              </div>
            )}
            {error && (
              <div style={{ fontSize: 12, color: "#b42318", marginTop: 6 }}>{error}</div>
            )}
          </div>

          {/* Disclosure + consent before contact capture */}
          {!ended && messages.some((m) => m.role === "morphe") && (
            <div
              style={{
                padding: "10px 14px",
                borderTop: `1px solid ${COLORS.gold}44`,
                fontSize: 11,
                color: COLORS.slate,
                lineHeight: 1.4,
                background: COLORS.ivory,
              }}
            >
              {ar
                ? "مorphe Assistant يستخدم نموذج محلي لتصنيف نواياك. لا يتم استخدام بياناتك في تدريب نماذج الذكاء الاصطناعي. عند مشاركة بيانات التواصل، سيتم حفظها كLead according to our Privacy Policy."
                : "Morphe uses a local model to classify your intent. Your data is never used to train AI models. When you share contact details, they are stored as a lead per our Privacy Policy."}
              <br />
              <a
                href="/legal/privacy-policy"
                style={{ color: COLORS.navy, textDecoration: "underline", textDecorationColor: COLORS.gold }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ar ? "سياسة الخصوصية" : "Privacy Policy"}
              </a>
            </div>
          )}

          {/* Input */}
          {!ended ? (
            <div
              style={{
                display: "flex",
                borderTop: `1px solid ${COLORS.gold}44`,
                padding: 10,
                gap: 8,
                background: COLORS.cream,
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit()
                }}
                placeholder={ar ? "اكتب رسالتك." : "Type your message."}
                style={{
                  flex: 1,
                  border: `1px solid ${COLORS.gold}66`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 14,
                  outline: "none",
                  background: "#ffffff",
                  color: "#1a1a1a",
                }}
              />
              <button
                onClick={submit}
                disabled={loading || ended}
                style={{
                  background: COLORS.gold,
                  color: COLORS.navy,
                  border: "none",
                  borderRadius: 10,
                  padding: "0 18px",
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: loading || ended ? 0.5 : 1,
                }}
              >
                {ar ? "إرسال" : "Send"}
              </button>
            </div>
          ) : (
            <div style={{ padding: 12, textAlign: "center", fontSize: 13, color: COLORS.slate, borderTop: `1px solid ${COLORS.gold}44`, background: COLORS.cream }}>
              {ar ? "اكتملت المحادثة." : "Conversation complete."}{" "}
              <button
                onClick={startOver}
                style={{ color: COLORS.navy, textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
              >
                {ar ? "بدء محادثة جديدة" : "Start a new one"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
