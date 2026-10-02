import { gsap } from 'gsap'
import { PERMISSION } from '../content'
import { el, reduced, session } from '../lib'
import { notify } from './notify'

// Chrome's classic "wants to use your camera and microphone" bubble, for the Zoom screen.
// It is a drawing of a permission prompt. Nothing here touches navigator.mediaDevices.

const MIC =
  '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5.3-3a5.3 5.3 0 0 1-10.6 0H5a7 7 0 0 0 6 6.9V21h2v-3.1a7 7 0 0 0 6-6.9h-1.7Z"/></svg>'
const CAM =
  '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4Z"/></svg>'

export function permissionPrompt(root: HTMLElement) {
  if (session.get('dy-perm')) return
  session.set('dy-perm', '1')
  const host = location.hostname || 'davidyen1124.github.io'
  const p = el(`
    <div class="perm" role="dialog" aria-label="A pretend permission request (nothing is actually requested)">
      <div class="perm__head">
        <span><b></b> wants to</span>
        <button class="perm__x" type="button" aria-label="Close">×</button>
      </div>
      <ul>
        <li>${MIC}<span>Use your microphones</span></li>
        <li>${CAM}<span>Use your cameras</span></li>
      </ul>
      <div class="perm__btns">
        <button class="perm__block" type="button">Block</button>
        <button class="perm__allow" type="button">Allow</button>
      </div>
    </div>`)
  p.querySelector('b')!.textContent = host
  root.append(p)
  gsap.fromTo(
    p,
    { y: reduced ? 0 : -10, opacity: 0, scale: reduced ? 1 : 0.97 },
    { y: 0, opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out', transformOrigin: '30px 0' },
  )

  // Like the notifications, it doesn't wait for an answer forever: it leaves quietly once you
  // scroll on, or after a few seconds of being ignored. Hovering it (desktop) holds it open.
  const LINGER = 8000
  const startY = window.scrollY
  let closed = false
  let timer = window.setTimeout(() => close(), LINGER)
  const onScroll = () => Math.abs(window.scrollY - startY) > window.innerHeight * 0.33 && close()
  window.addEventListener('scroll', onScroll, { passive: true })
  p.addEventListener('pointerenter', () => clearTimeout(timer))
  p.addEventListener('pointerleave', () => {
    clearTimeout(timer)
    timer = window.setTimeout(() => close(), 3000)
  })

  const close = (answer?: keyof typeof PERMISSION) => {
    if (closed) return
    closed = true
    clearTimeout(timer)
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('keydown', onKey)
    gsap.to(p, {
      opacity: 0,
      y: -6,
      duration: 0.18,
      onComplete: () => {
        p.remove()
        // a direct answer to the user, so it gets through Do Not Disturb
        if (answer) notify(PERMISSION[answer], { force: true, ms: 6500 })
      },
    })
  }
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
  document.addEventListener('keydown', onKey)
  p.querySelector('.perm__allow')!.addEventListener('click', () => close('allow'))
  p.querySelector('.perm__block')!.addEventListener('click', () => close('block'))
  p.querySelector('.perm__x')!.addEventListener('click', () => close())
}
