import { useCallback, useEffect, useRef, useState } from "react"
import Intro from "./Intro"
import {
  WhatsNew,
  CauseExhibition,
  WhoWeAre,
  PrivilegeToggle,
} from "@/pages/site/additions"
import {
  Evidence,
  Knowledge,
  Learning,
  Join,
  Conversation,
} from "@/pages/site/home"
import { Header } from "./components/Header"
import { Hero } from "./components/Hero"
import { Audiences } from "./components/Audiences"
import { Footer } from "./components/Footer"
import { Hub } from "./components/Hub"
import { DetailPage } from "./pages/DetailPage"
import type { SectionId } from "@/lib/routes"
import type { Lang } from "./types"

export type { Lang } from "./types"

type Props = {
  lang: Lang
  setLang: (l: Lang) => void
  hub?: string
  section?: SectionId
  page?: string
}

export default function Site(props: Props) {
  const { section } = props
  // Never read sessionStorage during render (breaks SSR/prerender). Start with
  // no intro and enable it in an effect so the prerendered HTML is stable.
  const [intro, setIntro] = useState(false)
  const [heroReady, setHeroReady] = useState(true)
  const mounted = useRef(false)
  useEffect(() => {
    if (!props.hub && !props.section && !props.page) {
      try {
        if (!sessionStorage.getItem("tm-intro")) setIntro(true)
      } catch {
        /* storage unavailable */
      }
    }
  }, [props.hub, props.section, props.page])
  useEffect(() => {
    if (section) {
      const el = document.getElementById(section)
      if (el) {
        const smooth =
          mounted.current &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        el.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "start",
        })
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" })
    }
    mounted.current = true
  }, [section, props.hub, props.page])
  const lift = useCallback(() => setHeroReady(true), [])
  const done = useCallback(() => {
    try {
      sessionStorage.setItem("tm-intro", "1")
    } catch {
      /* storage unavailable */
    }
    setIntro(false)
  }, [])
  return (
    <div dir={props.lang === "ar" ? "rtl" : "ltr"}>
      {intro && <Intro onDone={done} onLift={lift} lang={props.lang} />}
      <Header {...props} />
      <main id="main">
        {props.page ? (
          <DetailPage slug={props.page} lang={props.lang} />
        ) : props.hub ? (
          <Hub slug={props.hub} lang={props.lang} />
        ) : (
          <>
            {!heroReady ? (
              <div className="min-h-[calc(100svh-110px)]" />
            ) : (
              <Hero lang={props.lang} />
            )}
            <div className="tm-section">
              <Audiences lang={props.lang} />
            </div>
            <div className="tm-section">
              <WhatsNew lang={props.lang} />
            </div>
            <div className="tm-section">
              <Evidence lang={props.lang} />
            </div>
            <div className="tm-section">
              <CauseExhibition lang={props.lang} />
            </div>
            <div className="tm-section">
              <Knowledge lang={props.lang} />
            </div>
            <div className="tm-section">
              <Learning lang={props.lang} />
            </div>
            <div className="tm-section">
              <WhoWeAre lang={props.lang} />
            </div>
            <div className="tm-section">
              <Join lang={props.lang} />
            </div>
            <div className="tm-section">
              <Conversation lang={props.lang} />
            </div>
            <div className="tm-section">
              <PrivilegeToggle lang={props.lang} />
            </div>
          </>
        )}
      </main>
      <Footer lang={props.lang} />
    </div>
  )
}
