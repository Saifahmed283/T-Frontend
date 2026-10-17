import { useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { collections } from '../content-model'
import { Button, Field, Input, Select } from '../ui'
import { IconChevronRight, IconListFilter, IconSearch } from '../icons'
import { Badge, SegmentedControl } from '@/components/ui'

export function CollectionView({ collectionId, source, onOpenEditor }: { collectionId: string; source: 'live' | 'demo'; onOpenEditor: (id: string, itemId?: string) => void }) {
  const c = collections.find((x) => x.id === collectionId)
  const { items, loading, status, setStatus, search, setSearch, page, setPage, totalPages } = useCollection(collectionId, source)
  const [showFilters, setShowFilters] = useState(false)

  if (!c) return <div className="p-6">Unknown collection</div>

  const statusOptions = [
    { value: undefined as any, label: 'All' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'REVIEW', label: 'Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'UNPUBLISHED', label: 'Unpublished' },
    { value: 'ARCHIVED', label: 'Archived' },
  ]

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">{c.name}</h1>
          <p className="text-sm text-slate">{c.description}</p>
        </div>
        <Button variant="primary" onClick={() => onOpenEditor(collectionId)}>
          <IconPlus /> Add {c.singular.toLowerCase()}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 border border-line bg-ivory p-3">
        <div className="relative flex-1">
          <IconSearch className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${c.name.toLowerCase()}...`} className="ps-9" />
        </div>
        <Button onClick={() => setShowFilters(!showFilters)}>
          <IconListFilter className="h-4 w-4" /> Filters
        </Button>
        <SegmentedControl
          options={statusOptions as any}
          value={status ?? 'All'}
          onChange={(v) => setStatus(v === 'All' ? undefined : (v as any))}
          label="Status filter"
        />
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-4 border border-line bg-ivory p-4 md:grid-cols-4">
          <Field label="Language">
            <Select>
              <option>All languages</option>
              <option>English</option>
              <option>Arabic</option>
            </Select>
          </Field>
        </div>
      )}

      <div className="overflow-x-auto border border-line bg-ivory">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-slate">
              <th className="px-6 py-3 text-start">Title</th>
              <th className="px-3 py-3 text-start">Status</th>
              <th className="px-3 py-3 text-start">Updated</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-line last:border-0 hover:bg-ivory-2">
                <td className="px-6 py-3">
                  <p className="font-medium">{it.title || 'Untitled'}</p>
                  <p className="text-xs text-slate">/{it.slug}</p>
                </td>
                <td className="px-3 py-3">
                  <Badge tone="neutral">{it.status}</Badge>
                </td>
                <td className="px-3 py-3 text-xs text-slate">{new Date(it.updatedAt).toLocaleString()}</td>
                <td className="px-3 py-3 text-end">
                  <Button variant="ghost" onClick={() => onOpenEditor(collectionId, it.id)}>
                    Edit <IconChevronRight className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate">
                  No items yet. Add your first {c.singular.toLowerCase()}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}