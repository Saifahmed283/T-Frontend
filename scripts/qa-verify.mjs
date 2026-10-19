/* QA verification: route variants, counters (normal + reduced motion), dashboard.
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

// ---- route variants --------------------------------------------------------
async function routeVariants(browser) {
  const page = await browser.newPage()
  const variants = [
    "/about/contact",
    "/about/contact/",
    "/About/Contact",
    "/about/contact-offices",
    "/method/ldia",
    "/method/ldia/",
    "/method/ldia-architecture",
  ]
  console.log("=== route variants ===")
  for (const v of variants) {
    const res = await page.goto(BASE + v, { waitUntil: "domcontentloaded", timeout: 20000 })
    const body = await page.evaluate(() => document.body.innerText)
    const notFound = /not found|not in the register/i.test(body)
    console.log(
      `${String(res.status()).padEnd(4)} ${v.padEnd(28)} notFound=${notFound ? "YES" : "no "}  len=${body.length}`,
    )
  }
  await page.close()
}

// ---- counters --------------------------------------------------------------
async function counters(browser, reduced) {
  const page = await browser.newPage()
  if (reduced) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }])
  await page.goto(BASE + "/", { waitUntil: "networkidle0", timeout: 40000 })
  // dismiss intro if present
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /skip intro/i.test(x.textContent || ""))
    if (b) b.click()
  })
  await sleep(reduced ? 1200 : 4200)
  const vals = await page.evaluate(() => {
    const out = {}
    for (const a of document.querySelectorAll('a[href^="/"]')) {
      const t = a.textContent || ""
      const m = t.match(/(\d+)\s*(Dated assignments|Publications|learning programmes|vetted roster)/i)
      if (m) out[m[2]] = m[1]
    }
    return out
  })
  console.log(`=== counters (reduced=${reduced}) ===`, JSON.stringify(vals))
  await page.close()
  return vals
}

// ---- goldline visibility under reduced motion ------------------------------
async function goldline(browser) {
  const page = await browser.newPage()
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }])
  await page.goto(BASE + "/", { waitUntil: "networkidle0", timeout: 40000 })
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /skip intro/i.test(x.textContent || ""))
    if (b) b.click()
  })
  await sleep(1000)
  const info = await page.evaluate(() => {
    const rules = [...document.querySelectorAll(".gold-rule")]
    return rules.slice(0, 4).map((r) => {
      const cs = getComputedStyle(r)
      return { transform: cs.transform, opacity: cs.opacity, w: r.getBoundingClientRect().width }
    })
  })
  console.log("=== gold-rule under reduced motion ===", JSON.stringify(info))
  await page.close()
}

// ---- dashboard -------------------------------------------------------------
async function dashboard(browser) {
  const page = await browser.newPage()
  const errors = []
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()) })
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message))
  const res = await page.goto(BASE + "/dashboard/", { waitUntil: "networkidle0", timeout: 40000 })
  await sleep(2500)
  const text = await page.evaluate(() => document.body.innerText)
  const hasSignIn = /sign in|log in|password|email/i.test(text)
  console.log("=== /dashboard ===")
  console.log("  status:", res.status())
  console.log("  visible text length:", text.length)
  console.log("  shows auth gate (sign-in):", hasSignIn)
  console.log("  first 200 chars:", JSON.stringify(text.slice(0, 200)))
  console.log("  console errors:", errors.length ? errors.slice(0, 5) : "none")
  await page.close()
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] })
try {
  await routeVariants(browser)
  const norm = await counters(browser, false)
  const red = await counters(browser, true)
  await goldline(browser)
  await dashboard(browser)
  console.log("\n=== ACCEPTANCE ===")
  console.log("normal-motion counters match sources (8/6/4):", norm["Dated assignments"] === "8" && norm["Publications"] === "6" && norm["learning programmes"] === "4")
  console.log("reduced-motion counters match sources:", red["Dated assignments"] === "8" && red["Publications"] === "6" && red["learning programmes"] === "4")
} finally {
  await browser.close()
}
