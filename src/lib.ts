import SIZES from './art-sizes.json'

export const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s)!
export const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)]

export function el<T extends HTMLElement = HTMLElement>(html: string): T {
  const t = document.createElement('template')
  t.innerHTML = html.trim()
  return t.content.firstElementChild as T
}

export const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]!
export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const params = new URLSearchParams(location.search)
/** ?qa turns off smoothing so screenshots land exactly where the test scrolls to. */
export const QA = params.has('qa')
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
export const coarse = matchMedia('(pointer: coarse)').matches

const BASE = import.meta.env.BASE_URL
export const asset = (path: string) => BASE + path
/** A generated toy: two WebP sizes, longest edge 1200px and 520px (see scripts/process.mjs). */
export const art = (name: string) => {
  const [big, sm] = (SIZES as Record<string, number[]>)[name] ?? [1200, 520]
  return {
    src: asset(`img/${name}.webp`),
    srcset: `${asset(`img/${name}-sm.webp`)} ${sm}w, ${asset(`img/${name}.webp`)} ${big}w`,
  }
}

export function imgTag(name: string, cls: string, sizes: string, alt = '', lazy = true) {
  const a = art(name)
  return `<img class="${cls}" src="${a.src}" srcset="${a.srcset}" sizes="${sizes}" alt="${alt}" ${lazy ? 'loading="lazy"' : ''} decoding="async" draggable="false" />`
}

/** Wrap every visible character under `node` in a span.char so it can be animated on its own. */
export function charify(node: HTMLElement) {
  const walk = (n: Node) => {
    for (const child of [...n.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment()
        for (const c of child.textContent!) {
          if (/\s/.test(c)) frag.append(c)
          else {
            const s = document.createElement('span')
            s.className = 'char'
            s.textContent = c
            frag.append(s)
          }
        }
        child.replaceWith(frag)
      } else if (child instanceof HTMLElement && !child.classList.contains('char')) walk(child)
    }
  }
  walk(node)
  return $$('.char', node)
}

export function splitWords(node: HTMLElement) {
  // only splits plain text nodes; inline elements (<mark>, <em>, <a>) are kept whole
  const walk = (n: Node) => {
    for (const child of [...n.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment()
        for (const part of child.textContent!.split(/(\s+)/)) {
          if (!part) continue
          if (/^\s+$/.test(part)) frag.append(part)
          else {
            const s = document.createElement('span')
            s.className = 'w'
            s.textContent = part
            frag.append(s)
          }
        }
        child.replaceWith(frag)
      } else if (child instanceof HTMLElement) {
        child.classList.add('w')
      }
    }
  }
  walk(node)
  return $$('.w', node)
}

export const store = {
  get(key: string) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* private mode: forget it, like a goldfish */
    }
  },
}

export const session = {
  get(key: string) {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      sessionStorage.setItem(key, value)
    } catch {
      /* noop */
    }
  },
}
