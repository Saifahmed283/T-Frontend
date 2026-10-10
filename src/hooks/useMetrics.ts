const NS = 'tm'

export function useMetrics(scope: string = NS) {
  const key = (k: string) => `${scope}.${k}`
  const read = (k: string): number => {
    try { return Number(sessionStorage.getItem(key(k)) ?? 0) } catch { return 0 }
  }
  const bump = (k: string, by = 1) => {
    try { sessionStorage.setItem(key(k), String(read(k) + by)) } catch { /* storage unavailable */ }
  }
  const push = (k: string, v: number) => {
    try {
      const a: number[] = JSON.parse(sessionStorage.getItem(key(k)) ?? '[]')
      a.push(Math.round(v))
      sessionStorage.setItem(key(k), JSON.stringify(a))
    } catch { /* storage unavailable */ }
  }
  const clear = (k: string) => {
    try { sessionStorage.removeItem(key(k)) } catch { /* storage unavailable */ }
  }
  return { read, bump, push, clear }
}