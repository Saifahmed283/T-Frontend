import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import {
  MessageCircle,
  Send,
  Sparkles,
  X,
} from 'lucide-react'

import { api } from '@/lib/api'
import type { Lang } from '@/pages/site/types'
import './TerraMorphChat.css'

type ChatMessage = {
  role: 'user' | 'assistant'
  text: string
}

export default function TerraMorphChat({
  lang,
}: {
  lang: Lang
}) {
  const ar = lang === 'ar'

  const greeting = ar
    ? 'مرحبًا بك في تيرامورف. كيف يمكنني مساعدتك في استكشاف خدماتنا ومحتوى موقعنا؟'
    : 'Welcome to TerraMorph. How can I help you explore our work and services?'

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: greeting },
  ])

  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length === 1) {
      setMessages([{ role: 'assistant', text: greeting }])
    }
  }, [greeting])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending])

  async function sendMessage(value: string) {
    const text = value.trim()

    if (!text || pending) return

    const history = messages
      .slice(1)
      .slice(-8)
      .map(({ role, text: previousText }) => ({
        role,
        text: previousText,
      }))

    setDraft('')
    setError('')
    setMessages((current) => [
      ...current,
      { role: 'user', text },
    ])
    setPending(true)

    try {
      const result = await api.chat({
        message: text,
        history,
      })

      setMessages((current) => [
        ...current,
        { role: 'assistant', text: result.reply },
      ])
    } catch {
      setError(
        ar
          ? 'تعذر الاتصال بالمساعد حاليًا. يرجى المحاولة مرة أخرى.'
          : 'The assistant is temporarily unavailable. Please try again.',
      )
    } finally {
      setPending(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(draft)
  }

  const suggestions = ar
    ? [
        'ما هي تيرامورف؟',
        'ما هو منهج LDIA؟',
        'كيف يمكنني التواصل مع الفريق؟',
      ]
    : [
        'What does TerraMorph do?',
        'What is the LDIA method?',
        'How can I contact the team?',
      ]

  return (
    <div
      className="tm-chat-widget"
      dir={ar ? 'rtl' : 'ltr'}
    >
      {open && (
        <section
          id="tm-chat-panel"
          className="tm-chat-panel"
          role="dialog"
          aria-labelledby="tm-chat-title"
          aria-modal="false"
        >
          <header className="tm-chat-header">
            <div className="tm-chat-brand">
              <span className="tm-chat-mark" aria-hidden>
                <Sparkles size={19} />
              </span>

              <div>
                <strong id="tm-chat-title">
                  {ar ? 'مساعد تيرامورف' : 'TerraMorph Assistant'}
                </strong>
                <span>
                  {ar
                    ? 'معلومات الموقع · مساعد ذكاء اصطناعي'
                    : 'Website information · AI assistant'}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="tm-chat-close"
              aria-label={ar ? 'إغلاق المحادثة' : 'Close chat'}
              onClick={() => setOpen(false)}
            >
              <X size={19} />
            </button>
          </header>

          <div className="tm-chat-messages" role="log" aria-live="polite">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`tm-chat-row tm-chat-row--${item.role}`}
              >
                <div
                  className={`tm-chat-bubble tm-chat-bubble--${item.role}`}
                >
                  {item.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="tm-chat-suggestions">
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => void sendMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {pending && (
              <div className="tm-chat-status" role="status">
                {ar
                  ? 'جارٍ إعداد الإجابة…'
                  : 'Preparing your answer…'}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {error && (
            <p className="tm-chat-error" role="alert">
              {error}
            </p>
          )}

          <form
            className="tm-chat-form"
            onSubmit={handleSubmit}
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                ar ? 'اكتب سؤالك هنا…' : 'Ask TerraMorph a question…'
              }
              aria-label={ar ? 'رسالتك' : 'Your message'}
              maxLength={1200}
              disabled={pending}
            />

            <button
              type="submit"
              aria-label={ar ? 'إرسال الرسالة' : 'Send message'}
              disabled={pending || !draft.trim()}
            >
              <Send size={18} />
            </button>
          </form>

          <p className="tm-chat-privacy">
            {ar
              ? 'يرجى عدم مشاركة معلومات سرية أو بيانات حساسة.'
              : 'Please do not share confidential or sensitive information.'}
          </p>
        </section>
      )}

      <button
        type="button"
        className="tm-chat-launcher"
        aria-label={
          open
            ? ar ? 'إغلاق المحادثة' : 'Close chat'
            : ar ? 'افتح مساعد تيرامورف' : 'Open TerraMorph chat'
        }
        aria-expanded={open}
        aria-controls="tm-chat-panel"
        onClick={() => setOpen((current) => !current)}
      >
        {open
          ? <X size={23} />
          : <MessageCircle size={24} />}
      </button>
    </div>
  )
}