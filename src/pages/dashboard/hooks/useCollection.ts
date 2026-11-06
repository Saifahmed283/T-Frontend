import { useCallback, useEffect, useRef, useState } from "react"

import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { api, type ContentItem, type ContentStatus } from "@/lib/api"

const SEARCH_DEBOUNCE_MS = 300

export function useCollection(collectionId: string) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ContentStatus | undefined>(undefined)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // The input renders `search` immediately; the network only sees the settled
  // value, so typing does not fire one request per keystroke.
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)

  // Ignore a slow earlier response if a newer one has already been requested.
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const res = await api.contentList(collectionId, {
        status,
        search: debouncedSearch,
        page,
        pageSize: 20,
      })
      if (id !== requestId.current) return
      setItems(res.items)
      setTotalPages(res.pagination.totalPages)
    } catch {
      if (id !== requestId.current) return
      setError("Failed to load items")
      setItems([])
      setTotalPages(1)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [collectionId, status, debouncedSearch, page])

  useEffect(() => {
    void load()
  }, [load])

  const updateSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const updateStatus = useCallback((value: ContentStatus | undefined) => {
    setStatus(value)
    setPage(1)
  }, [])

  return {
    items,
    loading,
    error,
    status,
    setStatus: updateStatus,
    search,
    setSearch: updateSearch,
    page,
    setPage,
    totalPages,
    reload: load,
    setItems,
  }
}
