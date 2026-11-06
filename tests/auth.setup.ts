import { test as setup, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'mbaraka@askterramorph.com'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'MB@terramorph2026'

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/dashboard/login')
  await page.fill('input[type="email"]', ADMIN_EMAIL)
  await page.fill('input[type="password"]', ADMIN_PASSWORD)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.waitForLoadState('networkidle')
  await page.context().storageState({ path: 'tests/.auth/admin.json' })
})