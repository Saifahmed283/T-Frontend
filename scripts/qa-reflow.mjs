import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find((p)=>existsSync(p))
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] })
const routes = ["/","/evidence","/learning","/join","/contact","/hub/governments"]
for (const r of routes) {
  const page = await b.newPage()
  await page.setViewport({ width: 320, height: 720 })
  await page.goto("http://localhost:8443"+r, { waitUntil:"networkidle0", timeout:40000 })
  await page.evaluate(()=>{const x=[...document.querySelectorAll("button")].find(b=>/skip intro/i.test(b.textContent||""));if(x)x.click()})
  await new Promise(r=>setTimeout(r,1200))
  const o = await page.evaluate(()=>({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  console.log(`${r.padEnd(18)} scrollW=${o.sw} clientW=${o.cw} overflow=${o.sw>o.cw+1}`)
  await page.close()
}
await b.close()
