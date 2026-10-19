import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.goto("http://localhost:8443/", { waitUntil:"domcontentloaded" })
const r = await page.evaluate(async () => {
  await document.fonts.ready
  const mk = (css) => { const s = document.createElement("style"); s.textContent = css; document.head.appendChild(s) }
  mk(`@font-face{font-family:'TestSerif';font-style:normal;font-weight:300 700;src:local('Times New Roman');size-adjust:97.28%;ascent-override:94.58%;descent-override:29.8%;line-gap-override:0%}`)
  mk(`@font-face{font-family:'TestSerif';font-style:italic;font-weight:300 700;src:local('Times New Roman');size-adjust:97.28%;ascent-override:94.58%;descent-override:29.8%;line-gap-override:0%}`)
  mk(`@font-face{font-family:'TestSans';font-style:normal;font-weight:100 900;src:local('Arial');size-adjust:95.33%;ascent-override:112.24%;descent-override:39.85%;line-gap-override:0%}`)
  // one-line widths at real hero size (shrink-to-fit driver)
  const cw = (family, style, weight, text, size) => {
    const c = document.createElement("canvas").getContext("2d")
    c.font = `${style} ${weight} ${size}px ${family}`
    return Math.round(c.measureText(text).width*100)/100
  }
  const line1 = "We reshape the ground"
  const line2a = "on which "
  const line2b = "economies stand."
  const out = {}
  for (const [k, fam, st] of [["real","Cormorant Garamond","normal"],["plain","Times New Roman","normal"],["candidate","TestSerif","normal"]]) {
    out["h1-"+k] = { l1: cw(fam, st, 500, line1, 96.2), l2: cw(fam, st, 500, line2a, 96.2), l2i: cw(fam, st, 500+0, line2b, 96.2) }
    out["h1i-"+k] = { l2i: cw(fam, "italic", 500, line2b, 96.2) }
  }
  // paragraph wrap at 576px width, 17px/1.625
  const para = "Advisory for governments, institutions and social enterprises — a small, well-placed force for large public outcomes."
  const wrap = (family, style, weight, text, size, width) => {
    const d = document.createElement("div")
    d.style.cssText = `position:absolute;left:-9999px;font-family:${family};font-style:${style};font-weight:${weight};font-size:${size}px;line-height:1.625;width:${width}px`
    d.textContent = text
    document.body.appendChild(d)
    const h = d.getBoundingClientRect().height
    d.remove()
    return h
  }
  for (const [k, fam] of [["real","Jost"],["plain","Arial"],["candidate","TestSans"]]) out["para-"+k] = wrap(fam, "normal", 300, para, 17, 576)
  return out
})
console.log(JSON.stringify(r, null, 1))
await b.close()
