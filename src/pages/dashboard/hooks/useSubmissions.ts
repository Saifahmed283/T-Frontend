import { useCallback, useEffect, useRef, useState } from "react"

import { api, type Submission, type SubmissionKind } from "@/lib/api"

const PAGE_SIZE = 20

/**
 * Server-paginated submissions inbox. The dashboard used to download the first
 * 100 rows on every load even when the inbox was never opened; this hook fetches
 * one page at a time and only when `enabled`.
 */
export function useSubmissions(enabled: boolean) {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [kind, setKindState] = useState<SubmissionKind | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    if (!enabled) return
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const res = await api.submissions({ kind, page, pageSize: PAGE_SIZE })
      if (id !== requestId.current) return
      setItems(res.items)
      setTotalPages(res.pagination.totalPages)
    } catch {
      if (id !== requestId.current) return
      setError("Failed to load submissions")
      setItems([])
      setTotalPages(1)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [enabled, kind, page])

  useEffect(() => {
    void load()
  }, [load])

  const setKind = useCallback((value: SubmissionKind | undefined) => {
    setKindState(value)
    setPage(1)
  }, [])

  return {
    items,
    loading,
    error,
    kind,
    setKind,
    page,
    setPage,
    totalPages,
    reload: load,
  }
}
