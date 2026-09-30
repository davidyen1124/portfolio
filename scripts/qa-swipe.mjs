// Touch-scroll QA: real touch swipe gestures (via Chromium's DevTools protocol) in iPhone emulation.
// Checks the page scrolls, that a swipe on the open DavidBot sheet reaches the page, and that a long chat scrolls.
// usage: node scripts/qa-swipe.mjs [url]
import { chromium, devices } from 'playwright'
const URL = process.argv[2] || 'https://davidyen1124.github.io/portfolio/'
const b = await chromium.launch()
const ctx = await b.newContext({ ...devices['iPhone 13'] })
const p = await ctx.newPage()
const cdp = await ctx.newCDPSession(p)
const swipe = async (x, y, dy = -300) => {
  await cdp.send('Input.synthesizeScrollGesture', { x, y, yDistance: dy, gestureSourceType: 'touch', speed: 1200 })
  await p.waitForTimeout(700)
}
const sy = () => p.evaluate(() => Math.round(scrollY))
await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForTimeout(4500) // loader + intro
let a = await sy(); await swipe(195, 400); console.log('1. plain page swipe:            ', a, '→', await sy())
await p.evaluate(() => document.querySelector('.cookie [data-a="reject"]')?.click())
await p.waitForTimeout(2500)
await p.click('.bot-launch')
await p.waitForTimeout(3500)
const r = await p.evaluate(() => { const b = document.querySelector('.bot').getBoundingClientRect(); const l = document.querySelector('.bot__log'); return { top: Math.round(b.top), h: Math.round(b.height), logOverflow: l.scrollHeight > l.clientHeight } })
console.log('   bot panel top/height:', r)
a = await sy(); await swipe(195, r.top + 150); console.log('2. swipe on chat log (short):   ', a, '→', await sy())
a = await sy(); await swipe(195, Math.max(70, r.top / 2 + 28)); console.log('3. swipe on page above panel:   ', a, '→', await sy())
// make the conversation long, then try to scroll the log itself
for (const q of ['tech stack?', 'why hire him?', 'tell me a joke', 'salary?', 'where does he live?', 'yahoo?', 'houzz?']) {
  await p.fill('.bot__form input', q); await p.press('.bot__form input', 'Enter')
  await p.waitForFunction(() => !document.querySelector('.typing'), null, { timeout: 15000 }).catch(() => {})
  await p.waitForTimeout(600)
}
const before = await p.evaluate(() => { const l = document.querySelector('.bot__log'); return { st: Math.round(l.scrollTop), sh: l.scrollHeight, ch: l.clientHeight } })
await swipe(195, r.top + 200, 250)
const after = await p.evaluate(() => Math.round(document.querySelector('.bot__log').scrollTop))
console.log('4. swipe up inside long chat:   log scrollTop', before.st, '→', after, `(scrollHeight ${before.sh}, clientHeight ${before.ch})`)
await b.close()
