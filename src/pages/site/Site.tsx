import { useCallback, useState } from 'react'
import Intro from './Intro'
import { useHead } from '@/hooks/useHead'
import { WhatsNew, CauseExhibition } from '@/pages/site/additions'
import { Evidence, Knowledge, Learning, Join, Conversation } from '@/pages/site/home'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Audiences } from './components/Audiences'
import { Footer } from './components/Footer'
import { Hub } from './components/Hub'
import type { Lang } from './types'

export type { Lang } from './types'

type Props = { lang: Lang; setLang: (l: Lang) => void; hub?: string }

function HomeHead() {
  useHead('TerraMorph — Strategy, Policy & Transformation Advisory | Egypt', 'TerraMorph advises governments, institutions and social enterprises in Egypt and across borders on strategy, policy and transformation — with a dated, named assignment ledger behind every claim.')
  return null
}

export default function Site(props: Props) {
  const [intro, setIntro] = useState(() => !props.hub && !sessionStorage.getItem('tm-intro'))
  const [heroReady, setHeroReady] = useState(!intro)
  const lift = useCallback(() => setHeroReady(true), [])
  const done = useCallback(() => { sessionStorage.setItem('tm-intro', '1'); setIntro(false) }, [])
  return (
    <div dir={props.lang === 'ar' ? 'rtl' : 'ltr'}>
      {intro && <Intro onDone={done} onLift={lift} />}
      {!props.hub && <HomeHead />}
      <Header {...props} />
      <main id="main">
        {props.hub ? <Hub slug={props.hub} lang={props.lang} /> : (
          <>
            {!heroReady ? <div className="min-h-[calc(100svh-108px)]" /> : <Hero lang={props.lang} />}
            <Audiences lang={props.lang} />
            <WhatsNew />
            <Evidence />
            <CauseExhibition />
            <Knowledge />
            <Learning />
            <Join />
            <Conversation />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}