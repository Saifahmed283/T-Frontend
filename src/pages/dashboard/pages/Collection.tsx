import { useMemo, useState } from "react"
import { Check, ChevronRight, ListFilter, Plus, Search } from "lucide-react"

import type { ContentCounts } from "@/lib/api"
import { SkeletonRows } from "@/components/ui"

import type { Collection } from "../content-model"
import { useCollection } from "../hooks/useCollection"
import { Badge, Button, Field, Input } from "../ui"
import { collectionIcons, Empty, recordLanguages, statusTone } from "../shared"

/* Collections that have both geography and sector fields for server-side filtering. */
const COLLECTIONS_WITH_GEO_SECTOR = new Set(["cases", "publications", "instruments", "assignments"])

export function CollectionPage({
  collection,
  counts,
  onOpenItem,
  onCreate,
  refreshKey,
}: {
  collection: Collection
  counts: ContentCounts | null
  onOpenItem: (itemId: string) => void
  onCreate: () => void
  refreshKey?: number
}) {
  const hasGeoSector = COLLECTIONS_WITH_GEO_SECTOR.has(collection.id)
  const {
    items,
    loading,
    error,
    status,
    setStatus,
    search,
    setSearch,
    geography,
    setGeography,
    sector,
    setSector,
    page,
    setPage,
    totalPages,
  } = useCollection(collection.id, refreshKey)

  const [filters, setFilters] = useState(false)
  const byStatus = counts?.byKind?.[collection.id]?.byStatus

  const tabs: { key: string; label: string }[] = [
    { key: "All", label: "All content" },
    { key: "DRAFT", label: "Draft" },
    { key: "REVIEW", label: "Review" },
    { key: "APPROVED", label: "Approved" },
    { key: "SCHEDULED", label: "Scheduled" },
    { key: "PUBLISHED", label: "Published" },
    { key: "UNPUBLISHED", label: "Unpublished" },
    { key: "ARCHIVED", label: "Archived" },
  ]

  return (
    <section className="panel">
      <div className="status-tabs">
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant="ghost"
            className={(status ?? "All") === t.key ? "selected" : ""}
            onClick={() =>
              setStatus(t.key === "All" ? undefined : (t.key as never))
            }
          >
            {t.label}
            <span>
              {t.key === "All"
                ? (counts?.byKind?.[collection.id]?.total ?? 0)
                : (byStatus?.[t.key] ?? 0)}
            </span>
          </Button>
        ))}
      </div>

      <div className="collection-toolbar">
        <div className="search-field">
          <Search size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${collection.name.toLowerCase()}…`}
            aria-label={`Search ${collection.name}`}
          />
        </div>
        {hasGeoSector && (
          <Button
            className={filters ? "selected" : ""}
            onClick={() => setFilters(!filters)}
            aria-expanded={filters}
          >
            <ListFilter size={15} />
            Filters
            {filters && <Check size={13} />}
          </Button>
        )}
      </div>

      {filters && hasGeoSector && (
        <div className="expanded-filters">
          <Field label="Geography">
            <Input
              value={geography}
              onChange={(e) => setGeography(e.target.value)}
              placeholder="Filter by geography"
            />
          </Field>
          <Field label="Sector">
            <Input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Filter by sector"
            />
          </Field>
        </div>
      )}

      <div className="records-table-head">
        <span>Title</span>
        <span>Status</span>
        <span>Languages</span>
        <span>Last updated</span>
      </div>

      {error && (
        <p className="panel-foot is-error" role="alert">
          {error}
        </p>
      )}

      {loading && items.length === 0 ? (
        <SkeletonRows rows={5} />
      ) : items.length === 0 ? (
        <Empty
          icon={collectionIcons[collection.id]}
          title={`No ${collection.name.toLowerCase()} yet`}
          action={
            <Button className="mt-2" onClick={onCreate}>
              <Plus size={15} />
              Add {collection.singular.toLowerCase()}
            </Button>
          }
        >
          Create your first record to see it here.
        </Empty>
      ) : (
        <div>
          {items.map((it) => (
            <Button
              variant="ghost"
              key={it.id}
              onClick={() => onOpenItem(it.id)}
              className="item-row"
            >
              <div className="min-w-0">
                <p className="truncate">{it.title || "Untitled"}</p>
                <p className="truncate">/{it.slug}</p>
              </div>
              <div>
                <Badge tone={statusTone(it.status)}>{it.status}</Badge>
              </div>
              <div className="language-pills">
                {recordLanguages(it, collection).map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] tracking-wide text-slate-strong">
                  {new Date(it.updatedAt).toLocaleDateString()}
                </span>
                <ChevronRight size={14} />
              </div>
            </Button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="panel-foot" style={{ justifyContent: "space-between" }}>
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}