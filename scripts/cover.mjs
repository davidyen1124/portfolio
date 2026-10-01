// Renders art/cover/index.html (the README cover, also GitHub's 1280×640 social preview size) to .github/cover.jpg.
// It needs the Vite dev server, which resolves the fonts and src/content.ts for it:
//   npm run dev -- --port 5199 &   then   node scripts/cover.mjs [url]
import { chromium } from 'playwright'
import fs from 'node:fs'

const URL = process.argv[2] || 'http://localhost:5199/portfolio/art/cover/'
fs.mkdirSync('.github', { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 2 })
await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForSelector('html[data-ready="1"]', { timeout: 20000 })
await p.locator('#cover').screenshot({ path: '.github/cover.jpg', type: 'jpeg', quality: 88 })
await b.close()
console.log('.github/cover.jpg', `${Math.round(fs.statSync('.github/cover.jpg').size / 1024)}KB`)
