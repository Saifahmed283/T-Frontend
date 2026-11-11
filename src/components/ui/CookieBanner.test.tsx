import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CookieConsentProvider, useCookieConsent } from "./CookieBanner"

vi.mock("@/pages/site/SitePage", () => ({
  useLang: () => ({ lang: "en", setLang: () => {} }),
}))

const CONSENT_KEY = "cookie_consent"

function clearCookies() {
  document.cookie.split(";").forEach((part) => {
    const name = part.split("=")[0]?.trim()
    if (name) document.cookie = `${name}=; path=/; max-age=0`
  })
}

function storedConsent() {
  const raw = localStorage.getItem(CONSENT_KEY)
  return raw ? JSON.parse(raw) : null
}

function renderProvider(children: React.ReactNode = <div>site</div>) {
  return render(<CookieConsentProvider>{children}</CookieConsentProvider>)
}

function advanceToBanner() {
  act(() => {
    vi.advanceTimersByTime(1600)
  })
}

function PrefsTrigger() {
  const { openPreferences } = useCookieConsent()
  return (
    <button type="button" onClick={openPreferences}>
      open-prefs
    </button>
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  clearCookies()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("CookieConsentProvider", () => {
  it("shows the banner on first visit and persists Accept all", () => {
    renderProvider()

    expect(screen.queryByTestId("cookie-banner")).not.toBeInTheDocument()
    advanceToBanner()
    expect(screen.getByTestId("cookie-banner")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Accept all" }))

    expect(screen.queryByTestId("cookie-banner")).not.toBeInTheDocument()
    expect(storedConsent()).toMatchObject({
      essential: true,
      analytics: true,
      marketing: true,
      version: 1,
    })
    expect(storedConsent().timestamp).toEqual(expect.any(String))
    expect(document.cookie).toContain(`${CONSENT_KEY}=`)
  })

  it("does not show the banner when consent is already stored", () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        essential: true,
        analytics: true,
        marketing: false,
        timestamp: new Date().toISOString(),
        version: 1,
      }),
    )

    renderProvider()
    advanceToBanner()

    expect(screen.queryByTestId("cookie-banner")).not.toBeInTheDocument()
  })

  it("Reject all stores essential-only consent and removes analytics cookies", () => {
    document.cookie = "_ga=GA1.1.123; path=/"

    renderProvider()
    advanceToBanner()
    fireEvent.click(screen.getByRole("button", { name: "Reject all" }))

    expect(storedConsent()).toMatchObject({ analytics: false, marketing: false })
    expect(document.cookie).not.toContain("_ga=")
  })

  it("dismissing with X persists essential-only consent", () => {
    renderProvider()
    advanceToBanner()

    fireEvent.click(screen.getByRole("button", { name: /dismiss banner/i }))

    expect(storedConsent()).toMatchObject({ analytics: false, marketing: false })
    expect(screen.queryByTestId("cookie-banner")).not.toBeInTheDocument()
  })

  it("opens preferences without resurrecting the banner and exposes named switches", () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        essential: true,
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString(),
        version: 1,
      }),
    )

    renderProvider(<PrefsTrigger />)
    advanceToBanner()
    fireEvent.click(screen.getByRole("button", { name: "open-prefs" }))

    const modal = screen.getByTestId("cookie-preferences")
    expect(modal).toBeInTheDocument()
    expect(screen.queryByTestId("cookie-banner")).not.toBeInTheDocument()

    const analytics = within(modal).getByRole("switch", { name: "Analytics Cookies" })
    expect(analytics).toHaveAttribute("aria-checked", "false")

    fireEvent.click(analytics)

    expect(analytics).toHaveAttribute("aria-checked", "true")
    expect(storedConsent().analytics).toBe(true)
  })

  it("re-prompts when the stored consent version is stale", () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        essential: true,
        analytics: true,
        marketing: true,
        timestamp: new Date().toISOString(),
        version: 0,
      }),
    )

    renderProvider()
    advanceToBanner()

    expect(screen.getByTestId("cookie-banner")).toBeInTheDocument()
  })

  it("falls back to the consent cookie when localStorage is empty", () => {
    document.cookie = `${CONSENT_KEY}=${encodeURIComponent(
      JSON.stringify({
        essential: true,
        analytics: true,
        marketing: true,
        timestamp: new Date().toISOString(),
        version: 1,
      }),
    )}; path=/`

    renderProvider()
    advanceToBanner()

    expect(screen.queryByTestId("cookie-banner")).not.toBeInTheDocument()
  })

  it("Accept All inside preferences persists both categories and closes", () => {
    renderProvider(<PrefsTrigger />)
    advanceToBanner()
    fireEvent.click(screen.getByRole("button", { name: "open-prefs" }))

    const modal = screen.getByTestId("cookie-preferences")
    fireEvent.click(within(modal).getByRole("button", { name: "Accept All" }))

    expect(screen.queryByTestId("cookie-preferences")).not.toBeInTheDocument()
    expect(storedConsent()).toMatchObject({ analytics: true, marketing: true })
  })
})
