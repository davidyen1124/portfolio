import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource/instrument-serif/400-italic.css'
import './style.css'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { COMPANIES, END_NOTIF, HERO_NOTIF, LOADER_LINES, PROJECTS_NOTIF, type Notif } from './content'
import { $, $$, QA, charify, reduced, session, wait } from './lib'
import { refreshStars, renderCompanies, renderHero, renderProjects } from './render'
import { companyScene, endScene, heroIntro, heroScene, measureBands, mouseParallax, projectsScene, rewindScene, spotlight, state } from './scenes'
import { initBot } from './ui/bot'
import { cookieBanner } from './ui/cookies'
import { initNotifs, notify } from './ui/notify'

gsap.registerPlugin(ScrollTrigger)
// the mobile URL bar resizing the viewport shouldn't re-measure (and jump) the sticky scenes
ScrollTrigger.config({ ignoreMobileResize: true })
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

/* ——— build the page ——— */
renderHero()
renderCompanies()
renderProjects()
charify($('.end__title'))
$('#yearNow').textContent = String(new Date().getFullYear())

/* ——— smooth scroll ——— */
let lenis: Lenis | null = null
if (!reduced && !QA) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis!.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  lenis.stop()
}
const scrollTo = (target: string) => {
  const node = target === '#top' ? 0 : $(target)
  if (lenis) lenis.scrollTo(node, { duration: 2.2 })
  else if (node === 0) window.scrollTo(0, 0)
  else node.scrollIntoView()
}
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLElement>('[data-goto]')
  if (!a) return
  e.preventDefault()
  scrollTo(a.dataset.goto!)
})

/* ——— HUD: year, place and colours follow whichever screen is on top ——— */
const hud = $('#hud')
const hudYear = $('#hudYear')
const hudWhere = $('#hudWhere')
const themeMeta = $<HTMLMetaElement>('meta[name="theme-color"]')
const scenes = $$('.scene')
let current: HTMLElement | null = null

const NOTIFS: Record<string, Notif> = Object.fromEntries(COMPANIES.map((c) => [c.id, c.notif]))
NOTIFS.projects = PROJECTS_NOTIF
let ready = false
const pinged = new Set<string>()

function onScene(scene: HTMLElement) {
  const cs = getComputedStyle(scene)
  const ink = cs.getPropertyValue('--ink').trim()
  const bg = cs.getPropertyValue('--bg').trim()
  const accent = cs.getPropertyValue('--name').trim() || cs.getPropertyValue('--accent').trim()
  hud.style.setProperty('--hud-ink', ink)
  hud.style.setProperty('--hud-bg', bg)
  hud.style.setProperty('--hud-accent', accent)
  document.documentElement.style.setProperty('--hud-accent', accent)
  themeMeta.content = bg
  hudWhere.textContent = scene.dataset.where ?? ''
  const id = scene.id
  // a notification for each screen, once per visit, a moment after you arrive
  const n = NOTIFS[id]
  if (n && ready && !QA && !pinged.has(id)) {
    pinged.add(id)
    const at = id
    setTimeout(() => current?.id === at && notify(n), 1400)
  }
}

function syncHud() {
  const line = 36
  let top = scenes[0]!
  for (const s of scenes) if (s.getBoundingClientRect().top <= line) top = s
  if (top !== current) {
    current = top
    onScene(top)
  }
  const rewinding = top.id === 'rewind'
  hud.classList.toggle('is-rewinding', rewinding && state.rewindYear > 2012 && state.rewindYear < 2026)
  hudYear.textContent = rewinding ? String(state.rewindYear) : top.dataset.year ?? ''
}

/* ——— scroll scenes ——— */
measureBands()
ScrollTrigger.addEventListener('refreshInit', measureBands)
document.fonts.ready.then(measureBands)
heroScene()
rewindScene()
for (const s of $$('.co')) companyScene(s)
projectsScene()
endScene()
mouseParallax(() => current)
spotlight(() => current)

gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } })
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: syncHud, onRefresh: syncHud })

// Mom always gets through. Even Do Not Disturb can't stop Mom.
ScrollTrigger.create({
  trigger: '.end',
  start: 'top 25%',
  once: true,
  onEnter: () => ready && !QA && setTimeout(() => notify(END_NOTIF, { force: true, ms: 7000 }), 900),
})

/* ——— loader → intro ——— */
async function load() {
  const pct = $('#loaderPct')
  const line = $('#loaderLine')
  const shown = { v: 0 }
  let i = 0
  const lines = setInterval(() => (line.textContent = LOADER_LINES[++i % LOADER_LINES.length]!), 650)
  const tick = gsap.to(shown, { v: 90, duration: 2.2, ease: 'power2.out', onUpdate: () => (pct.textContent = String(Math.round(shown.v))) })
  const imgs = $$<HTMLImageElement>('.hero img')
  const decoded = Promise.all([document.fonts.ready, ...imgs.map((im) => im.decode().catch(() => undefined))])
  // returning visitors in the same tab don't need the whole bit again
  const min = session.get('dy-seen') || QA ? 0 : 1300
  await Promise.all([Promise.race([decoded, wait(6000)]), wait(min)])
  tick.kill()
  clearInterval(lines)
  line.textContent = 'Ready. Mostly.'
  await gsap.to(shown, { v: 100, duration: 0.35, onUpdate: () => (pct.textContent = String(Math.round(shown.v))) })
  session.set('dy-seen', '1')
}

async function start() {
  window.scrollTo(0, 0)
  await load()
  ScrollTrigger.refresh()
  const ui = $('#ui')
  initNotifs(ui)
  const out = gsap.timeline()
  out.to('#loader', { yPercent: -100, duration: QA ? 0 : 1.05, ease: 'expo.inOut' })
  out.add(() => {
    $('#loader').remove()
    document.body.classList.remove('is-loading')
    lenis?.start()
  })
  out.add(heroIntro(), QA ? 0 : 0.45)
  await out
  ready = true
  initBot(ui)
  if (QA) {
    // the QA script pokes the humour department directly
    Object.assign(window, { __qa: { gsap, notify, cookieBanner: () => cookieBanner(ui), notifs: { HERO_NOTIF, END_NOTIF, PROJECTS_NOTIF, ...NOTIFS } } })
    document.documentElement.dataset.ready = '1'
    return
  }
  await wait(1600)
  cookieBanner(ui)
  await wait(5200)
  if (current?.id === 'top' && !pinged.has('top')) {
    pinged.add('top')
    notify(HERO_NOTIF)
  }
}

void start()
void refreshStars()

// a late font or image can shift layouts; re-measure once everything settles
window.addEventListener('load', () => ScrollTrigger.refresh())
