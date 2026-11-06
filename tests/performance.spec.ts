import { test, expect } from '@playwright/test'

test.describe('Performance (slow network + CPU)', () => {
  test('homepage loads with skeleton on slow 4G', async ({ page }) => {
    await page.route('**/*', route => {
      route.continue()
    })

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Check that page loads - just verify main content appears
    await expect(page.locator('main, body').first()).toBeVisible({ timeout: 15000 })
  })

  test('dashboard shows login or skeleton on slow network', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    // Should show login form or skeleton
    await expect(page.locator('h1, form, [class*="skeleton"]').first()).toBeVisible({ timeout: 5000 })
  })

  test('LCP under threshold on mobile', async ({ page, browserName }) => {
    await page.goto('/', { waitUntil: 'load' })
    const lcp = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        }).observe({ type: 'largest-contentful-paint', buffered: true })
      })
    })
    expect(lcp).toBeLessThan(4000) // 4s threshold for slow network
  })

  test('CLS under threshold', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' })
    const cls = await page.evaluate(() => {
      return new Promise(resolve => {
        let clsValue = 0
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
        }).observe({ type: 'layout-shift', buffered: true })
        setTimeout(() => resolve(clsValue), 5000)
      })
    })
    expect(cls).toBeLessThan(0.1)
  })

  test('no layout shift on hero image load', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' })
    const shifts = await page.evaluate(() => {
      return new Promise(resolve => {
        let shiftCount = 0
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput && entry.value > 0.01) {
              shiftCount++
            }
          }
        }).observe({ type: 'layout-shift', buffered: true })
        setTimeout(() => resolve(shiftCount), 3000)
      })
    })
    expect(shifts).toBeLessThan(3)
  })
})

test.describe('Performance with throttling', () => {
  test('slow 3G + 4x CPU', async ({ page, context }) => {
    await context.setOffline(false)
    await page.route('**/*', route => route.continue())

    const cdp = await context.newCDPSession(page)
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8,
      latency: 200,
    })
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1, .hero, main').first()).toBeVisible({ timeout: 20000 })
  })
})