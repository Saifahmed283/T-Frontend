import { existsSync } from "node:fs"
import puppeteer from "puppeteer-core"

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean)
const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p))

const BASE = process.argv[2] ?? "http://localhost:8443"
const ROUTES = [
  "/",
  "/evidence",
  "/evidence/assignment-ledger",
  "/hub/governments",
  "/dashboard",
  "/no-such-page",
]

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu"],
})
let failures = 0
for (const route of ROUTES) {
  const page = await browser.newPage()
  const errors = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("pageerror", (err) => errors.push(String(err)))
  await page.goto(BASE + route, { waitUntil: "networkidle2", timeout: 30000 })
  await new Promise((r) => setTimeout(r, 1500))
  const title = await page.title()
  // Filter benign network errors (backend not running in preview)
  const real = errors.filter(
    (e) =>
      !/Failed to load resource|net::ERR|401|403|404 \(Not Found\)|api\//i.test(
        e,
      ),
  )
  const status = real.length === 0 ? "OK" : `FAIL (${real.length})`
  if (real.length) failures++
  console.log(`${status} ${route} — "${title}"`)
  for (const e of real.slice(0, 5)) console.log(`   ${e.slice(0, 200)}`)
  await page.close()
}
await browser.close()
process.exit(failures ? 1 : 0)
