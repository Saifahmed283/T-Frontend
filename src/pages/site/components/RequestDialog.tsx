import { useEffect, useState, type FormEvent } from 'react'
import { Dialog } from '@/components/ui'
import { api, ApiError, type SubmissionKind } from '@/lib/api'

export type RequestConfig = {
  kind: SubmissionKind
  title: string
  intro?: string
  submitLabel?: string
  requireMessage?: boolean
  context?: Record<string, unknown>
}

/* Captures a name/email message and records it as a backend Submission. Used by
   every CTA that needs a human reply: seat reservations, teaming, careers,
   tenders, publications and expert registration. */
export function RequestDialog({ request, onClose }: { request: RequestConfig | null; onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [phase, setPhase] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const open = !!request

  useEffect(() => {
    if (open) {
      setName('')
      setEmail('')
      setMessage('')
      setPhase('idle')
      setError('')
    }
  }, [open])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!request) return
    setPhase('sending')
    setError('')
    try {
      await api.submit({
        kind: request.kind,
        email,
        name: name.trim() || undefined,
        message: message.trim() || undefined,
        source: 'site',
        payload: request.context,
      })
      setPhase('done')
    } catch (err) {
      setPhase('error')
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} onBackdropClick={onClose} labelledBy="request-dialog-title" className="grid place-items-center bg-navy-3/70 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="mx-5 w-[min(520px,92vw)] border border-line bg-ivory shadow-2xl" style={{ animation: 'fadeup .3s both' }}>
        {phase === 'done' ? (
          <div className="p-10 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ok text-ivory">✓</span>
            <h3 id="request-dialog-title" className="mt-6 text-3xl font-medium">Got it — we're on it.</h3>
            <p className="mt-3 text-navy-2">A partner will reach out within two working days. We never share your details.</p>
            <button onClick={onClose} className="mt-8 border border-navy px-6 py-3 text-xs tracking-[0.18em] text-navy uppercase transition hover:bg-navy hover:text-ivory">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-line px-8 py-5">
              <p className="eyebrow text-gold-strong">{request?.title}</p>
              <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center text-navy transition hover:bg-ivory-2">✕</button>
            </div>
            <form onSubmit={submit} className="p-8" aria-busy={phase === 'sending'}>
              {request?.intro && <p className="text-sm text-slate">{request.intro}</p>}
              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className="eyebrow text-slate">Your name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} name="name" autoComplete="name" placeholder="Full name"
                    className="mt-2 w-full border-b border-navy/30 bg-transparent py-2 focus:border-gold focus:outline-none" />
                </label>
                <label className="block">
                  <span className="eyebrow text-slate">Work email <span className="text-gold-strong">*</span></span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" name="email" autoComplete="email" placeholder="you@organisation.org"
                    className="mt-2 w-full border-b border-navy/30 bg-transparent py-2 focus:border-gold focus:outline-none" />
                </label>
                <label className="block">
                  <span className="eyebrow text-slate">{request?.requireMessage ? 'Message *' : 'Message — optional'}</span>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} required={request?.requireMessage} name="message" rows={3} placeholder="Anything we should know to prepare?"
                    className="mt-2 w-full resize-none border-b border-navy/30 bg-transparent py-2 focus:border-gold focus:outline-none" />
                </label>
              </div>
              {phase === 'error' && <p role="alert" className="eyebrow mt-5 text-error">{error}</p>}
              <button type="submit" disabled={phase === 'sending'}
                className="mt-8 w-full bg-navy px-6 py-4 text-xs tracking-[0.2em] text-ivory uppercase transition hover:bg-navy-2 disabled:opacity-60">
                {phase === 'sending' ? 'Sending…' : (request?.submitLabel ?? 'Request')} →
              </button>
            </form>
          </>
        )}
      </div>
    </Dialog>
  )
}