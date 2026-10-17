import { useCallback, useEffect, useState } from 'react'
import { api, type ContentItem, type ContentStatus } from '@/lib/api'
import { makeDemoItems } from '../data/demo'

export function useCollection(collectionId: string, source: 'live' | 'demo') {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ContentStatus | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (source === 'demo') {
        setItems(makeDemoItems(collectionId, 12))
        setTotalPages(1)
        setLoading(false)
        return
      }
      const res = await api.contentList(collectionId, { status, search, page, pageSize: 20 })
      setItems(res.items)
      setTotalPages(res.pagination.totalPages)
    } catch (err) {
      setError('Failed to load items')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [collectionId, source, status, search, page])

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