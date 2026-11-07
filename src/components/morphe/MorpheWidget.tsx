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
import { useCallback, useEffect, useRef, useState } from "react";

import { Send, Mic, Info, Search } from "lucide-react";
import { api } from "@/lib/api";
import { MorpheIcon } from "./MorpheIcon";
import { KNOWLEDGE_BASE, findKnowledgeAnswer } from "./knowledge-base";
import type { Lang } from "@/pages/site/types";

type ChatMessage = {
  id: string;
  role: "morphe" | "user";
  text: string;
  content?: string;
  links?: Array<{ id: string; url: string; label: string }>;
  chips?: string[];
  terminal?: boolean;
  thinking?: boolean;
  searchUsed?: boolean;
  attachments?: Array<{ id: string; filename: string; size: number }>;
  sources?: Array<{ id: string; url: string; label: string }>;
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
const ALLOWED_EXTS = [".pdf", ".docx", ".txt", ".md", ".csv", ".json", ".png", ".jpg", ".jpeg"];
const MAX_MESSAGE = 4000;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export default function MorpheWidget({ lang = "en" }: { lang?: Lang }) {
  const ar = lang !== "en";
  const dir = ar ? "rtl" : "ltr";

  const t = (en: string, arText: string) => (ar ? arText : en);

  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recognition, setRecognition] = useState<any>(null);

  const submit = () => {
    const text = input.trim();

    if (!text && attachments.length === 0) {
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

    if (loading || streaming) return;

    setInputError("");

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: text || "[Attachment]",
      content: text || "[Attachment]",
      attachments: [...attachments].map((f) => ({
        id: crypto.randomUUID(),
        filename: f.name,
        size: f.size,
      })),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");
    setStreaming(true);

    void sendMessage(text).catch(() => {
      setError(
        t(
          "Couldn't send the message. Check your connection and try again.",
          "تعذّر إرسال الرسالة. تحقّق من اتصالك وحاول مرة أخرى.",
        ),
      );
    }).finally(() => {
      setLoading(false);
      setStreaming(false);
    });
  };

  const sendMessage = async (text: string) => {
    const fileIds: string[] = [];
    for (const f of attachments) {
      const formData = new FormData();
      formData.append("file", f);
      if (sessionId) formData.append("session_id", sessionId);
      const res = await fetch(`${api.baseUrl}/api/v1/morphe-ai/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        fileIds.push(data.file_id);
      }
    }
    setAttachments([]);

    await sendToAi(text, fileIds);
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
        setVoiceActive(false);
        submit();
      };
      rec.onerror = () => {
        setVoiceActive(false);
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

  // Keyboard handling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Enter" && !e.shiftKey && !loading && !streaming) {
        e.preventDefault();
        submit();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, streaming]);

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

  // File selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid: File[] = [];
    for (const f of files) {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        setError(
          ar
            ? `${f.name}: نوع الملف غير مسموح.`
            : `${f.name}: file type not allowed.`,
        );
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        setError(
          ar
            ? `${f.name}: الملف أكبر من 10 ميغابايت.`
            : `${f.name}: too large (max 10 MB).`,
        );
        continue;
      }
      valid.push(f);
    }
    if (valid.length > 0) setAttachments((prev) => [...prev, ...valid]);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const sendToAi = async (text: string, fileIds: string[] = []) => {
    const res = await fetch(`${api.baseUrl}/api/v1/morphe-ai/chat/stream`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId ?? null,
        message: text,
        lang,
        mode: "chat",
        stream: true,
        use_search: useSearch,
        temperature: 0.7,
        max_tokens: 2000,
        file_ids: fileIds,
      }),
    });
    if (!res.ok) throw new Error("Chat failed");

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response stream");

    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "morphe",
      text: "",
      content: "",
      sources: [],
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    const aiIndex = messages.length;

    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += new TextDecoder().decode(value);
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.chunk) {
              aiMessage.content += payload.chunk;
              setMessages((prev) =>
                prev.map((m, i) => (i === aiIndex ? { ...m, content: aiMessage.content } : m))
              );
            }
            if (payload.done) {
              aiMessage.sources = payload.sources || [];
              aiMessage.searchUsed = payload.searchUsed || false;
              setMessages((prev) =>
                prev.map((m, i) => (i === aiIndex ? { ...aiMessage } : m))
              );
            }
          } catch { /* ignore */ }
        }
      }
    }
  };

  const startOver = () => {
    setMessages([]);
    setSessionId(null);
    setError("");
    setAttachments([]);
    setStreaming(false);
    setVoiceActive(false);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
  };

  return (
    <div dir={dir} style={{ fontFamily: "Jost, system-ui, -apple-system, sans-serif" }}>
      {/* Launcher */}
      <button
        ref={launcherRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("إغلاق المحادثة", "Close chat") : t("فتح محادثة مع مورفي", "Open chat with Morphe")}
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
          aria-label={t("محادثة مورفي", "Morphe AI chat")}
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
              onClick={() => setOpen(false)}
              aria-label={t("إغلاق", "Close")}
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

          {/* Controls: web search + voice */}
          <div
            style={{
              padding: "10px 18px",
              display: "flex",
              gap: 10,
              alignItems: "center",
              background: C.ivory,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <button
              onClick={() => setUseSearch((p) => { setError(""); return !p })}
              style={{
                background: useSearch ? C.gold : "transparent",
                border: `1px solid ${useSearch ? C.gold : C.border}`,
                color: useSearch ? C.navy : C.slate,
                borderRadius: 10,
                padding: "6px 14px",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Search size={12} strokeWidth={1.5} />
              {useSearch ? ar ? "إيقاف البحث على الويب" : "Web Search On" : ar ? "بحث على الويب" : "Web Search"}
            </button>
            <button
              onMouseDown={startVoice}
              onMouseUp={stopVoice}
              onMouseLeave={stopVoice}
              disabled={voiceActive}
              style={{
                background: voiceActive ? C.error : C.white,
                border: `1px solid ${voiceActive ? C.error : C.gold}`,
                color: voiceActive ? C.white : C.navy,
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: voiceActive ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              title={ar ? "تسجيل صوتي" : "Voice Record"}
            >
              <Mic size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
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
                {m.role === "user" && m.attachments && m.attachments.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    {m.attachments.map((a) => (
                      <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 7, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", fontSize: 12, color: C.slate }}>
                        <span style={{ fontSize: 14 }}>📎</span>
                        <span style={{ fontWeight: 600, color: C.ink }}>{a.filename}</span>
                        <span style={{ fontSize: 10, color: C.slate }}>({Math.round(a.size / 1024)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
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
              <div style={{ alignSelf: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
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
              <div style={{ fontSize: 12, color: C.error, marginTop: 8, padding: "8px 12px", background: "rgba(180,35,24,0.1)", borderRadius: 8, border: `1px solid ${C.error}33` }}>{error}</div>
            )}
          </div>

          {/* Quick-reply chips */}
          {false && null}

          {/* Input */}
          {!ended ? (
            <div
              style={{
                display: "flex",
                borderTop: `1px solid ${C.border}`,
                padding: 14,
                gap: 8,
                background: C.cream,
                alignItems: "center",
              }}
            >
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <label
                onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                style={{
                  color: C.gold,
                  cursor: "pointer",
                  fontSize: 15,
                }}
              >
                📎
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
                }}
                placeholder={ar ? "اكتب رسالتك..." : "Type your message..."}
                style={{
                  flex: 1,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: "13px 48px 13px 48px",
                  fontSize: 14.5,
                  outline: "none",
                  background: C.white,
                  color: C.ink,
                  resize: "vertical",
                  fontFamily: "inherit",
                  minHeight: "48px",
                  maxHeight: "140px",
                }}
              />
              {attachments.length > 0 && (
                <div style={{ position: "absolute", right: 10, top: 10, display: "flex", gap: 5 }}>
                  {attachments.map((f, i) => (
                    <span key={i} style={{ background: C.navy, color: C.cream, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 10 }} onClick={() => removeAttachment(i)}>×</span>
                  ))}
                </div>
              )}
              {/* Voice record */}
              <button
                onMouseDown={startVoice}
                onMouseUp={stopVoice}
                onMouseLeave={stopVoice}
                disabled={voiceActive}
                style={{
                  background: voiceActive ? C.error : C.white,
                  border: `1px solid ${voiceActive ? C.error : C.gold}`,
                  color: voiceActive ? C.white : C.navy,
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: voiceActive ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  marginRight: 8,
                }}
                title={ar ? "تسجيل صوتي" : "Voice Record"}
              >
                <Mic size={14} strokeWidth={1.5} />
              </button>
              {/* Send */}
              <button
                onClick={() => submit()}
                disabled={loading || streaming || (!input.trim() && attachments.length === 0)}
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
                  cursor: "pointer",
                  opacity: (loading || streaming || (!input.trim() && attachments.length === 0)) ? 0.5 : 1,
                  transition: "all 0.2s",
                  boxShadow: "0 4px 12px rgba(201,162,39,0.35)",
                }}
              >
                <Send size={14} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <div style={{ padding: 16, textAlign: "center", fontSize: 13, color: C.slate, borderTop: `1px solid ${C.border}`, background: C.cream }}>
              {ar ? "اكتملت المحادثة." : "Conversation complete."}{" "}
              <button
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
