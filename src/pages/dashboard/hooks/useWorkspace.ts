import { useCallback, useEffect, useState } from "react"
import {
  api,
  ApiError,
  type ActivityFeed,
  type ContentCounts,
  type SessionInfo,
  type Submission,
  type WorkflowBoardPayload,
} from "@/lib/api"

export type WorkspaceData = {
  session: SessionInfo
  isAdmin: boolean
  isApprover: boolean
  activity: ActivityFeed
  submissions: Submission[] | null
  contentCounts: ContentCounts | null
  workflowBoard: WorkflowBoardPayload | null
}

export type WorkspaceState = {
  data: WorkspaceData | null
  loading: boolean
  error: string | null
  needsAuth: boolean
}

const initial: WorkspaceState = {
  data: null,
  loading: true,
  error: null,
  needsAuth: false,
}

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>(initial)

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))

    let session: SessionInfo
    try {
      session = await api.me()
    } catch (err) {
      const apiErr =
        err instanceof ApiError
          ? err
          : new ApiError(0, "Network error", "NETWORK_ERROR")
      const needsAuth = apiErr.status === 401
      setState({
        data: null,
        loading: false,
        error: needsAuth ? null : apiErr.message,
        needsAuth,
      })
      return
    }

    const isAdmin = session.role === "admin"
    const isApprover = isAdmin || session.role === "lead"

    try {
      const [activity, submissions, contentCounts, workflowBoard] =
        await Promise.all([
          api.activity(20),
          isAdmin
            ? api.submissions({ pageSize: 100 })
            : Promise.resolve({ items: [] as Submission[] }),
          api.contentCounts(),
          api.workflowBoard(),
        ])

      setState({
        data: {
          session,
          isAdmin,
          isApprover,
          activity,
          submissions: isAdmin ? submissions.items : null,
          contentCounts,
          workflowBoard,
        },
        loading: false,
        error: null,
        needsAuth: false,
      })
    } catch (err) {
      const apiErr =
        err instanceof ApiError
          ? err
          : new ApiError(0, "Network error", "NETWORK_ERROR")
      setState({
        data: null,
        loading: false,
        error: apiErr.message,
        needsAuth: false,
      })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return {
    ...state,
    reload: load,
    login: async (email: string, password: string) => {
      await api.login(email, password)
      await load()
    },
    logout: async () => {
      try {
        await api.logout()
      } finally {
        setState({ ...initial, loading: false, needsAuth: true })
      }
    },
  }
}
