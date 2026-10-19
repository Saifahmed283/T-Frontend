import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })

async function measure(label, skipIntro) {
  const page = await b.newPage()
  await page.setViewport({ width: 1350, height: 940 })
  await page.evaluateOnNewDocument((skip) => {
    if (skip) try { sessionStorage.setItem("tm-intro","1") } catch {}
    window.__cls = []
    window.__sh = []
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (e.hadRecentInput) continue
        window.__cls.push(e.value)
        if (e.value >= 0.005) window.__sh.push({
          v: +e.value.toFixed(4), t: Math.round(e.startTime),
          s: (e.sources||[]).map(x => {
            const n = x.node
            const name = n ? (n.nodeName + (n.id?"#"+n.id:"") + (typeof n.className==="string"&&n.className?"."+n.className.trim().split(/\s+/).slice(0,4).join("."):"")) : "?"
            return { n: name, p: x.previousRect?[Math.round(x.previousRect.x),Math.round(x.previousRect.y),Math.round(x.previousRect.width),Math.round(x.previousRect.height)]:null, c: x.currentRect?[Math.round(x.currentRect.x),Math.round(x.currentRect.y),Math.round(x.currentRect.width),Math.round(x.currentRect.height)]:null }
          })
        })
      }
    }).observe({ type:"layout-shift", buffered:true })
  }, skipIntro)

  await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
  await new Promise(r=>setTimeout(r,6500))
  for (let i=0;i<35;i++){ await page.evaluate(()=>window.scrollBy(0,650)); await new Promise(r=>setTimeout(r,300)) }
  await new Promise(r=>setTimeout(r,2000))
  const r = await page.evaluate(()=>({ total: window.__cls.reduce((a,x)=>a+x,0), n: window.__cls.length, sh: window.__sh }))
  console.log(`\n### ${label}: CLS=${r.total.toFixed(4)} over ${r.n} entries`)
  const byv = r.sh.sort((a,b)=>b.v-a.v).slice(0,8)
  for (const s of byv) console.log(`   ${s.v} t=${s.t}ms`, JSON.stringify(s.s.slice(0,2)))
  await page.close()
}

await measure("INTRO SHOWS (as a first-time visitor)", false)
await measure("INTRO SKIPPED (returning visitor)", true)
await b.close()
