import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })

for (const seed of [false, true]) {
  const page = await b.newPage()
  await page.setViewport({ width: 320, height: 800 })
  if (seed) await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("tm-intro","1") } catch {} })
  await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
  await new Promise(r=>setTimeout(r, 2500))
  const out = await page.evaluate(() => {
    const cw = document.documentElement.clientWidth
    const clipped = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { const s = getComputedStyle(p); if (s.overflowX !== "visible" || s.overflow !== "visible") return true } return false }
    const hits = []
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect()
      if (r.right > cw + 1 && r.width > 0 && !clipped(el)) {
        hits.push({ tag: el.tagName.toLowerCase(), cls: (typeof el.className === "string" ? el.className : "").slice(0,70), right: Math.round(r.right) })
      }
    }
    hits.sort((a,b) => b.right - a.right)
    return { scrollW: document.documentElement.scrollWidth, unclippedOverflows: hits.length, top: hits.slice(0,10) }
  })
  console.log((seed ? "INTRO SKIPPED" : "INTRO SHOWN ") + " | scrollW=" + out.scrollW + " unclipped=" + out.unclippedOverflows)
  for (const h of out.top) console.log("   ", h.right, h.tag, h.cls)
  await page.close()
}
await b.close()
