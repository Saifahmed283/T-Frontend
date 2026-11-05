/**
 * Lightweight in-memory API cache with TTL.
 *
 * Wraps fetch-based api calls so repeated navigations (back/forth between
 * collection pages, re-opening the editor, refreshing the shell) don't
 * re-hit the network for data we already have. Cache entries expire after
 * `ttl` ms and are invalidated on mutations (create/update/delete).
 *
 * Usage:
 *   const cached = cacheWrap(api.contentList, "contentList", 30_000)
 *   const data = await cached(collectionId, params)
 *
 * Call `cacheInvalidate(pattern)` after mutations to purge matching keys.
 */

type CacheEntry<T> = {
  data: T
  expiry: number
}

const cache = new Map<string, CacheEntry<unknown>>()

const defaultTtl = 30_000 // 30 seconds

function keyFor(name: string, ...args: unknown[]): string {
  return `${name}:${JSON.stringify(args)}`
}

export function cacheGet<T>(name: string, ...args: unknown[]): T | null {
  const entry = cache.get(keyFor(name, ...args)) as CacheEntry<T> | undefined
  if (!entry || Date.now() > entry.expiry) {
    cache.delete(keyFor(name, ...args))
    return null
  }
  return entry.data
}

export function cacheSet<T>(name: string, data: T, ttl: number, ...args: unknown[]): void {
  cache.set(keyFor(name, ...args), { data, expiry: Date.now() + ttl })
}

export function cacheInvalidate(pattern: string): void {
  for (const k of cache.keys()) {
    if (k.includes(pattern)) cache.delete(k)
  }
}

export function cacheClear(): void {
  cache.clear()
}

/* Wraps an async api function with caching. `name` is used for the cache key,
   `ttl` is the cache lifetime in ms. Returns a function with the same
   signature that returns cached data when fresh. */
export function cacheWrap<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  name: string,
  ttl = defaultTtl,
) {
  return async (...args: TArgs): Promise<TResult> => {
    const cached = cacheGet<TResult>(name, ...args)
    if (cached !== null) return cached
    const result = await fn(...args)
    cacheSet(name, result, ttl, ...args)
    return result
  }
}
