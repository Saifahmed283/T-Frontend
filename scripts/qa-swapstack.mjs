import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.setRequestInterception(true)
page.on("request", (req) => {
  if (req.url().includes("/fonts/") && req.url().endsWith(".woff2")) return req.abort()
  req.continue()
})
await page.setViewport({ width: 1300, height: 900 })
await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
await new Promise(r=>setTimeout(r,1000))
const r = await page.evaluate(() => {
  const cw = (family, text, size) => {
    const c = document.createElement("canvas").getContext("2d")
    c.font = `500 ${size}px ${family}`
    return Math.round(c.measureText(text).width*10)/10
  }
  const h1 = document.querySelector("h1")
  const rect = h1.getBoundingClientRect()
  const mk = (fam) => {
    const d = document.createElement("div")
    d.style.cssText = `position:absolute;left:-9999px;font-family:${fam};font-weight:500;font-size:96.2px;line-height:.95;letter-spacing:-0.02em`
    d.textContent = "We reshape the ground on which economies stand."
    document.body.appendChild(d)
    const w = Math.round(d.getBoundingClientRect().width*10)/10
    d.remove()
    return w
  }
  return {
    h1: { w: Math.round(rect.width), h: Math.round(rect.height) },
    cormorantAvailable: document.fonts.check('500 16px "Cormorant Garamond"'),
    stack_current: mk('"Cormorant Garamond", "Noto Naskh Arabic", serif'),
    stack_with_times: mk('"Cormorant Garamond", "Times New Roman", serif'),
    explicit_times: mk('"Times New Roman"'),
    explicit_serif: mk("serif"),
    explicit_noto: mk('"Noto Naskh Arabic"'),
    line1: {
      cormorant: cw('"Cormorant Garamond"', "We reshape the ground", 96.2),
      times: cw('"Times New Roman"', "We reshape the ground", 96.2),
      serif: cw("serif", "We reshape the ground", 96.2),
    },
  }
})
console.log(JSON.stringify(r, null, 1))
await b.close()
