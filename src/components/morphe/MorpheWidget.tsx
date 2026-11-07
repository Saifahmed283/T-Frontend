/**
 * MorpheWidget v3 - TerraMorph's AI chatbot (refactored)
 *
 * Design inspiration: reactbits.devv + getlayers.ai
 * - Glassmorphism panel with backdrop blur
 * - Smooth spring animations (cubic-bezier)
 * - Refined typography: Cormorant Garamond headings + Jost body
 * - Pill-shaped toggles, floating action button with send icon
 * - Info tooltip on hover for privacy disclosure
 * - Bilingual EN/AR with RTL support
 * - All Lucide-react icons (Send, Mic, Info, Search, Send)
 */
import { useEffect, useRef, useState } from "react";

import { Send, Mic, Info, Search } from "lucide-react";
import { api } from "@/lib/api";
import { MorpheIcon } from "./MorpheIcon";
import type { Lang } from "@/pages/site/types";

type ChatMessage = {
  id: string;
  role: "morphe" | "user";
  text: string;
  content?: string;
  links?: Array<{ id: string; url: string; label: string }>;
  terminal?: boolean;
  searchUsed?: boolean;
  timestamp?: string;
};

const C = {
  navy: "#0F1C2E",
  navyLight: "#16263F",
  gold: "#C9A227",
  goldLight: "#E4C57E",
  cream: "#FBF9F0",
  ivory: "#F3F0E6",
  slate: "#6B7280",
  white: "#FFFFFF",
  ink: "#1A1A1A",
  border: "#D8D4C4",
  error: "#B42318",
};

const SESSION_KEY = "morphe_v3_session_id";
/* Matches the backend's `message.max(2000)` on /api/v1/morphe/chat. */
const MAX_MESSAGE = 2000;

export default function MorpheWidget({ lang = "en" }: { lang?: Lang }) {
  const ar = lang !== "en";
  const dir = ar ? "rtl" : "ltr";

  const t = (en: string, arText: string) => (ar ? arText : en);

  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [showPrivacyTooltip, setShowPrivacyTooltip] = useState(false);
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState("");
  const [ended, setEnded] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [recognition, setRecognition] = useState<any>(null);

  const submit = (rawText?: string) => {
    const text = (rawText ?? input).trim();

    if (!text) {
      setInputError(
        t(
          "Type a message before sending.",
          "اكتب رسالة قبل الإرسال.",
        ),
      );
      textareaRef.current?.focus();
      return;
    }

    if (text.length > MAX_MESSAGE) {
      setInputError(
        t(
          `Messages are limited to ${MAX_MESSAGE.toLocaleString()} characters.`,
          `الرسائل محدودة بـ ${MAX_MESSAGE.toLocaleString()} حرفًا.`,
        ),
      );
      textareaRef.current?.focus();
      return;
    }

    if (loading || streaming || ended) return;

    setInputError("");
    setError("");

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStreaming(true);

    void sendMessage(text)
      .catch(() => {
        setError(
          t(
            "Couldn't send the message. Check your connection and try again.",
            "تعذّر إرسال الرسالة. تحقّق من اتصالك وحاول مرة أخرى.",
          ),
        );
      })
      .finally(() => {
        setLoading(false);
        setStreaming(false);
      });
  };

  /* Talks to the deployed Fastify Morphe flow engine. The old widget streamed
     from a separate Python service that is not deployed, so every message
     failed in production; this endpoint is the one that is actually live. */
  const sendMessage = async (text: string) => {
    const res = await api.morpheChat(sessionId, text, lang, useSearch);

    if (res.session_id && res.session_id !== sessionId) {
      setSessionId(res.session_id);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "morphe",
        text: res.reply,
        content: res.reply,
        links: res.links,
        searchUsed: res.search_used,
        terminal: res.terminal,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (res.terminal) setEnded(true);
  };

  // Restore session
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) setSessionId(stored);
    } catch { /* noop */ }
  }, []);

  // Persist session
  useEffect(() => {
    if (sessionId) {
      try { sessionStorage.setItem(SESSION_KEY, sessionId); } catch { /* noop */ }
    }
  }, [sessionId]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = ar ? "ar-EG" : "en-US";
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setInputError("");
        setVoiceActive(false);
        textareaRef.current?.focus();
      };
      rec.onerror = (event: any) => {
        setVoiceActive(false);
        // Stopping the recogniser or a silent pause is not a user-facing error.
        if (event?.error === "aborted" || event?.error === "no-speech") return;
        setError(
          ar
            ? "الإدخال الصوتي غير متاح. يرجى الكتابة بدلًا من ذلك."
            : "Voice input not available. Please type instead.",
        );
      };
      rec.onend = () => {
        setVoiceActive(false);
      };
      setRecognition(rec);
    }
  }, [ar]);

  // Keyboard handling: Escape closes the panel. Enter is handled on the
  // textarea itself — a document-level listener fired twice per keypress
  // because the event bubbles, which sent every message twice.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Move focus into the composer when the panel opens.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => textareaRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Keep Tab inside the panel while it is open (aria-modal).
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener("keydown", onTab);
    return () => panel.removeEventListener("keydown", onTab);
  }, [open]);

  // Voice recording
  const startVoice = () => {
    if (!recognition) {
      setError(
        ar
          ? "الإدخال الصوتي غير مدعوم في هذا المتصفح."
          : "Voice input is not supported in this browser.",
      );
      return;
    }
    try {
      recognition.start();
      setVoiceActive(true);
      setError("");
    } catch {
      setVoiceActive(false);
      setError(
        ar
          ? "تعذّر بدء الإدخال الصوتي."
          : "Could not start voice input.",
      );
    }
  };

  const stopVoice = () => {
    if (recognition && voiceActive) {
      try { recognition.stop(); } catch { /* ignore */ }
      setVoiceActive(false);
    }
  };

  // File attachments are not offered: the flow engine has no upload endpoint.

  const startOver = () => {
    setMessages([]);
    setSessionId(null);
    setError("");
    setInputError("");
    setStreaming(false);
    setVoiceActive(false);
    setEnded(false);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
  };

  return (
    <div dir={dir} style={{ fontFamily: "Jost, system-ui, -apple-system, sans-serif" }}>
      {/* Launcher */}
      <button
        ref={launcherRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("Close chat", "إغلاق المحادثة") : t("Open chat with Morphe", "فتح محادثة مع مورفي")}
        style={{
          position: "fixed",
          bottom: ar ? 28 : 28,
          right: ar ? undefined : 28,
          left: ar ? 28 : undefined,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: open ? C.gold : C.navy,
          border: `2px solid ${C.gold}`,
          color: open ? C.navy : C.cream,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 22,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 12px 32px rgba(15,28,46,0.4)",
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: open ? "scale(0.95)" : "scale(1)",
        }}
      >
        {open ? "✕" : "M"}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("Morphe AI chat", "محادثة مورفي")}
          style={{
            position: "fixed",
            bottom: 100,
            right: 20,
            width: 420,
            maxWidth: "92vw",
            height: 720,
            maxHeight: "94vh",
            background: `linear-gradient(135deg, ${C.cream}, ${C.white})`,
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            boxShadow: "0 30px 80px rgba(15,28,46,0.35)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1100,
            direction: dir,
            animation: "panelIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            backdropFilter: "blur(12px)",
          }}
        >
          <style>{`
            @keyframes panelIn {
              from { opacity: 0; transform: translateY(24px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes slideInMsg {
              from { opacity: 0; transform: translateX(${ar ? "-12px" : "12px"}); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes pulseDot {
              0%, 100% { opacity: 0.4; }
              50% { opacity: 1; transform: scale(1.1); }
            }
            @keyframes typingBounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`,
              color: C.cream,
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(201,162,39,0.3)",
              }}
            >
              <MorpheIcon size={24} thinking={loading} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, fontSize: 17 }}>
                Morphe AI
              </div>
              <div style={{ fontSize: 10.5, opacity: 0.75, letterSpacing: "0.02em" }}>
                {ar ? "مساعد ذكي - شركة تيرامورف" : "AI Intake Assistant"}
              </div>
            </div>
            <button
              type="button"
              onMouseEnter={() => setShowPrivacyTooltip(true)}
              onMouseLeave={() => setShowPrivacyTooltip(false)}
              onFocus={() => setShowPrivacyTooltip(true)}
              onBlur={() => setShowPrivacyTooltip(false)}
              onClick={() => setShowPrivacyTooltip((v) => !v)}
              aria-label={t("Privacy information", "معلومات الخصوصية")}
              aria-describedby={
                showPrivacyTooltip ? "morphe-privacy-tooltip" : undefined
              }
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                transition: "color 0.2s",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Info size={14} strokeWidth={1.5} aria-hidden="true" />
            </button>
            {showPrivacyTooltip && (
              <div
                id="morphe-privacy-tooltip"
                role="tooltip"
                style={{
                  position: "absolute",
                  top: -64,
                  right: ar ? "auto" : 40,
                  left: ar ? 40 : "auto",
                  width: 260,
                  background: C.navy,
                  color: C.cream,
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 11,
                  lineHeight: 1.5,
                  zIndex: 2000,
                  border: `1px solid ${C.gold}`,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  animation: "slideInMsg 0.3s ease-out forwards",
                }}
              >
                {ar
                  ? "مورفي هو المساعد الذكي لشركة تيرامورف. تُعالج رسائلك للرد عليك ولا تُستخدم لتدريب النماذج."
                  : "Morphe is TerraMorph's AI assistant. Messages are processed to answer you and are not used for model training."}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
              aria-label={t("Close", "إغلاق")}
              style={{
                background: "rgba(251,249,240,0.1)",
                border: `1px solid ${C.border}`,
                color: C.cream,
                cursor: "pointer",
                fontSize: 18,
                padding: 0,
                lineHeight: 1,
                width: 34,
                height: 34,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label={t("Conversation", "المحادثة")}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background: C.ivory,
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start",
                  animation: "slideInMsg 0.3s ease-out forwards",
                }}
              >
                <div
                  style={{
                    maxWidth: "90%",
                    padding: "13px 18px",
                    borderRadius: 18,
                    fontSize: 14.5,
                    lineHeight: 1.7,
                    background: m.role === "user" ? C.navy : C.white,
                    color: m.role === "user" ? C.cream : C.ink,
                    border: m.role === "morphe" ? `1px solid ${C.border}` : "none",
                    boxShadow: m.role === "morphe" ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {m.content}
                  {m.role === "morphe" && m.searchUsed && (
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, color: C.gold, fontWeight: 700 }}>
                        🔍
                      </span>
                      <span style={{ fontSize: 10.5, color: C.slate }}>
                        {ar ? "بحث على الويب" : "Web search used"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {streaming && (
              <div style={{ alignSelf: "flex-start", marginBottom: 8 }} role="status">
                <div style={{ display: "flex", gap: 5, alignItems: "center" }} aria-hidden="true">
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.gold, animation: "pulseDot 1.4s infinite", animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: C.slate, marginTop: 6, fontStyle: "italic" }}>
                  {useSearch ? ar ? "البحث على الويب..." : "Searching the web..." : ar ? "مورفي يفكر..." : "Morphe is thinking..."}
                </div>
              </div>
            )}
            {error && (
              <div role="alert" style={{ fontSize: 12, color: C.error, marginTop: 8, padding: "8px 12px", background: "rgba(180,35,24,0.1)", borderRadius: 8, border: `1px solid ${C.error}33` }}>{error}</div>
            )}
          </div>

          {/* Input */}
          {!ended ? (
            <div
              style={{
                borderTop: `1px solid ${C.border}`,
                padding: 14,
                background: C.cream,
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {/* Web search */}
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setUseSearch((p) => !p);
                  }}
                  aria-label={t(
                    "Toggle web search",
                    "تفعيل أو إيقاف البحث على الويب",
                  )}
                  aria-pressed={useSearch}
                  title={t("Toggle web search", "تفعيل أو إيقاف البحث على الويب")}
                  style={{
                    background: useSearch ? C.gold : C.white,
                    border: `1px solid ${useSearch ? C.gold : C.border}`,
                    color: useSearch ? C.navy : C.slate,
                    borderRadius: 12,
                    width: 38,
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.2s",
                  }}
                >
                  <Search size={15} strokeWidth={1.6} aria-hidden="true" />
                </button>

                {/* Voice dictation */}
                <button
                  type="button"
                  onClick={() => (voiceActive ? stopVoice() : startVoice())}
                  aria-label={t("Dictate a message", "إملاء رسالة")}
                  aria-pressed={voiceActive}
                  title={t("Dictate a message", "إملاء رسالة")}
                  style={{
                    background: voiceActive ? C.error : C.white,
                    border: `1px solid ${voiceActive ? C.error : C.gold}`,
                    color: voiceActive ? C.white : C.navy,
                    borderRadius: "50%",
                    width: 38,
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.2s",
                  }}
                >
                  <Mic size={15} strokeWidth={1.6} aria-hidden="true" />
                </button>

                <textarea
                  id="morphe-composer"
                  ref={textareaRef}
                  value={input}
                  maxLength={MAX_MESSAGE}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (inputError) setInputError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  aria-label={t("Message Morphe", "راسل مورفي")}
                  aria-invalid={inputError ? true : undefined}
                  aria-describedby={
                    inputError ? "morphe-input-error" : undefined
                  }
                  placeholder={
                    ar ? "اكتب رسالتك..." : "Type your message..."
                  }
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: `1px solid ${inputError ? C.error : C.border}`,
                    borderRadius: 14,
                    padding: "12px 14px",
                    fontSize: 14.5,
                    outline: "none",
                    background: C.white,
                    color: C.ink,
                    resize: "none",
                    fontFamily: "inherit",
                    minHeight: "44px",
                    maxHeight: "140px",
                  }}
                />

                {/* Send */}
                <button
                  type="button"
                  onClick={() => submit()}
                  disabled={loading || streaming}
                  aria-label={t("Send message", "إرسال الرسالة")}
                  aria-busy={loading || streaming || undefined}
                  style={{
                    background: C.gold,
                    color: C.navy,
                    border: "none",
                    borderRadius: "50%",
                    width: 38,
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: loading || streaming ? "not-allowed" : "pointer",
                    flexShrink: 0,
                    opacity: loading || streaming ? 0.5 : 1,
                    transition: "all 0.2s",
                    boxShadow: "0 4px 12px rgba(201,162,39,0.35)",
                  }}
                >
                  <Send size={15} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
              {inputError && (
                <p
                  id="morphe-input-error"
                  role="alert"
                  style={{
                    margin: "8px 2px 0",
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: C.error,
                  }}
                >
                  {inputError}
                </p>
              )}
            </div>
          ) : (
            <div style={{ padding: 16, textAlign: "center", fontSize: 13, color: C.slate, borderTop: `1px solid ${C.border}`, background: C.cream }}>
              {ar ? "اكتملت المحادثة." : "Conversation complete."}{" "}
              <button
                type="button"
                onClick={startOver}
                style={{ color: C.navy, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
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
