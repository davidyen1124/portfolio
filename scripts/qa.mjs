// Scroll QA: walks the whole page in small steps on several viewports, checks every step
// for layout problems, and saves screenshots + contact sheets for a human (or Claude) to eyeball.
// usage: node scripts/qa.mjs [--url http://localhost:5199/portfolio/] [--vp desktop,mobile] [--step 0.25] [--check 24]
import { chromium, devices } from 'playwright'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const opt = (k, d) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : d)
const URL = opt('url', 'http://localhost:5199/portfolio/')
const STEP = Number(opt('step', '0.25')) // screenshot every STEP viewports
const CHECK = Number(opt('check', '24')) // run DOM checks every CHECK px
const OUT = opt('out', 'qa-shots')
const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  laptop: { viewport: { width: 1280, height: 720 } },
  wide: { viewport: { width: 1920, height: 1080 } },
  tablet: { viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true },
  mobile: { ...devices['iPhone 13'], defaultBrowserType: undefined },
  small: { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  reduced: { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
  landscape: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
}
const pickVps = opt('vp', 'desktop,mobile').split(',')

// runs in the page: returns a list of problems at the current scroll position
function inspect() {
  const W = innerWidth
  const H = innerHeight
  const issues = []
  if (document.documentElement.scrollWidth > W + 1) issues.push(`horizontal overflow: ${document.documentElement.scrollWidth} > ${W}`)
  const scenes = [...document.querySelectorAll('.scene')]
  // the scene whose stage owns the screen right now
  let cur = scenes[0]
  for (const s of scenes) if (s.getBoundingClientRect().top <= 1) cur = s
  const top = cur.getBoundingClientRect().top
  const next = scenes[scenes.indexOf(cur) + 1]
  const nextTop = next ? next.getBoundingClientRect().top : Infinity
  // only judge a scene while it sits alone on screen (not mid-transition)
  const settled = top <= 1 && nextTop >= H - 1
  if (!settled) return { issues, scene: cur.id, settled }
  const visible = (el) => {
    const cs = getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.6
  }
  const text = [...cur.querySelectorAll('h1, h2, h3, p, li, .stat__num, .stat__label, .card__name, .btn, .hud__cta')].filter(
    (el) => visible(el) && el.getBoundingClientRect().width > 0,
  )
  const hudH = document.querySelector('.hud').getBoundingClientRect().height
  const inTrack = (el) => el.closest('.projects__track')
  for (const el of text) {
    const r = el.getBoundingClientRect()
    const name = `${cur.id} ${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${el.textContent.trim().slice(0, 28)}"`
    if (!inTrack(el)) {
      if (r.left < -1 || r.right > W + 1) issues.push(`clipped x: ${name} [${Math.round(r.left)}, ${Math.round(r.right)}]`)
      if (cur.id !== 'contact' && (r.top < hudH - 4 || r.bottom > H + 1) && !el.closest('.tape'))
        issues.push(`clipped y: ${name} [${Math.round(r.top)}, ${Math.round(r.bottom)}]`)
    }
    // text wider than its own box = overflowing words
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow === 'visible' && el.clientWidth > 0 && !el.matches('.line__in, .co__name, .hero__name'))
      issues.push(`overflowing text: ${name} ${el.scrollWidth}>${el.clientWidth}`)
  }
  // toys covering the reading copy (names are allowed to sit in front of toys)
  const copy = [...cur.querySelectorAll('.co__line, .stat, .co__foot, .co__meta, .hero__lede, .hero__chips li, .rewind__line')].filter(visible)
  for (const p of cur.querySelectorAll('.prop__img')) {
    const pr = p.getBoundingClientRect()
    // shrink to the toy's visual core; the webp box includes a little transparent air
    const core = { left: pr.left + pr.width * 0.18, right: pr.right - pr.width * 0.18, top: pr.top + pr.height * 0.18, bottom: pr.bottom - pr.height * 0.18 }
    for (const c of copy) {
      const cr = c.getBoundingClientRect()
      const ix = Math.max(0, Math.min(core.right, cr.right) - Math.max(core.left, cr.left))
      const iy = Math.max(0, Math.min(core.bottom, cr.bottom) - Math.max(core.top, cr.top))
      if (ix * iy > 0.12 * cr.width * cr.height)
        issues.push(`toy over copy: ${cur.id} ${p.getAttribute('src').split('/').pop()} × .${[...c.classList][0]} (${Math.round((100 * ix * iy) / (cr.width * cr.height))}%)`)
    }
  }
  // copy elements colliding with each other
  const blocks = [...cur.querySelectorAll('.co__copy > *, .hero__copy > *:not(.hero__cue), .end__inner > *')].filter(visible)
  for (let i = 0; i < blocks.length; i++)
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i].getBoundingClientRect()
      const b = blocks[j].getBoundingClientRect()
      const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left)
      const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
      if (ix > 2 && iy > 2) issues.push(`copy collision: ${cur.id} .${blocks[i].classList[0]} × .${blocks[j].classList[0]} (${Math.round(iy)}px)`)
    }
  // the tape must not run over the stats
  const tape = cur.querySelector('.tape')
  if (tape) {
    const t = tape.getBoundingClientRect()
    for (const s of [...cur.querySelectorAll('.stat, .co__foot')].filter(visible)) {
      const r = s.getBoundingClientRect()
      if (r.bottom > t.top + 4 && r.top < t.bottom) issues.push(`tape over copy: ${cur.id} .${s.classList[0]} bottom ${Math.round(r.bottom)} > tape ${Math.round(t.top)}`)
    }
  }
  return { issues, scene: cur.id, settled }
}

async function sheet(files, out, cols = 6) {
  const meta = await sharp(files[0]).metadata()
  const tw = Math.round(meta.width / (meta.width > 1000 ? 4 : 2))
  const th = Math.round((meta.height / meta.width) * tw)
  const tiles = await Promise.all(files.map((f) => sharp(f).resize(tw, th).toBuffer()))
  const rows = Math.ceil(tiles.length / cols)
  await sharp({ create: { width: cols * (tw + 6), height: rows * (th + 6), channels: 3, background: '#444' } })
    .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * (tw + 6), top: Math.floor(i / cols) * (th + 6) })))
    .jpeg({ quality: 72 })
    .toFile(out)
}

const browser = await chromium.launch()
const summary = {}
for (const vpName of pickVps) {
  const dir = path.join(OUT, vpName)
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  const ctx = await browser.newContext(VIEWPORTS[vpName])
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('requestfailed', (r) => !r.url().includes('api.github.com') && errors.push(`requestfailed: ${r.url()}`))
  page.on('response', (r) => r.status() >= 400 && !r.url().includes('api.github.com') && errors.push(`HTTP ${r.status()}: ${r.url()}`))
  await page.goto(URL + (URL.includes('?') ? '&' : '?') + 'qa', { waitUntil: 'networkidle' })
  await page.waitForSelector('html[data-ready="1"]', { timeout: 20000 })
  await page.waitForTimeout(400)
  const { H, total } = await page.evaluate(() => ({ H: innerHeight, total: document.documentElement.scrollHeight - innerHeight }))
  const issues = new Map()
  const shots = []
  const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  let nextShot = 0
  let n = 0
  for (let y = 0; y <= total + CHECK; y += CHECK) {
    const yy = Math.min(y, total)
    await page.evaluate((v) => window.scrollTo(0, v), yy)
    await settle()
    const res = await page.evaluate(inspect)
    for (const i of res.issues) if (!issues.has(i)) issues.set(i, yy)
    if (yy >= nextShot || yy === total) {
      // let lazy images arrive before the photo
      await page.evaluate(() => Promise.all([...document.images].filter((i) => !i.complete && i.getBoundingClientRect().top < innerHeight * 1.5 && i.getBoundingClientRect().bottom > -50).map((i) => new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 3000) }))))
      await settle()
      const f = path.join(dir, `${String(n++).padStart(3, '0')}-${yy}.jpg`)
      await page.screenshot({ path: f, type: 'jpeg', quality: 70 })
      shots.push(f)
      nextShot = yy + H * STEP
    }
    if (yy === total) break
  }
  const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src))
  for (let i = 0; i < shots.length; i += 36) await sheet(shots.slice(i, i + 36), path.join(OUT, `${vpName}-sheet-${i / 36 + 1}.jpg`))
  summary[vpName] = { height: total + H, shots: shots.length, errors, broken, issues: [...issues].map(([k, v]) => `@${v}px ${k}`) }
  await ctx.close()
}
await browser.close()
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(summary, null, 2))
for (const [vp, s] of Object.entries(summary)) {
  console.log(`\n=== ${vp}: ${s.height}px, ${s.shots} shots, ${s.errors.length} errors, ${s.broken.length} broken images, ${s.issues.length} issues`)
  for (const e of [...s.errors, ...s.broken]) console.log('  !', e)
  for (const i of s.issues.slice(0, 60)) console.log('  -', i)
}
