import { COMPANIES, HERO_PROPS, MORE_REPOS, PROJECTS, type Company, type Prop, type Stat } from './content'
import { $, charify, el, imgTag } from './lib'

const GH = 'https://github.com/davidyen1124/'

function propTag(p: Prop, i: number) {
  const vars = [
    `--x:${p.x}`,
    `--y:${p.y}`,
    `--w:${p.w}`,
    p.mx !== undefined ? `--mx:${p.mx}` : '',
    p.my !== undefined ? `--my:${p.my}` : '',
    p.mw !== undefined ? `--mw:${p.mw}` : '',
    `--dur:${(5.2 + ((i * 1.37) % 2.6)).toFixed(2)}s`,
    `--delay:${(-i * 1.1).toFixed(2)}s`,
  ]
    .filter(Boolean)
    .join(';')
  // .prop: placement + scroll parallax · .prop__c: centring (GSAP never touches it) · .prop__in: entrance + mouse
  return `<div class="prop" data-depth="${p.depth}" data-rot="${p.rot ?? 0}" style="${vars}"><div class="prop__c"><div class="prop__in">${imgTag(
    p.img,
    'prop__img',
    `(max-width: 1100px) ${p.mw ?? p.w}vw, ${p.w}vw`,
  )}</div></div></div>`
}

const statValue = (s: Stat) =>
  s.to === undefined ? s.text ?? '' : `${s.prefix ?? ''}${s.dp ? s.to.toFixed(s.dp) : s.to}${s.suffix ?? ''}`

function statTag(s: Stat) {
  const data =
    s.to === undefined
      ? ''
      : ` data-to="${s.to}" data-dp="${s.dp ?? 0}" data-prefix="${s.prefix ?? ''}" data-suffix="${s.suffix ?? ''}"`
  return `<li class="stat"><b class="stat__num${s.to === undefined ? ' is-word' : ''}"${data}>${statValue(s)}</b><span class="stat__label">${s.label}</span></li>`
}

function companyTag(c: Company, i: number) {
  const lines = (c.display ?? c.name).split('<br>')
  const t = c.theme
  const style = `--bg:${t.bg};--ink:${t.ink};--accent:${t.accent};--soft:${t.soft};--name:${t.name ?? t.accent}`
  const tapeWords = [...c.tape, ...c.tape].map((w) => `<span>${w}</span>`).join('')
  return `
  <section class="scene co co--${c.id}${c.mystery ? ' is-mystery' : ''}" id="${c.id}" data-theme="${c.id}" data-year="${c.year}" data-where="${c.where}" style="${style}">
    <div class="stage">
      <div class="pattern pattern--${c.pattern}" aria-hidden="true"></div>
      <div class="props" aria-hidden="true">${c.props.map(propTag).join('')}</div>
      <div class="co__copy safe">
        <p class="co__meta eyebrow"><span class="co__idx">${String(i + 1).padStart(2, '0')} / ${String(COMPANIES.length).padStart(2, '0')}</span><span>${c.when}</span><span>${c.where}</span><span class="co__role">${c.role}</span>${c.mystery ? '<span class="co__rec">● REC</span>' : ''}</p>
        <h2 class="co__name${lines.length > 1 ? ' is-two' : ''}" style="--len:${Math.max(...lines.map((l) => l.replace(/<[^>]+>/g, '').length))}" aria-label="${c.name}">${lines
          .map((l) => `<span class="line" aria-hidden="true"><span class="line__in">${l}</span></span>`)
          .join('')}${c.mystery ? '<span class="redact-bar" aria-hidden="true"><i>Classified</i></span>' : ''}</h2>
        <p class="co__line">${c.line}</p>
        <ul class="co__stats${c.stats.length === 4 ? ' is-four' : ''}" style="--n:${c.stats.length}">${c.stats.map(statTag).join('')}</ul>
        ${c.foot ? `<p class="co__foot">${c.foot}</p>` : ''}
      </div>
      <div class="tape" aria-hidden="true"><div class="tape__in">${tapeWords}</div><div class="tape__in">${tapeWords}</div></div>
    </div>
  </section>`
}

export function renderCompanies() {
  const root = $('#companies')
  // newest first, like a résumé (and LinkedIn): the current job is the first thing after the hero
  root.innerHTML = [...COMPANIES].sort((a, b) => b.year - a.year).map(companyTag).join('')
  for (const h of root.querySelectorAll<HTMLElement>('.co__name .line__in')) charify(h)
}

export function renderHero() {
  $('[data-props="hero"]').innerHTML = HERO_PROPS.map(propTag).join('')
  for (const w of document.querySelectorAll<HTMLElement>('.hero__word')) charify(w)
  // the rubber duck sits on the N. It has seen things.
  const yen = document.querySelectorAll('.hero__word')[1] as HTMLElement
  yen.style.position = 'relative'
  yen.append(
    el(`<span class="hero__duck" aria-hidden="true"><span class="hero__duck-in">${imgTag('hero-duck', 'prop__img', '(max-width: 760px) 26vw, 13vw', '', false)}</span></span>`),
  )
}

export function renderProjects() {
  $('#cards').innerHTML = PROJECTS.map(
    (p, i) => `
    <article class="card" style="--c-bg:${p.bg};--c-ink:${p.ink}" data-tilt="${i % 2 ? 1 : -1}">
      <div class="card__art" aria-hidden="true">${imgTag(p.img, '', '(max-width: 760px) 70vw, 360px')}</div>
      <div class="card__top"><span>${String(i + 1).padStart(2, '0')} · ${p.tags[0]}</span><span class="card__stars" data-stars="${p.repo}" aria-label="${p.stars} GitHub stars">★ ${p.stars}</span></div>
      <h3 class="card__name">${p.name}</h3>
      <p class="card__blurb">${p.blurb}</p>
      <ul class="card__tags">${p.tags.map((t) => `<li>${t}</li>`).join('')}</ul>
      <div class="card__links">${p.live ? `<a href="${p.live}" target="_blank" rel="noopener">Live ↗</a>` : ''}<a href="${GH}${p.repo}" target="_blank" rel="noopener">Code</a></div>
    </article>`,
  ).join('')
  $('#moreList').innerHTML = MORE_REPOS.map(
    (r) => `<li><a href="${GH}${r}" target="_blank" rel="noopener">${r}</a></li>`,
  ).join('')
}

/** Star counts are baked in; if GitHub answers, show the live ones. */
export async function refreshStars() {
  try {
    const res = await fetch('https://api.github.com/users/davidyen1124/repos?per_page=100&type=owner', {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) return
    const repos = (await res.json()) as { name: string; stargazers_count: number }[]
    for (const r of repos) {
      const node = document.querySelector<HTMLElement>(`[data-stars="${r.name}"]`)
      if (node) {
        node.textContent = `★ ${r.stargazers_count}`
        node.setAttribute('aria-label', `${r.stargazers_count} GitHub stars`)
      }
    }
  } catch {
    /* offline, rate-limited, or GitHub is having a day. The baked numbers are fine. */
  }
}
