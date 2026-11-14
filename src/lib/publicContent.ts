import { useEffect, useState } from "react"

import { api, type PublicContentItem } from "./api"

/*
 * Public-site content hooks.
 *
 * The marketing site is prerendered, so the static TypeScript content stays as
 * the build-time fallback. These hooks upgrade a section to CMS content in the
 * browser: if the API is unavailable the static copy keeps rendering unchanged.
 *
 * The public endpoints cache for 60 seconds, so the default poll matches that
 * window — an editor's published change appears without a redeploy.
 */

export type Lang = "en" | "ar"

export type PublicCollectionState = {
  items: PublicContentItem[]

  total: number

  live: boolean

  loading: boolean
}

const EMPTY: PublicCollectionState = {
  items: [],

  total: 0,

  live: false,

  loading: true,
}

/*
 * Several homepage sections ask for different collections at the same time, and
 * each one polls. A tiny shared cache plus in-flight de-duplication keeps that to
 * one request per collection per window, which matters against the public API's
 * per-IP rate limit. The TTL is deliberately short (10s) so the 60s poll still
 * delivers an editor's change promptly.
 */
const COLLECTION_CACHE_MS = 10_000

type CollectionResult = Awaited<ReturnType<typeof api.publicContentList>>

const collectionCache = new Map<string, {
  at: number
  value: CollectionResult
}>()

const collectionInflight = new Map<string, Promise<CollectionResult>>()

// Tests need a clean module-level cache; this is also useful if a future caller
// wants to force the next read to bypass a stale entry.
export function clearPublicContentCache() {
  collectionCache.clear()

  collectionInflight.clear()
}

function loadCollection(collectionId: string, pageSize: number) {
  const key = `${collectionId}:${pageSize}`

  const cached = collectionCache.get(key)

  if (cached && Date.now() - cached.at < COLLECTION_CACHE_MS) {
    return Promise.resolve(cached.value)
  }

  const pending = collectionInflight.get(key)

  if (pending) return pending

  const request = api.publicContentList(collectionId, { pageSize }).then(
    (value) => {
      collectionCache.set(key, { at: Date.now(), value })

      collectionInflight.delete(key)

      return value
    },

    (error) => {
      collectionInflight.delete(key)

      throw error
    },
  )

  collectionInflight.set(key, request)

  return request
}

export function usePublicCollection(
  collectionId: string,
  options: {
    pageSize?: number

    pollMs?: number
  } = {},
): PublicCollectionState {
  const { pageSize = 50, pollMs = 60_000 } = options

  const [state, setState] = useState<PublicCollectionState>(EMPTY)

  useEffect(() => {
    let cancelled = false

    const load = () => {
      loadCollection(collectionId, pageSize)

        .then((result) => {
          if (cancelled) return

          setState({
            items: result.items,

            total: result.total,

            live: true,

            loading: false,
          })
        })

        .catch(() => {
          if (cancelled) return

          // Keep the static fallback: mark the feed as not live rather than
          // alarming a reader when the marketing API is briefly unreachable.
          setState({ items: [], total: 0, live: false, loading: false })
        })
    }

    load()

    const timer = pollMs > 0 ? window.setInterval(load, pollMs) : undefined

    return () => {
      cancelled = true

      if (timer !== undefined) window.clearInterval(timer)
    }
  }, [collectionId, pageSize, pollMs])

  return state
}

export function usePublicItem(
  collectionId: string,
  slug: string | undefined,
  options: { pollMs?: number } = {},
) {
  const { pollMs = 0 } = options

  const [item, setItem] = useState<PublicContentItem | null>(null)

  const [loading, setLoading] = useState(Boolean(slug))

  useEffect(() => {
    if (!slug) {
      setItem(null)

      setLoading(false)

      return
    }

    let cancelled = false

    const load = () => {
      api

        .publicContentGet(collectionId, slug)

        .then((result) => {
          if (!cancelled) {
            setItem(result)

            setLoading(false)
          }
        })

        .catch(() => {
          if (!cancelled) setLoading(false)
        })
    }

    setLoading(true)

    load()

    const timer = pollMs > 0 ? window.setInterval(load, pollMs) : undefined

    return () => {
      cancelled = true

      if (timer !== undefined) window.clearInterval(timer)
    }
  }, [collectionId, slug, pollMs])

  return { item, loading }
}

/* Public site settings (contact, legal, social, SEO, hero, announcement,
   navigation). Loaded once and polled at the public cache TTL so a published
   edit reaches readers without a redeploy. Falls back to static defaults when
   the API is unreachable. */
export type PublicSettingsState = {
  settings: Record<string, unknown> | null
  updatedAt: string | null
  live: boolean
  loading: boolean
}

const EMPTY_SETTINGS: PublicSettingsState = {
  settings: null,
  updatedAt: null,
  live: false,
  loading: true,
}

const SETTINGS_CACHE_MS = 60_000
let settingsCache: {
  at: number

  value: PublicSettingsState
} | null = null

export function usePublicSettings(): PublicSettingsState {
  const [state, setState] = useState<PublicSettingsState>(EMPTY_SETTINGS)

  useEffect(() => {
    let cancelled = false

    const load = () => {
      if (settingsCache && Date.now() - settingsCache.at < SETTINGS_CACHE_MS) {
        if (!cancelled) setState(settingsCache.value)
        return
      }

      api
        .publicSettings()
        .then((result) => {
          if (cancelled) return

          const next: PublicSettingsState = {
            settings: result,
            updatedAt: null,
            live: true,
            loading: false,
          }
          settingsCache = { at: Date.now(), value: next }
          if (!cancelled) setState(next)
        })
        .catch(() => {
          if (!cancelled) setState({ ...EMPTY_SETTINGS, loading: false })
        })
    }

    load()

    const timer = window.setInterval(load, SETTINGS_CACHE_MS)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  return state
}

export function localized(value: unknown, lang: Lang): string | undefined {
  if (typeof value === "string") return value || undefined

  if (!value || typeof value !== "object") return undefined

  const source = value as {
    en?: unknown

    ar?: unknown
  }

  const preferred =
    lang === "ar" ? (source.ar ?? source.en) : (source.en ?? source.ar)

  return typeof preferred === "string" && preferred.trim()
    ? preferred
    : typeof source.en === "string" && source.en.trim()
      ? source.en
      : typeof source.ar === "string" && source.ar.trim()
        ? source.ar
        : undefined
}

export function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined
}

export function numberOf(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) return parsed
  }

  return undefined
}

export function titleOf(item: PublicContentItem, lang: Lang): string {
  return localized(item.data.title, lang) ?? item.title
}

// --- Adapters to the shapes the existing sections render -------------------

export type LiveCase = {
  slug: string
  sector: string
  sectorAr: string
  year: string
  title: string
  titleAr: string
  client: string
  clientAr: string
  tag: string
  tagAr: string
  href: string
}

export function mapCase(item: PublicContentItem): LiveCase {
  const data = item.data

  return {
    slug: item.slug,

    sector: text(data.sector) ?? "",

    sectorAr: text(data.sectorAr) ?? text(data.sector) ?? "",

    year: String(
      numberOf(data.year) ?? new Date(item.publishedAt ?? 0).getFullYear(),
    ),

    title: titleOf(item, "en"),

    titleAr: titleOf(item, "ar"),

    client: text(data.client) ?? "",

    clientAr: text(data.clientAr) ?? text(data.client) ?? "",

    tag: text(data.tag) ?? "",

    tagAr: text(data.tagAr) ?? text(data.tag) ?? "",

    href: `/evidence/${item.slug}`,
  }
}

export type LiveLedgerRow = {
  y: number

  sector: string

  sectorAr: string

  title: string

  titleAr: string

  client: string

  clientAr: string

  geo: string

  geoAr: string

  size: string

  href: string
}

export function mapLedgerRow(item: PublicContentItem): LiveLedgerRow {
  const data = item.data

  return {
    y: numberOf(data.year) ?? new Date(item.publishedAt ?? 0).getFullYear(),

    sector: text(data.sector) ?? "",

    sectorAr: text(data.sectorAr) ?? text(data.sector) ?? "",

    title: titleOf(item, "en"),

    titleAr: titleOf(item, "ar"),

    client: text(data.client) ?? "",

    clientAr: text(data.clientAr) ?? text(data.client) ?? "",

    geo: text(data.geography) ?? "",

    geoAr: text(data.geographyAr) ?? text(data.geography) ?? "",

    size: text(data.size) ?? text(data.valueBand) ?? "",

    href: `/evidence/${item.slug}`,
  }
}

export type LivePublication = {
  slug: string
  type: string
  typeAr: string
  lang: string
  title: string
  titleAr: string
  meta: string
  metaAr: string
  free: boolean
  href: string
}

export function mapPublication(item: PublicContentItem): LivePublication {
  const data = item.data

  return {
    slug: item.slug,

    type: text(data.contentType) ?? "Publication",

    typeAr: text(data.contentTypeAr) ?? text(data.contentType) ?? "إصدار",

    lang: text(data.language) ?? "EN",

    title: titleOf(item, "en"),

    titleAr: titleOf(item, "ar"),

    meta: text(data.meta) ?? "",

    metaAr: text(data.metaAr) ?? text(data.meta) ?? "",

    free: text(data.free) === "true",

    href: `/knowledge/${item.slug}`,
  }
}

export type LiveCourse = {
  id: string
  slug: string
  title: string
  titleAr: string
  fmt: string
  fmtAr: string
  price: string
  priceAr: string
  seats: number
  startDate: string | null
  booking: string | null
  href: string
}

export function mapCourse(item: PublicContentItem): LiveCourse {
  const data = item.data

  return {
    id: item.slug,

    slug: item.slug,

    title: titleOf(item, "en"),

    titleAr: titleOf(item, "ar"),

    fmt: text(data.format) ?? "",

    fmtAr: text(data.formatAr) ?? text(data.format) ?? "",

    price: text(data.price) ?? "",

    priceAr: text(data.priceAr) ?? text(data.price) ?? "",

    seats: numberOf(data.seats) ?? 0,

    startDate: text(data.startDate) ?? null,

    booking: text(data.booking) ?? null,

    href: `/learning/${item.slug}`,
  }
}

export type LiveAudience = {
  slug: string

  order: number

  label: string

  ar: string

  kicker: string

  kickerAr: string

  line: string

  lineAr: string

  intro: string

  introAr: string

  meta: string

  metaAr: string

  short: string

  shortAr: string

  action: string

  actionAr: string

  q: string[]

  qAr: string[]
}

export function mapAudience(item: PublicContentItem): LiveAudience {
  const data = item.data

  const lines = (value: unknown) =>
    (localized(value, "en") ?? "")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)

  const linesAr = (value: unknown) =>
    (localized(value, "ar") ?? "")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)

  return {
    slug: item.slug,

    order: numberOf(data.order) ?? 99,

    label: localized(data.heading, "en") ?? titleOf(item, "en"),

    ar: localized(data.heading, "ar") ?? titleOf(item, "ar"),

    kicker: localized(data.kicker, "en") ?? "",

    kickerAr:
      localized(data.kicker, "ar") ?? localized(data.kicker, "en") ?? "",

    line: localized(data.heading, "en") ?? titleOf(item, "en"),

    lineAr:
      localized(data.heading, "ar") ??
      titleOf(item, "ar") ??
      localized(data.heading, "en") ??
      titleOf(item, "en"),

    intro: localized(data.intro, "en") ?? "",

    introAr: localized(data.intro, "ar") ?? localized(data.intro, "en") ?? "",

    meta: localized(data.meta, "en") ?? "",

    metaAr: localized(data.meta, "ar") ?? localized(data.meta, "en") ?? "",

    short: localized(data.short, "en") ?? "",

    shortAr: localized(data.short, "ar") ?? localized(data.short, "en") ?? "",

    action: localized(data.cta, "en") ?? "",

    actionAr: localized(data.cta, "ar") ?? localized(data.cta, "en") ?? "",

    q: lines(data.questions),

    qAr: linesAr(data.questions),
  }
}

// Instruments are the open-licence toolkits shown in the Knowledge library.
export function mapInstrument(item: PublicContentItem): LivePublication {
  const data = item.data

  return {
    slug: item.slug,

    type: "Toolkit",

    typeAr: "حزمة أدوات",

    lang: "AR/EN",

    title: titleOf(item, "en"),

    titleAr: titleOf(item, "ar"),

    meta:
      text(data.license) ??
      (text(data.stage) ? `${text(data.stage)} · Toolkit` : "Open licence"),

    metaAr:
      text(data.license) ??
      (text(data.stage) ? `${text(data.stage)} · حزمة أدوات` : "رخصة مفتوحة"),

    free: true,

    href: `/method/${item.slug}`,
  }
}

/* Partners are the delivery partnerships shown on the About page and the
   partner tab of Join. */
export type LivePartner = {
  slug: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  country: string
  sectors: string
  languages: string
  capabilities: string
  href: string
}

export function mapPartner(item: PublicContentItem): LivePartner {
  const data = item.data

  return {
    slug: item.slug,

    title: titleOf(item, "en"),

    titleAr: titleOf(item, "ar"),

    description: localized(data.description, "en") ?? "",

    descriptionAr:
      localized(data.description, "ar") ??
      localized(data.description, "en") ??
      "",

    country: text(data.country) ?? "",

    sectors: text(data.sectors) ?? "",

    languages: text(data.languages) ?? "",

    capabilities: text(data.capabilities) ?? "",

    href: `/about/${item.slug}`,
  }
}

/* Vacancies power the careers tab of Join. `meta` matches the single line the
   static list prints ("Cairo · Full time"). */
export type LiveVacancy = {
  slug: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  location: string
  salaryBand: string
  contractType: string
  deadline: string | null
  meta: string
  metaAr: string
  href: string
}

export function mapVacancy(item: PublicContentItem): LiveVacancy {
  const data = item.data

  const location = text(data.location) ?? ""

  const contractType = text(data.contractType) ?? ""

  const meta = [location, contractType].filter(Boolean).join(" · ")

  return {
    slug: item.slug,

    title: titleOf(item, "en"),

    titleAr: titleOf(item, "ar"),

    description: localized(data.description, "en") ?? "",

    descriptionAr:
      localized(data.description, "ar") ??
      localized(data.description, "en") ??
      "",

    location,

    salaryBand: text(data.salaryBand) ?? "",

    contractType,

    deadline: text(data.deadline) ?? null,

    meta,

    metaAr: meta,

    href: `/join/${item.slug}`,
  }
}

/* Initiative statuses are free text in the CMS; translate the common values and
   fall back to the source string so new statuses still read correctly. */
const INITIATIVE_STATUS_AR: Record<string, string> = {
  "in development": "قيد التطوير",

  active: "نشط",

  ongoing: "جارٍ",

  completed: "مكتمل",

  planned: "مخطط",

  paused: "متوقف مؤقتًا",
}

export type LiveInitiative = {
  slug: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  status: string
  statusAr: string
  meta: string
  metaAr: string
  href: string
}

export function mapInitiative(item: PublicContentItem): LiveInitiative {
  const data = item.data

  const status = text(data.status) ?? ""

  return {
    slug: item.slug,

    title: titleOf(item, "en"),

    titleAr: titleOf(item, "ar"),

    description: localized(data.description, "en") ?? "",

    descriptionAr:
      localized(data.description, "ar") ??
      localized(data.description, "en") ??
      "",

    status,

    statusAr: INITIATIVE_STATUS_AR[status.toLowerCase()] ?? status,

    meta: text(data.meta) ?? "",

    metaAr: text(data.meta) ?? "",

    href: `/about/${item.slug}`,
  }
}

export const collectionLabels = {
  cases: "case studies",
  publications: "publications",
  instruments: "instruments",
  courses: "courses",
  experts: "experts",
  partners: "partners",
  vacancies: "vacancies",
  initiatives: "initiatives",
  audiences: "audiences",
} as const
