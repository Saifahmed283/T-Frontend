import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.goto("http://localhost:8443/", { waitUntil:"domcontentloaded" })
const r = await page.evaluate(async () => {
  await document.fonts.ready
  const cvs = document.createElement("canvas")
  const ctx = cvs.getContext("2d")
  const measure = (font, text) => { ctx.font = font; const m = ctx.measureText(text); return { w: m.width, asc: m.fontBoundingBoxAscent, desc: m.fontBoundingBoxDescent } }
  const S = "We reshape the ground on which economies stand."
  const B = "Advisory for governments, institutions and social enterprises"
  const out = {}
  out.cormorant = measure('500 100px "Cormorant Garamond"', S)
  out.times = measure('500 100px "Times New Roman"', S)
  out.georgia = measure('500 100px Georgia', S)
  out.jost = measure('400 100px "Jost"', B)
  out.arial = measure('400 100px Arial', B)
  out.verdana = measure('400 100px Verdana', B)
  out.segoe = measure('400 100px "Segoe UI"', B)
  out.mono_jb = measure('400 100px "JetBrains Mono"', "0123456789 abcdefghij")
  out.mono_cons = measure('400 100px Consolas', "0123456789 abcdefghij")
  out.mono_casc = measure('400 100px "Cascadia Mono"', "0123456789 abcdefghij")
  return out
})
console.log(JSON.stringify(r, null, 1))
await b.close()
