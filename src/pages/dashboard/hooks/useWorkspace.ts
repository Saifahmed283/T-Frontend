import { useCallback, useEffect, useState } from "react"
import {
  api,
  ApiError,
  type ActivityFeed,
  type Assignment,
  type ContentCounts,
  type ContentItem,
  type DashboardSummary,
  type Expert,
  type SessionInfo,
  type Submission,
  type WorkflowBoardPayload,
} from "@/lib/api"
import { collections } from "../content-model"
import { makeDemoItems } from "../data/demo"

export type WorkspaceSource = "live" | "demo"

export type WorkspaceData = {
  session: SessionInfo | null
  isAdmin: boolean
  isApprover: boolean
  summary: DashboardSummary | null
  assignments: Assignment[]
  activity: ActivityFeed
  experts: Expert[]
  submissions: Submission[] | null
  contentCounts: ContentCounts | null
  workflowBoard: WorkflowBoardPayload | null
}

export type WorkspaceState = {
  data: WorkspaceData | null
  source: WorkspaceSource
  loading: boolean
  error: string | null
  needsAuth: boolean
}

const initial: WorkspaceState = {
  data: null,
  source: "demo",
  loading: true,
  error: null,
  needsAuth: false,
}

function demoData(): WorkspaceData {
  const contentCounts: ContentCounts = {
    total: 62,
    byStatus: {
      DRAFT: 12,
      REVIEW: 5,
      APPROVED: 2,
      SCHEDULED: 1,
      PUBLISHED: 38,
      UNPUBLISHED: 1,
      ARCHIVED: 3,
    },
    byKind: collections.reduce(
      (acc, c) => {
        const base = ["DRAFT", "REVIEW", "PUBLISHED"][
          Math.random() > 0.5 ? 1 : 0
        ]
        acc[c.id] = {
          total: 6,
          byStatus: {
            DRAFT: base === "DRAFT" ? 3 : 2,
            REVIEW: base === "REVIEW" ? 2 : 1,
            APPROVED: 1,
            SCHEDULED: 0,
            PUBLISHED: 2,
            UNPUBLISHED: 0,
            ARCHIVED: 0,
          },
        }
        return acc
      },
      {} as ContentCounts["byKind"],
    ),
    generatedAt: new Date().toISOString(),
  }

  return {
    session: null,
    isAdmin: false,
    isApprover: false,
    summary: {
      activeAssignments: 7,
      contractValue: 1075,
      expertsOnRoster: 214,
      outcomesVerified: 92,
      notesReceived: 31,
      statuses: { ON_TRACK: 5, AT_RISK: 1, BLOCKED: 1 },
      stages: { G0: 1, G1: 2, G2: 1, G3: 1, G4: 1, G5: 1, G6: 0, G7: 0 },
      generatedAt: new Date().toISOString(),
    },
    assignments: [
      {
        id: "TM-25-031",
        name: "Governorate investment map — phase II",
        client: "Assiut Governorate",
        sector: "Public sector",
        value: 182,
        status: "ON_TRACK" as const,
        stage: "G5" as const,
        lead: { id: "m-baraka", name: "M. Baraka" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    activity: {
      items: [
        {
          id: "a1",
          type: "NOTE_ADDED",
          message: "Procurement pack downloaded",
          metadata: null,
          createdAt: new Date(Date.now() - 2 * 60_000).toISOString(),
          user: { id: "u1", name: "A. N" },
          assignment: {
            id: "TM-25-031",
            name: "Governorate investment map — phase II",
          },
        },
        {
          id: "a2",
          type: "STAGE_ADVANCED",
          message: "G5 gate passed",
          metadata: null,
          createdAt: new Date(Date.now() - 60_000).toISOString(),
          user: null,
          assignment: {
            id: "TM-25-031",
            name: "Governorate investment map — phase II",
          },
        },
      ],
      nextCursor: null,
    },
    experts: [],
    submissions: null,
    contentCounts,
    workflowBoard: {
      columns: collections.slice(0, 3).reduce(
        (acc, c) => {
          acc[c.id] = makeDemoItems(c.id, 2)
          return acc
        },
        {} as Record<string, ContentItem[]>,
      ),
      generatedAt: new Date().toISOString(),
    },
  }
}

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>(initial)

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))

    // Probe the session first so we can tell "signed out" (401) apart from an
    // unreachable API, and fall back to the bundled sample data in both cases
    // so the dashboard always renders.
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
        data: demoData(),
        source: "demo",
        loading: false,
        error: needsAuth ? null : apiErr.message,
        needsAuth,
      })
      return
    }

    const isAdmin = session.role === "admin"
    const isApprover = isAdmin || session.role === "lead"

    try {
      const [
        summary,
        assignments,
        activity,
        experts,
        submissions,
        contentCounts,
        workflowBoard,
      ] = await Promise.all([
        api.summary(),
        api.assignments({ pageSize: 100 }),
        api.activity(20),
        api.experts({ pageSize: 100 }),
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
          summary,
          assignments: assignments.items,
          activity,
          experts: experts.items,
          submissions: isAdmin ? submissions.items : null,
          contentCounts,
          workflowBoard,
        },
        source: "live",
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
        data: demoData(),
        source: "demo",
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
        setState({
          ...initial,
          loading: false,
          data: demoData(),
          source: "demo",
          needsAuth: true,
        })
      }
    },
  }
}
