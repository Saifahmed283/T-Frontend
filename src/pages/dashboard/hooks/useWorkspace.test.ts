import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError, type SessionInfo } from "@/lib/api"

const mocks = vi.hoisted(() => ({
  me: vi.fn(),

  activity: vi.fn(),

  submissions: vi.fn(),

  contentCounts: vi.fn(),

  workflowBoard: vi.fn(),

  login: vi.fn(),

  logout: vi.fn(),
}))

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>()

  return {
    ...actual,

    api: { ...actual.api, ...mocks },
  }
})

const { useWorkspace } = await import("./useWorkspace")

const session: SessionInfo = {
  user: { id: "u1", name: "Mona", email: "mona@example.com" },

  workspace: { id: "w1", slug: "terramorph" },

  role: "member",
}

const activity = { items: [], nextCursor: null }

const contentCounts = {
  total: 0,

  byStatus: {},

  byKind: {},

  generatedAt: "2026-10-01T00:00:00.000Z",
}

const workflowBoard = {
  columns: {},

  generatedAt: "2026-10-01T00:00:00.000Z",
}

beforeEach(() => {
  mocks.me.mockResolvedValue(session)

  mocks.activity.mockResolvedValue(activity)

  mocks.submissions.mockResolvedValue({
    items: [],

    pagination: { page: 1, pageSize: 100, total: 0, totalPages: 0 },
  })

  mocks.contentCounts.mockResolvedValue(contentCounts)

  mocks.workflowBoard.mockResolvedValue(workflowBoard)

  mocks.login.mockResolvedValue(session)

  mocks.logout.mockResolvedValue(undefined)
})

describe("useWorkspace", () => {
  it("shows the auth gate when the session probe returns 401", async () => {
    mocks.me.mockRejectedValue(
      new ApiError(401, "Authentication required", "UNAUTHORIZED"),
    )

    const { result } = renderHook(() => useWorkspace())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current).toMatchObject({
      data: null,

      needsAuth: true,

      error: null,
    })

    expect(mocks.activity).not.toHaveBeenCalled()
  })

  it("loads the workspace and derives role capabilities", async () => {
    const { result } = renderHook(() => useWorkspace())

    await waitFor(() => expect(result.current.data).not.toBeNull())

    expect(result.current).toMatchObject({
      loading: false,

      needsAuth: false,

      error: null,

      data: {
        session,

        isAdmin: false,

        isApprover: false,

        activity,

        submissions: null,

        contentCounts,

        workflowBoard,
      },
    })

    expect(mocks.submissions).not.toHaveBeenCalled()
  })

  it("loads the submission queue for an admin", async () => {
    mocks.me.mockResolvedValue({ ...session, role: "admin" })

    const { result } = renderHook(() => useWorkspace())

    await waitFor(() => expect(result.current.data).not.toBeNull())

    expect(result.current.data).toMatchObject({
      isAdmin: true,

      isApprover: true,

      submissions: [],
    })

    expect(mocks.submissions).toHaveBeenCalledWith({ pageSize: 100 })
  })

  it("surfaces a non-auth load failure instead of the auth gate", async () => {
    mocks.me.mockRejectedValue(
      new ApiError(500, "Workspace unavailable", "INTERNAL_ERROR"),
    )

    const { result } = renderHook(() => useWorkspace())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current).toMatchObject({
      data: null,

      needsAuth: false,

      error: "Workspace unavailable",
    })
  })
})
