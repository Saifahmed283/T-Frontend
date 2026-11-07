import { useEffect, useState } from "react"
import { usePageContext } from "vike-react/usePageContext"
import { Shield } from "lucide-react"

import SitePage from "@/pages/site/SitePage"
import { Heading, Button, Prose, GoldLine, Card, CardContent, Field, Input, Textarea, Select } from "@/components/ui"
import { DATA_REQUEST_TYPES, type DataRequestType, getRequiredFields } from "@/content/data-requests"

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

function DataRequestPage() {
  const [formData, setFormData] = useState<{
    type: "access" | "rectification" | "erasure" | "restriction" | "portability" | "objection" | "withdraw_consent"
    email: string
    name: string
    details: string
  }>({
    type: "access",
    email: "",
    name: "",
    details: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [requestId, setRequestId] = useState<string | null>(null)

  const validateForm = () => {
    const errors: Record<string, string> = {}
    const requiredFields = getRequiredFields(formData.type)
    
    if (!formData.email) errors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Enter a valid email address"
    
    if (requiredFields.includes('name') && !formData.name) errors.name = "Name is required"
    if (requiredFields.includes('details') && !formData.details) errors.details = "Details are required for this request type"
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setStatus('loading')
    setMessage('')

    try {
      // In production, this would call the API
      // const res = await fetch('/api/v1/data-requests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Generate a mock request ID
      const mockId = `DSR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      setRequestId(mockId)
      setStatus('success')
      setMessage(`Your request has been submitted. Reference: ${mockId}`)
      
      // Clear form
      setFormData({ type: "access", email: "", name: "", details: "" })
    } catch (e) {
      setStatus('error')
      setMessage('Something went wrong. Please try again or contact us.')
    }
  }

  const requiredFields = getRequiredFields(formData.type)
  const typeConfig = DATA_REQUEST_TYPES.find(t => t.value === formData.type)

  return (
    <SitePage lang="en">
      <div className="mx-auto max-w-[600px] px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20">
        <header className="mb-10">
          <h1 className="text-h1 sm:text-h2 mb-3">Data Subject Request</h1>
          <p className="text-navy-2">Exercise your rights under GDPR and Egypt PDPL. We'll process your request within 30 days.</p>
        </header>

        <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-6 space-y-6">
              <h2 className="text-h3">Submit a Data Subject Request</h2>
              <p className="text-navy-2">Exercise your rights under GDPR and Egypt PDPL. We'll process your request within 30 days.</p>
              
              <Field label="Request Type" required>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as "access" | "rectification" | "erasure" | "restriction" | "portability" | "objection" | "withdraw_consent" }))}
                >
                  {DATA_REQUEST_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <p className="text-sm text-navy-2 mt-2">
                {typeConfig?.description}
              </p>

              <Field label="Email" error={formErrors.email} required>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </Field>

              {requiredFields.includes('name') && (
                <Field label="Full Name" error={formErrors.name} required>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </Field>
              )}

              {requiredFields.includes('details') && (
                <Field label="Details" error={formErrors.details} required hint="Please provide specific details about your request">
                  <Textarea
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData((prev) => ({ ...prev, details: e.target.value }))}
                    placeholder="Describe your request in detail..."
                  />
                </Field>
              )}

              <div className="pt-4 border-t border-line">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 shrink-0 rounded border-line text-gold-strong focus:ring-2 focus:ring-gold focus:ring-offset-2"
                  />
                  <div>
                    <span className="block font-medium text-sm text-navy">I confirm this is my own request and the information provided is accurate.</span>
                    <p className="mt-1 text-xs text-slate">
                      We may contact you to verify your identity before processing.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" variant="primary" disabled={status === 'loading'} className="w-full">
                  {status === 'loading' ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
                <Button type="button" variant="ghost" onClick={() => {
                  setFormData({ type: "access", email: "", name: "", details: "" })
                  setFormErrors({})
                  setStatus('idle')
                  setMessage('')
                  setRequestId(null)
                }} className="w-full">
                  Clear Form
                </Button>
              </div>

              {status === 'success' && (
                <div className="pt-6 border-t border-line">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="h-6 w-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-medium text-green-800">Request Submitted Successfully</p>
                      <p className="text-sm text-green-700 mt-1">
                        Reference: <span className="font-mono font-medium">{requestId}</span>
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        We'll send a verification email to <span className="font-mono">{formData.email}</span> within 24 hours.
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary" className="mt-4 w-full" onClick={() => {
                    setFormData({ type: "access", email: "", name: "", details: "" })
                    setFormErrors({})
                    setStatus('idle')
                    setMessage('')
                    setRequestId(null)
                  }}>
                    Submit Another Request
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="pt-6 border-t border-line">
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <svg className="h-6 w-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-medium text-red-800">Submission Failed</p>
                      <p className="text-sm text-red-700">{message || 'Something went wrong. Please try again or contact us.'}</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="mt-4 w-full" onClick={() => setStatus('idle')}>
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </form>
            </CardContent>
          </Card>

        <footer className="mt-10 text-center">
          <p className="text-sm text-navy-2">
            <a href="/legal/privacy-policy" className="underline decoration-gold underline-offset-2 hover:text-navy">Privacy Policy</a>
            {' '}·{' '}
            <a href="/legal/terms-of-service" className="underline decoration-gold underline-offset-2 hover:text-navy">Terms of Service</a>
          </p>
          <p className="mt-1 text-sm text-navy-2">
            <a href="mailto:privacy@askterramorph.com" className="underline decoration-gold underline-offset-2 hover:text-navy">privacy@askterramorph.com</a>
          </p>
        </footer>
      </div>
    </SitePage>
  )
}

export default DataRequestPage