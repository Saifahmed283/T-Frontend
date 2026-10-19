import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.evaluateOnNewDocument(() => {
  window.__cls = []
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue
      window.__cls.push({
        value: e.value,
        time: Math.round(e.startTime),
        sources: (e.sources||[]).map(s => ({
          node: s.node ? (s.node.tagName + (s.node.className && typeof s.node.className==="string" ? "."+s.node.className.split(" ").slice(0,3).join(".") : "") + (s.node.id?"#"+s.node.id:"")) : "?",
          prev: s.previousRect ? [Math.round(s.previousRect.x),Math.round(s.previousRect.y),Math.round(s.previousRect.width),Math.round(s.previousRect.height)] : null,
          cur: s.currentRect ? [Math.round(s.currentRect.x),Math.round(s.currentRect.y),Math.round(s.currentRect.width),Math.round(s.currentRect.height)] : null,
        })),
      })
    }
  }).observe({ type: "layout-shift", buffered: true })
})
await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
await new Promise(r=>setTimeout(r,6000))          // through the intro
const step = async () => { await page.evaluate(()=>window.scrollBy(0, 600)); await new Promise(r=>setTimeout(r,350)) }
for (let i=0;i<30;i++) await step()
await new Promise(r=>setTimeout(r,1500))
const res = await page.evaluate(()=>{
  const total = window.__cls.reduce((a,e)=>a+e.value,0)
  const byNode = {}
  for (const e of window.__cls) for (const s of e.sources) {
    const k = s.node
    byNode[k] = byNode[k] || { v:0, n:0, sample:null }
    byNode[k].v += e.value; byNode[k].n++
    if (!byNode[k].sample) byNode[k].sample = { time:e.time, prev:s.prev, cur:s.cur }
  }
  return { total, count: window.__cls.length, top: Object.entries(byNode).sort((a,b)=>b[1].v-a[1].v).slice(0,12), raw: window.__cls.slice(0,4) }
})
console.log("TOTAL CLS:", res.total.toFixed(4), "entries:", res.count)
console.log("--- by element (attributed value) ---")
for (const [k,v] of res.top) console.log("  ", v.v.toFixed(4), "x"+v.n, k, JSON.stringify(v.sample))
console.log("--- first entries ---")
for (const e of res.raw) console.log("  t="+e.time, e.value.toFixed(4), JSON.stringify(e.sources.slice(0,2)))
await b.close()
