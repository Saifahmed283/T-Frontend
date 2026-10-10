/**
 * Typed client for the Terramorph backend.
 *
 * In development, requests go to the same origin and the Vite server proxies
 * `/api` to the backend (see `vite.config.ts`), so the httpOnly session cookie is
 * set and sent without CORS or cross-site complications. Set `VITE_API_URL` to
 * target a different origin (for example, a deployed API).
 */

export type ApiStatus = 'ON_TRACK' | 'AT_RISK' | 'BLOCKED'
export type ApiStage = 'G0' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6' | 'G7'

export type DashboardSummary = {
  activeAssignments: number
  contractValue: number
  expertsOnRoster: number
  outcomesVerified: number
  notesReceived: number
  statuses: Partial<Record<ApiStatus, number>>
  stages: Partial<Record<ApiStage, number>>
  generatedAt: string
}

export type Assignment = {
  id: string
  name: string
  client: string
  sector: string
  value: number
  status: ApiStatus
  stage: ApiStage
  lead: { id: string; name: string } | null
  createdAt: string
  updatedAt: string
}

export type Paginated<T> = {
  items: T[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

export type ActivityItem = {
  id: string
  type: string
  message: string
  metadata: unknown
  createdAt: string
  user: { id: string; name: string } | null
  assignment: { id: string; name: string } | null
}

export type ActivityFeed = { items: ActivityItem[]; nextCursor: string | null }

export type SessionInfo = {
  user: { id: string; name: string; email: string }
  workspace: { id: string; slug: string }
  role: string
}

export class ApiError extends Error {
  status: number
  code?: string
  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
      ...init,
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the API', 'NETWORK_ERROR')
  }
  if (res.status === 204) return undefined as T
  const text = await res.text()
  let payload: unknown = null
  if (text) {
    try { payload = JSON.parse(text) } catch { payload = null }
  }
  if (!res.ok) {
    const env = (payload ?? {}) as { error?: { code?: string; message?: string } }
    throw new ApiError(res.status, env.error?.message ?? res.statusText, env.error?.code)
  }
  return payload as T
}

export const api = {
  baseUrl: BASE || '(same origin)',
  login: (email: string, password: string) =>
    request<SessionInfo>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<void>('/api/v1/auth/logout', { method: 'POST' }),
  me: () => request<SessionInfo>('/api/v1/auth/me'),
  summary: () => request<DashboardSummary>('/api/v1/dashboard/summary'),
  assignments: (params: { status?: ApiStatus; search?: string; page?: number; pageSize?: number } = {}) => {
    const q = new URLSearchParams()
    if (params.status) q.set('status', params.status)
    if (params.search) q.set('search', params.search)
    if (params.page) q.set('page', String(params.page))
    if (params.pageSize) q.set('pageSize', String(params.pageSize))
    const qs = q.toString()
    return request<Paginated<Assignment>>(`/api/v1/assignments${qs ? `?${qs}` : ''}`)
  },
  activity: (limit = 20) => request<ActivityFeed>(`/api/v1/activity?limit=${limit}`),
}