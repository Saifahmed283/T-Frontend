import { useState } from "react"
import { Loader2 } from "lucide-react"

import SitePage, { useLang } from "@/pages/site/SitePage"
import {
  Button,
  Card,
  CardContent,
  Field,
  Input,
  Textarea,
  Select,
} from "@/components/ui"
import {
  DATA_REQUEST_TYPES,
  DATA_REQUEST_TYPE_DESCRIPTIONS,
  DATA_REQUEST_TYPE_DESCRIPTIONS_AR,
  DATA_REQUEST_TYPE_LABELS,
  DATA_REQUEST_TYPE_LABELS_AR,
  getRequiredFields,
  type DataRequestType,
} from "@/content/data-requests"
import { api } from "@/lib/api"
import { messageForError } from "@/lib/messages"
import {
  validateConfirmation,
  validateEmail,
  validateMessage,
  validateName,
} from "@/lib/validation"
import { useFormValidation } from "@/lib/useFormValidation"

function DataRequestForm() {
  const { lang } = useLang()
  const ar = lang === "ar"

  const [status, setStatus] = useState<"idle" | "success">("idle")
  const [requestId, setRequestId] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState("")

  const form = useFormValidation({
    fields: {
      type: { initial: "access" as DataRequestType },
      email: {
        initial: "",
        validate: (value) => validateEmail(value, lang),
      },
      name: {
        initial: "",
        validate: (value, values) =>
          getRequiredFields(values.type as DataRequestType).includes("name")
            ? validateName(value, lang)
            : null,
      },
      details: {
        initial: "",
        validate: (value, values) =>
          getRequiredFields(values.type as DataRequestType).includes("details")
            ? validateMessage(value, lang)
            : null,
      },
      confirm: {
        initial: false,
        validate: (value) => validateConfirmation(value, lang),
      },
    },
    onSubmit: async (values) => {
      const email = String(values.email).trim()

      try {
        const res = await api.dataRequestCreate({
          type: values.type as DataRequestType,
          email,
          name: String(values.name).trim() || undefined,
          details: String(values.details).trim() || undefined,
        })

        setRequestId(res.id)
        setSubmittedEmail(email)
        setStatus("success")
        form.reset()
      } catch (cause) {
        const { message } = messageForError(cause, lang)
        throw new Error(
          message ||
            (ar
              ? "حدث خطأ ما. حاول مرة أخرى أو تواصل معنا."
              : "Something went wrong. Please try again or contact us."),
        )
      }
    },
  })

  const values = form.values
  const selectedType = values.type as DataRequestType
  const requiredFields = getRequiredFields(selectedType)
  const typeDescription = ar
    ? DATA_REQUEST_TYPE_DESCRIPTIONS_AR[selectedType]
    : DATA_REQUEST_TYPE_DESCRIPTIONS[selectedType]
  const typeLabels = ar ? DATA_REQUEST_TYPE_LABELS_AR : DATA_REQUEST_TYPE_LABELS

  const clearForm = () => {
    form.reset()
    setStatus("idle")
    setRequestId(null)
    setSubmittedEmail("")
  }

  return (
    <div className="mx-auto max-w-[600px] px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20">
      <header className="mb-10">
        <h1 className="text-h1 sm:text-h2 mb-3">
          {ar ? "طلب حقوق صاحب البيانات" : "Data Subject Request"}
        </h1>
        <p className="text-navy-2">
          {ar
            ? "مارس حقوقك بموجب اللائحة العامة لحماية البيانات (GDPR) وقانون حماية البيانات الشخصية المصري. سنعالج طلبك خلال 30 يومًا."
            : "Exercise your rights under GDPR and Egypt PDPL. We'll process your request within 30 days."}
        </p>
      </header>

      <Card>
        <CardContent>
          <form {...form.formProps} className="space-y-6">
            <div className="p-6 space-y-6">
              <h2 className="text-h3">
                {ar
                  ? "قدّم طلبًا خاصًا بصاحب البيانات"
                  : "Submit a Data Subject Request"}
              </h2>
              <p className="text-navy-2">
                {ar
                  ? "أخبرنا بالحق الذي ترغب في ممارسته وسنتولى الباقي."
                  : "Tell us which right you would like to exercise and we will take it from there."}
              </p>

              <Field
                label={ar ? "نوع الطلب" : "Request Type"}
                required
              >
                <Select {...form.input("type")}>
                  {DATA_REQUEST_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {typeLabels[t.value]}
                    </option>
                  ))}
                </Select>
              </Field>

              <p className="text-sm text-navy-2 mt-2">{typeDescription}</p>

              <Field
                label={ar ? "البريد الإلكتروني" : "Email"}
                error={form.error("email") ?? undefined}
                required
              >
                <Input
                  {...form.input("email")}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                />
              </Field>

              {requiredFields.includes("name") && (
                <Field
                  label={ar ? "الاسم الكامل" : "Full Name"}
                  error={form.error("name") ?? undefined}
                  required
                >
                  <Input
                    {...form.input("name")}
                    autoComplete="name"
                    placeholder={ar ? "اسمك الكامل" : "Your full name"}
                  />
                </Field>
              )}

              {requiredFields.includes("details") && (
                <Field
                  label={ar ? "التفاصيل" : "Details"}
                  error={form.error("details") ?? undefined}
                  hint={
                    ar
                      ? "يرجى تقديم تفاصيل محددة حول طلبك"
                      : "Please provide specific details about your request"
                  }
                  required
                >
                  <Textarea
                    {...form.input("details")}
                    rows={4}
                    placeholder={
                      ar
                        ? "صِف طلبك بالتفصيل…"
                        : "Describe your request in detail…"
                    }
                  />
                </Field>
              )}

              <div className="pt-4 border-t border-line">
                <label className="flex items-start gap-3">
                  <input
                    {...form.checkbox("confirm")}
                    type="checkbox"
                    className={`mt-1 h-4 w-4 shrink-0 rounded text-gold-strong focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                      form.error("confirm")
                        ? "border-error ring-1 ring-error"
                        : "border-line"
                    }`}
                  />
                  <div>
                    <span className="block font-medium text-sm text-navy">
                      {ar
                        ? "أؤكد أن هذا الطلب خاص بي وأن المعلومات المقدمة صحيحة."
                        : "I confirm this is my own request and the information provided is accurate."}
                    </span>
                    <p className="mt-1 text-xs text-slate">
                      {ar
                        ? "قد نتواصل معك للتحقق من هويتك قبل المعالجة."
                        : "We may contact you to verify your identity before processing."}
                    </p>
                  </div>
                </label>
                {form.error("confirm") && (
                  <p
                    id={form.errorId("confirm")}
                    role="alert"
                    className="field-error mt-2"
                  >
                    {form.error("confirm")}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={form.isSubmitting}
                  aria-busy={form.isSubmitting || undefined}
                  className="w-full"
                >
                  {form.isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      {ar ? "جارٍ الإرسال…" : "Submitting…"}
                    </>
                  ) : ar ? (
                    "إرسال الطلب"
                  ) : (
                    "Submit Request"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearForm}
                  className="w-full"
                >
                  {ar ? "مسح النموذج" : "Clear Form"}
                </Button>
              </div>

              {form.submitError && (
                <div className="pt-6 border-t border-line">
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <svg
                      className="h-6 w-6 text-red-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-red-800">
                        {ar ? "فشل الإرسال" : "Submission Failed"}
                      </p>
                      <p role="alert" className="text-sm text-red-700 mt-1">
                        {form.submitError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status === "success" && (
                <div className="pt-6 border-t border-line">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <svg
                      className="h-6 w-6 text-green-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-green-800">
                        {ar
                          ? "تم إرسال الطلب بنجاح"
                          : "Request Submitted Successfully"}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {ar ? "المرجع: " : "Reference: "}
                        <span className="font-mono font-medium">
                          {requestId}
                        </span>
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {ar
                          ? "سنرسل رسالة تحقق إلى "
                          : "We'll send a verification email to "}
                        <span className="font-mono">{submittedEmail}</span>
                        {ar ? " خلال 24 ساعة." : " within 24 hours."}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="mt-4 w-full"
                    onClick={clearForm}
                  >
                    {ar ? "إرسال طلب آخر" : "Submit Another Request"}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <footer className="mt-10 text-center">
        <p className="text-sm text-navy-2">
          <a
            href="/legal/privacy-policy"
            className="underline decoration-gold underline-offset-2 hover:text-navy"
          >
            {ar ? "سياسة الخصوصية" : "Privacy Policy"}
          </a>{" "}
          ·{" "}
          <a
            href="/legal/terms-of-service"
            className="underline decoration-gold underline-offset-2 hover:text-navy"
          >
            {ar ? "شروط الخدمة" : "Terms of Service"}
          </a>
        </p>
        <p className="mt-1 text-sm text-navy-2">
          <a
            href="mailto:privacy@askterramorph.com"
            className="underline decoration-gold underline-offset-2 hover:text-navy"
          >
            privacy@askterramorph.com
          </a>
        </p>
      </footer>
    </div>
  )
}

export default function DataRequestPage() {
  return (
    <SitePage lang="en">
      <DataRequestForm />
    </SitePage>
  )
}
