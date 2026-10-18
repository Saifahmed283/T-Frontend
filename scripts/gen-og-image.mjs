import { existsSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import puppeteer from "puppeteer-core"

/* Renders public/og-image.png (1200x630) — the social share image used by
   og:image / twitter:image in pages/+Head.tsx. Uses the same local
   Chrome/Edge detection as scripts/a11y.mjs; set CHROME_PATH to override.
   Run once via `pnpm og-image` and commit the PNG. */

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const OUT = resolve(root, "public/og-image.png")

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean)

const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p))
if (!executablePath) {
  console.error(
    "No Chrome/Edge binary found. Set CHROME_PATH to a Chromium executable.",
  )
  process.exit(2)
}

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    background: #0C1D30;
    color: #FBF8F1;
    font-family: "Jost", sans-serif;
    position: relative;
  }
  .contours {
    position: absolute; inset: 0; opacity: 0.14;
    background:
      radial-gradient(ellipse 900px 420px at 85% 110%, transparent 58%, #C4A868 58.5%, transparent 59.5%),
      radial-gradient(ellipse 1100px 520px at 90% 115%, transparent 62%, #C4A868 62.5%, transparent 63.5%),
      radial-gradient(ellipse 1300px 620px at 95% 120%, transparent 66%, #C4A868 66.5%, transparent 67.5%),
      radial-gradient(ellipse 700px 340px at 80% 105%, transparent 54%, #C4A868 54.5%, transparent 55.5%);
  }
  .rule { position: absolute; left: 64px; right: 64px; top: 52px; height: 1px; background: rgba(196,168,104,.4); }
  .rule-b { top: auto; bottom: 116px; }
  .inner { position: relative; padding: 88px 64px 0; height: 100%; display: flex; flex-direction: column; }
  .eyebrow {
    font-size: 15px; letter-spacing: .32em; text-transform: uppercase;
    color: #C4A868; font-weight: 500;
  }
  h1 {
    font-family: "Cormorant Garamond", serif;
    font-weight: 600; font-size: 108px; line-height: 1;
    letter-spacing: .02em; margin-top: 28px; color: #FBF8F1;
  }
  h1 em { font-style: italic; font-weight: 400; color: #C4A868; }
  .tagline {
    font-family: "Cormorant Garamond", serif; font-style: italic;
    font-size: 34px; line-height: 1.3; color: rgba(251,248,241,.78);
    margin-top: 26px; max-width: 780px;
  }
  .foot {
    position: absolute; left: 64px; right: 64px; bottom: 48px;
    display: flex; justify-content: space-between; align-items: baseline;
    font-size: 16px; letter-spacing: .22em; text-transform: uppercase;
  }
  .foot .left { color: rgba(251,248,241,.55); font-weight: 300; }
  .foot .right { color: #C4A868; font-weight: 500; }
</style>
</head>
<body>
  <div class="contours"></div>
  <div class="rule"></div>
  <div class="rule rule-b"></div>
  <div class="inner">
    <p class="eyebrow">Strategy · Policy · Transformation</p>
    <h1>Terra<em>Morph</em></h1>
    <p class="tagline">Reshaping the ground on which economies stand.</p>
  </div>
  <div class="foot">
    <span class="left">New Cairo · Egypt</span>
    <span class="right">askterramorph.com</span>
  </div>
</body>
</html>`

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu"],
})
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 })
await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 })
await page.evaluateHandle("document.fonts.ready")
await page.screenshot({ path: OUT, type: "png" })
await browser.close()
console.log(`wrote ${OUT}`)
