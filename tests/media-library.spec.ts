import { test, expect, type Page } from '@playwright/test'

test.use({ storageState: 'tests/.auth/admin.json' })

const ASSETS_PATH = '/api/v1/assets'

// A real 1×1 PNG so the request would succeed if storage were configured.
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

async function gotoMedia(page: Page) {
  // Workspace reads `window.location.hash` without a leading slash.
  await page.goto('/dashboard#media')
  // The panel's h2 heading is unique; the workspace shell also renders an h1.
  await expect(
    page.locator('h2:has-text("Media library")'),
  ).toBeVisible({ timeout: 15000 })
  // The assets request fires on mount; wait briefly for it to settle.
  await page.waitForTimeout(500)
}

test.describe('Media library', () => {
  test('reflects whether media storage is configured', async ({ page }) => {
    await gotoMedia(page)

    const upload = page.getByRole('button', { name: 'Upload', exact: true })
    const warning = page
      .getByRole('alert')
      .filter({ hasText: 'Media storage not configured' })

    // In this environment storage is NOT configured (no S3 credentials).
    // The warning banner appears and the Upload button is disabled.
    await expect(warning).toBeVisible()
    await expect(warning).toContainText('uploads stay disabled')
    await expect(upload).toBeDisabled()

    // Either the empty state or the asset grid must render.
    await expect(
      page.getByText('No files yet').or(page.locator('ul.media-grid')),
    ).toBeVisible()
  })

  test('rejects a disallowed file type before uploading', async ({ page }) => {
    await gotoMedia(page)

    let uploadPosts = 0
    page.on('request', (request) => {
      if (
        request.method() === 'POST' &&
        new URL(request.url()).pathname === ASSETS_PATH
      ) {
        uploadPosts += 1
      }
    })

    await page.locator('input[type="file"]').setInputFiles({
      name: 'payload.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('MZ'),
    })

    await expect(
      page
        .locator('.toast-error')
        .filter({ hasText: 'application/x-msdownload is not allowed' }),
    ).toBeVisible()
    expect(uploadPosts).toBe(0)
  })

  test('rejects a file larger than the 15 MB limit before uploading', async ({
    page,
  }) => {
    await gotoMedia(page)

    let uploadPosts = 0
    page.on('request', (request) => {
      if (
        request.method() === 'POST' &&
        new URL(request.url()).pathname === ASSETS_PATH
      ) {
        uploadPosts += 1
      }
    })

    await page.locator('input[type="file"]').setInputFiles({
      name: 'huge.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(15 * 1024 * 1024 + 1),
    })

    await expect(
      page
        .locator('.toast-error')
        .filter({ hasText: /exceeds the 15 MB limit/ }),
    ).toBeVisible()
    expect(uploadPosts).toBe(0)
  })

  test('surfaces the server error when storage is unavailable', async ({
    page,
  }) => {
    await gotoMedia(page)

    const posted = page.waitForResponse((response) => {
      if (response.request().method() !== 'POST') return false
      return new URL(response.url()).pathname === ASSETS_PATH
    })

    await page.locator('input[type="file"]').setInputFiles({
      name: 'pixel.png',
      mimeType: 'image/png',
      buffer: TINY_PNG,
    })

    const response = await posted
    expect(response.status()).toBe(503)
    expect((await response.json()).error.code).toBe('STORAGE_NOT_CONFIGURED')

    await expect(
      page
        .locator('.toast-error')
        .filter({ hasText: /storage isn't configured/i }),
    ).toBeVisible()
  })
})
