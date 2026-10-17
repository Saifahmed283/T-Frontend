import { useCallback, useEffect, useState } from 'react'
import { api, ApiError, type ActivityFeed, type Assignment, type DashboardSummary, type Expert, type SessionInfo, type Submission } from '@/lib/api'

export type DashboardSource = 'live' | 'demo'

export type DashboardData = {
  summary: DashboardSummary
  assignments: Assignment[]
  activity: ActivityFeed
  session: SessionInfo | null
  experts: Expert[]
  submissions: Submission[] | null
}

export type DashboardState = {
  data: DashboardData | null
  source: DashboardSource
  loading: boolean
  error: string | null
  needsAuth: boolean
  isAdmin: boolean
}

const initial: DashboardState = { data: null, source: 'demo', loading: true, error: null, needsAuth: false, isAdmin: false }

/**
 * Loads the portal payload from the API and, when the caller is unauthenticated
 * or the API is unreachable, reports `demo` so the UI can fall back to the
 * bundled sample data rather than showing an empty shell.
 */
export function useDashboard() {
  const [state, setState] = useState<DashboardState>(initial)

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const session = await api.me().catch(() => null)
      const isAdmin = session?.role === 'admin'
      const [summary, assignments, activity, experts, submissions] = await Promise.all([
        api.summary(),
        api.assignments({ pageSize: 100 }),
        api.activity(20),
        session ? api.experts({ pageSize: 100 }).catch(() => null) : Promise.resolve(null),
        isAdmin ? api.submissions({ pageSize: 100 }).catch(() => null) : Promise.resolve(null),
      ])
      setState({
        data: {
          summary,
          assignments: assignments.items,
          activity,
          session,
          experts: experts?.items ?? [],
          submissions: submissions?.items ?? null,
        },
        source: 'live',
        loading: false,
        error: null,
        needsAuth: false,
        isAdmin,
      })
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError(0, 'Network error', 'NETWORK_ERROR')
      const needsAuth = apiErr.status === 401
      setState({
        data: null,
        source: 'demo',
        loading: false,
        error: needsAuth ? null : apiErr.message,
        needsAuth,
        isAdmin: false,
      })
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const login = useCallback(async (email: string, password: string) => {
    await api.login(email, password)
    await load()
  }, [load])

  const logout = useCallback(async () => {
    try { await api.logout() } finally {
      setState({ ...initial, loading: false, needsAuth: true })
    }
  }, [])

  return { ...state, reload: load, login, logout }
}