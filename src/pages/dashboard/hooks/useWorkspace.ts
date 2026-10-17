import { useCallback, useEffect, useState } from 'react'
import { api, ApiError, type ActivityFeed, type Assignment, type ContentCounts, type ContentItem, type DashboardSummary, type Expert, type SessionInfo, type Submission, type WorkflowBoardPayload } from '@/lib/api'
import { collections } from '../content-model'
import { makeDemoItems } from '../data/demo'

export type WorkspaceSource = 'live' | 'demo'

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
  contentByCollection: Record<string, ContentItem[]>
}

export type WorkspaceState = {
  data: WorkspaceData | null
  source: WorkspaceSource
  loading: boolean
  error: string | null
  needsAuth: boolean
}

const initial: WorkspaceState = { data: null, source: 'demo', loading: true, error: null, needsAuth: false }

function demoData(): WorkspaceData {
  const contentCounts: ContentCounts = {
    total: 62,
    byStatus: { DRAFT: 12, REVIEW: 5, APPROVED: 2, SCHEDULED: 1, PUBLISHED: 38, UNPUBLISHED: 1, ARCHIVED: 3 },
    byKind: collections.reduce((acc, c) => {
      const base = ['DRAFT', 'REVIEW', 'PUBLISHED'][Math.random() > 0.5 ? 1 : 0]
      acc[c.id] = {
        total: 6,
        byStatus: {
          DRAFT: base === 'DRAFT' ? 3 : 2,
          REVIEW: base === 'REVIEW' ? 2 : 1,
          APPROVED: 1,
          SCHEDULED: 0,
          PUBLISHED: 2,
          UNPUBLISHED: 0,
          ARCHIVED: 0,
        },
      }
      return acc
    }, {} as Record<string, { total: number; byStatus: Record<string, number> }>),
    generatedAt: new Date().toISOString(),
  }

  const contentByCollection: Record<string, ContentItem[]> = collections.reduce((acc, c) => {
    acc[c.id] = makeDemoItems(c.id, 6)
    return acc
  }, {} as Record<string, ContentItem[]>)

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
        id: 'TM-25-031',
        name: 'Governorate investment map — phase II',
        client: 'Assiut Governorate',
        sector: 'Public sector',
        value: 182,
        status: 'ON_TRACK' as const,
        stage: 'G5' as const,
        lead: { id: 'm-baraka', name: 'M. Baraka' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    activity: {
      items: [
        { id: 'a1', type: 'NOTE_ADDED', message: 'Procurement pack downloaded', metadata: null, createdAt: new Date(Date.now() - 2 * 60_000).toISOString(), user: { id: 'u1', name: 'A. N' }, assignment: { id: 'TM-25-031', name: 'Governorate investment map — phase II' } },
        { id: 'a2', type: 'STAGE_ADVANCED', message: 'G5 gate passed', metadata: null, createdAt: new Date(Date.now() - 60_000).toISOString(), user: null, assignment: { id: 'TM-25-031', name: 'Governorate investment map — phase II' } },
      ],
      nextCursor: null,
    },
    experts: [],
    submissions: null,
    contentCounts,
    workflowBoard: {
      columns: collections.slice(0, 3).reduce((acc, c) => {
        acc[c.id] = contentByCollection[c.id]?.slice(0, 2) ?? []
        return acc
      }, {} as Record<string, ContentItem[]>),
      generatedAt: new Date().toISOString(),
    },
    contentByCollection,
  }
}

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>(initial)

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const session = await api.me().catch(() => null)
      const isAdmin = session?.role === 'admin'
      const isApprover = isAdmin || session?.role === 'lead'
      const [summary, assignments, activity, experts, submissions, contentCounts, workflowBoard] = await Promise.all([
        api.summary().catch(() => null),
        api.assignments({ pageSize: 100 }).catch(() => ({ items: [] as Assignment[] })),
        api.activity(20).catch(() => ({ items: [], nextCursor: null })),
        session ? api.experts({ pageSize: 100 }).catch(() => ({ items: [] as Expert[] })) : Promise.resolve({ items: [] as Expert[] }),
        isAdmin ? api.submissions({ pageSize: 100 }).catch(() => ({ items: [] as Submission[] })) : Promise.resolve({ items: [] as Submission[] } as any),
        api.contentCounts().catch(() => null),
        api.workflowBoard().catch(() => null),
      ])

      // fetch content per collection in parallel, but cap
      const lists = await Promise.all(
        collections.map((c) =>
          api
            .contentList(c.id, { pageSize: 20 })
            .then((r) => ({ id: c.id, items: r.items }))
            .catch(() => ({ id: c.id, items: [] as ContentItem[] })),
        ),
      )
      const contentByCollection = lists.reduce((acc, x) => ({ ...acc, [x.id]: x.items }), {} as Record<string, ContentItem[]>)

      setState({
        data: {
          session,
          isAdmin,
          isApprover,
          summary,
          assignments: assignments.items,
          activity,
          experts: experts.items,
          submissions: isAdmin ? (submissions as any).items : null,
          contentCounts,
          workflowBoard,
          contentByCollection,
        },
        source: 'live',
        loading: false,
        error: null,
        needsAuth: false,
      })
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError(0, 'Network error', 'NETWORK_ERROR')
      const needsAuth = apiErr.status === 401
      setState({
        data: demoData(),
        source: 'demo',
        loading: false,
        error: needsAuth ? null : apiErr.message,
        needsAuth,
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
        setState({ ...initial, loading: false, data: demoData(), source: 'demo', needsAuth: true })
      }
    },
  }
}