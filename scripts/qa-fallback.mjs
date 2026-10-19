import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.goto("http://localhost:8443/", { waitUntil:"domcontentloaded" })
const r = await page.evaluate(async () => {
  await document.fonts.ready
  const mk = (css) => { const s = document.createElement("style"); s.textContent = css; document.head.appendChild(s); return s }
  const S = "We reshape the ground on which economies stand."
  const IT = "economies stand."
  const B = "Advisory for governments, institutions and social enterprises and more words to wrap here ok"
  const EY = "Strategy · Policy · Transformation"
  const meas = (family, style, weight, text, size, lh) => {
    const d = document.createElement("div")
    d.style.cssText = `position:absolute;left:-9999px;top:0;font-family:${family};font-style:${style};font-weight:${weight};font-size:${size}px;line-height:${lh};white-space:normal;width:520px;max-width:none`
    d.textContent = text
    document.body.appendChild(d)
    const rect = d.getBoundingClientRect()
    const out = { w: Math.round(rect.width*100)/100, h: Math.round(rect.height*100)/100 }
    d.remove()
    return out
  }
  // widths for ratio via canvas (unwrapped)
  const cw = (family, style, weight, text, size) => {
    const c = document.createElement("canvas").getContext("2d")
    c.font = `${style} ${weight} ${size}px ${family}`
    return c.measureText(text).width
  }
  const out = {}
  // candidate descriptors: measure candidate fallback family vs real family
  const trial = (name, src, sizeAdjust) => {
    mk(`@font-face{font-family:'${name}';font-style:normal;font-weight:300 700;src:${src};size-adjust:${sizeAdjust}%;ascent-override:94.58%;descent-override:29.8%;line-gap-override:0%}`)
    mk(`@font-face{font-family:'${name}';font-style:italic;font-weight:300 700;src:${src};size-adjust:${sizeAdjust}%;ascent-override:94.58%;descent-override:29.8%;line-gap-override:0%}`)
  }
  trial("TestSerif", "local('Times New Roman')", 97.28)
  mk(`@font-face{font-family:'TestSans';font-style:normal;font-weight:100 900;src:local('Arial');size-adjust:95.33%;ascent-override:112.24%;descent-override:39.85%;line-gap-override:0%}`)
  const cases = [
    ["display-real", "Cormorant Garamond", "normal", 500, S, 96, "0.95"],
    ["display-fallback-candidate", "TestSerif", "normal", 500, S, 96, "0.95"],
    ["display-fallback-plain", "Times New Roman", "normal", 500, S, 96, "0.95"],
    ["display-italic-real", "Cormorant Garamond", "italic", 500, IT, 96, "0.95"],
    ["display-italic-candidate", "TestSerif", "italic", 500, IT, 96, "0.95"],
    ["display-italic-plain", "Times New Roman", "italic", 500, IT, 96, "0.95"],
    ["sans-real", "Jost", "normal", 300, B, 17, "1.625"],
    ["sans-candidate", "TestSans", "normal", 300, B, 17, "1.625"],
    ["sans-plain", "Arial", "normal", 300, B, 17, "1.625"],
    ["eyebrow-real", "Jost", "normal", 400, EY, 13, "1.5"],
    ["eyebrow-candidate", "TestSans", "normal", 400, EY, 13, "1.5"],
    ["eyebrow-plain", "Arial", "normal", 400, EY, 13, "1.5"],
    ["normal-lh-real", "Cormorant Garamond", "normal", 500, S, 40, "normal"],
    ["normal-lh-candidate", "TestSerif", "normal", 500, S, 40, "normal"],
    ["normal-lh-plain", "Times New Roman", "normal", 500, S, 40, "normal"],
    ["sans-normal-lh-real", "Jost", "normal", 400, B, 40, "normal"],
    ["sans-normal-lh-candidate", "TestSans", "normal", 400, B, 40, "normal"],
    ["sans-normal-lh-plain", "Arial", "normal", 400, B, 40, "normal"],
  ]
  for (const [k, fam, st, wt, tx, sz, lh] of cases) out[k] = meas(fam, st, wt, tx, sz, lh)
  return out
})
for (const [k,v] of Object.entries(r)) console.log(k.padEnd(30), JSON.stringify(v))
await b.close()
