import type { ReactNode } from "react"
import {
  BookOpen,
  BriefcaseBusiness,
  Clock3,
  Database,
  FileCheck2,
  FileText,
  FolderOpen,
  Globe2,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  Network,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react"

import { collections } from "./content-model"
import { Heading } from "./ui"

/* Shared vocabulary for the workspace: navigation, per-collection icons and the
   small formatting helpers every page needs. Keeping them here means the shell
   and the pages can never drift apart on labels or ordering. */

export type NavGroup = {
  title: string
  items: {
    id: string
    label: string
    icon: LucideIcon
    expandable?: boolean
  }[]
}

export const navGroups: NavGroup[] = [
  {
    title: "Workspace",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "content", label: "Content", icon: FolderOpen, expandable: true },
      { id: "media", label: "Media library", icon: ImageIcon },
      { id: "workflow", label: "Publishing workflow", icon: Workflow },
    ],
  },
  {
    title: "Website",
    items: [
      { id: "website", label: "Website settings", icon: LayoutTemplate },
      { id: "audiences", label: "Audience hubs", icon: Users },
    ],
  },
  {
    title: "Management",
    items: [
      { id: "submissions", label: "Submissions", icon: Inbox },
      { id: "data-requests", label: "Data requests", icon: FileText },
      { id: "users", label: "Users & roles", icon: ShieldCheck },
      { id: "activity", label: "Activity log", icon: Clock3 },
      { id: "settings", label: "Settings", icon: Settings2 },
    ],
  },
]

export const pageNames: Record<string, string> = Object.fromEntries(
  navGroups.flatMap((g) => g.items.map((i) => [i.id, i.label])),
)
for (const c of collections) pageNames[c.id] = c.name

export const collectionIcons: Record<string, LucideIcon> = {
  cases: FolderOpen,
  publications: BookOpen,
  instruments: Network,
  courses: FileCheck2,
  experts: Users,
  partners: Globe2,
  vacancies: BriefcaseBusiness,
  initiatives: Sparkles,
  audiences: Users,
}

/* The API stores a record's `kind` in the singular (CASE, PUBLICATION, …).
   Collections are keyed in the plural. This map is the only correct bridge
   between the two — never derive one from the other by string surgery. */
export const collectionIdByKind: Record<string, string> = {
  CASE: "cases",
  PUBLICATION: "publications",
  INSTRUMENT: "instruments",
  COURSE: "courses",
  EXPERT: "experts",
  PARTNER: "partners",
  VACANCY: "vacancies",
  INITIATIVE: "initiatives",
  AUDIENCE: "audiences",
}

/* Which languages a record actually carries, read from its localized fields.
   Used instead of printing a fixed EN/AR pair that may not be true. */
export function recordLanguages(
  item: { data: Record<string, unknown> },
  collection: { fields: { key: string; localized?: boolean }[] },
): string[] {
  const langs: string[] = []
  let en = false
  let ar = false
  for (const field of collection.fields) {
    if (!field.localized) continue
    const value = item.data[field.key]
    if (value && typeof value === "object") {
      const rec = value as Record<string, unknown>
      if (String(rec.en ?? "").trim()) en = true
      if (String(rec.ar ?? "").trim()) ar = true
    } else if (typeof value === "string" && value.trim()) {
      en = true
    }
  }
  if (en) langs.push("EN")
  if (ar) langs.push("AR")
  return langs
}

export const statusOrder = [
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "UNPUBLISHED",
  "ARCHIVED",
] as const

export function statusTone(
  status: string,
): "neutral" | "warning" | "success" | "brand" {
  if (status === "PUBLISHED") return "success"
  if (status === "APPROVED" || status === "SCHEDULED") return "brand"
  if (status === "REVIEW" || status === "UNPUBLISHED") return "warning"
  return "neutral"
}

export const statusLabel = (key: string) =>
  key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, " ")

export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "TM"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function IconTile({
  icon: Icon,
  small = false,
}: {
  icon: LucideIcon
  small?: boolean
}) {
  return (
    <span className={`icon-tile ${small ? "small" : ""}`}>
      <Icon size={small ? 16 : 19} strokeWidth={1.5} />
    </span>
  )
}

export function Empty({
  icon: Icon = Database,
  title,
  children,
  action,
}: {
  icon?: LucideIcon
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={22} strokeWidth={1.4} />
      </span>
      <Heading level={3}>{title}</Heading>
      <p>{children}</p>
      {action}
    </div>
  )
}
