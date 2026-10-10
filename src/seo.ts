import { useEffect } from 'react'

const BRAND = 'TerraMorph'

/* Per-route <title> and meta description — the shell ships the homepage defaults. */
export function useHead(title: string, description: string) {
  useEffect(() => {
    document.title = title.includes(BRAND) ? title : `${title} | ${BRAND}`
    let m = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m) }
    m.content = description
  }, [title, description])
}
