import { lazy, Suspense, useEffect, useState } from 'react'
import Site, { type Lang } from './Site'
import NotFound from './NotFound'
import { audiences } from './data'

const Dashboard = lazy(() => import('./Dashboard'))

function useRoute() {
  const [route, setRoute] = useState(() => window.location.pathname)
  useEffect(() => {
    const on = () => setRoute(window.location.pathname)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a) return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (a.target && a.target !== '_self') return
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (url.pathname === window.location.pathname && url.hash) return
      e.preventDefault()
      window.history.pushState({}, '', url.pathname + url.search + url.hash)
      on()
    }
    window.addEventListener('popstate', on)
    window.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('popstate', on)
      window.removeEventListener('click', onClick)
    }
  }, [])
  return route
}

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