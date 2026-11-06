import { useEffect, useState } from "react"

/**
 * Returns a copy of `value` that only changes after `delayMs` of quiet.
 *
 * Use it for search boxes that trigger a network request: the input stays
 * responsive because it renders the immediate value, while the request layer
 * sees one settled value instead of one per keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
