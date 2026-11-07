import { createContext, useCallback, useContext, useEffect, useState } from "react"
import Site, { type Lang } from "./Site"
import { ensureArabicFonts } from "@/lib/fonts"
import { loadPagesAr } from "@/content/pages.i18n"
import { loadHubsAr } from "@/content/hubs.i18n"
import { CookieConsentProvider } from "@/components/ui/CookieBanner"
import type { SectionId } from "@/lib/routes"
import type { ReactNode } from "react"

type Props = {
  section?: SectionId
  page?: string
  hub?: string
  children?: ReactNode
  lang?: Lang
}

/* Holds the client-side language toggle. Arabic stays on the same URL — the
   page is prerendered in English and the toggle flips lang/dir on the client.

   The Arabic copy lives in its own lazily-fetched chunks (see pages.i18n /
   hubs.i18n), so the toggle awaits them before flipping: switching is a single
   repaint into fully-translated content rather than an English flash. */

export const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
} | null>(null)

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used within SitePage")
  return ctx
}

export default function SitePage(props: Props) {
  const [lang, setLangState] = useState<Lang>(props.lang ?? "en")
  useEffect(() => {
    const el = document.documentElement
    el.lang = lang
    el.dir = lang === "ar" ? "rtl" : "ltr"
    if (lang === "ar") ensureArabicFonts()
  }, [lang])
  const setLang = useCallback((next: Lang) => {
    if (next !== "ar") {
      setLangState(next)
      return
    }
    void Promise.all([loadPagesAr(), loadHubsAr()]).then(() =>
      setLangState("ar"),
    )
  }, [])
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <CookieConsentProvider>
        <Site lang={lang} setLang={setLang} {...props}>
          {props.children}
        </Site>
      </CookieConsentProvider>
    </LangContext.Provider>
  )
}
