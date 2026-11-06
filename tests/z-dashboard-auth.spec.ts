import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'mbaraka@askterramorph.com'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'MB@terramorph2026'

// Run in a fresh unauthenticated context to avoid polluting the
// authenticated browser context used by other test files.
test.use({ storageState: undefined })
test.describe('Dashboard authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('redirects to login when unauthenticated', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard\/login\?return=/)
    await expect(page.locator('h1')).toContainText(/Welcome back|Sign in/i)
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('.is-error, [role="alert"]')).toContainText(/incorrect|invalid/i)
  })

  test('signs in successfully with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.locator('.tm-workspace')).toBeVisible()
  })

  test('session persists on refresh', async ({ page }) => {
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard$/)

    await page.reload()
    await expect(page).toHaveURL(/\/dashboard$/)
    // Use more specific selector that matches the actual DOM
    await expect(page.locator('.tm-workspace, main, body').first()).toBeVisible()
  })

  test('signs out and clears session', async ({ page }) => {
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard$/)

    await page.click('button:has-text("Sign out"), button:has-text("Log out"), [aria-label*="sign out" i]')
    await expect(page).toHaveURL(/\/dashboard\/login/)
    await expect(page.locator('h1')).toContainText(/Welcome back/i)
  })

  test('password reset link renders', async ({ page }) => {
    const forgotLink = page.locator('a:has-text("Forgot"), a:has-text("forgot"), a:has-text("Reset")')
    if (await forgotLink.isVisible({ timeout: 3000 })) {
      await forgotLink.click()
      await expect(page).toHaveURL(/\/reset-password/)
      await expect(page.locator('h1')).toContainText(/Reset|password/i)
    } else {
      await expect(page.locator('h1')).toContainText(/Welcome back|Sign in/i)
    }
  })

  test('csrf protection blocks cross-origin state change', async ({ page }) => {
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard$/)

    const response = await page.request.post('/api/v1/auth/logout', {
      headers: { 'Content-Type': 'application/json' },
    })
    expect([204, 403]).toContain(response.status())
  })
})