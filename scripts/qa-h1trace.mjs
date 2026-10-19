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
  const t0 = performance.now()
  const iv = setInterval(() => {
    const h1 = document.querySelector("h1")
    if (h1) {
      const r = h1.getBoundingClientRect()
      const key = Math.round(r.width)+"x"+Math.round(r.height)
      if (window.__lastH1 !== key) {
        if (window.__lastH1) log("h1-size", window.__lastH1+" -> "+key)
        window.__lastH1 = key
      }
    }
    if (document.querySelector("#__vpn")) {} // noop
  }, 16)
  window.addEventListener("load", () => { log("load","") })
  document.addEventListener("DOMContentLoaded", () => log("domcontentloaded",""))
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      const t = m.target.nodeType===1 ? m.target : m.target.parentElement
      if (!t) continue
      const h1 = t.closest ? t.closest("h1") : null
      if (h1) log("h1-mutation", m.type+" "+(m.attributeName||"")+" -> "+(h1.textContent||"").slice(0,40))
      else if (m.type==="characterData" || m.type==="childList") log("mutation", m.type+" on "+(t.nodeName||"")+"."+(typeof t.className==="string"?t.className.slice(0,50):""))
    }
  })
  mo.observe(document.documentElement, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:["class","style"]})
  document.fonts.ready.then(() => log("fonts-ready",""))
  document.fonts.addEventListener("loadingdone", (e) => log("fonts-loadingdone", (e.fontfaces||[]).map(f=>f.family).join(",")))
  window.addEventListener("load", () => setTimeout(()=>{clearInterval(iv); clearInterval(window.__iv2)}, 6000))
})
await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
await new Promise(r=>setTimeout(r,7000))
const ev = await page.evaluate(()=>window.__ev)
for (const e of ev.slice(0,80)) console.log(e.t, e.n, e.d)
console.log("total events:", ev.length)
await b.close()
