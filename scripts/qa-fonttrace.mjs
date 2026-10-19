import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.setViewport({ width: 1300, height: 900 })
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("tm-intro","1") } catch {} })
await page.evaluateOnNewDocument(() => {
  window.__ev = []
  const log = (n,d) => window.__ev.push({t:Math.round(performance.now()), n, d})
  window.__log = log
  document.fonts.addEventListener("loadingdone", (e) =>
    log("fonts-loadingdone", (e.fontfaces||[]).map(f=>f.family+" "+f.display).join(" | ")))
  let iv
  const tick = () => {
    const h1 = document.querySelector("h1")
    if (h1) {
      const r = h1.getBoundingClientRect()
      const key = Math.round(r.width)+"x"+Math.round(r.height)
      const corm = document.fonts.check('500 100px "Cormorant Garamond"')
      const k2 = key+"|font:"+(corm?"ready":"not")
      if (window.__last !== k2) { if (window.__last) log("h1", window.__last+" -> "+k2); window.__last = k2 }
    }
  }
  iv = setInterval(tick, 10)
  setTimeout(()=>clearInterval(iv), 8000)
})
await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
await new Promise(r=>setTimeout(r,8000))
const ev = await page.evaluate(()=>window.__ev)
for (const e of ev) console.log(e.t, e.n, "|", e.d)
await b.close()
