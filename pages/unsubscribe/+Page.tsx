import { useEffect, useRef, useState } from "react"
import { usePageContext } from "vike-react/usePageContext"
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react"

import SitePage, { useLang } from "@/pages/site/SitePage"
import {
  Heading,
  Button,
  Prose,
  Card,
  CardContent,
} from "@/components/ui"
import { MARKETING_LISTS } from "@/content/marketing-consent"
import { api } from "@/lib/api"
import { messageForError } from "@/lib/messages"
import { validateEmail } from "@/lib/validation"

type Status = "checking" | "loading" | "success" | "error" | "invalid"

const ALL_LISTS: string[] = MARKETING_LISTS.map((list) => list.value)

function UnsubscribeContent() {
  const { lang } = useLang()
  const ar = lang === "ar"
  const { urlParsed } = usePageContext()

  const email = urlParsed.search.email ?? ""
  const list = urlParsed.search.list ?? ""
  const token = urlParsed.search.token ?? ""

  const listValid = list === "all" || ALL_LISTS.includes(list)
  const linkValid =
    validateEmail(email, "en") === null && listValid && token.trim().length > 0

  const [status, setStatus] = useState<Status>(
    linkValid ? "loading" : "invalid",
  )
  const [error, setError] = useState<unknown>(null)
  const postedRef = useRef(false)

  useEffect(() => {
    if (!linkValid) {
      setStatus("invalid")
      return
    }

    // React 19 StrictMode runs effects twice in development; the token must
    // only be consumed once per visit.
    if (postedRef.current) return
    postedRef.current = true

    let cancelled = false
    setStatus("loading")

    api
      .marketingConsentUnsubscribe({ email, list, token })
      .then(() => {
        if (!cancelled) setStatus("success")
      })
      .catch((cause) => {
        if (cancelled) return
        setError(cause)
        setStatus("error")
      })

    return () => {
      cancelled = true
    }
  }, [email, linkValid, list, token])

  const listLabel = MARKETING_LISTS.find((entry) => entry.value === list)
  const targetList =
    list === "all"
      ? ar
        ? "جميع رسائل التسويق"
        : "all marketing communications"
      : ar
        ? (listLabel?.labelAr ?? list)
        : (listLabel?.label ?? list)

  const errorMessage = error
    ? messageForError(error, lang).message
    : ar
      ? "حدث خطأ ما. حاول مرة أخرى أو تواصل معنا."
      : "Something went wrong. Please try again or contact us."

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20">
      <div className="text-center mb-8">
        <Mail className="mx-auto h-12 w-12 text-navy-2" aria-hidden="true" />
        <Heading level={1} className="mt-4 text-h2">
          {ar ? "إلغاء الاشتراك" : "Unsubscribe"}
        </Heading>
        <p className="mt-2 text-navy-2">
          {ar ? "إدارة اشتراكك في " : "Manage your subscription to "}
          <strong>{targetList}</strong>
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2
                className="h-8 w-8 text-gold animate-spin"
                aria-hidden="true"
              />
              <p className="text-navy-2" role="status">
                {ar ? "جارٍ معالجة طلبك…" : "Processing your request…"}
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle
                className="h-12 w-12 text-green-600"
                aria-hidden="true"
              />
              <Heading level={2} className="text-xl">
                {ar ? "تم إلغاء اشتراكك" : "You're unsubscribed"}
              </Heading>
              <Prose className="text-center text-navy-2 max-w-xs">
                <p role="status">
                  {ar
                    ? `تم إلغاء اشتراكك من ${targetList}.`
                    : `You have been unsubscribed from ${targetList}.`}
                </p>
                <p className="mt-2 text-sm">
                  {list === "all"
                    ? ar
                      ? "لن تتلقى أي رسائل تسويقية منّا بعد الآن."
                      : "You will no longer receive any marketing emails from us."
                    : ar
                      ? "قد تتلقى اتصالات أخرى وافقت عليها."
                      : "You may still receive other communications you've consented to."}
                </p>
              </Prose>
              <div className="mt-4 flex flex-col gap-2">
                <Button variant="secondary" asChild>
                  <a href="/join/newsletter">
                    {ar ? "إدارة الاشتراكات الأخرى" : "Manage other subscriptions"}
                  </a>
                </Button>
                <Button variant="ghost" asChild>
                  <a href="/">
                    <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                    {ar ? "العودة إلى الرئيسية" : "Back to home"}
                  </a>
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <AlertCircle
                className="h-12 w-12 text-red-600"
                aria-hidden="true"
              />
              <Heading level={2} className="text-xl">
                {ar ? "تعذّر إلغاء الاشتراك" : "Unable to unsubscribe"}
              </Heading>
              <Prose className="text-center text-navy-2 max-w-xs">
                <p role="alert">{errorMessage}</p>
                <p className="mt-2 text-sm">
                  {ar
                    ? "يرجى التحقق من الرابط في بريدك أو "
                    : "Please check the link in your email or "}
                  <a
                    href="mailto:privacy@askterramorph.com"
                    className="underline decoration-gold underline-offset-2 hover:text-navy"
                  >
                    {ar ? "تواصل معنا" : "contact us"}
                  </a>
                  {ar ? " للحصول على المساعدة." : " for assistance."}
                </p>
              </Prose>
              <Button variant="ghost" asChild>
                <a href="/">
                  <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                  {ar ? "العودة إلى الرئيسية" : "Back to home"}
                </a>
              </Button>
            </div>
          )}

          {status === "invalid" || status === "checking" ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <AlertCircle
                className="h-12 w-12 text-yellow-600"
                aria-hidden="true"
              />
              <Heading level={2} className="text-xl">
                {ar ? "رابط غير صالح" : "Invalid link"}
              </Heading>
              <Prose className="text-center text-navy-2 max-w-xs">
                <p role="alert">
                  {ar
                    ? "يفتقد رابط إلغاء الاشتراك إلى معلمات مطلوبة."
                    : "This unsubscribe link is missing required parameters."}
                </p>
                <p className="mt-2 text-sm">
                  {ar
                    ? "يرجى استخدام الرابط من بريدك أو "
                    : "Please use the link from your email or "}
                  <a
                    href="mailto:privacy@askterramorph.com"
                    className="underline decoration-gold underline-offset-2 hover:text-navy"
                  >
                    {ar ? "تواصل معنا" : "contact us"}
                  </a>
                  {ar ? " للحصول على المساعدة." : " for assistance."}
                </p>
              </Prose>
              <Button variant="ghost" asChild>
                <a href="/">
                  <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                  {ar ? "العودة إلى الرئيسية" : "Back to home"}
                </a>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <footer className="mt-10 text-center">
        <p className="text-sm text-navy-2">
          {ar
            ? "TerraMorph Advisory LLC · س.ت 184 562 · القاهرة"
            : "TerraMorph Advisory LLC · CR No. 184 562 · Cairo"}
        </p>
        <p className="mt-1 text-sm text-navy-2">
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
      </footer>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <SitePage lang="en">
      <UnsubscribeContent />
    </SitePage>
  )
}
