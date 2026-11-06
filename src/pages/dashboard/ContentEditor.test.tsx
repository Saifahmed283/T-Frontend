import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { ContentItemDetail } from "@/lib/api"

import { ToastProvider } from "./ui"
import ContentEditor from "./ContentEditor"
import type { Collection } from "./content-model"

const mocks = vi.hoisted(() => ({
  contentGet: vi.fn(),

  contentCreate: vi.fn(),

  contentUpdate: vi.fn(),

  contentTransition: vi.fn(),

  contentDelete: vi.fn(),
}))

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>()

  return {
    ...actual,

    api: { ...actual.api, ...mocks },
  }
})

const collection: Collection = {
  id: "cases",

  name: "Case Studies",

  singular: "Case Study",

  description: "Evidence of work and measurable change",

  group: "Evidence",

  fields: [
    { key: "title", label: "Title", required: true, localized: true },

    { key: "client", label: "Client", required: true },

    { key: "year", label: "Year", type: "number" },

    {
      key: "description",
      label: "Description",
      type: "textarea",
      localized: true,
    },
  ],
}

const detail: ContentItemDetail = {
  id: "c1",

  kind: "case",

  status: "DRAFT",

  slug: "water-reuse",

  title: "Water reuse",

  data: {
    title: { en: "Water reuse", ar: "إعادة استخدام المياه" },

    client: "Cairo Water",

    year: 2025,

    description: { en: "A reuse programme", ar: "برنامج إعادة استخدام" },
  },

  seo: {},

  assignmentId: null,

  sourceReference: null,

  scheduledPublishAt: null,

  scheduledUnpublishAt: null,

  publishedAt: null,

  createdById: "u1",

  updatedById: "u1",

  createdAt: "2026-09-01T00:00:00.000Z",

  updatedAt: "2026-09-02T00:00:00.000Z",

  activities: [],
}

beforeEach(() => {
  mocks.contentGet.mockResolvedValue(detail)

  mocks.contentCreate.mockResolvedValue(detail)

  mocks.contentUpdate.mockResolvedValue(detail)

  mocks.contentTransition.mockResolvedValue(detail)

  mocks.contentDelete.mockResolvedValue({ id: "c1", deleted: true })
})

describe("ContentEditor", () => {
  it("creates a record with separate English and Arabic values", async () => {
    const user = userEvent.setup()

    const onSaved = vi.fn()

    render(
      <ToastProvider>
        <ContentEditor
          collection={collection}
          isApprover={false}
          isAdmin={true}
          onClose={vi.fn()}
          onSaved={onSaved}
        />
      </ToastProvider>,
    )

    await user.type(screen.getByLabelText(/title · en/i), "Water reuse")

    await user.type(screen.getByLabelText(/client/i), "Cairo Water")

    await user.type(
      screen.getByLabelText(/description · en/i),
      "A reuse programme",
    )

    await user.click(screen.getByRole("button", { name: /العربية/i }))

    expect(screen.getByLabelText(/title · ar/i)).toHaveValue("")

    await user.type(
      screen.getByLabelText(/title · ar/i),
      "إعادة استخدام المياه",
    )

    await user.click(screen.getByRole("button", { name: /create case study/i }))

    await waitFor(() => expect(mocks.contentCreate).toHaveBeenCalledTimes(1))

    expect(mocks.contentCreate).toHaveBeenCalledWith(
      "cases",

      expect.objectContaining({
        data: {
          title: { en: "Water reuse", ar: "إعادة استخدام المياه" },

          client: "Cairo Water",

          year: "",

          description: { en: "A reuse programme", ar: "" },
        },

        seo: {},

        slug: undefined,

        sourceReference: null,

        scheduledPublishAt: null,

        scheduledUnpublishAt: null,
      }),
    )

    expect(onSaved).toHaveBeenCalledTimes(1)
  })

  it("loads, updates and transitions an existing record with approver gating", async () => {
    const user = userEvent.setup()

    const onSaved = vi.fn()

    const { rerender } = render(
      <ToastProvider>
        <ContentEditor
          collection={collection}
          itemId="c1"
          isApprover={false}
          isAdmin={true}
          onClose={vi.fn()}
          onSaved={onSaved}
        />
      </ToastProvider>,
    )

    const title = await screen.findByDisplayValue("Water reuse")

    expect(mocks.contentGet).toHaveBeenCalledWith("cases", "c1")

    await user.clear(title)

    await user.type(title, "Water reuse updated")

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() => expect(mocks.contentUpdate).toHaveBeenCalledTimes(1))

    expect(mocks.contentUpdate).toHaveBeenCalledWith(
      "cases",

      "c1",

      expect.objectContaining({
        data: expect.objectContaining({
          title: { en: "Water reuse updated", ar: "إعادة استخدام المياه" },
        }),
      }),
    )

    await user.click(screen.getByRole("button", { name: "Publishing" }))

    expect(
      screen.getByRole("button", { name: /move to published/i }),
    ).toBeDisabled()

    expect(
      screen.getByRole("button", { name: /move to review/i }),
    ).toBeEnabled()

    rerender(
      <ToastProvider>
        <ContentEditor
          collection={collection}
          itemId="c1"
          isApprover
          isAdmin={true}
          onClose={vi.fn()}
          onSaved={onSaved}
        />
      </ToastProvider>,
    )

    const publish = screen.getByRole("button", { name: /move to published/i })

    expect(publish).toBeEnabled()

    await user.click(publish)

    await waitFor(() =>
      expect(mocks.contentTransition).toHaveBeenCalledWith(
        "cases",

        "c1",

        "PUBLISHED",
      ),
    )
  })
})
