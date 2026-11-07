import { test, expect } from '@playwright/test';

test.describe('Legal pages', () => {
  const urls = [
    { path: '/legal', title: 'Legal & Compliance' },
    { path: '/legal/privacy-policy', title: 'Privacy Policy' },
    { path: '/legal/terms-of-service', title: 'Terms of Service' },
    { path: '/legal/cookie-policy', title: 'Cookie Policy' },
  ];

  for (const { path, title } of urls) {
    test(`${path} loads and shows correct title`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'networkidle', timeout: 30000 });
      expect(response.status()).toBe(200);
      // Wait for client-side rendering to complete by waiting for main content to be attached
      await page.waitForSelector('main[id="main"]', { timeout: 15000, state: 'attached' });
      // Now check the title (client-side rendering should have updated it)
      await expect(page).toHaveTitle(new RegExp(title), { timeout: 15000 });
    });
  }
});