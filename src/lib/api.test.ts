import { beforeEach, describe, expect, it, vi } from "vitest"

import { api, ApiError, type PublicContentList, type SessionInfo } from "./api"

function fetchResponse(payload: unknown, status = 200, statusText = "") {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: async () =>
      typeof payload === "string" ? payload : JSON.stringify(payload),
  } as Response
}

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
})

describe("api request", () => {
  it("sends JSON credentials to the login endpoint and returns the session", async () => {
    const session: SessionInfo = {
      user: { id: "u1", name: "Mona", email: "mona@example.com" },
      workspace: { id: "w1", slug: "terramorph" },
      role: "admin",
    }

    fetchMock.mockResolvedValue(fetchResponse(session))

    await expect(api.login("mona@example.com", "secret")).resolves.toEqual(
      session,
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0]

    expect(url).toBe("/api/v1/auth/login")
    expect(init?.method).toBe("POST")
    expect(init?.credentials).toBe("include")
    expect(init?.headers).toMatchObject({ "Content-Type": "application/json" })
    expect(JSON.parse(String(init?.body))).toEqual({
      email: "mona@example.com",
      password: "secret",
    })
  })

  it("returns undefined for a 204 without reading a body", async () => {
    const text = vi.fn()

    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      statusText: "No Content",
      text,
    } as unknown as Response)

    await expect(api.logout()).resolves.toBeUndefined()
    expect(text).not.toHaveBeenCalled()
  })

  it("turns the error envelope into a typed ApiError", async () => {
    fetchMock.mockResolvedValue(
      fetchResponse(
        {
          error: {
            code: "SLUG_TAKEN",
            message: "That slug is already in use.",
          },
        },
        409,

        "Conflict",
      ),
    )

    const error = await api.contentCreate("cases", { data: {} }).catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 409,
      code: "SLUG_TAKEN",
      message: "That slug is already in use.",
    })
  })

  it("falls back to the HTTP status text when an error body is not JSON", async () => {
    fetchMock.mockResolvedValue(
      fetchResponse("Bad gateway", 502, "Bad Gateway"),
    )

    await expect(api.me()).rejects.toMatchObject({
      status: 502,
      message: "Bad Gateway",
    })
  })

  it("reports an unreachable API as a network ApiError", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"))

    await expect(api.me()).rejects.toMatchObject({
      status: 0,
      code: "NETWORK_ERROR",
      message: "Cannot reach the API",
    })
  })

  it("leaves the multipart boundary to the browser when uploading a file", async () => {
    fetchMock.mockResolvedValue(
      fetchResponse({
        id: "a1",
        filename: "brief.txt",
        storageKey: "k",
        url: "/media/brief.txt",
        mimeType: "text/plain",
        size: 5,
        alt: { en: "Brief", ar: "موجز" },
        createdById: "u1",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    )

    await api.assetUpload(
      new File(["hello"], "brief.txt", { type: "text/plain" }),

      { en: "Brief", ar: "موجز" },
    )

    const [, init] = fetchMock.mock.calls[0]

    expect(init?.body).toBeInstanceOf(FormData)

    expect(init?.headers).not.toHaveProperty("Content-Type")

    const form = init?.body as FormData

    expect(form.get("file")).toBeInstanceOf(File)
    expect(form.get("alt")).toBe("Brief")
    expect(form.get("altAr")).toBe("موجز")
  })

  it("requests public lists without an HTTP cache and encodes the collection", async () => {
    const payload: PublicContentList = {
      collectionId: "case studies",
      items: [],
      total: 0,
      page: 2,
      pageSize: 10,
    }

    fetchMock.mockResolvedValue(fetchResponse(payload))

    await expect(
      api.publicContentList("case studies", {
        search: "a b",
        page: 2,
        pageSize: 10,
      }),
    ).resolves.toEqual(payload)

    const [url, init] = fetchMock.mock.calls[0]

    expect(url).toBe(
      "/api/v1/public/content/case%20studies?search=a+b&page=2&pageSize=10",
    )
    expect(init).toMatchObject({ cache: "no-store" })
  })
})

describe("api request hardening", () => {
  it("shares one in-flight GET between concurrent callers", async () => {
    const session: SessionInfo = {
      user: { id: "u1", name: "Mona", email: "mona@example.com" },
      workspace: { id: "w1", slug: "terramorph" },
      role: "admin",
    }

    let resolveFetch!: (value: Response) => void

    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve
        }),
    )

    const first = api.me()
    const second = api.me()

    /* Two components asking at the same moment (StrictMode, shell + page)
       must not produce two requests. */
    expect(fetchMock).toHaveBeenCalledTimes(1)

    resolveFetch(fetchResponse(session))

    await expect(Promise.all([first, second])).resolves.toEqual([
      session,
      session,
    ])

    /* De-duplication only: the entry is gone once settled, so the next read
       hits the network again rather than serving a stale copy. */
    fetchMock.mockResolvedValue(fetchResponse(session))

    await api.me()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("reports a timeout distinctly from an unreachable API", async () => {
    fetchMock.mockRejectedValue(
      new DOMException("The operation timed out.", "TimeoutError"),
    )

    const error = await api.me().catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 0, code: "TIMEOUT" })
  })
})
