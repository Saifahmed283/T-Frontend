import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.goto("http://localhost:8443/", { waitUntil:"domcontentloaded" })
const r = await page.evaluate(async () => {
  await document.fonts.ready
  const c = document.createElement("canvas").getContext("2d")
  const S1 = "We reshape the ground"          // h1 line 1
  const S2 = "on which economies stand."      // h1 line 2 (mixed roman+italic)
  const SJ = "Advisory for governments, institutions and social enterprises" // para
  const SE = "Strategy · Policy · Transformation"
  const w = (fam, style, wt, text, size) => { c.font = `${style} ${wt} ${size}px ${fam}`; return c.measureText(text).width }
  const out = {}
  for (const wt of [300,400,500,600,700]) {
    out["cormorant-"+wt] = { s1: +w('"Cormorant Garamond"',"normal",wt,S1,96.2).toFixed(1), sj: +w('"Cormorant Garamond"',"normal",wt,SJ,17).toFixed(1) }
    out["times-"+wt]     = { s1: +w('"Times New Roman"',"normal",wt,S1,96.2).toFixed(1), sj: +w('"Times New Roman"',"normal",wt,SJ,17).toFixed(1) }
    out["jost-"+wt]      = { sj: +w('"Jost"',"normal",wt,SJ,17).toFixed(1), se: +w('"Jost"',"normal",wt,SE,13).toFixed(1) }
    out["arial-"+wt]     = { sj: +w('Arial',"normal",wt,SJ,17).toFixed(1), se: +w('Arial',"normal",wt,SE,13).toFixed(1) }
  }
  out["cormorant-it500"] = +w('"Cormorant Garamond"',"italic",500,"economies stand.",96.2).toFixed(1)
  out["times-it500"]     = +w('"Times New Roman"',"italic",500,"economies stand.",96.2).toFixed(1)
  out["garamond-it500"]  = +w('Garamond',"italic",500,"economies stand.",96.2).toFixed(1)
  out["garamond-n500"]   = +w('Garamond',"normal",500,S1,96.2).toFixed(1)
  out["jbmono-400"]      = +w('"JetBrains Mono"',"normal",400,"0123456789",14).toFixed(1)
  out["consolas-400"]    = +w('Consolas',"normal",400,"0123456789",14).toFixed(1)
  out["cascadia-400"]    = +w('"Cascadia Mono"',"normal",400,"0123456789",14).toFixed(1)
  return out
})
for (const [k,v] of Object.entries(r)) console.log(k.padEnd(18), JSON.stringify(v))
await b.close()
