// Renders art/icon/index.html with the site's display font into the favicon and the apple-touch icon.
// Needs the Vite dev server:  npm run dev -- --port 5199 &   then   node scripts/icon.mjs [base-url]
import { chromium } from 'playwright'
import sharp from 'sharp'

const BASE = process.argv[2] || 'http://localhost:5199/portfolio/art/icon/'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 512, height: 512 } })
const grab = async (hash) => {
  await p.goto(BASE + hash, { waitUntil: 'networkidle' })
  await p.reload({ waitUntil: 'networkidle' }) // a hash-only change doesn't re-run the module
  await p.waitForSelector('html[data-ready="1"]')
  return p.locator('#icon').screenshot({ omitBackground: true })
}
const round = await grab('')
const square = await grab('#square')
await b.close()
await sharp(round).resize(96, 96).png().toFile('public/favicon.png')
await sharp(square).resize(180, 180).flatten({ background: '#111111' }).png().toFile('public/apple-touch-icon.png')
// a 32px preview, to eyeball how it reads in a browser tab
await sharp(round).resize(32, 32).png().toFile(process.env.TMPDIR + '/favicon-32.png')
console.log('public/favicon.png 96×96, public/apple-touch-icon.png 180×180')
