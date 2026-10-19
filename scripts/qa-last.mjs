import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.goto("http://localhost:8443/", { waitUntil:"domcontentloaded" })
const r = await page.evaluate(async () => {
  await document.fonts.ready
  const c = document.createElement("canvas").getContext("2d")
  const w = (fam, style, wt, text, size) => { c.font = `${style} ${wt} ${size}px ${fam}`; return Math.round(c.measureText(text).width*10)/10 }
  const IT = "economies stand."
  const out = {}
  for (const wt of [600,700]) {
    out["corm-it-"+wt] = w('"Cormorant Garamond"',"italic",wt,IT,96.2)
    out["times-it-"+wt] = w('"Times New Roman"',"italic",wt,IT,96.2)
  }
  // ascent/descent of all four pairs (canvas)
  const ad = (fam, style, wt) => { c.font = `${style} ${wt} 100px ${fam}`; const m = c.measureText("Hxg"); return [m.fontBoundingBoxAscent, m.fontBoundingBoxDescent] }
  out.ad_cormorant = ad('"Cormorant Garamond"',"normal",500)
  out.ad_cormorant_it = ad('"Cormorant Garamond"',"italic",500)
  out.ad_jost = ad('"Jost"',"normal",400)
  out.ad_jbmono = ad('"JetBrains Mono"',"normal",400)
  return out
})
console.log(JSON.stringify(r, null, 1))
await b.close()
