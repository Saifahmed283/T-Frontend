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
  const [isMobile, setIsMobile] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [greeted, setGreeted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const infoBtnRef = useRef<HTMLButtonElement>(null);
  const [tooltipRect, setTooltipRect] = useState<{ top: number; left: number } | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  // Responsive sizing: smaller launcher + taller-but-capped panel on mobile.
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Reveal animation: once the widget mounts (after cookie consent is given),
  // the launcher slides up and fades in.
  useEffect(() => {
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Close the privacy tooltip when clicking outside the info button.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (showPrivacyTooltip && infoBtnRef.current && !infoBtnRef.current.contains(e.target as Node)) {
        setShowPrivacyTooltip(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showPrivacyTooltip]);

  /* ------------------------------------------------------------------ */
  /*  Interactive message content                                       */
  /* ------------------------------------------------------------------ */

  /* Turns plain text into clickable interactive elements:
     http/https URLs  -> <a href> that navigates to the route directly
     email addresses  -> mailto: links
     phone numbers    -> tel: links
  */
  const renderInteractiveContent = (content: string) => {
    // Split on URL, email, or phone patterns while keeping the delimiters
    const parts = content.split(
      /(https?:\/\/[^\s<>"'()]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|\+?\d[\d\s().-]{7,}\d)/g,
    );

    return parts.map((part, i) => {
      if (/^https?:\/\//i.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: C.gold,
              textDecoration: "underline",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {part}
          </a>
        );
      }
      if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(part)) {
        return (
          <a
            key={i}
            href={`mailto:${part}`}
            style={{
              color: C.gold,
              textDecoration: "underline",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {part}
          </a>
        );
      }
      if (/^\+?\d[\d\s().-]{7,}\d$/.test(part)) {
        return (
          <a
            key={i}
            href={`tel:${part.replace(/[\s().-]/g, "")}`}
            style={{
              color: C.gold,
              textDecoration: "underline",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  /* Sends a quick-action chip message immediately (auto-submit). */
  const sendQuickAction = (message: string) => {
    setInput(message);
    submit(message);
  };

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

  // Speech recognition setup — max sensitivity, continuous listening with
  // interim results so the user sees letters appear as they speak.
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 5;
      rec.lang = ar ? "ar-EG" : "en-US";
      rec.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setInput(finalTranscript);
          setInputError("");
          setVoiceActive(false);
          try { rec.stop(); } catch { /* ignore */ }
          textareaRef.current?.focus();
        } else if (interimTranscript) {
          setInput(interimTranscript);
          setInputError("");
        }
      };
      rec.onerror = (event: any) => {
        setVoiceActive(false);
        // Aborted / no-speech are normal when the user stops speaking — not errors.
        if (event?.error === "aborted" || event?.error === "no-speech") return;
        setError(
          ar
            ? "الإدخال الصوتي غير متاح. يرجى الكتابة بدلًا من ذلك."
            : "Voice input not available. Please type instead.",
        );
      };
      rec.onend = () => {
        // Only deactivate if we haven't just finalized a transcript.
        if (voiceActive) setVoiceActive(false);
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
        onClick={() => {
          const willOpen = !open;
          setOpen(willOpen);
          if (willOpen && messages.length === 0 && !greeted) {
            setGreeted(true);
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "morphe",
                text: t(
                  "Hello! I'm Morphe, TerraMorph's AI intake assistant. I can help you explore our advisory method, services, case studies, or start a partnership conversation. How can I assist you today?",
                  "مرحباً! أنا مورفي، المساعد الذكي لاستقبال العملاء في تيرامورف. يمكنني مساعدتك في استكشاف منهجيتنا الاستشارية، خدماتنا، دراسات الحالة، أو بدء محادثة شراكة. كيف يمكنني مساعدتك اليوم؟",
                ),
                content: t(
                  "Hello! I'm Morphe, TerraMorph's AI intake assistant. I can help you explore our advisory method, services, case studies, or start a partnership conversation. How can I assist you today?",
                  "مرحباً! أنا مورفي، المساعد الذكي لاستقبال العملاء في تيرامورف. يمكنني مساعدتك في استكشاف منهجيتنا الاستشارية، خدماتنا، دراسات الحالة، أو بدء محادثة شراكة. كيف يمكنني مساعدتك اليوم؟",
                ),
                timestamp: new Date().toISOString(),
              },
            ]);
          }
        }}
        aria-label={open ? t("Close chat", "إغلاق المحادثة") : t("Open chat with Morphe", "فتح محادثة مع مورفي")}
        style={{
          position: "fixed",
          bottom: isMobile ? 20 : 28,
          right: ar ? undefined : isMobile ? 16 : 28,
          left: ar ? isMobile ? 16 : 28 : undefined,
          width: isMobile ? 48 : 56,
          height: isMobile ? 48 : 56,
          borderRadius: "50%",
          background: open ? C.gold : C.navy,
          border: `2px solid ${C.gold}`,
          color: open ? C.navy : C.cream,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: isMobile ? 18 : 22,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 12px 32px rgba(15,28,46,0.4)",
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          opacity: revealed ? 1 : 0,
          transform: revealed
            ? open
              ? "scale(0.95)"
              : "scale(1)"
            : "scale(0.8) translateY(20px)",
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
            right: ar ? undefined : isMobile ? 12 : 20,
            left: ar ? isMobile ? 12 : undefined : undefined,
            width: isMobile ? "92vw" : 420,
            maxWidth: "96vw",
            height: "72vh",
            background: `linear-gradient(135deg, ${C.cream}, ${C.white})`,
            border: `1px solid ${C.border}`,
            borderRadius: isMobile ? 16 : 24,
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
            @keyframes pulseVoice {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.4; }
            }
            @keyframes pulseRing {
              0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
              100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
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
              ref={infoBtnRef}
              type="button"
              onMouseEnter={(e) => {
                setShowPrivacyTooltip(true);
                const r = infoBtnRef.current?.getBoundingClientRect();
                if (r) setTooltipRect({ top: r.top, left: r.left });
              }}
              onMouseLeave={() => setShowPrivacyTooltip(false)}
              onFocus={(e) => {
                setShowPrivacyTooltip(true);
                const r = infoBtnRef.current?.getBoundingClientRect();
                if (r) setTooltipRect({ top: r.top, left: r.left });
              }}
              onBlur={() => {
                // Delay hide so a click can register before the tooltip closes
                setTimeout(() => setShowPrivacyTooltip(false), 150);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowPrivacyTooltip(true);
                const r = infoBtnRef.current?.getBoundingClientRect();
                if (r) setTooltipRect({ top: r.top, left: r.left });
              }}
              aria-label={t("Privacy information", "معلومات الخصوصية")}
              aria-describedby={
                showPrivacyTooltip ? "morphe-privacy-tooltip" : undefined
              }
              style={{
                background: "rgba(255,255,255,0.08)",
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.9)",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              <Info size={16} strokeWidth={1.6} aria-hidden="true" />
            </button>
            {showPrivacyTooltip && (
              <div
                id="morphe-privacy-tooltip"
                role="tooltip"
                style={{
                  position: "fixed",
                  top: tooltipRect ? tooltipRect.top - 70 : 120,
                  left: tooltipRect
                    ? ar
                      ? Math.max(8, tooltipRect.left - 260 + 24)
                      : Math.max(8, tooltipRect.left)
                    : ar
                      ? undefined
                      : 20,
                  right: tooltipRect || ar ? undefined : 20,
                  width: 260,
                  background: C.navy,
                  color: C.cream,
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 11,
                  lineHeight: 1.5,
                  zIndex: 9999,
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
            {messages.map((m) => {
              const isMorphe = m.role === "morphe";
              const time = m.timestamp
                ? new Date(m.timestamp).toLocaleTimeString(ar ? "ar-EG" : "en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMorphe ? "flex-start" : "flex-end",
                    animation: "slideInMsg 0.3s ease-out forwards",
                    gap: 6,
                  }}
                >
                  {/* Sender label */}
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: isMorphe ? C.gold : C.slate,
                      marginLeft: isMorphe ? 0 : "auto",
                      marginRight: isMorphe ? "auto" : 0,
                      marginBottom: 2,
                    }}
                  >
                    {isMorphe ? t("Morphe", "مورفي") : t("You", "أنت")}
                  </div>

                  {/* Message bubble */}
                  <div
                    style={{
                      maxWidth: "90%",
                      padding: "12px 16px",
                      borderRadius: isMorphe ? 16 : 16,
                      background: isMorphe ? C.white : C.navy,
                      color: isMorphe ? C.ink : C.cream,
                      border: isMorphe ? `1px solid ${C.border}` : "none",
                      boxShadow: isMorphe ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {renderInteractiveContent(m.content ?? "")}
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

                  {/* Timestamp */}
                  <div
                    style={{
                      fontSize: 9.5,
                      color: C.slate,
                      marginLeft: isMorphe ? 4 : "auto",
                      marginRight: isMorphe ? "auto" : 4,
                    }}
                  >
                    {time}
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div style={{ alignSelf: "center", color: C.slate, fontSize: 13, paddingTop: 40 }}>
                {ar ? "انقر على الأيقونة لبدء المحادثة مع مورفي" : "Tap the icon to start a conversation with Morphe"}
              </div>
            )}
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

            {/* Suggested actions after greeting */}
            {messages.length === 1 && messages[0]?.role === "morphe" && !streaming && !ended && (
              <div style={{ marginTop: 10, padding: "0 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: C.slate, marginBottom: 6 }}>
                  {t("Quick actions", "إجراءات سريعة")}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { key: "about", label: t("About TerraMorph", "عن تيرامورف"), message: t("Tell me about TerraMorph", "أخبرني عن تيرامورف") },
                    { key: "services", label: t("Services", "الخدمات"), message: t("What services do you offer?", "ما الخدمات التي تقدمونها؟") },
                    { key: "case-studies", label: t("Case Studies", "دراسات الحالة"), message: t("Show me case studies", "أظهر لي دراسات الحالة") },
                    { key: "contact", label: t("Contact Team", "تواصل مع الفريق"), message: t("How can I contact the team?", "كيف يمكنني التواصل مع الفريق؟") },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => sendQuickAction(item.message)}
                      style={{
                        flexShrink: 0,
                        padding: "8px 14px",
                        borderRadius: 20,
                        border: `1px solid ${C.border}`,
                        background: C.white,
                        color: C.ink,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
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
                  aria-label={voiceActive ? t("Stop dictation", "إيقاف الإملاء") : t("Dictate a message", "إملاء رسالة")}
                  aria-pressed={voiceActive}
                  title={voiceActive ? t("Stop dictation", "إيقاف الإملاء") : t("Dictate a message", "إملاء رسالة")}
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
                    boxShadow: voiceActive
                      ? `0 0 0 0 ${C.error}80`
                      : "0 2px 6px rgba(0,0,0,0.1)",
                    animation: voiceActive ? "pulseVoice 1.5s infinite" : "none",
                  }}
                >
                  <Mic size={15} strokeWidth={1.6} aria-hidden="true" />
                  {voiceActive && (
                    <span style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      border: `2px solid ${C.error}`,
                      opacity: 0.5,
                      animation: "pulseRing 1.5s infinite",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                    }} />
                  )}
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
