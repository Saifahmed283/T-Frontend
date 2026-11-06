import { useCallback, useEffect, useState } from "react"
import {
  api,
  ApiError,
  type ActivityFeed,
  type ContentCounts,
  type SessionInfo,
  type WorkflowBoardPayload,
} from "@/lib/api"

export type WorkspaceData = {
  session: SessionInfo
  isAdmin: boolean
  isApprover: boolean
  activity: ActivityFeed
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

    /* The session probe is authoritative. A confirmed 401 means “signed out”;
       anything else (network, 429, 5xx) is a transient problem — we show a
       retry state instead of throwing the visitor out of the workspace. */
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

    /* Each data source fails independently: a hiccup in one feed never takes
       down the whole workspace. The shell renders around nulls. */
    let activity: ActivityFeed = { items: [], nextCursor: null }
    let contentCounts: ContentCounts | null = null
    let workflowBoard: WorkflowBoardPayload | null = null

    /* Submissions are deliberately not loaded here: the inbox fetches its own
       page when an admin opens it, instead of every dashboard visit paying for
       a queue most people never look at. */
    await Promise.all([
      api.activity(20).then((a) => { activity = a }).catch(() => {}),
      api.contentCounts().then((c) => { contentCounts = c }).catch(() => {}),
      api.workflowBoard().then((b) => { workflowBoard = b }).catch(() => {}),
    ])

    setState({
      data: {
        session,
        isAdmin,
        isApprover,
        activity,
        contentCounts,
        workflowBoard,
      },
      loading: false,
      error: null,
      needsAuth: false,
    })
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
      /* Send the visitor to the dedicated login page so the dashboard URL is
         never left sitting unauthenticated in the address bar. */
      window.location.replace("/dashboard/login")
    },
  }
}
