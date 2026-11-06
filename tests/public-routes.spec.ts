import { test, expect } from '@playwright/test'

test.describe('Public routes', () => {
  const routes = [
    { path: '/', title: 'TerraMorph — Strategy, Policy & Transformation Advisory' },
    { path: '/evidence', title: 'Evidence' },
    { path: '/method', title: 'Method' },
    { path: '/knowledge', title: 'Knowledge' },
    { path: '/learning', title: 'Learning' },
    { path: '/about', title: 'About' },
    { path: '/join', title: 'Join' },
    { path: '/contact', title: 'Contact' },
    { path: '/hub/governments', title: 'For governments' },
    { path: '/hub/consultancies', title: 'For consultancies' },
    { path: '/hub/development-partners', title: 'For development partners' },
    { path: '/hub/experts', title: 'Expert network' },
    { path: '/hub/careers', title: 'Careers' },
    { path: '/hub/ngos', title: 'For NGOs' },
    { path: '/hub/business', title: 'For business' },
  ]

  for (const route of routes) {
    test(`loads ${route.path} with correct title`, async ({ page }) => {
      await page.goto(route.path)
      await expect(page).toHaveTitle(new RegExp(route.title))
    })
  }

  test('404 page renders for unknown route', async ({ page }) => {
    await page.goto('/definitely-not-a-page')
    await expect(page).toHaveTitle(/Page not found|404|surveyed/i)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('all internal links resolve (no 404 from nav/footer)', async ({ page }) => {
    await page.goto('/')
    const links = await page.locator('a[href^="/"]').evaluateAll(
      els => els.map(e => e.getAttribute('href')).filter(Boolean)
    )
    const unique = [...new Set(links)]
    for (const href of unique.slice(0, 30)) {
      const res = await page.request.get(href, { timeout: 15000 })
      if (res.status() === 404) {
        console.warn(`Broken link: ${href}`)
      }
      expect(res.status()).toBeLessThan(400)
    }
  })
})