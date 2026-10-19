import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.setViewport({ width: 320, height: 800 })
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("tm-intro","1") } catch {} })
await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
await new Promise(r=>setTimeout(r,2500))
const out = await page.evaluate(() => {
  const cw = document.documentElement.clientWidth
  const span = [...document.querySelectorAll("span.inline-block.overflow-hidden")].find(el => el.getBoundingClientRect().right > 500)
  if (!span) return { err: "no span" }
  const chain = []
  for (let el = span; el && el !== document.documentElement; el = el.parentElement) {
    const r = el.getBoundingClientRect(); const s = getComputedStyle(el)
    chain.push({ tag: el.tagName.toLowerCase(), cls: (typeof el.className === "string" ? el.className : "").slice(0,80),
      w: Math.round(r.width), right: Math.round(r.right), ws: s.whiteSpace, disp: s.display, ff: s.fontFamily.slice(0,45), fs: s.fontSize })
  }
  return { cw, scrollW: document.documentElement.scrollWidth, text: span.textContent.slice(0,60), chain }
})
console.log(JSON.stringify(out, null, 1))
await b.close()
