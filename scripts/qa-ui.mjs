// Exercises the humour department in a real (non-QA) page load: cookie banner, fake
// notifications, Do Not Disturb, and DavidBot. Screenshots land in qa-shots/ui/.
// usage: node scripts/qa-ui.mjs [--url http://localhost:5199/portfolio/]
import { chromium, devices } from 'playwright'
import fs from 'node:fs'

const argv = process.argv.slice(2)
const URL = argv.includes('--url') ? argv[argv.indexOf('--url') + 1] : 'http://localhost:5199/portfolio/'
const OUT = 'qa-shots/ui'
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const fail = []
const check = (ok, msg) => {
  console.log(ok ? '  ok  ' : '  FAIL', msg)
  if (!ok) fail.push(msg)
}

for (const [name, ctxOpts] of [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['mobile', { ...devices['iPhone 13'] }],
]) {
  console.log(`=== ${name}`)
  const ctx = await browser.newContext(ctxOpts)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const shot = (n) => page.screenshot({ path: `${OUT}/${name}-${n}.jpg`, type: 'jpeg', quality: 75 })

  await page.goto(URL, { waitUntil: 'networkidle' })
  // loader → intro → cookie banner ~1.6s after
  await page.waitForSelector('.cookie', { timeout: 15000 })
  await page.waitForTimeout(900)
  await shot('1-cookie')
  check(await page.isVisible('.bot-launch'), 'bot launcher visible')
  const lb = await page.locator('.bot-launch').boundingBox()
  check(lb && lb.y + lb.height <= (ctxOpts.viewport?.height ?? 664) + 1, `bot launcher on screen (y=${Math.round(lb?.y)})`)

  await page.click('[data-a="manage"]')
  await page.click('input[data-k="necessary"]')
  await page.waitForTimeout(600)
  check(await page.isChecked('input[data-k="necessary"]'), 'necessary cookies re-check themselves')
  check((await page.textContent('.cookie__prefs em')).includes('nice try'), 'necessary cookies say "nice try"')
  await shot('2-cookie-prefs')
  await page.click('[data-a="accept"]')
  await page.waitForTimeout(700)
  check((await page.locator('.cookie-fall').count()) > 0, 'accepting rains cookies')
  check(await page.isVisible('.notif'), 'legal notification shown')
  await shot('3-cookie-rain')
  await page.waitForTimeout(3000)
  check((await page.locator('.cookie').count()) === 0, 'cookie banner gone')

  // the hero notification arrives ~5s after the banner
  await page.waitForTimeout(4500)
  // scroll to Dcard, wait for its notification
  await page.evaluate(() => window.scrollTo(0, document.getElementById('dcard').offsetTop + innerHeight * 0.3))
  await page.waitForTimeout(3200)
  await shot('4-notif-dcard')
  const texts = await page.locator('.notif__text').allTextContents()
  check(texts.some((t) => t.includes('midnight')), `dcard notification (${texts.map((t) => t.slice(0, 24)).join(' | ')})`)
  const hasDnd = (await page.locator('.notif__dnd').count()) > 0
  check(hasDnd, 'third notification offers Do Not Disturb')
  if (hasDnd) {
    await page.click('.notif__dnd')
    await page.waitForTimeout(900)
    check((await page.locator('.notif__text').allTextContents()).some((t) => t.includes('mom')), 'DND confirmation mentions mom')
    await shot('5-dnd')
  }

  // bot
  await page.waitForTimeout(4500)
  await page.click('.bot-launch')
  await page.waitForSelector('.bot')
  await page.waitForFunction(() => document.querySelectorAll('.msg--bot:not(:has(.typing))').length >= 2, null, { timeout: 12000 })
  await page.click('.bot__chips button:has-text("Is David any good?")')
  await page.waitForFunction(() => document.querySelectorAll('.msg--bot:not(:has(.typing))').length >= 3, null, { timeout: 12000 })
  await page.fill('.bot__form input', 'what is the salary expectation?')
  await page.press('.bot__form input', 'Enter')
  await page.waitForFunction(() => document.querySelectorAll('.msg--bot:not(:has(.typing))').length >= 4, null, { timeout: 12000 })
  await page.fill('.bot__form input', '<img src=x onerror=alert(1)> are you sentient')
  await page.press('.bot__form input', 'Enter')
  await page.waitForFunction(() => document.querySelectorAll('.msg--bot:not(:has(.typing))').length >= 5, null, { timeout: 15000 })
  const log = await page.locator('.msg').allTextContents()
  console.log('   chat:', log.map((l) => l.slice(0, 60)).join('\n         '))
  check((await page.locator('.msg--me img').count()) === 0, 'user input is rendered as text, not HTML')
  check(log.some((l) => l.includes('65%')), 'bot answers "any good" with the 65% fact')
  check(log.some((l) => l.includes('not authorized to discuss money')), 'bot dodges salary')
  check(log.some((l) => l.includes('typed a whole paragraph')), 'third question gets the awkward deleted-paragraph bit')
  await shot('6-bot')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(600)
  check((await page.locator('.bot').count()) === 0, 'Escape closes the bot')

  // end: Mom gets through Do Not Disturb
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(3500)
  check((await page.locator('.notif__text').allTextContents()).some((t) => t.includes('are you eating')), 'Mom gets through DND at the end')
  await shot('7-end-mom')
  check(errors.length === 0, `no page errors ${errors.join(' | ')}`)
  await ctx.close()
}
await browser.close()
console.log(fail.length ? `\n${fail.length} failure(s)` : '\nall humour checks passed')
process.exit(fail.length ? 1 : 0)
