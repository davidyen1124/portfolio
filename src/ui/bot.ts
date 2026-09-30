import { gsap } from 'gsap'
import { $, art, el, pick, reduced, session, wait } from '../lib'

// DavidBot™: an "AI assistant" that is a list of regular expressions with low self-esteem.

const MAIL = '<a href="mailto:davidyen1124@gmail.com">davidyen1124@gmail.com</a>'

const INTRO = [
  'Hi! I’m DavidBot™, an AI trained on exactly one résumé and a README.',
  'My context window is about three facts. What would you like to know?',
]

const CHIPS = ['Is David any good?', 'Why should I hire him?', 'Tech stack?', 'Tell me a joke', 'Are you sentient?']

// first match wins, so the specific ones go first
const RULES: [RegExp, string | string[]][] = [
  [/why.*hire|convince|pitch|sell me/i, 'Eleven-plus years across SaaS, marketplaces, ad-tech and social. Makes slow things fast and big things feel small. Also, he built me, and I turned out… fine.'],
  [/hire|job|role|position|available|opening|recruit|contract|interview/i, `Excellent instinct. Email ${MAIL}. I’d forward it myself, but I don’t have hands. Or email.`],
  [/\b(sentient|alive|conscious|feelings?|human|ai|agi|robot)\b/i, 'No. Next question. (Please don’t tell David I hesitated.)'],
  [/salary|money|pay|rate|comp|equity|\$/i, 'I’m not authorized to discuss money. I’m barely authorized to discuss this.'],
  [/r[ée]sum[ée]|\bcv\b/i, 'Here it is: <a href="resume.pdf" target="_blank" rel="noopener">resume.pdf</a>. It’s shorter than this conversation will be.'],
  [/joke|funny|laugh|humou?r/i, [
    'Why do programmers prefer dark mode? Because light attracts bugs.',
    'I’d tell you a UDP joke, but you might not get it.',
    'There are 10 kinds of people: those who understand binary and— you know what, never mind.',
  ]],
  [/stack|tech|skill|language|typescript|javascript|\bjs\b|\bts\b|react|next|node|python|aws|framework/i, 'TypeScript, React, Next.js, Node, some Python and AWS. He also learned GSAP for this website, so if anything bounces, that’s why.'],
  [/cookie/i, 'I’m not allowed to talk about the cookie banner. Legal is still recovering.'],
  [/meeting sdk|video sdk|\bsdk\b/i, 'Per Zoom’s docs: the Meeting SDK embeds the Zoom meeting and webinar experience in an app or website, and the Video SDK gives you video, audio, screen sharing and chat to build your own UI. What David does with them is classified.'],
  [/zoom/i, 'Zoom, since 2025. Something with the Meeting SDK and the Video SDK, for the web. I asked for details and got back a black bar. I respect it.'],
  [/current|currently|right now|nowadays|work(s|ing)? (at|now)|\bjob now\b/i, 'Zoom, since 2025. Meeting SDK, Video SDK, the web. That’s all I have. You didn’t hear it from me. You didn’t hear it from anyone.'],
  [/typeface/i, 'Typeface, 2023 to 2025. Senior engineer. Made the JS bundle 65% smaller. Webpack still hasn’t called back.'],
  [/houzz/i, 'Houzz, 2021 to 2023. Built the “All Results” search. Has seen more kitchen islands than any human should.'],
  [/yahoo/i, 'Yahoo, 2017 to 2021. Made the reports twice as fast. The exclamation mark was already there when he arrived.'],
  [/dcard/i, 'Founding engineer at Dcard. Helped it grow 10×, from 300 users to 3,000. Everyone starts somewhere.'],
  [/choco/i, 'CHOCOLABS: an internship with 90% test coverage. Despite the name, he insists it was mostly Node.js and very little chocolate.'],
  [/spark|android|app/i, 'Sparks Lab was his indie Android label: four apps, 150k+ installs and two national first places. He was a student. It’s a bit much, honestly.'],
  [/side project|project|github|repo|build/i, 'Sixty-plus public repos. Highlights include a temple-divination physics engine and a beaver on a pool float. I don’t make the rules.'],
  [/where|location|live|based|taiwan|taipei|sunnyvale|bay area/i, 'Sunnyvale, California. Originally Taipei. Has opinions about bubble tea and will share them unprompted.'],
  [/contact|email|reach|talk|mail/i, `${MAIL}. He replies faster than Yahoo reports used to.`],
  [/thank|thx|\bty\b/i, 'You’re welcome. This was the highlight of my week. I was deployed this week.'],
  [/bye|goodbye|see ya|later|cya/i, 'Bye! I’ll just… stay here. In the corner. It’s fine.'],
  [/good|great|skilled|talented|smart|legit|best|any good/i, 'He cut a JavaScript bundle by 65% and a build from 60 minutes to 2 seconds. I’m contractually obliged to be impressed, but I genuinely am.'],
  [/\b(hi|hello|hey|yo|sup|hola)\b/i, 'Hi. Hello. Sorry. Hi.'],
]

const FALLBACK = [
  'Great question. I’m going to pretend I didn’t see it.',
  'I asked David. He said “it depends.” He’s a senior engineer.',
  'Hmm. Let me think about that… no.',
  'I don’t know, but I was told to always sound confident, so: TypeScript.',
  'That’s outside my training data, which is one PDF.',
]

function answer(q: string) {
  for (const [re, a] of RULES) if (re.test(q)) return typeof a === 'string' ? a : pick(a)
  return pick(FALLBACK)
}

export function initBot(root: HTMLElement) {
  const face = art('bot').src
  const launch = el<HTMLButtonElement>(`
    <button class="bot-launch" type="button" aria-haspopup="dialog" aria-expanded="false">
      <img src="${face}" alt="" width="42" height="42" /><span>Ask DavidBot™</span><i class="badge" aria-label="1 unread">1</i>
    </button>`)
  root.append(launch)
  // a CSS entrance: GSAP would inline `rotate/scale: none` and flatten the hover wiggle
  launch.classList.add('is-in')

  let panel: HTMLElement | null = null
  let log: HTMLElement
  let asked = 0
  let busy = false
  let tease: HTMLElement | null = null

  const teaseTimer = setTimeout(() => {
    if (panel || session.get('dy-bot')) return
    tease = el('<button class="bot-tease" type="button">psst. I’m an AI. I know things.<br /><small>(three things)</small></button>')
    tease.addEventListener('click', open)
    root.append(tease)
    gsap.from(tease, { y: 20, opacity: 0, scale: 0.9, duration: 0.5, ease: 'back.out(2)', transformOrigin: '100% 100%' })
    setTimeout(() => dropTease(), 7000)
  }, 26000)

  function dropTease() {
    if (!tease) return
    const t = tease
    tease = null
    gsap.to(t, { opacity: 0, y: 10, duration: 0.3, onComplete: () => t.remove() })
  }

  function add(html: string, who: 'bot' | 'me' | 'note') {
    const m = el(`<div class="msg msg--${who}"></div>`)
    if (who === 'me') m.textContent = html
    else m.innerHTML = html
    log.append(m)
    if (!reduced) gsap.from(m, { y: 12, opacity: 0, duration: 0.35, ease: 'power2.out' })
    log.scrollTop = log.scrollHeight
    return m
  }

  async function typing(ms: number) {
    const t = add('<span class="typing" aria-label="DavidBot is typing"><i></i><i></i><i></i></span>', 'bot')
    await wait(ms)
    t.remove()
  }

  async function say(text: string) {
    await typing(Math.min(2300, 650 + text.length * 11))
    add(text, 'bot')
  }

  async function ask(q: string) {
    if (busy || !q.trim()) return
    busy = true
    add(q.trim(), 'me')
    asked++
    const a = answer(q)
    if (asked === 3 && !session.get('dy-bot-awkward')) {
      // once per visit: a long, visible typing session that goes nowhere
      session.set('dy-bot-awkward', '1')
      await typing(2600)
      await wait(900)
      await say(`Sorry, I typed a whole paragraph and deleted it. Anyway: ${a}`)
    } else await say(a)
    busy = false
  }

  function open() {
    dropTease()
    clearTimeout(teaseTimer)
    session.set('dy-bot', '1')
    launch.querySelector('.badge')?.remove()
    if (panel) return
    launch.setAttribute('aria-expanded', 'true')
    launch.style.visibility = 'hidden'
    panel = el(`
      <div class="bot" role="dialog" aria-label="DavidBot chat">
        <div class="bot__head">
          <img src="${face}" alt="" width="44" height="44" />
          <div><b>DavidBot™</b><small>Online · mostly guessing</small></div>
          <button class="bot__close" type="button" aria-label="Close chat">×</button>
        </div>
        <div class="bot__log" data-lenis-prevent aria-live="polite"></div>
        <div class="bot__chips" data-lenis-prevent>${CHIPS.map((c) => `<button type="button">${c}</button>`).join('')}</div>
        <form class="bot__form" autocomplete="off">
          <input name="q" type="text" maxlength="200" placeholder="Ask about David…" aria-label="Your question" />
          <button type="submit">Send</button>
        </form>
        <p class="bot__fine">DavidBot can make mistakes. DavidBot mostly makes mistakes.</p>
      </div>`)
    root.append(panel)
    log = $('.bot__log', panel)
    gsap.from(panel, { y: 40, opacity: 0, scale: 0.96, duration: 0.5, ease: 'expo.out', transformOrigin: '100% 100%' })
    const input = $<HTMLInputElement>('input', panel)
    $('.bot__close', panel).addEventListener('click', close)
    panel.addEventListener('keydown', (e) => e.key === 'Escape' && close())
    $('.bot__chips', panel).addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('button')
      if (b) void ask(b.textContent ?? '')
    })
    $('form', panel).addEventListener('submit', (e) => {
      e.preventDefault()
      const q = input.value
      input.value = ''
      void ask(q)
    })
    if (!matchMedia('(pointer: coarse)').matches) input.focus()
    void (async () => {
      busy = true
      for (const line of INTRO) await say(line)
      busy = false
    })()
  }

  function close() {
    if (!panel) return
    const p = panel
    panel = null
    launch.setAttribute('aria-expanded', 'false')
    gsap.to(p, {
      y: 30,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        p.remove()
        launch.style.visibility = ''
        launch.focus()
      },
    })
  }

  launch.addEventListener('click', open)
}
