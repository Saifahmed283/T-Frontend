import { useCallback, useEffect, useState } from "react"
import { api, type ContentItem, type ContentStatus } from "@/lib/api"

export function useCollection(collectionId: string) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ContentStatus | undefined>(undefined)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.contentList(collectionId, {
        status,
        search,
        page,
        pageSize: 20,
      })
      setItems(res.items)
      setTotalPages(res.pagination.totalPages)
    } catch {
      setError("Failed to load items")
      setItems([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [collectionId, status, search, page])

  useEffect(() => {
    void load()
  }, [load])

  return {
    items,
    loading,
    error,
    status,
    setStatus,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    reload: load,
    setItems,
  }
}
