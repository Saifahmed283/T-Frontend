import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.goto("http://localhost:8443/", { waitUntil:"domcontentloaded" })
const r = await page.evaluate(async () => {
  await document.fonts.ready
  const c = document.createElement("canvas").getContext("2d")
  const S = "economies stand."
  const N = "We reshape the ground on which economies stand."
  const w = (fam, style, text, size) => { c.font = `${style} 500 ${size}px ${fam}`; return Math.round(c.measureText(text).width*10)/10 }
  const out = { target_it: w('"Cormorant Garamond"', "italic", S, 96.2), target_n: w('"Cormorant Garamond"', "normal", N, 96.2) }
  const cands = ['"Times New Roman"','Georgia','"Palatino Linotype"','"Book Antiqua"','"Cambria"','"Constantia"','"Bookman Old Style"','"Century Schoolbook"','Garamond','"Segoe UI"','"Liberation Serif"','"Noto Serif"']
  for (const f of cands) {
    out[f] = { it: w(f, "italic", S, 96.2), n: w(f, "normal", N, 96.2) }
  }
  // jost candidates
  out.jost_target = w('"Jost"', "normal", "Advisory for governments, institutions and social enterprises", 100)
  for (const f of ['Arial','"Segoe UI"','"Liberation Sans"','"Noto Sans"','Verdana','"Trebuchet MS"']) {
    out["jost-vs-"+f] = w(f, "normal", "Advisory for governments, institutions and social enterprises", 100)
  }
  return out
})
for (const [k,v] of Object.entries(r)) console.log(k.padEnd(26), JSON.stringify(v))
await b.close()
