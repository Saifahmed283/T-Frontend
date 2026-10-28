import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react"

import {
  ArrowRight,
  Copy,
  Link,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react"

import { api } from "@/lib/api"
import type { Lang } from "@/pages/site/types"
import "./TerraMorphChat.css"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  text: string
  status?: "sending" | "delivered" | "error"
  createdAt: number
}

type ChatError = {
  code: string
  message: string
  retryable: boolean
}

const ERROR_MESSAGES: Record<string, ChatError> = {
  INVALID_CHAT_REQUEST: {
    code: "INVALID_CHAT_REQUEST",
    message: "Please enter a valid message.",
    retryable: false,
  },
  AI_NOT_CONFIGURED: {
    code: "AI_NOT_CONFIGURED",
    message: "The assistant is not configured on this environment.",
    retryable: false,
  },
  AI_RATE_LIMITED: {
    code: "AI_RATE_LIMITED",
    message: "The assistant is busy. Please try again in a moment.",
    retryable: true,
  },
  EMPTY_AI_RESPONSE: {
    code: "EMPTY_AI_RESPONSE",
    message: "I didn't get a response. Please try again.",
    retryable: true,
  },
  AI_UNAVAILABLE: {
    code: "AI_UNAVAILABLE",
    message: "The assistant is temporarily unavailable.",
    retryable: true,
  },
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "Unable to connect. Please check your connection and try again.",
    retryable: true,
  },
}

export default function TerraMorphChat({
  lang,
}: {
  lang: Lang
}) {
  const ar = lang === "ar"

  const greeting = ar
    ? "مرحباً! كيف يمكنني مساعدتك في استكشاف تيرامورف وخدماتها؟"
    : "Welcome! How can I help you explore TerraMorph and our services?"

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<ChatError | null>(null)
  const [errorMessageId, setErrorMessageId] = useState<string | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-0",
      role: "assistant",
      text: greeting,
      status: "delivered",
      createdAt: Date.now(),
    },
  ])

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const isSendingRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      scrollToBottom()
    }
  }, [open, scrollToBottom])

  useEffect(() => {
    scrollToBottom()
  }, [messages, pending, error, scrollToBottom])

  const parseError = (ex: unknown): ChatError => {
    if (ex && typeof ex === "object" && "status" in ex) {
      const status = (ex as { status?: number }).status
      const body = (ex as { body?: { error?: { code?: string; message?: string } } }).body
      const code = body?.error?.code || "AI_UNAVAILABLE"
      const message = body?.error?.message || ERROR_MESSAGES[code]?.message || "Something went wrong."
      return { code, message, retryable: ERROR_MESSAGES[code]?.retryable ?? true }
    }
    return ERROR_MESSAGES.NETWORK_ERROR
  }

  const sendMessage = useCallback(
    async (value: string) => {
      const text = value.trim()
      if (!text || pending || isSendingRef.current) return

      isSendingRef.current = true

      const history = messages
        .slice(1)
        .slice(-8)
        .map(({ role, text: previousText }) => ({ role, text: previousText }))

      const userId = `msg-${Date.now()}`
      const optimisticUser: ChatMessage = {
        id: userId,
        role: "user",
        text,
        status: "sending",
        createdAt: Date.now(),
      }

      setDraft("")
      setError(null)
      setErrorMessageId(null)
      setMessages((current) => [...current, optimisticUser])
      setPending(true)

      try {
        const result = await api.chat({
          message: text,
          history,
        })

        setMessages((current) => [
          ...current.filter((m) => m.id !== userId),
          { id: userId, role: "user", text, status: "delivered", createdAt: Date.now() },
          {
            id: `msg-${Date.now() + 1}`,
            role: "assistant",
            text: result.reply,
            status: "delivered",
            createdAt: Date.now(),
          },
        ])
      } catch (ex) {
        const chatError = parseError(ex)
        setError(chatError)

        setMessages((current) => [
          ...current.filter((m) => m.id !== userId),
          { id: userId, role: "user", text, status: "error", createdAt: Date.now() },
        ])
      } finally {
        isSendingRef.current = false
        setPending(false)
      }
    },
    [messages, pending]
  )

  const retryMessage = useCallback((id: string) => {
    const message = messages.find((m) => m.id === id && m.role === "user")
    if (message) {
      setError(null)
      setErrorMessageId(null)
      void sendMessage(message.text)
    }
  }, [messages, sendMessage])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage(draft)
  }

  const suggestions = ar
    ? [
        { label: "ما هي تيرامورف؟", route: "/" },
        { label: "ما هو منهج LDIA؟", route: "/method" },
        { label: "كيف يمكنني التواصل مع الفريق؟", route: "/contact" },
      ]
    : [
        { label: "What does TerraMorph do?", route: "/" },
        { label: "What is the LDIA method?", route: "/method" },
        { label: "How can I contact the team?", route: "/contact" },
      ]

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(ar ? "ar-EG" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div
      className="tm-chat-widget"
      dir={ar ? "rtl" : "ltr"}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Background glow when open */}
      {open && (
        <div
          className="tm-chat-glow"
          style={{
            animation: "tm-glow-pulse 4s ease-in-out infinite alternate",
          }}
        />
      )}

      {open && (
        <section
          id="tm-chat-panel"
          ref={panelRef}
          className="tm-chat-panel"
          role="dialog"
          aria-labelledby="tm-chat-title"
          aria-modal="true"
        >
          <header className="tm-chat-header">
            <div className="tm-chat-brand">
              <div className="tm-chat-mark" aria-hidden>
                <Sparkles size={18} />
              </div>
              <div>
                <strong id="tm-chat-title">
                  {ar ? "مساعد تيرامورف" : "TerraMorph Assistant"}
                </strong>
              </div>
            </div>

            <div className="tm-chat-status-chip">
              <span
                className={`tm-status-dot ${
                  error ? "tm-status-error" : pending ? "tm-status-typing" : "tm-status-ready"
                }`}
              />
              <span className="tm-status-text">
                {error
                  ? ar
                    ? "خطأ في الاتصال"
                    : "Connection error"
                  : pending
                    ? ar
                      ? "جارٍ الإجابة…"
                      : "Typing…"
                    : ar
                      ? "متاح"
                      : "Ready"}
              </span>
            </div>

            <button
              type="button"
              className="tm-chat-close"
              aria-label={ar ? "إغلاق المحادثة" : "Close chat"}
              onClick={() => setOpen(false)}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </header>

          <div className="tm-chat-messages" role="log" aria-live="polite">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`tm-chat-row tm-chat-row--${item.role} tm-row`}
              >
                <div
                  className={`tm-chat-bubble tm-chat-bubble--${item.role} tm-bubble`}
                  data-status={item.status}
                >
                  <span className="tm-bubble-text">{item.text}</span>
                  <div className="tm-bubble-meta">
                    <span className="tm-bubble-time">{formatTime(item.createdAt)}</span>
                    {item.status === "error" && (
                      <button
                        type="button"
                        className="tm-bubble-retry"
                        aria-label="Retry"
                        onClick={() => retryMessage(item.id)}
                      >
                        <ArrowRight size={12} strokeWidth={1.5} />
                      </button>
                    )}
                    {item.role === "user" && item.status === "sending" && (
                      <span className="tm-bubble-sending">sending</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="tm-chat-suggestions">
                {suggestions.map((s) => (
                  <button
                    type="button"
                    key={s.label}
                    className="tm-suggestion"
                    onClick={() => {
                      setDraft(s.label)
                      void sendMessage(s.label)
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {pending && (
              <div className="tm-chat-typing" role="status" aria-label="Typing">
                <span className="tm-typing-dot" />
                <span className="tm-typing-dot" />
                <span className="tm-typing-dot" />
              </div>
            )}

            <div ref={messagesEndRef} />

            {error && (
              <div className="tm-chat-error-banner" role="alert">
                <span className="tm-error-text">{error.message}</span>
                {error.retryable && (
                  <button
                    type="button"
                    className="tm-error-retry"
                    onClick={() => {
                      const lastUser = messages
                        .slice()
                        .reverse()
                        .find((m) => m.role === "user")
                      if (lastUser) void sendMessage(lastUser.text)
                    }}
                  >
                    {ar ? "محاولة مرة أخرى" : "Try again"}
                  </button>
                )}
              </div>
            )}

            <form className="tm-chat-form" onSubmit={handleSubmit}>
              <div className="tm-input-wrapper">
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={ar ? "اكتب رسالتك هنا…" : "Type your question…"}
                  aria-label={ar ? "رسالتك" : "Your message"}
                  maxLength={1200}
                  disabled={pending}
                  autoComplete="off"
                  spellCheck={false}
                />
                <span className="tm-input-border" />
              </div>
              <button
                type="submit"
                aria-label={ar ? "إرسال" : "Send"}
                disabled={pending || !draft.trim()}
                className="tm-send-btn"
              >
                <Send size={17} strokeWidth={2} />
              </button>
            </form>

            <p className="tm-chat-privacy">
              {ar
                ? "لا تشارك معلومات سرية أو بيانات حساسة."
                : "Please don't share confidential or sensitive information."}
            </p>
          </div>
        </section>
      )}

      <button
        type="button"
        className={`tm-chat-launcher ${open ? "tm-chat-launcher--open" : ""}`}
        aria-label={
          open
            ? ar ? "إغلاق المحادثة" : "Close chat"
            : ar ? "افتح مساعد تيرامورف" : "Open TerraMorph chat"
        }
        aria-expanded={open}
        aria-controls="tm-chat-panel"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <X size={22} strokeWidth={2} />
        ) : (
          <div className="tm-launcher-content">
            <MessageCircle size={20} />
            <div className="tm-launcher-pulse" />
          </div>
        )}
      </button>
    </div>
  )
}
