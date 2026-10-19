import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.setViewport({ width: 320, height: 800 })
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("tm-intro","1") } catch {} })
const cssResponses = []
page.on("response", r => { if (r.url().endsWith(".css")) cssResponses.push(r.status() + " " + r.url().split("/").pop()) })
await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
const out = await page.evaluate(() => {
  const sheets = [...document.styleSheets].map(s => { try { return { href: (s.href||"inline").split("/").pop(), rules: s.cssRules.length } } catch(e) { return { href: (s.href||"").split("/").pop(), err: "CORS" } } })
  const sec = document.querySelector("section")
  const bodyCS = getComputedStyle(document.body)
  return { sheets, bodyFont: bodyCS.fontFamily.slice(0,60), bodyPad: bodyCS.padding, secPad: sec ? getComputedStyle(sec).paddingLeft : null,
           linkCount: document.querySelectorAll('link[rel="stylesheet"]').length }
})
console.log("css responses:", cssResponses)
console.log(JSON.stringify(out, null, 1))
await b.close()
