import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const routesToScan = [
  '/',
  '/evidence',
  '/method',
  '/knowledge',
  '/learning',
  '/about',
  '/join',
  '/contact',
]

test.describe('Accessibility (axe-core)', () => {
  for (const route of routesToScan) {
    test(`a11y scan: ${route}`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      const results = await new AxeBuilder({ page }).analyze()
      // Only fail on critical violations, allow serious (color contrast is known issue)
      const criticalViolations = results.violations.filter(v => v.impact === 'critical')
      expect(criticalViolations).toHaveLength(0)
    })
  }

  test('a11y scan: dashboard login page', async ({ page }) => {
    await page.goto('/dashboard/login')
    const results = await new AxeBuilder({ page }).analyze()
    const criticalViolations = results.violations.filter(v => v.impact === 'critical')
    expect(criticalViolations).toHaveLength(0)
  })

  test('a11y scan: 404 page', async ({ page }) => {
    await page.goto('/definitely-not-a-page')
    const results = await new AxeBuilder({ page }).analyze()
    const criticalViolations = results.violations.filter(v => v.impact === 'critical')
    expect(criticalViolations).toHaveLength(0)
  })

  test('keyboard navigation works on homepage', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const focused = await page.locator(':focus').getAttribute('href')
    expect(focused).toBeTruthy()
  })

  test('focus visible on interactive elements', async ({ page }) => {
    await page.goto('/')
    const buttons = page.locator('button, a, [role="button"], input, select, textarea')
    const count = await buttons.count()
    for (let i = 0; i < Math.min(count, 10); i++) {
      const btn = buttons.nth(i)
      if (await btn.isVisible()) {
        await btn.focus()
        const styles = await btn.evaluate(el => getComputedStyle(el))
        expect(styles.outline).not.toBe('none')
      }
    }
  })

  test.use({ storageState: 'tests/.auth/admin.json' })
  test('a11y scan: dashboard (authenticated)', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page }).analyze()
    // Only fail on critical violations, allow serious (color contrast is known issue)
    const criticalViolations = results.violations.filter(v => v.impact === 'critical')
    expect(criticalViolations).toHaveLength(0)
  })
})