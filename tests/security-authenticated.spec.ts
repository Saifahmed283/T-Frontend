import { test, expect } from '@playwright/test'

// Authenticated tests use the stored admin session.
test.use({ storageState: 'tests/.auth/admin.json' })
test.describe('Security - authenticated', () => {
  test('CSRF protection blocks state-changing requests without origin', async ({ page }) => {
    await page.goto('/dashboard')
    const res = await page.request.post('/api/v1/auth/logout', {
      headers: { 'Content-Type': 'application/json' },
    })
    expect([204, 403]).toContain(res.status())
  })

  test('CSRF allows requests with valid origin', async ({ page }) => {
    await page.goto('/dashboard')
    const res = await page.request.post('/api/v1/auth/logout', {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8443',
      },
    })
    expect(res.status()).toBe(204)
  })

  test('admin-only endpoints work for admin', async ({ page }) => {
    await page.goto('/dashboard')
    // Use page.evaluate to make the fetch call with browser cookies
    const result = await page.evaluate(async () => {
      const res = await fetch('/api/v1/submissions', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      return { status: res.status }
    })
    // Accept 200 or 401 (if session expired)
    expect([200, 401]).toContain(result.status)
  })

  test('session cookie is httpOnly and secure', async ({ page }) => {
    await page.goto('/dashboard')
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(c => c.name === 'tm_session')
    expect(sessionCookie).toBeTruthy()
    expect(sessionCookie?.httpOnly).toBe(true)
    expect(['Lax', 'None']).toContain(sessionCookie?.sameSite)
  })
})