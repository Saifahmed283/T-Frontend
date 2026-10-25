import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { PublicContentItem, PublicContentList } from "./api"
import {
  clearPublicContentCache,
  localized,
  usePublicCollection,
  usePublicItem,
} from "./publicContent"

const mocks = vi.hoisted(() => ({
  publicContentList: vi.fn(),

  publicContentGet: vi.fn(),
}))

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>()

  return {
    ...actual,

    api: { ...actual.api, ...mocks },
  }
})

const item: PublicContentItem = {
  kind: "case",

  slug: "water-reuse",

  title: "Water reuse",

  data: { title: { en: "Water reuse", ar: "إعادة استخدام المياه" } },

  seo: null,

  publishedAt: "2026-05-01T00:00:00.000Z",

  updatedAt: "2026-05-02T00:00:00.000Z",

  collectionId: "cases",
}

const list: PublicContentList = {
  collectionId: "cases",

  items: [item],

  total: 1,

  page: 1,

  pageSize: 50,
}

beforeEach(() => {
  clearPublicContentCache()
})

describe("usePublicCollection", () => {
  it("upgrades a section to live items", async () => {
    mocks.publicContentList.mockResolvedValue(list)

    const { result } = renderHook(() => usePublicCollection("cases"))

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.live).toBe(true))

    expect(result.current).toMatchObject({
      items: [item],

      total: 1,

      live: true,

      loading: false,
    })

    expect(mocks.publicContentList).toHaveBeenCalledWith("cases", {
      pageSize: 50,
    })
  })

  it("keeps the static fallback when the public API fails", async () => {
    mocks.publicContentList.mockRejectedValue(new Error("offline"))

    const { result } = renderHook(() => usePublicCollection("cases"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current).toEqual({
      items: [],

      total: 0,

      live: false,

      loading: false,
    })
  })

  it("shares one request between sections reading the same collection", async () => {
    mocks.publicContentList.mockResolvedValue(list)

    const first = renderHook(() => usePublicCollection("cases"))

    const second = renderHook(() => usePublicCollection("cases"))

    await waitFor(() => {
      expect(first.result.current.live).toBe(true)

      expect(second.result.current.live).toBe(true)
    })

    expect(mocks.publicContentList).toHaveBeenCalledTimes(1)
  })

  it("loads an item by collection and slug", async () => {
    mocks.publicContentGet.mockResolvedValue(item)

    const { result } = renderHook(() => usePublicItem("cases", "water-reuse"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.item).toEqual(item)

    expect(mocks.publicContentGet).toHaveBeenCalledWith("cases", "water-reuse")
  })

  it("does not request a detail item without a slug", async () => {
    const { result } = renderHook(() => usePublicItem("cases", undefined))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.item).toBeNull()

    expect(mocks.publicContentGet).not.toHaveBeenCalled()
  })
})

describe("localized", () => {
  it("prefers the active language and falls back to the other one", () => {
    expect(localized({ en: "Hello", ar: "مرحبا" }, "ar")).toBe("مرحبا")

    expect(localized({ en: "Hello", ar: "" }, "ar")).toBe("Hello")

    expect(localized("Plain", "en")).toBe("Plain")

    expect(localized(undefined, "en")).toBeUndefined()
  })
})
