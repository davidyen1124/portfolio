// Link rot check: loads the page, collects every outbound link (project demos, repos, résumé, GitHub)
// and requests each one. Demos die quietly (a deleted Cloudflare Worker answers 404 "error code: 1042").
// usage: node scripts/qa-links.mjs [url]
import { chromium } from 'playwright'

const URL = process.argv[2] || 'http://localhost:5199/portfolio/'
const b = await chromium.launch()
const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/130 Safari/537.36' })
const p = await ctx.newPage()
await p.goto(URL + (URL.includes('?') ? '&' : '?') + 'qa')
await p.waitForSelector('html[data-ready="1"]')
const links = await p.evaluate(() =>
  [...document.querySelectorAll('a[href]')]
    .filter((a) => /^https?:/.test(a.href) && !a.href.startsWith(location.origin + location.pathname + '#'))
    .map((a) => ({ href: a.href, text: a.textContent.trim().slice(0, 30), where: a.closest('.card')?.querySelector('.card__name')?.textContent ?? a.closest('section, footer, header')?.id ?? '' })),
)
const seen = new Map()
for (const l of links) if (!seen.has(l.href)) seen.set(l.href, l)
const dead = []
for (const l of seen.values()) {
  let status = 'ERR'
  for (let attempt = 0; attempt < 2 && (status === 'ERR' || status >= 500); attempt++) {
    const r = await ctx.request.get(l.href, { timeout: 25000, maxRedirects: 5 }).catch(() => null)
    status = r ? r.status() : 'ERR'
  }
  if (status === 'ERR' || status >= 400) dead.push(`${status} ${l.href}  (${l.where}: "${l.text}")`)
}
await b.close()
console.log(`${seen.size} unique links checked, ${dead.length} dead`)
for (const d of dead) console.log('  ✗', d)
process.exit(dead.length ? 1 : 0)
