import { useCallback, useEffect, useRef, useState } from 'react'
import Intro from './Intro'
import { useHead } from '@/hooks/useHead'
import { WhatsNew, CauseExhibition, WhoWeAre, PrivilegeToggle } from '@/pages/site/additions'
import { Evidence, Knowledge, Learning, Join, Conversation } from '@/pages/site/home'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Audiences } from './components/Audiences'
import { Footer } from './components/Footer'
import { Hub } from './components/Hub'
import { DetailPage } from './pages/DetailPage'
import type { SectionId } from '@/lib/routes'
import type { Lang } from './types'

export type { Lang } from './types'

type Props = { lang: Lang; setLang: (l: Lang) => void; hub?: string; section?: SectionId; page?: string }

function HomeHead() {
  useHead('TerraMorph — Strategy, Policy & Transformation Advisory | Egypt', 'TerraMorph advises governments, institutions and social enterprises in Egypt and across borders on strategy, policy and transformation — with a dated, named assignment ledger behind every claim.')
  return null
}

export default function Site(props: Props) {
  const { section } = props
  const [intro, setIntro] = useState(() => !props.hub && !props.section && !props.page && !sessionStorage.getItem('tm-intro'))
  const [heroReady, setHeroReady] = useState(!intro)
  const mounted = useRef(false)
  useEffect(() => {
    if (section) {
      const el = document.getElementById(section)
      if (el) {
        const smooth = mounted.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    mounted.current = true
  }, [section, props.hub, props.page])
  const lift = useCallback(() => setHeroReady(true), [])
  const done = useCallback(() => { sessionStorage.setItem('tm-intro', '1'); setIntro(false) }, [])
  return (
    <div dir={props.lang === 'ar' ? 'rtl' : 'ltr'}>
      {intro && <Intro onDone={done} onLift={lift} lang={props.lang} />}
      {!props.hub && !props.page && <HomeHead />}
      <Header {...props} />
      <main id="main">
        {props.page ? <DetailPage slug={props.page} lang={props.lang} /> : props.hub ? <Hub slug={props.hub} lang={props.lang} /> : (
          <>
            {!heroReady ? <div className="min-h-[calc(100svh-110px)]" /> : <Hero lang={props.lang} />}
            <Audiences lang={props.lang} />
            <WhatsNew lang={props.lang} />
            <Evidence lang={props.lang} />
            <CauseExhibition lang={props.lang} />
            <Knowledge lang={props.lang} />
            <Learning lang={props.lang} />
            <WhoWeAre lang={props.lang} />
            <Join lang={props.lang} />
            <Conversation lang={props.lang} />
            <PrivilegeToggle lang={props.lang} />
          </>
        )}
      </main>
      <Footer lang={props.lang} />
    </div>
  )
}