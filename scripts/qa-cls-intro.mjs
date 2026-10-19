import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.setViewport({ width: 1300, height: 900 })
await page.evaluateOnNewDocument(() => {
  window.__cls = []
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput && typeof e.value === "number")
      window.__cls.push({v:+e.value.toFixed(4), t:Math.round(e.startTime),
        s:(e.sources||[]).slice(0,3).map(x=>x.node?(x.node.nodeName+(typeof x.node.className==="string"&&x.node.className?"."+x.node.className.trim().split(/\s+/).slice(0,4).join("."):"")):"?")})
  }).observe({type:"layout-shift", buffered:true})
})
await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
await new Promise(r=>setTimeout(r,6500)) // let intro play out fully
for (let i=0;i<35;i++){ await page.evaluate(()=>window.scrollBy(0,650)); await new Promise(r=>setTimeout(r,300)) }
await new Promise(r=>setTimeout(r,2000))
const r = await page.evaluate(()=>({ total: window.__cls.reduce((a,x)=>a+x.v,0), n: window.__cls.length, entries: window.__cls.slice(0,8) }))
console.log("INTRO SHOWN + full scroll  CLS:", r.total.toFixed(4), "over", r.n, "entries")
for (const e of r.entries) console.log(" ", e.t+"ms", e.v, e.s.join(" | "))
await b.close()
