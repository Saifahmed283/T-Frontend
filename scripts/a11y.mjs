import { readFileSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import puppeteer from "puppeteer-core"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const BASE =
  process.argv[2] ?? process.env.A11Y_BASE_URL ?? "http://localhost:8443"

const AXE_SRC = readFileSync(
  resolve(root, "node_modules/axe-core/axe.min.js"),
  "utf8",
)

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean)

const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p))
if (!executablePath) {
  console.error(
    "No Chrome/Edge binary found. Set CHROME_PATH to a Chromium executable.",
  )
  process.exit(2)
}

const scenarios = [
  {
    name: "home",
    path: "/",
    steps: [
      {
        name: "home (base)",
        action: async (page) => {
          await page.evaluate(() => {
            const b = [...document.querySelectorAll("button")].find((x) =>
              /skip intro/i.test(x.textContent || ""),
            )
            if (b) b.click()
          })
          await page
            .waitForFunction(
              () => !/skip intro/i.test(document.body.innerText),
              { timeout: 5000 },
            )
            .catch(() => {})
          await sleep(400)
        },
      },
      {
        name: "home (search overlay open)",
        action: async (page) => {
          await page.click('button[aria-label="Search (Ctrl K)"]')
          await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
        },
      },
      {
        name: "home (WhatsNew drawer open)",
        action: async (page) => {
          await page.keyboard.press("Escape")
          await sleep(200)
          await page.click('#new button[aria-hidden="false"]')
          await sleep(400)
        },
      },
    ],
  },
  {
    name: "dashboard",
    path: "/dashboard",
    steps: [{ name: "dashboard (signed out — auth gate)" }],
  },
  {
    name: "dashboard-live",
    path: "/dashboard",
    steps: [
      {
        name: "dashboard (live, signed in)",
        action: async (page) => {
          const res = await page.evaluate(async () => {
            const r = await fetch("/api/v1/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                email: "mbaraka@askterramorph.com",
                password: "MB@terramorph2026",
              }),
            })
            return r.status
          })
          if (res === 429) {
            console.warn(
              "  ! login rate-limited (429); scanning auth gate instead",
            )
            return
          }
          if (res !== 200) throw new Error(`login failed (${res})`)
          await page.reload({ waitUntil: "networkidle0" })
          await sleep(600)
        },
      },
    ],
  },
  {
    name: "hub",
    path: "/hub/governments",
    steps: [{ name: "hub (governments)" }],
  },
  {
    name: "not-found",
    path: "/no-such-page",
    steps: [{ name: "404" }],
  },
]

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
})

let totalSerious = 0
let totalAll = 0

try {
  for (const scenario of scenarios) {
    const page = await browser.newPage()
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ])
    await page.setViewport({ width: 1280, height: 900 })
    await page.goto(`${BASE}${scenario.path}`, { waitUntil: "networkidle0" })
    await sleep(400)

    for (const step of scenario.steps) {
      if (step.action) {
        try {
          await step.action(page)
        } catch (err) {
          console.warn(`  ! step "${step.name}" skipped: ${err.message}`)
          continue
        }
      }
      await page.evaluate(AXE_SRC)
      const results = await page.evaluate(async (tags) => {
        return await window.axe.run(document, {
          runOnly: { type: "tag", values: tags },
        })
      }, wcagTags)

      const { violations } = results
      totalAll += violations.length
      const serious = violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      ).length
      totalSerious += serious

      if (violations.length === 0) {
        console.log(`\n[${step.name}] PASS - no violations`)
        continue
      }

      console.log(`\n[${step.name}] ${violations.length} violation rule(s)`)
      for (const v of violations) {
        console.log(`  - ${v.id} (${v.impact}) x${v.nodes.length} :: ${v.help}`)
        for (const node of v.nodes.slice(
          0,
          v.id === "color-contrast" ? 30 : 3,
        )) {
          console.log(`      ${node.target.join(" ")}`)
          console.log(
            `        html: ${(node.html || "").replace(/\s+/g, " ").slice(0, 200)}`,
          )
          if (v.id === "color-contrast") {
            const detail = (node.failureSummary || "")
              .split("\n")
              .slice(1)
              .join(" ")
              .replace(/\s+/g, " ")
              .trim()
            if (detail) console.log(`        ${detail}`)
          }
        }
      }
    }
    await page.close()
  }
} finally {
  await browser.close()
}

console.log(
  `\n=== ${totalAll} violation rule(s) total, ${totalSerious} serious/critical ===`,
)
process.exit(totalSerious > 0 ? 1 : 0)
