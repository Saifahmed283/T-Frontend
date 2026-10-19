import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })

const measure = async (page) => page.evaluate(() => {
  const h1 = document.querySelector("h1")
  const r = h1.getBoundingClientRect()
  const para = document.querySelector("h1")?.parentElement?.querySelector("p.mt-8")
  const pr = para ? para.getBoundingClientRect() : null
  return { h1: [Math.round(r.width), Math.round(r.height)], para: pr ? [Math.round(pr.width), Math.round(pr.height)] : null,
           fontUsed: getComputedStyle(h1).fontFamily.slice(0,60) }
})

// A: webfonts blocked (fallback rendering only)
const pageA = await b.newPage()
await pageA.setViewport({ width: 1300, height: 900 })
await pageA.evaluateOnNewDocument(() => { try { sessionStorage.setItem("tm-intro","1") } catch {} })
await pageA.setRequestInterception(true)
pageA.on("request", (r) => { if (r.url().includes("/fonts/") && r.url().endsWith(".woff2")) r.abort(); else r.continue() })
await pageA.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
const A = await measure(pageA)

// B: normal (real fonts)
const pageB = await b.newPage()
await pageB.setViewport({ width: 1300, height: 900 })
await pageB.evaluateOnNewDocument(() => { try { sessionStorage.setItem("tm-intro","1") } catch {} })
await pageB.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
await new Promise(r=>setTimeout(r,1500))
const B = await measure(pageB)

console.log("fallback-only:", JSON.stringify(A))
console.log("real fonts  :", JSON.stringify(B))
console.log("h1 match:", A.h1[0]===B.h1[0] && A.h1[1]===B.h1[1] ? "EXACT" : "DIFFERENT")
await b.close()
