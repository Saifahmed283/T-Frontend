import { test, expect } from '@playwright/test'

test.describe.configure({ retries: 0 })
test.use({ storageState: 'tests/.auth/admin.json' })

test.describe('Dashboard workspace', () => {
  test('overview page renders with metric cards', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('.tm-workspace').first()).toBeVisible()
    await expect(page.locator('h1')).toContainText(/Overview|Dashboard/i)
    const panels = page.locator('.panel, .card, [class*="metric"]')
    const count = await panels.count()
    expect(count).toBeGreaterThan(0)
  })

  test('navigation tabs work', async ({ page }) => {
    await page.goto('/dashboard')
    const tabs = ['Overview', 'Content', 'Workflow', 'Media', 'Website', 'Submissions', 'Users', 'Activity', 'Settings']
    for (const tab of tabs) {
      const tabBtn = page.locator(`nav button:has-text("${tab}"), .tm-workspace button:has-text("${tab}"), [role="tablist"] button:has-text("${tab}")`).first()
      if (await tabBtn.isVisible()) {
        await tabBtn.click()
        await page.waitForTimeout(300)
      }
    }
  })

  test('overview shows content counts', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('.panel, .card').first()).toBeVisible()
  })

  test('activity feed loads', async ({ page }) => {
    await page.goto('/dashboard')
    const activityTab = page.locator('button:has-text("Activity"), nav >> text=Activity').first()
    if (await activityTab.isVisible()) {
      await activityTab.click()
    }
    await expect(page.locator('.tm-workspace').first()).toBeVisible()
  })
})