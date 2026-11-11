import { defineConfig, devices } from "@playwright/test"

/* Dedicated config for the cookie-consent suite. The main config depends on the
   `setup` project (admin login against the backend); consent tests are public
   and should run without it. */
export default defineConfig({
  testDir: "./tests",
  testMatch: /cookie-consent\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8443",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:8443",
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
})
