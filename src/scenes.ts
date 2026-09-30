import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, QA, reduced, splitWords } from './lib'

gsap.registerPlugin(ScrollTrigger)

// Scrubbed timelines lag the scrollbar a touch so the choreography feels weighty.
// QA screenshots want the exact frame instead.
const SCRUB: number | true = QA || reduced ? true : 0.6
const H = () => window.innerHeight
// same breakpoints as the stacked and short-landscape layouts in style.css
const stacked = matchMedia('(max-width: 760px), (orientation: portrait) and (max-width: 1100px)')
const short = matchMedia('(max-height: 500px) and (orientation: landscape)')
const narrow = () => stacked.matches || short.matches
const motion = !reduced

/** Shared by the HUD while the tape fast-forwards. */
export const state = { tapeYear: 2012 }

/*
 Every scene after the hero is `margin-top: -100vh`, so it slides up over the previous
 sticky stage. A scene's own timeline spans three screens of scroll:
   0 → 1  entering (sliding over the last scene)
   1 → 2  on its own
   2 → 3  covered (the next scene slides over it)
*/
function sceneTimeline(section: HTMLElement) {
  return gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: SCRUB,
      invalidateOnRefresh: true,
    },
  })
}

function enter(tl: gsap.core.Timeline, stage: HTMLElement) {
  tl.fromTo(stage, { '--r': '40px' }, { '--r': '0px', duration: 1 }, 0)
}

function covered(tl: gsap.core.Timeline, stage: HTMLElement, at = 2) {
  tl.fromTo(stage, { scale: 1, '--dim': 0 }, { scale: 0.9, '--dim': 0.62, duration: 1, ease: 'power1.in' }, at)
}

/** Near toys travel further than far ones. `from0`: start at the designed spot (the hero).
 *  On phones the toys share a thin band with the copy, so they drift less. */
function parallax(tl: gsap.core.Timeline, stage: HTMLElement, span: number, from0 = false) {
  if (!motion) return
  const amp = () => (narrow() ? 0.1 : 0.3)
  for (const p of $$('.prop', stage)) {
    const d = Number(p.dataset.depth)
    const r = Number(p.dataset.rot)
    tl.fromTo(
      p,
      { y: () => (from0 ? 0 : H() * amp() * d), rotation: from0 ? r : r - 10 * d },
      { y: () => -H() * (from0 ? 0.55 : amp()) * d, rotation: r + 10 * d, duration: span },
      0,
    )
  }
  const pattern = stage.querySelector('.pattern')
  if (pattern) tl.fromTo(pattern, { yPercent: 7 }, { yPercent: -7, duration: span }, 0)
}

function fmt(n: HTMLElement, v: number) {
  const dp = Number(n.dataset.dp)
  return `${n.dataset.prefix}${dp ? v.toFixed(dp) : Math.round(v)}${n.dataset.suffix}`
}

/** Phones: the toys get whatever height the copy leaves free above it. */
export function measureBands() {
  for (const stage of $$('.co .stage')) {
    const first = $('.co__copy', stage).firstElementChild as HTMLElement
    stage.style.setProperty('--band', `${first.offsetTop}px`)
  }
}

/* ——— hero ——— */

export function heroIntro() {
  const tl = gsap.timeline()
  if (!motion) return tl
  tl.from('.hero__name .char', { yPercent: 118, rotation: 12, duration: 1.2, stagger: 0.05, ease: 'expo.out' }, 0)
    .from(
      '.hero .prop__in',
      { scale: 0, rotation: (i: number) => (i % 2 ? 35 : -35), duration: 1.3, stagger: 0.12, ease: 'back.out(1.6)' },
      0.25,
    )
    .from('.hero__duck-in', { yPercent: -260, rotation: -40, opacity: 0, duration: 1.1, ease: 'bounce.out' }, 0.75)
    .from(
      ['.hero__eyebrow', '.hero__lede', '.hero__chips li', '.hero__cue'],
      { y: 26, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out' },
      0.45,
    )
  return tl
}

export function heroScene() {
  const hero = $('.hero')
  const stage = $('.stage', hero)
  const [w1, w2] = $$('.hero__word', hero)
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: SCRUB, invalidateOnRefresh: true },
  })
  parallax(tl, stage, 1, true)
  if (motion) {
    tl.to(w1!, { xPercent: -28, duration: 1 }, 0)
      .to(w2!, { xPercent: 28, duration: 1 }, 0)
      .to('.hero__duck', { y: () => -H() * 0.5, rotation: 50, duration: 1 }, 0)
      .to(['.hero__row', '.hero__eyebrow', '.hero__cue'], { y: () => -H() * 0.12, opacity: 0, duration: 0.5 }, 0)
  }
  covered(tl, stage, 0)
}

/* ——— fast-forward: after the oldest job, the tape runs back up to now ——— */

export function rewindScene() {
  const section = $('.rewind')
  const stage = $('.stage', section)
  const year = $('#rewindYear')
  const tc = $('#rewindTc')
  const yearBox = year.parentElement!
  const tl = sceneTimeline(section)
  enter(tl, stage)
  const counter = { v: 2012 }
  let shown = 2012
  tl.to(
    counter,
    {
      v: 2026,
      duration: 1.15,
      ease: 'power1.inOut',
      onUpdate: () => {
        const y = Math.round(counter.v)
        state.tapeYear = y
        // timecode spins forward with the tape
        const secs = Math.max(0, Math.round((counter.v - 2012) * 3600 * 0.37))
        tc.textContent = `SP ${String(Math.floor(secs / 3600)).padStart(2, '0')}:${String(Math.floor(secs / 60) % 60).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
        if (y !== shown) {
          shown = y
          year.textContent = String(y)
          if (motion) {
            yearBox.classList.add('is-glitch')
            setTimeout(() => yearBox.classList.remove('is-glitch'), 70)
          }
        }
      },
    },
    0.75,
  )
  if (motion) {
    tl.from('.rewind__copy > *', { y: 50, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }, 0.35)
    tl.fromTo(yearBox, { scale: 0.86 }, { scale: 1.06, duration: 1.4 }, 0.6)
  }
  covered(tl, stage)
}

/* ——— companies ——— */

export function companyScene(section: HTMLElement) {
  const stage = $('.stage', section)
  const tl = sceneTimeline(section)
  enter(tl, stage)
  parallax(tl, stage, 3)

  const tape = $$('.tape__in', section)
  tl.fromTo(tape, { xPercent: 0 }, { xPercent: -50, duration: 3 }, 0)

  if (motion) {
    tl.from(
      $$('.prop__in', section),
      { scale: 0.2, opacity: 0, rotation: (i: number) => (i % 2 ? 45 : -45), duration: 0.55, stagger: 0.08, ease: 'back.out(1.5)' },
      0.28,
    )
    tl.from($$('.co__name .char', section), { yPercent: 115, rotation: 9, duration: 0.45, stagger: 0.03, ease: 'power3.out' }, 0.36)
    tl.from($$('.co__meta > *', section), { y: 18, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }, 0.44)
    tl.from(splitWords($('.co__line', section)), { opacity: 0.1, y: 10, duration: 0.3, stagger: 0.01, ease: 'power1.out' }, 0.56)
  }

  $$('.stat', section).forEach((s, i) => {
    const at = 0.7 + i * 0.1
    if (motion) {
      tl.from(s, { y: 34, opacity: 0, duration: 0.3, ease: 'power2.out' }, at)
      tl.fromTo(s, { '--rule': 0 }, { '--rule': 1, duration: 0.45, ease: 'power2.inOut' }, at)
    }
    const num = s.querySelector<HTMLElement>('.stat__num[data-to]')
    // reduced motion: the final numbers are already in the markup
    if (!num || !motion) return
    const to = Number(num.dataset.to)
    const c = { v: 0 }
    num.textContent = fmt(num, 0)
    tl.to(c, { v: to, duration: 0.55, ease: 'power2.out', onUpdate: () => (num.textContent = fmt(num, c.v)) }, at + 0.05)
  })
  // classified: the name sits under a redaction bar until it has fully risen, then gets declassified
  const bar = section.querySelector('.redact-bar')
  if (bar && motion) tl.fromTo(bar, { scaleX: 1 }, { scaleX: 0, duration: 0.35, ease: 'power2.inOut' }, 0.92)
  const foot = section.querySelector('.co__foot')
  if (foot && motion) tl.from(foot, { y: 20, opacity: 0, duration: 0.3, ease: 'power2.out' }, 1.05)

  covered(tl, stage)
  if (motion) tl.to($('.co__copy', section), { y: () => -H() * 0.06, duration: 1 }, 2)
}

/* ——— side projects: a horizontal track pinned by a sticky stage ——— */

export function projectsScene() {
  const section = $('.projects')
  const stage = $('.stage', section)
  const track = $('#track')
  const end = $('.end')
  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)
  // enter (1 screen, over Typeface) + the track + a short hold + covered (1 screen)
  const size = () => (section.style.height = `${Math.round(H() * 2.15 + dist())}px`)
  size()
  ScrollTrigger.addEventListener('refreshInit', size)

  gsap
    .timeline({ scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: SCRUB } })
    .fromTo(stage, { '--r': '40px' }, { '--r': '0px', ease: 'none' }, 0)
    .from('.projects__title span', { yPercent: 60, opacity: 0, stagger: 0.1, ease: 'power3.out', duration: 0.5 }, 0.45)
    .from('.projects__intro > p', { y: 30, opacity: 0, stagger: 0.06, ease: 'power2.out', duration: 0.4 }, 0.55)

  const slide = gsap.to(track, {
    x: () => -dist(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${dist()}`,
      scrub: SCRUB,
      invalidateOnRefresh: true,
    },
  })
  const pattern = stage.querySelector('.pattern')
  if (pattern && motion)
    gsap.to(pattern, {
      xPercent: -8,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${dist()}`, scrub: SCRUB, invalidateOnRefresh: true },
    })

  if (motion) {
    for (const card of $$('.card', section)) {
      const tilt = Number(card.dataset.tilt)
      gsap.fromTo(
        card,
        { rotation: tilt * 7, y: 70 },
        {
          rotation: tilt * 1.5,
          y: 0,
          ease: 'power1.out',
          scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left right', end: 'center 60%', scrub: SCRUB },
        },
      )
      gsap.fromTo(
        $('.card__art img', card),
        { xPercent: 12, rotation: tilt * 10 },
        {
          xPercent: -12,
          rotation: -tilt * 6,
          ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left right', end: 'right left', scrub: SCRUB },
        },
      )
    }
  }

  gsap
    .timeline({ scrollTrigger: { trigger: end, start: 'top bottom', end: 'top top', scrub: SCRUB } })
    .fromTo(stage, { scale: 1, '--dim': 0 }, { scale: 0.9, '--dim': 0.62, ease: 'power1.in' })
}

/* ——— the end ——— */

export function endScene() {
  const end = $('.end')
  const tl = gsap.timeline({ scrollTrigger: { trigger: end, start: 'top bottom', end: 'top top', scrub: SCRUB } })
  tl.fromTo(end, { '--r': '40px' }, { '--r': '0px', ease: 'none', duration: 1 }, 0)
  if (motion) {
    tl.from('.end__title .char', { yPercent: 110, rotation: 8, stagger: 0.02, duration: 0.4, ease: 'power3.out' }, 0.45)
    tl.from(['.end__inner > .eyebrow', '.end__lede', '.end__actions'], { y: 30, opacity: 0, stagger: 0.05, duration: 0.3, ease: 'power2.out' }, 0.55)
  }
}

/* ——— Zoom's spotlight follows the pointer (fine pointers only; otherwise it drifts by itself) ——— */

export function spotlight(getScene: () => HTMLElement | null) {
  if (!motion || !matchMedia('(pointer: fine)').matches) return
  document.documentElement.classList.add('has-pointer')
  window.addEventListener(
    'pointermove',
    (e) => {
      const spot = getScene()?.querySelector<HTMLElement>('.pattern--spot')
      if (!spot) return
      const r = spot.getBoundingClientRect()
      spot.style.setProperty('--spx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
      spot.style.setProperty('--spy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`)
    },
    { passive: true },
  )
}

/* ——— mouse parallax on the toys (fine pointers only) ——— */

export function mouseParallax(getScene: () => HTMLElement | null) {
  if (!motion || !matchMedia('(pointer: fine)').matches) return
  const movers = new Map<HTMLElement, { x: gsap.QuickToFunc; y: gsap.QuickToFunc; d: number }>()
  const mover = (p: HTMLElement) => {
    let m = movers.get(p)
    if (!m) {
      const inner = $('.prop__in', p)
      m = {
        x: gsap.quickTo(inner, 'x', { duration: 0.9, ease: 'power3.out' }),
        y: gsap.quickTo(inner, 'y', { duration: 0.9, ease: 'power3.out' }),
        d: Number(p.dataset.depth),
      }
      movers.set(p, m)
    }
    return m
  }
  window.addEventListener(
    'pointermove',
    (e) => {
      const scene = getScene()
      if (!scene) return
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      for (const p of $$('.prop', scene)) {
        const m = mover(p)
        m.x(-nx * 60 * m.d)
        m.y(-ny * 44 * m.d)
      }
    },
    { passive: true },
  )
}
