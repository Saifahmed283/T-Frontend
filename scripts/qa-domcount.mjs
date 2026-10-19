import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.setViewport({ width: 412, height: 915 })
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("tm-intro","1") } catch {} })
await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
const out = await page.evaluate(() => {
  const total = document.querySelectorAll("*").length
  const perSection = [...document.querySelectorAll("main > section, main > div, body > div > section")].map(s => ({
    id: s.id || (typeof s.className === "string" ? s.className.split(/\s+/).slice(0,3).join(".") : "?"),
    n: s.querySelectorAll("*").length
  })).sort((a,b) => b.n - a.n).slice(0, 8)
  const svgs = [...document.querySelectorAll("svg")].map(s => ({ cls: (s.getAttribute("class")||"").slice(0,50), n: s.querySelectorAll("*").length })).sort((a,b)=>b.n-a.n).slice(0,6)
  return { total, perSection, svgs }
})
console.log(JSON.stringify(out, null, 1))
await b.close()
