import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const page = await b.newPage()
await page.setViewport({ width: 1300, height: 900 })
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("tm-intro","1") } catch {} })
await page.goto("http://localhost:8443/", { waitUntil:"networkidle0", timeout:60000 })
await page.screenshot({ path: "C:/Users/saif ahmed/AppData/Local/Temp/hero.png", fullPage: false })
console.log("shot hero.png")
await b.close()
