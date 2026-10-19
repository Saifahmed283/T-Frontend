import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.setViewport({ width: 1300, height: 900 })
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("tm-intro","1") } catch {} })
await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
await new Promise(r=>setTimeout(r,3000))
const info = await page.evaluate(() => {
  const paints = performance.getEntriesByType("paint").map(p=>({n:p.name, t:Math.round(p.startTime)}))
  const fonts = performance.getEntriesByType("resource").filter(r=>r.name.includes("/fonts/"))
    .map(r=>({f:r.name.split("/").pop(), start:Math.round(r.startTime), end:Math.round(r.responseEnd)}))
  const h1 = document.querySelector("h1")
  const cs = h1 ? getComputedStyle(h1) : null
  const rect = h1 ? h1.getBoundingClientRect() : null
  return { paints, fonts, h1: h1?{height:Math.round(rect.height), family:cs.fontFamily.slice(0,80), weight:cs.fontWeight}:null,
    cormorantReady: document.fonts.check('400 16px "Cormorant Garamond"'),
    jostReady: document.fonts.check('400 16px "Jost"') }
})
console.log(JSON.stringify(info, null, 1))
await b.close()
