import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.use({ storageState: undefined })
test.setTimeout(90_000)

/* The marketing pages pull remote imagery/fonts. The consent suite only needs
   the local app, and a slow third-party asset must not stall `load`. */
test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) => {
    const url = route.request().url()
    if (
      url.startsWith("http://localhost:8443") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    ) {
      return route.continue()
    }
    return route.abort()
  })
})

async function skipIntro(page: Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("tm-intro", "1")
    } catch {
      /* ignore */
    }
  })
}

function banner(page: Page) {
  return page.getByTestId("cookie-banner")
}

async function openSite(page: Page) {
  await skipIntro(page)
  await page.goto("/", { waitUntil: "domcontentloaded" })
  const el = banner(page)
  await expect(el).toBeVisible({ timeout: 15_000 })
  return el
}

test.describe("Cookie consent", () => {
  test("Accept all persists across reload and navigation", async ({ page }) => {
    const el = await openSite(page)
    await el.getByRole("button", { name: "Accept all" }).click()
    await expect(banner(page)).toHaveCount(0)

    const stored = await page.evaluate(() => localStorage.getItem("cookie_consent"))
    expect(stored).toBeTruthy()
    expect(JSON.parse(stored!)).toMatchObject({
      essential: true,
      analytics: true,
      marketing: true,
      version: 1,
    })

    await page.reload({ waitUntil: "domcontentloaded" })
    await page.waitForTimeout(2200)
    await expect(banner(page)).toHaveCount(0)

    await page.goto("/evidence", { waitUntil: "domcontentloaded" })
    await page.waitForTimeout(2200)
    await expect(banner(page)).toHaveCount(0)
  })

  test("Reject all persists essential-only consent", async ({ page }) => {
    const el = await openSite(page)
    await el.getByRole("button", { name: "Reject all" }).click()
    await expect(banner(page)).toHaveCount(0)

    const stored = await page.evaluate(() => localStorage.getItem("cookie_consent"))
    expect(JSON.parse(stored!)).toMatchObject({ analytics: false, marketing: false })

    await page.reload({ waitUntil: "domcontentloaded" })
    await page.waitForTimeout(2200)
    await expect(banner(page)).toHaveCount(0)
  })

  test("Dismissing the banner persists essential-only consent", async ({ page }) => {
    const el = await openSite(page)
    await el.getByRole("button", { name: /dismiss banner/i }).click()
    await expect(banner(page)).toHaveCount(0)

    const stored = await page.evaluate(() => localStorage.getItem("cookie_consent"))
    expect(JSON.parse(stored!)).toMatchObject({ analytics: false, marketing: false })

    await page.reload({ waitUntil: "domcontentloaded" })
    await page.waitForTimeout(2200)
    await expect(banner(page)).toHaveCount(0)
  })

  test("footer preferences opens only the modal", async ({ page }) => {
    const el = await openSite(page)
    await el.getByRole("button", { name: "Accept all" }).click()

    await page.getByRole("button", { name: "Cookie preferences" }).click()
    await expect(page.getByTestId("cookie-preferences")).toBeVisible()
    await expect(banner(page)).toHaveCount(0)

    await page
      .getByTestId("cookie-preferences")
      .getByRole("button", { name: "Save & Close" })
      .click()
    await expect(page.getByTestId("cookie-preferences")).toHaveCount(0)
    await expect(banner(page)).toHaveCount(0)
  })

  test("preference switches are named and persist changes", async ({ page }) => {
    const el = await openSite(page)
    await el.getByRole("button", { name: "Manage preferences" }).click()

    const modal = page.getByTestId("cookie-preferences")
    await expect(modal).toBeVisible()

    const analytics = modal.getByRole("switch", { name: "Analytics Cookies" })
    await expect(analytics).toHaveAttribute("aria-checked", "false")
    // The input is visually hidden (sr-only); a pointer user clicks the label.
    await modal.getByTestId("cookie-toggle-analytics").click()
    await expect(analytics).toHaveAttribute("aria-checked", "true")

    const stored = await page.evaluate(() => localStorage.getItem("cookie_consent"))
    expect(JSON.parse(stored!).analytics).toBe(true)
  })

  test("consent survives localStorage loss via the cookie fallback", async ({ page }) => {
    const el = await openSite(page)
    await el.getByRole("button", { name: "Accept all" }).click()

    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: "domcontentloaded" })
    await page.waitForTimeout(2200)
    await expect(banner(page)).toHaveCount(0)
  })

  test("a stale consent version re-prompts", async ({ page }) => {
    const el = await openSite(page)
    await el.getByRole("button", { name: "Accept all" }).click()

    await page.evaluate(() => {
      const raw = localStorage.getItem("cookie_consent")
      if (!raw) return
      const parsed = JSON.parse(raw)
      parsed.version = 0
      localStorage.setItem("cookie_consent", JSON.stringify(parsed))
    })

    await page.reload({ waitUntil: "domcontentloaded" })
    await expect(banner(page)).toBeVisible({ timeout: 8000 })
  })

  test("consent UI has no serious or critical a11y violations", async ({ page }) => {
    const el = await openSite(page)

    const bannerScan = await new AxeBuilder({ page })
      .include('[data-testid="cookie-banner"]')
      .analyze()
    expect(
      bannerScan.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      ),
    ).toHaveLength(0)

    await el.getByRole("button", { name: "Manage preferences" }).click()
    await expect(page.getByTestId("cookie-preferences")).toBeVisible()

    const modalScan = await new AxeBuilder({ page })
      .include('[data-testid="cookie-preferences"]')
      .analyze()
    expect(
      modalScan.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      ),
    ).toHaveLength(0)
  })

  test("Arabic banner is fully localized", async ({ page }) => {
    await skipIntro(page)
    await page.goto("/", { waitUntil: "domcontentloaded" })

    // Waiting for the banner also guarantees React has hydrated, so the
    // language switch handler is attached before we click it.
    const el = banner(page)
    await expect(el).toBeVisible({ timeout: 15_000 })

    await page
      .getByRole("group", { name: "Language" })
      .getByRole("button", { name: "AR" })
      .click()
    await expect(page.locator("html")).toHaveAttribute("lang", "ar")

    await expect(el.getByText("نحترم خصوصيتك")).toBeVisible()
    await expect(el.getByText("الأساسية", { exact: true })).toBeVisible()
    await expect(el.getByText("مفعّلة دائمًا")).toBeVisible()
    await expect(el.getByRole("button", { name: "قبول الكل" })).toBeVisible()
  })

  const viewports = [
    { name: "mobile-320x568", width: 320, height: 568 },
    { name: "mobile-375x667", width: 375, height: 667 },
    { name: "mobile-390x844", width: 390, height: 844 },
    { name: "mobile-430x932", width: 430, height: 932 },
    { name: "mobile-landscape-667x375", width: 667, height: 375 },
    { name: "tablet-768x1024", width: 768, height: 1024 },
    { name: "tablet-1024x768", width: 1024, height: 768 },
    { name: "desktop-1440x900", width: 1440, height: 900 },
    { name: "desktop-1920x1080", width: 1920, height: 1080 },
  ]

  for (const vp of viewports) {
    test(`banner fits and accepts at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      const el = await openSite(page)

      // The banner slides up over 0.7s; measure once it has settled.
      await page.waitForTimeout(800)
      const box = await el.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.y).toBeGreaterThanOrEqual(-1)
      expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height + 1)

      const accept = el.getByRole("button", { name: "Accept all" })
      await expect(accept).toBeVisible()
      await accept.click()
      await expect(banner(page)).toHaveCount(0)
    })
  }

  for (const width of [320, 390]) {
    test(`header wordmark is visible at ${width}px without overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await skipIntro(page)
      await page.goto("/", { waitUntil: "domcontentloaded" })

      const wordmark = page
        .locator("header")
        .getByText("TERRAMORPH", { exact: true })
      await expect(wordmark).toBeVisible()

      const tagline = page
        .locator("header")
        .getByText("LEVERAGE FOR GOOD", { exact: true })
      await expect(tagline).toBeVisible()

      const box = await wordmark.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(width)

      const tagBox = await tagline.boundingBox()
      expect(tagBox).not.toBeNull()
      expect(tagBox!.x).toBeGreaterThanOrEqual(0)
      expect(tagBox!.x + tagBox!.width).toBeLessThanOrEqual(width)

      // The wordmark + tagline column must not run under the search/menu controls.
      const controls = await page
        .locator("header")
        .getByRole("button", { name: /search/i })
        .first()
        .boundingBox()
      if (controls) {
        expect(Math.max(box!.x + box!.width, tagBox!.x + tagBox!.width)).toBeLessThanOrEqual(
          controls.x,
        )
      }

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)

      // The page spacer reads --tm-header-h, which the header measures live and
      // the ResizeObserver writes after layout/fonts settle. Wait for the token
      // to catch up, then assert the spacer matches the rendered header even
      // after the extra tagline line.
      await page.waitForFunction(() => {
        const header = document.querySelector("header")
        const token = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--tm-header-h"),
        )
        return (
          !!header &&
          Number.isFinite(token) &&
          Math.abs(token - Math.round(header.getBoundingClientRect().height)) <= 1
        )
      })

      const headerHeights = await page.evaluate(() => {
        const header = document.querySelector("header")
        const main = document.querySelector("#main")
        return {
          rendered: header?.getBoundingClientRect().height ?? 0,
          token: parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue("--tm-header-h"),
          ),
          spacer: main?.getBoundingClientRect().top ?? 0,
        }
      })
      expect(headerHeights.rendered).toBeGreaterThan(0)
      expect(Math.abs(headerHeights.token - headerHeights.rendered)).toBeLessThanOrEqual(1)
      expect(Math.abs(headerHeights.spacer - headerHeights.rendered)).toBeLessThanOrEqual(1)
    })
  }
})
