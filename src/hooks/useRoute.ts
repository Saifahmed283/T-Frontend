import { useEffect, useState } from 'react'

export function useRoute() {
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