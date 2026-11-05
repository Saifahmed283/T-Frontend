import { ArrowRight, Search } from "lucide-react"

import type { ContentCounts } from "@/lib/api"

import type { Collection } from "../content-model"
import { Badge, Button, Heading, Input, Select } from "../ui"
import { collectionIcons, Empty, IconTile } from "../shared"

/* Content — the catalogue of collections, filterable by group and name. */

const GROUPS = ["All collections", "Evidence", "Knowledge", "Network", "Website"]

export function ContentPage({
  collections,
  counts,
  query,
  setQuery,
  group,
  setGroup,
  sort,
  setSort,
  onNavigate,
}: {
  collections: Collection[]
  counts: ContentCounts | null
  query: string
  setQuery: (v: string) => void
  group: string
  setGroup: (v: string) => void
  sort: string
  setSort: (v: string) => void
  onNavigate: (id: string) => void
}) {
  return (
    <section className="panel">
      <div className="collection-toolbar">
        <div className="search-field">
          <Search size={16} />
          <Input
            aria-label="Search collections"
            placeholder="Search content collections…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          aria-label="Filter collection group"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          {GROUPS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </Select>
        <Select
          aria-label="Sort collections"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">Default order</option>
          <option value="az">Name A–Z</option>
          <option value="za">Name Z–A</option>
        </Select>
      </div>

      <div className="collection-grid">
        {collections.map((c) => (
          <Button
            variant="ghost"
            className="collection-card"
            key={c.id}
            onClick={() => onNavigate(c.id)}
          >
            <IconTile icon={collectionIcons[c.id]} />
            <Badge>{c.group}</Badge>
            <Heading level={3}>{c.name}</Heading>
            <p>{c.description}</p>
            <span className="collection-card-foot">
              {counts?.byKind?.[c.id]?.total ?? 0} records
              <span>Manage</span>
              <ArrowRight size={14} />
            </span>
          </Button>
        ))}
      </div>

      {!collections.length && (
        <Empty icon={Search} title="No matching collections">
          Try a different search term or collection group.
        </Empty>
      )}
    </section>
  )
}
