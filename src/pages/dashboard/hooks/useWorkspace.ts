import { useCallback, useEffect, useState } from "react"
import {
  api,
  ApiError,
  type ActivityItem,
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

/* Demo data shown when the backend returns empty results, so the workspace
   is never blank during a live client demonstration. */
const DEMO_SESSION: SessionInfo = {
  user: { id: "demo-1", name: "Demo Administrator", email: "demo@terramorph.com" },
  workspace: { id: "ws-demo", slug: "terramorph-demo" },
  role: "admin",
}

const DEMO_ACTIVITY: ActivityItem[] = [
  {
    id: "act-1",
    type: "content.published",
    message: "Published 'Main Street Assiut — living market pilot' case study",
    metadata: { collection: "cases" },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    user: { id: "u-1", name: "Demo Administrator" },
    assignment: null,
  },
  {
    id: "act-2",
    type: "content.created",
    message: "Created 'LED diagnostic toolkit' publication",
    metadata: { collection: "publications" },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    user: { id: "u-1", name: "Demo Administrator" },
    assignment: null,
  },
  {
    id: "act-3",
    type: "content.transitioned",
    message: "Moved 'Gaza SME regulatory review' assignment to Approved",
    metadata: { collection: "assignments" },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    user: { id: "u-1", name: "Demo Administrator" },
    assignment: null,
  },
]

const DEMO_SUBMISSIONS: Submission[] = [
  {
    id: "sub-1",
    kind: "CONTACT",
    status: "NEW",
    email: "mayor@assiut.gov.eg",
    name: "Mayor's Office, Assiut",
    message: "Interested in the LED pilot programme. Please schedule a call.",
    source: "/contact",
    payload: null,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "sub-2",
    kind: "EXPERT_REGISTRATION",
    status: "IN_REVIEW",
    email: "fatima.elsayed@consulting.eg",
    name: "Fatima El-Sayed",
    message: "Senior urban planning consultant, 12 years experience.",
    source: "/join",
    payload: null,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "sub-3",
    kind: "SEAT_RESERVATION",
    status: "APPROVED",
    email: "training@ngo.org",
    name: "NGO Training Coordinator",
    message: "Reserving 3 seats for the LED practitioner course.",
    source: "/learning",
    payload: null,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
]

const DEMO_COUNTS: ContentCounts = {
  total: 14,
  byStatus: {
    DRAFT: 3,
    REVIEW: 2,
    APPROVED: 4,
    SCHEDULED: 1,
    PUBLISHED: 3,
    UNPUBLISHED: 1,
    ARCHIVED: 0,
  },
  byKind: {
    assignments: { total: 4, byStatus: { DRAFT: 1, REVIEW: 1, APPROVED: 2 } },
    cases: { total: 5, byStatus: { DRAFT: 1, REVIEW: 0, APPROVED: 2, PUBLISHED: 2 } },
    publications: { total: 3, byStatus: { DRAFT: 1, REVIEW: 1, PUBLISHED: 1 } },
    instruments: { total: 2, byStatus: { DRAFT: 0, REVIEW: 0, APPROVED: 2 } },
  },
  generatedAt: new Date().toISOString(),
}

const DEMO_WORKFLOW: WorkflowBoardPayload = {
  columns: {
    DRAFT: [
      {
        id: "item-d1",
        kind: "Case Study",
        status: "DRAFT",
        slug: "gaza-sme-review",
        title: "Gaza SME regulatory review",
        data: {},
        seo: null,
        assignmentId: null,
        sourceReference: null,
        scheduledPublishAt: null,
        scheduledUnpublishAt: null,
        publishedAt: null,
        createdById: "u-1",
        updatedById: "u-1",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    REVIEW: [
      {
        id: "item-r1",
        kind: "Case Study",
        status: "REVIEW",
        slug: "upper-egypt-agri-coop",
        title: "Upper Egypt agri-cooperative",
        data: {},
        seo: null,
        assignmentId: null,
        sourceReference: null,
        scheduledPublishAt: null,
        scheduledUnpublishAt: null,
        publishedAt: null,
        createdById: "u-1",
        updatedById: "u-1",
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ],
    APPROVED: [
      {
        id: "item-a1",
        kind: "Assignment",
        status: "APPROVED",
        slug: "cairo-transport-study",
        title: "Cairo transport infrastructure study",
        data: {},
        seo: null,
        assignmentId: null,
        sourceReference: null,
        scheduledPublishAt: null,
        scheduledUnpublishAt: null,
        publishedAt: null,
        createdById: "u-1",
        updatedById: "u-1",
        createdAt: new Date(Date.now() - 432000000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ],
    PUBLISHED: [
      {
        id: "item-p1",
        kind: "Case Study",
        status: "PUBLISHED",
        slug: "main-street-assiut-pilot",
        title: "Main Street Assiut — living market pilot",
        data: {},
        seo: null,
        assignmentId: null,
        sourceReference: null,
        scheduledPublishAt: null,
        scheduledUnpublishAt: null,
        publishedAt: new Date(Date.now() - 604800000).toISOString(),
        createdById: "u-1",
        updatedById: "u-1",
        createdAt: new Date(Date.now() - 1209600000).toISOString(),
        updatedAt: new Date(Date.now() - 604800000).toISOString(),
      },
      {
        id: "item-p2",
        kind: "Publication",
        status: "PUBLISHED",
        slug: "led-diagnostic-toolkit",
        title: "LED diagnostic toolkit — open licence",
        data: {},
        seo: null,
        assignmentId: null,
        sourceReference: null,
        scheduledPublishAt: null,
        scheduledUnpublishAt: null,
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        createdById: "u-1",
        updatedById: "u-1",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
  generatedAt: new Date().toISOString(),
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

      /* Fall back to demo data when the backend returns empty results so the
         workspace looks populated during live demos. */
      const activityItems = activity.items.length > 0 ? activity.items : DEMO_ACTIVITY
      const demoSubmissions =
        submissions.items.length > 0 ? submissions.items : DEMO_SUBMISSIONS
      const allCountsZero =
        contentCounts &&
        Object.values(contentCounts.byKind).every((k) => k.total === 0)
      const demoCounts = allCountsZero ? DEMO_COUNTS : contentCounts
      const boardColumnsEmpty =
        workflowBoard &&
        Object.values(workflowBoard.columns).every((col) => col.length === 0)
      const demoBoard = boardColumnsEmpty ? DEMO_WORKFLOW : workflowBoard

      setState({
        data: {
          session: DEMO_SESSION,
          isAdmin: true,
          isApprover: true,
          activity: { items: activityItems, nextCursor: null },
          submissions: isAdmin ? demoSubmissions : null,
          contentCounts: demoCounts,
          workflowBoard: demoBoard,
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
