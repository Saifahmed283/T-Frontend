/* QA verification round 2: CV wizard (007), mailing-list opt-in (009),
   dashboard auth gate + notice (005), detail-page routes (001).
   Read-only probe against a running preview. */
import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"

const BASE = process.argv[2] ?? "http://localhost:8443"
const CHROME = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean).find((p) => existsSync(p))

if (!CHROME) {
  console.error("no chrome/edge found")
  process.exit(2)
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function routes(browser) {
  const page = await browser.newPage()
  console.log("=== detail-page routes (001) ===")
  for (const v of ["/about/contact", "/method/ldia"]) {
    const res = await page.goto(BASE + v, { waitUntil: "domcontentloaded", timeout: 20000 })
    const body = await page.evaluate(() => document.body.innerText)
    console.log(`${String(res.status()).padEnd(4)} ${v.padEnd(18)} notFound=${/not found/i.test(body)} len=${body.length}`)
  }
  await page.close()
}

async function mailingLists(browser) {
  const page = await browser.newPage()
  await page.goto(BASE + "/", { waitUntil: "networkidle0", timeout: 40000 })
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /skip intro/i.test(x.textContent || ""))
    if (b) b.click()
  })
  await sleep(3500)
  const pressed = await page.evaluate(() =>
    [...document.querySelectorAll('button[aria-pressed]')]
      .filter((b) => /briefs|digest|investment|toolkit|opportunities|موجزات|نشرة|الأعمال|حِزم|فرص/i.test(b.textContent || ""))
      .map((b) => ({ label: (b.textContent || "").replace(/^\s*[✓+]\s*/, "").trim(), pressed: b.getAttribute("aria-pressed") })),
  )
  const anyOn = pressed.some((p) => p.pressed === "true")
  console.log("=== mailing-list opt-in defaults (009) ===")
  console.log("  list buttons:", pressed.length)
  console.log("  any pre-selected (should be none):", anyOn)
  console.log("  detail:", JSON.stringify(pressed.slice(0, 3)))
  await page.close()
}

async function cvWizard(browser) {
  const page = await browser.newPage()
  await page.goto(BASE + "/", { waitUntil: "networkidle0", timeout: 40000 })
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /skip intro/i.test(x.textContent || ""))
    if (b) b.click()
  })
  await sleep(3500)
  // ensure the Expert network tab is active
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /expert network|شبكة الخبراء/i.test(x.textContent || ""))
    if (b) b.click()
  })
  await sleep(600)
  // advance the wizard to step 2 (CV): Continue, Continue
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) => /continue|متابعة/i.test(x.textContent || ""))
      if (b) b.click()
    })
    await sleep(400)
  }
  const fileInput = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input[type="file"]')]
    return inputs.map((i) => ({
      accept: i.getAttribute("accept"),
      srOnly: i.className.includes("sr-only"),
    }))
  })
  const helper = await page.evaluate(() => {
    const p = [...document.querySelectorAll("p")].find((x) => /requested securely|يُطلب بأمان/i.test(x.textContent || ""))
    return p ? p.textContent.trim() : null
  })
  console.log("=== expert wizard CV input (007) ===")
  console.log("  file inputs:", JSON.stringify(fileInput))
  console.log("  truthful helper present:", helper)
  await page.close()
}

async function dashboard(browser) {
  const page = await browser.newPage()
  const res = await page.goto(BASE + "/dashboard/", { waitUntil: "networkidle0", timeout: 40000 })
  await sleep(3000)
  const info = await page.evaluate(() => {
    const t = document.body.innerText
    const notice = document.querySelector('[role="status"]')
    return {
      signIn: /sign in|log in|password|email/i.test(t),
      notice: notice ? notice.textContent.trim().slice(0, 120) : null,
      hasShellNav: /MANAGEMENT|Overview|Activity/i.test(t),
    }
  })
  console.log("=== /dashboard auth gate (005) ===")
  console.log("  status:", res.status())
  console.log("  shows sign-in gate:", info.signIn)
  console.log("  shows dashboard shell (should be false):", info.hasShellNav)
  console.log("  probe notice:", info.notice)
  await page.close()
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] })
try {
  await routes(browser)
  await mailingLists(browser)
  await cvWizard(browser)
  await dashboard(browser)
} finally {
  await browser.close()
}
