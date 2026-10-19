import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.setViewport({ width: 1300, height: 900 })
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("tm-intro","1") } catch {} })
await page.evaluateOnNewDocument(() => {
  window.__sh = []
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput || typeof e.value !== "number") continue
      window.__sh.push({v:e.value, t:Math.round(e.startTime),
        s:(e.sources||[]).map(x=>({n:x.node?(x.node.nodeName+(x.node.id?"#"+x.node.id:"")+(typeof x.node.className==="string"&&x.node.className?"."+x.node.className.trim().split(/\s+/).slice(0,5).join("."):"")):"?", p:x.previousRect?[Math.round(x.previousRect.x),Math.round(x.previousRect.y),Math.round(x.previousRect.width),Math.round(x.previousRect.height)]:null, c:x.currentRect?[Math.round(x.currentRect.x),Math.round(x.currentRect.y),Math.round(x.currentRect.width),Math.round(x.currentRect.height)]:null}))
      })
    }
  }).observe({type:"layout-shift", buffered:true})
})
await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
await new Promise(r=>setTimeout(r,7000))
const r = await page.evaluate(()=>window.__sh)
console.log(JSON.stringify(r, null, 1))
await b.close()
