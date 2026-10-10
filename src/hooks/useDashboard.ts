import { useCallback, useEffect, useState } from 'react'
import { api, ApiError, type ActivityFeed, type Assignment, type DashboardSummary, type SessionInfo } from '@/lib/api'

export type DashboardSource = 'live' | 'demo'

export type DashboardData = {
  summary: DashboardSummary
  assignments: Assignment[]
  activity: ActivityFeed
  session: SessionInfo | null
}

export type DashboardState = {
  data: DashboardData | null
  source: DashboardSource
  loading: boolean
  error: string | null
  needsAuth: boolean
}

const initial: DashboardState = { data: null, source: 'demo', loading: true, error: null, needsAuth: false }

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
      const [summary, assignments, activity, session] = await Promise.all([
        api.summary(),
        api.assignments({ pageSize: 50 }),
        api.activity(8),
        api.me().catch(() => null),
      ])
      setState({
        data: { summary, assignments: assignments.items, activity, session },
        source: 'live',
        loading: false,
        error: null,
        needsAuth: false,
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