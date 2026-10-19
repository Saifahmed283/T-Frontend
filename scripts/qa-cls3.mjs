import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.setViewport({ width: 1300, height: 900 })
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("tm-intro","1") } catch {} })
await page.evaluateOnNewDocument(() => {
  window.__cls = []
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue
      if (typeof e.value === "number") window.__cls.push({v:e.value, t:Math.round(e.startTime)})
    }
  }).observe({type:"layout-shift", buffered:true})
})
await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
await new Promise(r=>setTimeout(r,6500))
for (let i=0;i<35;i++){ await page.evaluate(()=>window.scrollBy(0,650)); await new Promise(r=>setTimeout(r,300)) }
await new Promise(r=>setTimeout(r,2000))
const r = await page.evaluate(()=>({ total: window.__cls.reduce((a,x)=>a+(x.v||0),0), n: window.__cls.length }))
console.log("CLS:", Number(r.total||0).toFixed(4), "over", r.n, "entries")
await b.close()



