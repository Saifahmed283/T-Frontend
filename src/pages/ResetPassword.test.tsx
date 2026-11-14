import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/lib/api"

const mocks = vi.hoisted(() => ({
  resetPassword: vi.fn(),
  forgotPassword: vi.fn(),
}))

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>()
  return {
    ...actual,
    api: { ...actual.api, ...mocks },
  }
})

import ResetPassword from "@/pages/ResetPassword"

const validPassword = "New-Password-1"

const setSearch = (search: string) => {
  window.history.pushState({}, "", `${search || "/"}`)
}

const input = (id: string) =>
  document.getElementById(id) as HTMLInputElement | null

beforeEach(() => {
  mocks.resetPassword.mockReset()
  mocks.forgotPassword.mockReset()
  setSearch("/")
})

describe("ResetPassword", () => {
  it("resets the password and shows the success screen", async () => {
    const user = userEvent.setup()
    mocks.resetPassword.mockResolvedValue({ ok: true })
    setSearch("?token=reset-123")

    render(<ResetPassword />)

    await screen.findByRole("heading", { name: /choose a new password/i })

    await user.type(input("password")!, validPassword)
    await user.type(input("confirm")!, validPassword)

    await user.click(screen.getByRole("button", { name: /update password/i }))

    await waitFor(() =>
      expect(mocks.resetPassword).toHaveBeenCalledWith("reset-123", validPassword),
    )

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /password updated/i })).toBeInTheDocument(),
    )
  })

  it("shows an error when the reset token is invalid or expired", async () => {
    const user = userEvent.setup()
    const cause: ApiError = new ApiError(
      400,
      "This password reset link is invalid or has expired",
      "INVALID_RESET_TOKEN",
    )
    mocks.resetPassword.mockRejectedValue(cause)
    setSearch("?token=stale-token")

    render(<ResetPassword />)

    await screen.findByRole("heading", { name: /choose a new password/i })

    await user.type(input("password")!, validPassword)
    await user.type(input("confirm")!, validPassword)

    await user.click(screen.getByRole("button", { name: /update password/i }))

    await waitFor(() =>
      expect(mocks.resetPassword).toHaveBeenCalledWith("stale-token", validPassword),
    )

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "This password reset link is invalid or has expired. Request a new one.",
      ),
    )
  })

  it("renders a link-not-valid state when no token is present", async () => {
    render(<ResetPassword />)

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /link not valid/i })).toBeInTheDocument(),
    )
    expect(screen.getByRole("link", { name: /back to sign in/i })).toBeInTheDocument()
  })
})
