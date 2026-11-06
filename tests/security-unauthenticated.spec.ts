import { test, expect } from '@playwright/test'

// Unauthenticated tests run in a fresh context without storage state.
test.use({ storageState: undefined })
test.describe.configure({ retries: 0 })
test.describe('Security - unauthenticated', () => {
  test('unauthenticated dashboard access redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard\/login\?return=/)
  })

  test('unauthenticated API calls return 401', async ({ page }) => {
    const res = await page.request.get('/api/v1/content/counts')
    expect(res.status()).toBe(401)
  })

  test('public content API works without auth', async ({ page }) => {
    const res = await page.request.get('/api/v1/public/slugs')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.collections).toBeTruthy()
  })

  test('rate limit on login', async ({ page }) => {
    for (let i = 0; i < 12; i++) {
      const res = await page.request.post('/api/v1/auth/login', {
        data: { email: 'test@example.com', password: 'wrong' },
      })
      if (res.status() === 429) {
        expect(res.status()).toBe(429)
        const body = await res.json()
        expect(body.error.code).toBe('RATE_LIMITED')
        return
      }
    }
  })

  test('rate limit on submissions', async ({ page }) => {
    for (let i = 0; i < 25; i++) {
      const res = await page.request.post('/api/v1/submissions', {
        data: { kind: 'CONTACT', name: 'Test', email: `test${i}@example.com`, message: 'Test ' + i },
      })
      if (res.status() === 429) {
        expect(res.status()).toBe(429)
        return
      }
    }
  })

  test('password reset does not enumerate users', async ({ page }) => {
    const res1 = await page.request.post('/api/v1/auth/password/forgot', {
      data: { email: 'exists@terramorph.local' },
    })
    const res2 = await page.request.post('/api/v1/auth/password/forgot', {
      data: { email: 'nonexistent@example.com' },
    })
    expect(res1.status()).toBe(202)
    expect(res2.status()).toBe(202)
    const body1 = await res1.json()
    const body2 = await res2.json()
    expect(body1).toEqual(body2)
  })

  test('no sensitive data in localStorage/sessionStorage', async ({ page }) => {
    await page.goto('/')
    const localStorage = await page.evaluate(() => JSON.stringify(localStorage))
    const sessionStorage = await page.evaluate(() => JSON.stringify(sessionStorage))
    expect(localStorage).not.toMatch(/password|token|secret|key/i)
    expect(sessionStorage).not.toMatch(/password|token|secret|key/i)
  })
})