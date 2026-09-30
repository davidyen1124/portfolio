import { gsap } from 'gsap'
import type { Notif } from '../content'
import { el, reduced } from '../lib'

// Fake OS notifications. They come from apps that are not installed, about things that
// already happened, and they can be silenced (mostly).

let box: HTMLElement
let dnd = false
let shown = 0

export function initNotifs(root: HTMLElement) {
  box = el('<div class="notifs" aria-live="polite"></div>')
  root.append(box)
}

function dismiss(node: HTMLElement) {
  if (node.dataset.gone) return
  node.dataset.gone = '1'
  gsap.to(node, {
    x: reduced ? 0 : 80,
    opacity: 0,
    duration: 0.35,
    ease: 'power2.in',
    onComplete: () => node.remove(),
  })
}

/** `force` gets through Do Not Disturb. Only mothers and legal departments may use it. */
export function notify(n: Notif, { force = false, ms = 5600 } = {}) {
  if (!box || (dnd && !force)) return
  shown++
  const offerDnd = !dnd && shown === 3
  const node = el(`
    <div class="notif" role="status">
      <span class="notif__icon" style="background:${n.color}">${n.icon}</span>
      <span class="notif__app">${n.app}</span>
      <span class="notif__time">now</span>
      <span class="notif__text"><b>${n.title}</b>${n.body}</span>
      ${offerDnd ? '<button class="notif__dnd" type="button">Turn on Do Not Disturb</button>' : ''}
    </div>`)
  box.prepend(node)
  const extra = [...box.children].slice(2) as HTMLElement[]
  extra.forEach(dismiss)
  gsap.fromTo(
    node,
    { x: reduced ? 0 : 70, opacity: 0, scale: 0.97 },
    { x: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' },
  )
  let timer = setTimeout(() => dismiss(node), offerDnd ? ms + 3000 : ms)
  node.addEventListener('mouseenter', () => clearTimeout(timer))
  node.addEventListener('mouseleave', () => (timer = setTimeout(() => dismiss(node), 2200)))
  node.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.notif__dnd')) {
      dnd = true
      dismiss(node)
      setTimeout(
        () =>
          notify(
            { app: 'Focus', icon: '☾', color: '#5b3fd1', title: 'Do Not Disturb is on', body: 'Notifications silenced. Your mom can still get through.' },
            { force: true, ms: 4200 },
          ),
        380,
      )
      return
    }
    dismiss(node)
  })
}
