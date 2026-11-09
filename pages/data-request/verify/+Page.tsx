import { useEffect, useState } from "react"

import { usePageContext } from "vike-react/usePageContext"

import SitePage, { useLang } from "@/pages/site/SitePage"
import { api } from "@/lib/api"
import { messageForError } from "@/lib/messages"
import { Button, Card, CardContent, Heading } from "@/components/ui"

export default function DataRequestVerifyPage() {
  const { lang } = useLang()
  const ar = lang === "ar"
  const { urlParsed } = usePageContext()
  const token = urlParsed.search.token ?? ""

  const [status, setStatus] = useState<"checking" | "success" | "error">("checking")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      return
    }

    let cancelled = false
    api
      .dataRequestVerify(token)
      .then(() => {
        if (!cancelled) setStatus("success")
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const title = ar ? "التحقق من طلب صاحب البيانات" : "Verify Data Subject Request"
  const checking = ar ? "جارٍ التحقق من طلبك…" : "Verifying your request…"
  const successTitle = ar ? "تم التحقق بنجاح" : "Request verified"
  const successBody = ar ? "سيتم معالجة طلبك من قبل فريقنا." : "Our team will now process your request."
  const errorTitle = ar ? "فشل التحقق" : "Verification failed"
  const errorBody = ar ? "رابط التحقق غير صالح أو منتهي الصلاحية." : "The verification link is invalid or has expired."

  return (
    <SitePage lang="en">
      <div className="mx-auto max-w-[600px] px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20">
        <header className="mb-10 text-center">
          <h1 className="text-h1 sm:text-h2 mb-3">{title}</h1>
        </header>
        <Card>
          <CardContent className="p-8 md:p-12 text-center">
            {status === "checking" && (
              <div>
                <Heading level={2}>{checking}</Heading>
              </div>
            )}
            {status === "success" && (
              <div>
                <Heading level={2}>{successTitle}</Heading>
                <p className="mt-4 text-navy-2">{successBody}</p>
              </div>
            )}
            {status === "error" && (
              <div>
                <Heading level={2}>{errorTitle}</Heading>
                <p className="mt-4 text-navy-2">{errorBody}</p>
                <div className="mt-8">
                  <Button variant="primary" asChild>
                    <a href="/">{ar ? "العودة إلى الرئيسية" : "Back to home"}</a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SitePage>
  )
}
