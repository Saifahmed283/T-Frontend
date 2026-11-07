/**
 * MorpheWidget - TerraMorph's animated, bilingual intake assistant.
 *
 * Design inspiration: reactbits.devv + getlayers.ai — smooth spring
 * animations, glass panels, thinking states, chip-based quick replies.
 *
 *   <MorpheWidget lang="en" />
 *
 * Features:
 *   - Animated Morphe SVG icon (thinking state pulses the network)
 *   - Smooth open/close with cubic-bezier spring physics
 *   - Thinking/typing indicator with animated dots
 *   - Knowledge base trained on TerraMorph website topics (G0-G7, LDIA,
 *     audiences, services, certifications, contact, legal)
 *   - Classifier routes to knowledge answers; falls back to flow engine
 *   - Quick-reply chips for the current state's valid intents
 *   - Smooth scroll, focus trap, Escape-to-close, aria-live
 *   - Session in sessionStorage; lead persisted server-side via Submission
 *   - No raw transcripts stored
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api"
import { MorpheIcon } from "./MorpheIcon"
import { KNOWLEDGE_BASE, findKnowledgeAnswer } from "./knowledge-base"
import type { Lang } from "@/pages/site/types"

type ChatLink = { id: string; url: string; label: string }
type Message = {
  role: "morphe" | "user"
  text: string
  links?: ChatLink[]
  chips?: string[]
  terminal?: boolean
  thinking?: boolean
}

const COLORS = {
  navy: "#132B45",
  navy2: "#1A2E4A",
  gold: "#AF8C4B",
  cream: "#FBF9F0",
  ivory: "#F5F1E8",
  slate: "#6B7280",
  white: "#FFFFFF",
}

const SESSION_KEY = "morphe_session_id"

// Quick-reply chip suggestions per flow state
const CHIPS_BY_STATE: Record<string, string[]> = {
  greeting: ["I have an idea", "I want to partner", "I have a question", "Just browsing"],
  sector: ["Education", "Climate", "Health", "Livelihoods", "Governance", "Not sure"],
  idea_stage: ["Just a concept", "Tested informally", "Already running"],
  timeline: ["Next month", "This quarter", "Exploratory"],
  contact_capture: ["Share email", "Prefer not to"],
  general_qa: ["Methodology", "Services", "About", "Partners", "Contact"],
}

export default function MorpheWidget({ lang = "en" }: { lang?: Lang }) {
  const ar = lang === "ar"
  const dir = ar ? "rtl" : "ltr"

  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [thinking, setThinking] = useState(false)
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

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, loading, thinking])

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

  const send = useCallback(
    async (text: string | null) => {
      setLoading(true)
      setError("")
      setThinking(true)
      try {
        const data = await api.morpheChat(sessionId, text, lang)
        setSessionId(data.session_id)

        // Check knowledge base first for direct answers
        const kbEntry = text ? findKnowledgeAnswer(text, lang) : null

        setMessages((prev) => [
          ...prev,
          {
            role: "morphe",
            text: kbEntry ? (lang === "ar" ? kbEntry.ar : kbEntry.en) : data.reply,
            links: kbEntry?.links ?? data.links,
            chips: kbEntry ? [] : CHIPS_BY_STATE[data.state] ?? [],
            terminal: data.terminal,
          },
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
        setThinking(false)
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

  const submit = () => {
    const text = input.trim()
    if (!text || loading || ended) return
    setMessages((prev) => [...prev, { role: "user", text }])
    setInput("")
    send(text)
  }

  const sendChip = (label: string) => {
    setMessages((prev) => [...prev, { role: "user", text: label }])
    setInput("")
    send(label)
  }

  const startOver = () => {
    setMessages([])
    setSessionId(null)
    setEnded(false)
    setError("")
    setThinking(false)
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* noop */ }
  }

  const lastMessage = messages[messages.length - 1]
  const showChips = lastMessage?.chips?.length && !ended && !loading

  const t = (en: string, arText: string) => (ar ? arText : en)

  return (
    <div dir={dir} style={{ fontFamily: "Jost, system-ui, sans-serif" }}>
      {/* Launcher */}
      <button
        ref={launcherRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("إغلاق المحادثة", "Close chat") : t("فتح المحادثة مع مورفي", "Open chat with Morphe")}
        style={{
          position: "fixed",
          bottom: 28,
          right: ar ? 28 : 28,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: open ? COLORS.gold : COLORS.navy,
          border: `2px solid ${COLORS.gold}`,
          color: open ? COLORS.navy : COLORS.cream,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 26,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(19,43,69,0.4)",
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: open ? "scale(1.05)" : "scale(1)",
        }}
      >
        <MorpheIcon size={32} thinking={loading} />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("محادثة مورفي", "Morphe chat")}
          style={{
            position: "fixed",
            bottom: 110,
            right: 24,
            width: 400,
            maxWidth: "94vw",
            height: 620,
            maxHeight: "90vh",
            background: COLORS.cream,
            border: `1px solid ${COLORS.gold}`,
            borderRadius: 20,
            boxShadow: "0 24px 60px rgba(19,43,69,0.35)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1100,
            direction: dir,
            animation: "panelOpen 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          <style>{`
            @keyframes panelOpen {
              from { opacity: 0; transform: translateY(20px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(${ar ? "-20px" : "20px"}); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes typingDots {
              0%, 60%, 100% { transform: translateY(0); }
              30% { transform: translateY(-6px); }
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              background: COLORS.navy,
              color: COLORS.cream,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: `1px solid ${COLORS.gold}33`,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: COLORS.gold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MorpheIcon size={24} thinking={loading} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, fontSize: 16 }}>
                Morphe
              </div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>
                {ar ? "مساعد الاستقبال - شركة تيرامورف" : "TerraMorph intake assistant"}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("إغلاق", "Close")}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: COLORS.cream,
                cursor: "pointer",
                fontSize: 22,
                padding: 0,
                lineHeight: 1,
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
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
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: COLORS.ivory,
              scrollBehavior: "smooth",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start",
                  animation: "slideIn 0.4s ease-out forwards",
                }}
              >
                <div
                  style={{
                    maxWidth: "88%",
                    padding: "12px 16px",
                    borderRadius: 16,
                    fontSize: 14,
                    lineHeight: 1.6,
                    background: m.role === "user" ? COLORS.navy : COLORS.white,
                    color: m.role === "user" ? COLORS.cream : "#1a1a1a",
                    border:
                      m.role === "morphe"
                        ? `1px solid ${COLORS.gold}44`
                        : "none",
                    boxShadow:
                      m.role === "morphe"
                        ? "0 4px 16px rgba(0,0,0,0.06)"
                        : "none",
                    position: "relative",
                  }}
                >
                  {m.text}
                  {m.role === "morphe" && thinking && (
                    <div style={{ marginTop: 8, display: "flex", gap: 4, justifyContent: "center" }}>
                      {[1, 2, 3].map((dot) => (
                        <div
                          key={dot}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: COLORS.gold,
                            animation: `typingDots 1.2s ease-in-out infinite`,
                            animationDelay: `${dot * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {m.links && m.links.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                    {m.links.map((l) => (
                      <a
                        key={l.id}
                        href={l.url}
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 12,
                          padding: "7px 14px",
                          borderRadius: 999,
                          border: `1px solid ${COLORS.gold}`,
                          color: COLORS.navy,
                          textDecoration: "none",
                          background: `${COLORS.gold}12`,
                          whiteSpace: "nowrap",
                          transition: "all 0.2s",
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
            {loading && thinking && (
              <div style={{ display: "flex", justifyContent: "flex-start", padding: "4px 0" }}>
                <div style={{ fontSize: 12, color: COLORS.slate, fontStyle: "italic", display: "flex", alignItems: "center", gap: 6 }}>
                  {ar ? "مورفي يفكر" : "Morphe is thinking"}
                  <div style={{ display: "flex", gap: 3 }}>
                    {[1, 2, 3].map((dot) => (
                      <div
                        key={dot}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: COLORS.gold,
                          animation: `typingDots 1.2s ease-in-out infinite`,
                          animationDelay: `${dot * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div style={{ fontSize: 12, color: "#b42318", marginTop: 6 }}>{error}</div>
            )}
          </div>

          {/* Quick-reply chips */}
          {showChips && lastMessage?.chips && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                padding: "0 18px 10px",
                justifyContent: ar ? "flex-end" : "flex-start",
              }}
            >
              {lastMessage.chips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => sendChip(chip)}
                  style={{
                    fontSize: 12,
                    padding: "7px 14px",
                    borderRadius: 999,
                    border: `1px solid ${COLORS.gold}`,
                    color: COLORS.navy,
                    background: COLORS.white,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Disclosure before contact capture */}
          {!ended && messages.some((m) => m.role === "morphe") && (
            <div
              style={{
                padding: "10px 18px",
                borderTop: `1px solid ${COLORS.gold}44`,
                fontSize: 11,
                color: COLORS.slate,
                lineHeight: 1.4,
                background: COLORS.ivory,
              }}
            >
              {ar
                ? "مorphe يستخدم نموذجًا محليًا لتصنيف نواياك. لا تُستخدم بياناتك في تدريب نماذج الذكاء الاصطناعي. عند مشاركة بيانات التواصل، تُحفظ كإشعارlead وفقًا لسياسة الخصوصية."
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
                padding: 12,
                gap: 10,
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
                  borderRadius: 14,
                  padding: "12px 16px",
                  fontSize: 14,
                  outline: "none",
                  background: COLORS.white,
                  color: "#1a1a1a",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
              <button
                onClick={submit}
                disabled={loading || ended}
                style={{
                  background: COLORS.gold,
                  color: COLORS.navy,
                  border: "none",
                  borderRadius: 14,
                  padding: "0 22px",
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: loading || ended ? 0.5 : 1,
                  transition: "all 0.2s",
                  boxShadow: loading || ended ? "none" : `0 4px 12px rgba(175,140,62,0.35)`,
                }}
              >
                {ar ? "إرسال" : "Send"}
              </button>
            </div>
          ) : (
            <div style={{ padding: 16, textAlign: "center", fontSize: 13, color: COLORS.slate, borderTop: `1px solid ${COLORS.gold}44`, background: COLORS.cream }}>
              {ar ? "اكتملت المحادثة." : "Conversation complete."}{" "}
              <button
                onClick={startOver}
                style={{ color: COLORS.navy, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
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
