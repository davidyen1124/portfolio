import { gsap } from 'gsap'
import { $, art, el, reduced, store } from '../lib'
import { notify } from './notify'

// The cookie banner. There are no cookies. There is no tracking. There is, however, a banner.

const KEY = 'dy-cookies'

function rain(count: number) {
  if (reduced) return
  const { src } = art('cookie')
  for (let i = 0; i < count; i++) {
    const c = el<HTMLImageElement>(`<img class="cookie-fall" src="${src}" alt="" aria-hidden="true" />`)
    document.body.append(c)
    const size = gsap.utils.random(46, 96)
    const x = gsap.utils.random(-40, window.innerWidth - 20)
    gsap.set(c, { width: size, x, y: -140, rotation: gsap.utils.random(-180, 180) })
    gsap.to(c, {
      y: window.innerHeight + 160,
      x: x + gsap.utils.random(-120, 120),
      rotation: `+=${gsap.utils.random(-360, 360)}`,
      duration: gsap.utils.random(1.3, 2.5),
      delay: i * 0.06 + gsap.utils.random(0, 0.3),
      ease: 'power1.in',
      onComplete: () => c.remove(),
    })
  }
}

export function cookieBanner(root: HTMLElement) {
  if (store.get(KEY)) return
  const { src } = art('cookie')
  const c = el(`
    <div class="cookie" role="dialog" aria-label="Cookie consent">
      <img class="cookie__img" src="${src}" alt="" width="92" height="88" />
      <b class="cookie__title">This portfolio uses cookies.</b>
      <p class="cookie__msg">Not the tracking kind. There’s no analytics on this site. David just really likes cookies, and legal said we had to tell you.</p>
      <div class="cookie__prefs" hidden>
        <label><input type="checkbox" checked data-k="necessary" /> <span>Strictly necessary <em>(chocolate chip)</em></span></label>
        <label><input type="checkbox" checked data-k="perf" /> <span>Performance <em>(they help David perform)</em></span></label>
        <label><input type="checkbox" disabled /> <span>Marketing <em>(no budget, sorry)</em></span></label>
      </div>
      <div class="cookie__btns">
        <button class="pill pill--solid" type="button" data-a="accept">Accept all</button>
        <button class="pill" type="button" data-a="awkward">Accept, awkwardly</button>
        <button class="pill pill--ghost" type="button" data-a="reject">Reject</button>
      </div>
      <button class="linkish" type="button" data-a="manage">Manage preferences</button>
    </div>`)
  root.append(c)
  gsap.fromTo(c, { y: 60, opacity: 0, rotation: -2 }, { y: 0, opacity: 1, rotation: 0, duration: 0.8, ease: 'expo.out' })

  const msg = $('.cookie__msg', c)
  const close = (delay = 0) => {
    c.querySelectorAll('button').forEach((b) => (b.disabled = true))
    gsap.to(c, { y: 80, opacity: 0, duration: 0.45, delay, ease: 'power2.in', onComplete: () => c.remove() })
  }

  $('input[data-k="necessary"]', c).addEventListener('change', (e) => {
    const box = e.target as HTMLInputElement
    const note = box.parentElement!.querySelector('em')!
    if (!box.checked) {
      note.textContent = '(nice try)'
      setTimeout(() => (box.checked = true), 350)
    }
  })
  $('input[data-k="perf"]', c).addEventListener('change', (e) => {
    const box = e.target as HTMLInputElement
    box.parentElement!.querySelector('em')!.textContent = box.checked
      ? '(they help David perform)'
      : '(David is fine. David is totally fine.)'
  })

  c.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a
    if (!a) return
    if (a === 'manage') {
      const prefs = $('.cookie__prefs', c)
      prefs.hidden = !prefs.hidden
      $('[data-a="manage"]', c).textContent = prefs.hidden ? 'Manage preferences' : 'Hide preferences (they can’t really be managed)'
      return
    }
    store.set(KEY, a)
    if (a === 'accept') {
      rain(18)
      notify(
        { app: 'Legal', icon: '§', color: '#111111', title: 'Cookies accepted', body: 'They are being delivered physically. Please stand clear.' },
        { force: true },
      )
      close()
    } else if (a === 'awkward') {
      msg.textContent = 'Okay. Cool. Cool cool cool. …Great talk.'
      if (!reduced) gsap.fromTo(c, { rotation: -1.5 }, { rotation: 1.5, duration: 0.09, repeat: 7, yoyo: true, ease: 'sine.inOut', clearProps: 'rotation' })
      close(1.8)
    } else {
      msg.textContent = 'Understandable. I’ll eat them myself.'
      $('.cookie__img', c).classList.add('is-bitten')
      close(1.7)
    }
  })
}
