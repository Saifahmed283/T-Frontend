import { useEffect, useState } from "react"
import Site, { type Lang } from "./Site"
import type { SectionId } from "@/lib/routes"

type Props = {
  section?: SectionId
  page?: string
  hub?: string
}

/* Holds the client-side language toggle. Arabic stays on the same URL — the
   page is prerendered in English and the toggle flips lang/dir on the client. */
export default function SitePage(props: Props) {
  const [lang, setLang] = useState<Lang>("en")
  useEffect(() => {
    const el = document.documentElement
    el.lang = lang
    el.dir = lang === "ar" ? "rtl" : "ltr"
  }, [lang])
  return <Site lang={lang} setLang={setLang} {...props} />
}
