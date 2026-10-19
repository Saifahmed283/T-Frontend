import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.setViewport({ width: 320, height: 800 })
await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
const out = await page.evaluate(() => {
  const cw = document.documentElement.clientWidth
  const bad = []
  for (const el of document.querySelectorAll("*")) {
    const r = el.getBoundingClientRect()
    if (r.right > cw + 1 && r.width > 0 && r.height > 0) {
      bad.push({ tag: el.tagName.toLowerCase(), cls: (typeof el.className === "string" ? el.className : "").slice(0,90), right: Math.round(r.right), w: Math.round(r.width) })
    }
  }
  return { cw, scrollW: document.documentElement.scrollWidth, count: bad.length, worst: bad.slice(0, 14) }
})
console.log(JSON.stringify(out, null, 1))
await b.close()
