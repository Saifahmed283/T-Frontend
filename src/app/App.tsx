import { lazy, Suspense, useEffect, useState } from 'react'
import Site, { type Lang } from '@/pages/site/Site'
import NotFound from '@/pages/NotFound'
import { audiences } from '@/content/data'
import { useRoute } from '@/hooks/useRoute'

const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'))

export default function App() {
  const route = useRoute()
  const [lang, setLang] = useState<Lang>('en')
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => {
    const anchor = window.location.hash.replace(/^#/, '')
    if (anchor) requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' }))
    else window.scrollTo(0, 0)
  }, [route])

  if (route === '/dashboard') return <Suspense fallback={<div className="min-h-screen bg-ivory" />}><Dashboard /></Suspense>
  if (route === '/') return <Site lang={lang} setLang={setLang} />
  const hub = route.startsWith('/hub/') ? route.slice(5) : undefined
  if (hub && audiences.some((a) => a.slug === hub)) return <Site lang={lang} setLang={setLang} hub={hub} />
  return <NotFound />
}