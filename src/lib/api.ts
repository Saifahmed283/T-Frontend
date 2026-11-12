/**
 * Typed client for the Terramorph backend.
 *
 * In development, requests go to the same origin and the Vite server proxies
 * `/api` to the backend (see `vite.config.ts`), so the httpOnly session cookie is
 * set and sent without CORS or cross-site complications. Set `VITE_API_URL` to
 * target a different origin (for example, a deployed API).
 */

import { fieldErrors as extractFieldErrors, messageForError } from "./messages"

export type ApiStatus = "ON_TRACK" | "AT_RISK" | "BLOCKED"

export type ApiStage = "G0" | "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7"

// Content workspace

export const contentStatuses = [
  "DRAFT",

  "REVIEW",

  "APPROVED",

  "SCHEDULED",

  "PUBLISHED",

  "UNPUBLISHED",

  "ARCHIVED",
] as const

export type ContentStatus = typeof contentStatuses[number]

// Mirrors the server's TRANSITIONS map; the server remains authoritative.

export const contentTransitions: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ["REVIEW", "PUBLISHED", "ARCHIVED"],

  REVIEW: ["APPROVED", "DRAFT", "ARCHIVED"],

  APPROVED: ["PUBLISHED", "SCHEDULED", "DRAFT", "ARCHIVED"],

  SCHEDULED: ["PUBLISHED", "DRAFT", "ARCHIVED"],

  PUBLISHED: ["UNPUBLISHED", "ARCHIVED"],

  UNPUBLISHED: ["PUBLISHED", "DRAFT", "ARCHIVED"],

  ARCHIVED: ["DRAFT"],
}

// Moving a record into any of these states is an approver action (admin/lead).

export const approverTargets: ContentStatus[] = [
  "APPROVED",

  "SCHEDULED",

  "PUBLISHED",

  "UNPUBLISHED",

  "ARCHIVED",
]

export type LocalizedValue = {
  en?: string

  ar?: string
}

export type ContentItem = {
  id: string

  kind: string

  status: ContentStatus

  slug: string

  title: string

  data: Record<string, unknown>

  seo: Record<string, unknown> | null

  assignmentId: string | null

  sourceReference: string | null

  scheduledPublishAt: string | null

  scheduledUnpublishAt: string | null

  publishedAt: string | null

  createdById: string | null

  updatedById: string | null

  createdAt: string

  updatedAt: string
}

export type ContentActivity = {
  id: string

  type: string

  message: string

  metadata: unknown

  createdAt: string

  user: {
    id: string

    name: string
  } | null
}

export type ContentItemDetail = ContentItem & { activities: ContentActivity[] }

// Public (unauthenticated) read model served to the marketing site. It carries

// only PUBLISHED rows and has internal fields stripped server-side.

export type PublicContentItem = {
  kind: string

  slug: string

  title: string

  data: Record<string, unknown>

  seo: Record<string, unknown> | null

  publishedAt: string | null

  updatedAt: string

  collectionId: string | null
}

export type PublicContentList = {
  collectionId: string

  items: PublicContentItem[]

  total: number

  page: number

  pageSize: number
}

export type PublicSlugs = {
  collections: Record<string, string[]>
}

export type ContentCounts = {
  total: number

  byStatus: Record<string, number>

  byKind: Record<string, {
    total: number

    byStatus: Record<string, number>
  }>

  generatedAt: string
}

export type WorkflowBoardPayload = {
  columns: Record<string, ContentItem[]>

  generatedAt: string
}

export type ContentInput = {
  data: Record<string, unknown>

  seo?: Record<string, unknown> | null

  slug?: string

  assignmentId?: string | null

  sourceReference?: string | null

  scheduledPublishAt?: string | null

  scheduledUnpublishAt?: string | null
}

// Media assets

export type Asset = {
  id: string

  filename: string

  storageKey: string

  url: string

  mimeType: string

  size: number

  alt: LocalizedValue | null

  createdById: string | null

  createdAt: string

  updatedAt: string
}

// Site settings & members

export type SiteSettingsPayload = {
  data: Record<string, unknown>

  updatedAt: string | null
}

export type MemberRole = "admin" | "lead" | "member"

export type Member = {
  userId: string

  name: string

  email: string

  joinedAt: string

  role: MemberRole

  suspendedAt: string | null
}

export type Paginated<T> = {
  items: T[]

  pagination: {
    page: number

    pageSize: number

    total: number

    totalPages: number
  }
}

export type DataRequestType =
  | "ACCESS"
  | "RECTIFICATION"
  | "ERASURE"
  | "RESTRICTION"
  | "PORTABILITY"
  | "OBJECTION"
  | "WITHDRAW_CONSENT"

export type DataRequestStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED"

export interface DataSubjectRequest {
  id: string
  type: DataRequestType
  email: string
  name?: string
  details?: string
  status: DataRequestStatus
  createdAt: string
  updatedAt: string
  completedAt?: string
  response?: string
  verificationToken?: string
  verifiedAt?: string
  timeline?: DataRequestTimelineEvent[]
}

export interface DataRequestTimelineEvent {
  id: string
  status: DataRequestStatus
  message: string
  createdAt: string
  actor?: string
}

export interface DataRequestExport {
  request: DataSubjectRequest
  personalData: {
    submissions: Array<{
      id: string
      kind: string
      status: string
      email: string
      name: string | null
      createdAt: string
    }>
    contentItems: Array<{
      id: string
      kind: string
      status: string
      title: string
      createdAt: string
    }>
    sessions: Array<{
      id: string
      activeWorkspaceId: string | null
      createdAt: string
      lastUsedAt: string | null
    }>
    exportedAt: string
  }
}

export type ActivityItem = {
  id: string

  type: string

  message: string

  metadata: unknown

  createdAt: string

  user: {
    id: string

    name: string
  } | null

  assignment: {
    id: string

    name: string
  } | null
}

export type ActivityFeed = {
  items: ActivityItem[]

  nextCursor: string | null
}

export const submissionKinds = [
  "CONTACT",

  "EXPERT_REGISTRATION",

  "SEAT_RESERVATION",

  "TENDER_INTEREST",

  "TEAM_PROPOSAL",

  "JOB_APPLICATION",

  "PUBLICATION_REQUEST",

  "NEWSLETTER",

  "CONTRIBUTION",

  "MORPHE_LEAD",
] as const

export type SubmissionKind = typeof submissionKinds[number]

export type SubmissionInput = {
  kind: SubmissionKind

  email?: string

  name?: string

  message?: string

  source?: string

  payload?: Record<string, unknown>
}

export type SubmissionReceipt = {
  id: string

  kind: SubmissionKind

  status: string

  createdAt: string
}

export type SessionInfo = {
  user: {
    id: string

    name: string

    email: string
  }

  workspace: {
    id: string

    slug: string
  }

  role: string
}

export type SubmissionStatus = "NEW" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED"

export type Submission = {
  id: string

  kind: SubmissionKind

  status: SubmissionStatus

  email: string | null

  name: string | null

  message: string | null

  source: string | null

  payload: unknown

  createdAt: string
}

export class ApiError extends Error {
  status: number

  code?: string

  details?: unknown

  requestId?: string

  retryAfter?: number

  constructor(status: number, message: string, code?: string, details?: unknown, requestId?: string, retryAfter?: number) {
    super(message)

    this.name = "ApiError"

    this.status = status

    this.code = code

    this.details = details

    this.requestId = requestId

    this.retryAfter = retryAfter
  }
}

const BASE = import.meta.env.VITE_API_URL ?? ""

/** Requests that hang forever make the dashboard feel broken. */
const REQUEST_TIMEOUT_MS = 20_000

/* Uploads are exempt from the short deadline: a large file over a slow uplink
   can legitimately take minutes, and aborting it would lose the whole transfer. */
const UPLOAD_TIMEOUT_MS = 5 * 60_000

/*
 * In-flight GET de-duplication. Two components asking for the same URL at the
 * same moment (for example React StrictMode's double effect, or the shell and a
 * page both loading the same collection) share one network request. Completed
 * requests are removed immediately, so this is de-duplication, not caching.
 */
const inflight = new Map<string, Promise<unknown>>()

/* Read the CSRF token from the page's meta tag. The backend populates
   <meta name="csrf-token" content="..."> when rendering the page; the token is
   sent on every state-changing request as an X-CSRF-Token header. Empty when
   no token is configured (for example before the backend issues one). */
function csrfToken(): string {
  if (typeof document === "undefined") return ""
  const meta = document.querySelector('meta[name="csrf-token"]')
  return meta?.getAttribute("content") ?? ""
}

async function performRequest<T>(
  path: string,
  init: RequestInit,
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  let url = `${BASE}${path}`
  if (query) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) qs.set(k, String(v))
    }
    const qsStr = qs.toString()
    if (qsStr) url += `?${qsStr}`
  }
  let res: Response

  const isForm =
    typeof FormData !== "undefined" && init.body instanceof FormData

  try {
    res = await fetch(url, {
      ...init,

      credentials: "include",

      // The browser must set the multipart boundary itself.
      headers: {
        ...(isForm ? {} : { "Content-Type": "application/json" }),

        // CSRF token on state-changing requests only; GETs are read-only and
        // carry the session cookie instead.
        ...(init.method !== "GET" && init.method !== "HEAD"
          ? { "X-CSRF-Token": csrfToken() }
          : {}),

        ...(init.headers ?? {}),
      },

      signal:
        init.signal ??
        AbortSignal.timeout(isForm ? UPLOAD_TIMEOUT_MS : REQUEST_TIMEOUT_MS),
    })
  } catch (err) {
    // A timeout and an unreachable host are different problems for the user
    // and for whoever is reading the logs.
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new ApiError(0, "The API took too long to respond", "TIMEOUT")
    }
    throw new ApiError(0, "Cannot reach the API", "NETWORK_ERROR")
  }

  if (res.status === 204) return undefined as T

  const text = await res.text()

  let payload: unknown = null

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!res.ok) {
    const env = (payload ?? {}) as {
      error?: {
        code?: string
        message?: string
        details?: unknown
        requestId?: string
      }
    }

    // Extract Retry-After header for rate limits
    const retryAfterHeader = res.headers.get("Retry-After")
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined

    throw new ApiError(
      res.status,
      env.error?.message ?? res.statusText,
      env.error?.code,
      env.error?.details,
      env.error?.requestId,
      retryAfter,
    )
  }

  return payload as T
}

function request<T>(
  path: string,
  init: RequestInit = {},
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase()

  if (method !== "GET") return performRequest<T>(path, init)

  /* The de-duplication key must include the query string: two GETs to the same
     path with different query parameters (for example ?status=DRAFT vs
     ?status=PUBLISHED) must not share one network request, otherwise the second
     caller receives the first caller's response. */
  const qs = query
    ? new URLSearchParams(
        Object.entries(query)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : ""

  const key = `${method} ${path}${qs ? `?${qs}` : ""}`

  const pending = inflight.get(key)

  if (pending) return pending as Promise<T>

  let promise: Promise<T>

  promise = performRequest<T>(path, init, query).finally(() => {
    // Only delete our own entry: a newer request may have replaced it.
    if (inflight.get(key) === promise) inflight.delete(key)
  })

  inflight.set(key, promise)

  return promise
}

export type MorpheChatResponse = {
  session_id: string
  reply: string
  state: string
  terminal: boolean
  slots: Record<string, unknown>
  links: Array<{ id: string; url: string; label: string }>
  search_used?: boolean
}

export const api = {
  baseUrl: BASE || "(same origin)",

  login: (email: string, password: string) =>
    request<SessionInfo>("/api/v1/auth/login", {
      method: "POST",

      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<void>("/api/v1/auth/logout", { method: "POST" }),

  me: () => request<SessionInfo>("/api/v1/auth/me"),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>("/api/v1/auth/password", {
      method: "POST",

      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  submissions: (
    params: {
      kind?: SubmissionKind
      status?: string
      page?: number
      pageSize?: number
    } = {},
  ) => {
    const q = new URLSearchParams()

    if (params.kind) q.set("kind", params.kind)
    if (params.status) q.set("status", params.status)
    if (params.page) q.set("page", String(params.page))
    if (params.pageSize) q.set("pageSize", String(params.pageSize))

    const qs = q.toString()

    return request<Paginated<Submission>>(
      `/api/v1/submissions${qs ? `?${qs}` : ""}`,
    )
  },

  submissionStats: () => request<Record<string, number>>("/api/v1/submissions/stats"),

  submissionGet: (id: string) => request<Submission>(`/api/v1/submissions/${encodeURIComponent(id)}`),

  submissionUpdateStatus: (id: string, status: SubmissionStatus) =>
    request<Submission>(`/api/v1/submissions/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  submissionDelete: (id: string) =>
    request<{ deleted: boolean }>(`/api/v1/submissions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  activity: (params: { limit?: number; before?: string } = {}) =>
    request<ActivityFeed>("/api/v1/activity", {}, params),

  submit: (input: SubmissionInput) =>
    request<SubmissionReceipt>("/api/v1/submissions", {
      method: "POST",

      body: JSON.stringify(input),
    }),

  /* Content workspace */

  contentCounts: () => request<ContentCounts>("/api/v1/content/counts"),

  workflowBoard: () => request<WorkflowBoardPayload>("/api/v1/workflow/board"),

  contentList: (
    collectionId: string,

    params: {
      status?: ContentStatus

      search?: string

      geography?: string

      sector?: string

      page?: number

      pageSize?: number
    } = {},
  ) => {
    const q = new URLSearchParams()

    if (params.status) q.set("status", params.status)

    if (params.search) q.set("search", params.search)

    if (params.geography) q.set("geography", params.geography)

    if (params.sector) q.set("sector", params.sector)

    if (params.page) q.set("page", String(params.page))

    if (params.pageSize) q.set("pageSize", String(params.pageSize))

    const qs = q.toString()

    return request<Paginated<ContentItem>>(
      `/api/v1/content/${encodeURIComponent(collectionId)}${
        qs ? `?${qs}` : ""
      }`,
    )
  },

  publicContentList: (
    collectionId: string,

    params: {
      search?: string

      page?: number

      pageSize?: number
    } = {},
  ) => {
    const q = new URLSearchParams()

    if (params.search) q.set("search", params.search)

    if (params.page) q.set("page", String(params.page))

    if (params.pageSize) q.set("pageSize", String(params.pageSize))

    const qs = q.toString()

    return request<PublicContentList>(
      `/api/v1/public/content/${encodeURIComponent(collectionId)}${
        qs ? `?${qs}` : ""
      }`,
      // The server sends max-age=60 for CDN caching. In the browser that cache
      // can shadow a 60s poll by a few milliseconds, delaying a published edit
      // to the next tick. Polls must always reach the API.
      { cache: "no-store" },
    )
  },

  publicContentGet: (collectionId: string, slug: string) =>
    request<PublicContentItem>(
      `/api/v1/public/content/${encodeURIComponent(collectionId)}/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    ),

  publicSlugs: () =>
    request<PublicSlugs>("/api/v1/public/slugs", { cache: "no-store" }),

  publicSettings: () =>
    request<Record<string, unknown>>("/api/v1/public/settings", {
      cache: "no-store",
    }),

  forgotPassword: (email: string) =>
    request<{ ok: boolean }>("/api/v1/auth/password/forgot", {
      method: "POST",

      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<{ ok: boolean }>("/api/v1/auth/password/reset", {
      method: "POST",

      body: JSON.stringify({ token, newPassword }),
    }),

  contentGet: (collectionId: string, id: string) =>
    request<ContentItemDetail>(
      `/api/v1/content/${encodeURIComponent(collectionId)}/${encodeURIComponent(id)}`,
    ),

  contentCreate: (collectionId: string, body: ContentInput) =>
    request<ContentItem>(
      `/api/v1/content/${encodeURIComponent(collectionId)}`,

      { method: "POST", body: JSON.stringify(body) },
    ),

  contentUpdate: (
    collectionId: string,

    id: string,

    body: Partial<ContentInput>,
  ) =>
    request<ContentItem>(
      `/api/v1/content/${encodeURIComponent(collectionId)}/${encodeURIComponent(id)}`,

      { method: "PATCH", body: JSON.stringify(body) },
    ),

  contentTransition: (collectionId: string, id: string, to: ContentStatus) =>
    request<ContentItem>(
      `/api/v1/content/${encodeURIComponent(collectionId)}/${encodeURIComponent(id)}/transition`,

      { method: "POST", body: JSON.stringify({ to }) },
    ),

  contentDelete: (collectionId: string, id: string) =>
    request<{
      id: string

      deleted: boolean
    }>(
      `/api/v1/content/${encodeURIComponent(collectionId)}/${encodeURIComponent(id)}`,

      { method: "DELETE" },
    ),

  /* Media library */

  assets: (
    params: {
      search?: string

      mimeType?: string

      page?: number

      pageSize?: number
    } = {},
  ) => {
    const q = new URLSearchParams()

    if (params.search) q.set("search", params.search)

    if (params.mimeType) q.set("mimeType", params.mimeType)

    if (params.page) q.set("page", String(params.page))

    if (params.pageSize) q.set("pageSize", String(params.pageSize))

    const qs = q.toString()

    return request<Paginated<Asset> & { storageEnabled: boolean }>(
      `/api/v1/assets${qs ? `?${qs}` : ""}`,
    )
  },

  assetUpload: (file: File, alt?: LocalizedValue) => {
    const form = new FormData()

    form.append("file", file)

    if (alt?.en) form.append("alt", alt.en)

    if (alt?.ar) form.append("altAr", alt.ar)

    return request<Asset>("/api/v1/assets", { method: "POST", body: form })
  },

  assetUpdateAlt: (id: string, alt: LocalizedValue | null) =>
    request<Asset>(`/api/v1/assets/${encodeURIComponent(id)}`, {
      method: "PATCH",

      body: JSON.stringify({ alt }),
    }),

  assetDelete: (id: string) =>
    request<{
      id: string

      deleted: boolean
    }>(
      `/api/v1/assets/${encodeURIComponent(id)}`,

      { method: "DELETE" },
    ),

  /* Site settings */

  siteSettings: () => request<SiteSettingsPayload>("/api/v1/settings/site"),

  updateSiteSettings: (data: Record<string, unknown>) =>
    request<SiteSettingsPayload>("/api/v1/settings/site", {
      method: "PUT",

      body: JSON.stringify({ data }),
    }),

  /* Members */

  members: () => request<{ items: Member[] }>("/api/v1/members"),

  updateMemberRole: (userId: string, role: MemberRole) =>
    request<{
      role: MemberRole

      user: {
        id: string

        name: string

        email: string
      }
    }>(`/api/v1/members/${encodeURIComponent(userId)}`, {
      method: "PATCH",

      body: JSON.stringify({ role }),
    }),

  updateMemberInfo: (userId: string, data: { name: string; email: string }) =>
    request<{
      user: {
        id: string

        name: string

        email: string
      }
    }>(`/api/v1/members/${encodeURIComponent(userId)}`, {
      method: "PATCH",

      body: JSON.stringify(data),
    }),

  suspendMember: (userId: string) =>
    request<{
      userId: string
      suspendedAt: string
    }>(`/api/v1/members/${encodeURIComponent(userId)}/suspend`, {
      method: "POST",
    }),

  resumeMember: (userId: string) =>
    request<{
      userId: string
      suspendedAt: string | null
    }>(`/api/v1/members/${encodeURIComponent(userId)}/resume`, {
      method: "POST",
    }),

  deleteMember: (userId: string) =>
    request<{
      deleted: boolean
    }>(`/api/v1/members/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    }),

  inviteMember: (data: { email: string; name: string; role: MemberRole }) =>
    request<{
      role: MemberRole
      user: {
        id: string
        name: string
        email: string
      }
      tempPassword: string | null
    }>("/api/v1/members/invite", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /* Data Subject Requests */

  dataRequests: (params?: { page?: number; pageSize?: number; status?: string; search?: string }) =>
    request<Paginated<DataSubjectRequest>>(
      `/api/v1/data-requests${params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ""}`,
    ),

  dataRequestCreate: (data: {
    type: DataRequestType
    email: string
    name?: string
    details?: string
  }) =>
    request<DataSubjectRequest>("/api/v1/data-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  dataRequestGet: (id: string) =>
    request<DataSubjectRequest>(`/api/v1/data-requests/${encodeURIComponent(id)}`),

  dataRequestUpdate: (id: string, data: Partial<DataSubjectRequest>) =>
    request<DataSubjectRequest>(`/api/v1/data-requests/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  dataRequestDelete: (id: string) =>
    request<{ deleted: boolean }>(`/api/v1/data-requests/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  dataRequestVerify: (token: string) =>
    request<{ id: string; email: string; type: string; message: string }>(
      `/api/v1/data-requests/verify?token=${encodeURIComponent(token)}`,
    ),

  dataRequestExport: (id: string) =>
    request<DataRequestExport>(
      `/api/v1/data-requests/${encodeURIComponent(id)}/export`,
      { method: "POST" },
    ),

  /* Marketing Consent */

  marketingConsentSubscribe: (data: {
    email: string
    lists: string[]
    source?: string
    locale?: string
  }) =>
    request<{ email: string; lists: string[]; status: string; message: string }>(
      "/api/v1/marketing-consent",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  marketingConsentUnsubscribe: (data: {
    email: string
    list: string
    token: string
  }) =>
    request<{ email: string; lists: string[]; message: string }>(
      "/api/v1/marketing-consent/unsubscribe",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  marketingConsentGet: (email: string) =>
    request<{ email: string; lists: string[]; status: string; confirmedAt: string | null; unsubscribedAt: string | null }>(
      `/api/v1/marketing-consent?email=${encodeURIComponent(email)}`,
    ),

  /* Terms Acceptance */

  termsAcceptanceRecord: (data: {
    email: string
    privacyVersion?: string
    termsVersion?: string
    ipAddress?: string
    userAgent?: string
    source?: string
  }) =>
    request<{ id: string; email: string; privacyVersion: string; termsVersion: string; acceptedAt: string; message: string }>(
      "/api/v1/terms-acceptance",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  termsAcceptanceCheck: (email: string) =>
    request<{
      email: string
      accepted: boolean
      privacyVersion: string
      termsVersion: string
      acceptedAt: string | null
      source: string | null
      currentPrivacyVersion: string
      currentTermsVersion: string
      message: string
    }>(
      `/api/v1/terms-acceptance?email=${encodeURIComponent(email)}`,
    ),

  /** Get a user-friendly error message from any caught error. */
  errorMessage: (err: unknown, fallback?: string) => {
    const { message } = messageForError(err)
    return fallback ?? message
  },

  /** Extract field-level validation errors from a VALIDATION_ERROR. */
  fieldErrors: (err: unknown) => extractFieldErrors(err),

  /** Chat with Morphe, the intake assistant. */
  morpheChat: (sessionId: string | null, message: string | null, lang: "en" | "ar", useSearch?: boolean) =>
    request<MorpheChatResponse>("/api/v1/morphe/chat", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, message, lang, use_search: useSearch ?? false }),
    }),

  /** Morphe health check. */
  morpheHealth: () => request<{ status: string; service: string }>("/api/v1/morphe/health"),
}

