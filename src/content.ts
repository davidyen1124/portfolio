// Everything the site says lives here. Facts come from assets/resume.pdf; the jokes do not.

export interface Stat {
  /** Number to count up to. Omit for values that are just words. */
  to?: number
  /** Decimal places while counting. */
  dp?: number
  prefix?: string
  suffix?: string
  /** Shown as-is when `to` is omitted. */
  text?: string
  label: string
}

export interface Theme {
  bg: string
  ink: string
  accent: string
  /** Soft tone for panels and outlines. */
  soft: string
  /** Colour of the giant name. Defaults to accent. */
  name?: string
}

export interface Prop {
  img: string
  /** Position of the object's centre in % of the stage, desktop. */
  x: number
  y: number
  /** Width in vw (desktop) / vw (mobile). */
  w: number
  mw?: number
  /** Mobile overrides. */
  mx?: number
  my?: number
  /** Parallax depth: 0 = far/slow, 1 = near/fast. */
  depth: number
  rot?: number
}

export interface Company {
  id: string
  name: string
  /** How the giant name is broken for layout, if it needs to be. */
  display?: string
  role: string
  when: string
  where: string
  year: number
  theme: Theme
  pattern: 'dots' | 'grid' | 'stripes' | 'checker' | 'rings' | 'lines' | 'spot'
  /** Classified: the name starts redacted and gets declassified as you scroll in. */
  mystery?: boolean
  line: string
  stats: Stat[]
  foot?: string
  /** Keywords on the ticker tape. */
  tape: string[]
  props: Prop[]
  /** Omitted for Zoom, which gets a (fake) camera/mic permission prompt instead. */
  notif?: Notif
}

export interface Notif {
  app: string
  icon: string
  color: string
  title: string
  body: string
}

export const COMPANIES: Company[] = [
  {
    id: 'sparks',
    name: 'Sparks Lab',
    display: 'Sparks<br>Lab',
    role: 'Indie Android Dev',
    when: 'Sep 2012 — Nov 2015',
    where: 'Taipei',
    year: 2012,
    theme: { bg: '#3DDC84', ink: '#073B2A', accent: '#073B2A', soft: '#9CF0C0', name: '#073B2A' },
    pattern: 'dots',
    line: 'Started as a CS student shipping Android apps at night. Some people went to parties. I went to the Google Play Developer Console.',
    stats: [
      { to: 4, label: 'Android apps published' },
      { to: 150, suffix: 'k+', label: 'installs, mostly not my mom' },
      { to: 2, label: 'national 1st-place awards' },
    ],
    foot: 'Mobile Hero 2012 went to <b>Chinese Band</b>. I rebuilt it for the web in 2026 — <a href="https://davidyen1124.github.io/chinese-band/" target="_blank" rel="noopener">play it ↗</a>',
    tape: ['Android', 'Java', 'Google Play', 'Chinese Band', 'Friendly Restaurant Taipei', 'Mobile Hero 2012', 'IDEAS Show 2013'],
    props: [
      { img: 'sparks-phone', x: 78, y: 40, w: 25, mw: 44, mx: 74, my: 25, depth: 0.8, rot: 12 },
      { img: 'sparks-trophy', x: 90, y: 80, w: 14, mw: 26, mx: 86, my: 88, depth: 0.5, rot: -8 },
      { img: 'sparks-guzheng', x: 60, y: 90, w: 19, mw: 34, mx: 22, my: 92, depth: 1, rot: -14 },
      { img: 'sparks-bolt', x: 55, y: 21, w: 10, mw: 18, mx: 90, my: 8, depth: 0.3, rot: 18 },
    ],
    notif: {
      app: 'Google Play Console',
      icon: '▶',
      color: '#073B2A',
      title: 'New review: ★☆☆☆☆',
      body: '“Works perfectly. One star because I don’t believe in five.”',
    },
  },
  {
    id: 'dcard',
    name: 'Dcard',
    role: 'Founding Engineer',
    when: 'Dec 2013 — Nov 2015',
    where: 'Taipei',
    year: 2013,
    theme: { bg: '#006AA6', ink: '#FFFFFF', accent: '#9FD4F2', soft: '#3397CF', name: '#FFFFFF' },
    pattern: 'grid',
    line: 'Joined as a founding engineer when every user could fit in one lecture hall. Re-architected the forum so they wouldn’t have to.',
    stats: [
      { to: 10, suffix: '×', label: 'user growth, 300 → 3,000' },
      { to: 2, suffix: '×', label: 'page views from the modal viewer' },
      { to: 1, prefix: '−', suffix: 's', label: 'off every page render' },
      { to: 3, label: 'AWS zones of push notifi\u00ADcations' }, // soft hyphen: four stats share a 320px phone
    ],
    tape: ['Node.js', 'Redis', 'MongoDB', 'AWS × 3 zones', 'Push notifications', 'Modal viewer', '300 → 3,000'],
    props: [
      { img: 'dcard-card', x: 80, y: 38, w: 22, mw: 40, mx: 76, my: 22, depth: 0.8, rot: -10 },
      { img: 'dcard-bell', x: 92, y: 78, w: 13, mw: 24, mx: 88, my: 90, depth: 1, rot: 14 },
      { img: 'dcard-clock', x: 60, y: 82, w: 13, mw: 26, mx: 16, my: 92, depth: 0.6, rot: -6 },
      { img: 'dcard-plane', x: 56, y: 21, w: 13, mw: 22, mx: 22, my: 10, depth: 0.35, rot: 8 },
    ],
    notif: {
      app: 'Dcard',
      icon: 'D',
      color: '#006AA6',
      title: 'It’s midnight. Your new card is here.',
      body: 'It’s a push notification about push notifications.',
    },
  },
  {
    id: 'chocolabs',
    name: 'CHOCOLABS',
    display: 'CHOCO<br>LABS',
    role: 'R&D Intern',
    when: 'Jul 2014 — Apr 2015',
    where: 'Taipei',
    year: 2014,
    theme: { bg: '#3B2016', ink: '#FFF1E0', accent: '#FF8FB1', soft: '#7B4A2D', name: '#FF8FB1' },
    pattern: 'checker',
    line: 'An internship at a company named after chocolate. Wrote Node.js tests like the candy depended on it, and moved a music app onto Express + MongoDB.',
    stats: [
      { to: 90, suffix: '%', label: 'test coverage on the V.S. forum backend' },
      { to: 10, suffix: '×', label: 'iMusee users, 1k → 10k' },
      { text: 'Express', label: '+ MongoDB, the migration that did it' },
    ],
    tape: ['Node.js', 'Express', 'MongoDB', '90% coverage', 'iMusee', 'V.S. forum', '1k → 10k'],
    props: [
      { img: 'choco-bar', x: 80, y: 36, w: 23, mw: 40, mx: 76, my: 22, depth: 0.8, rot: 14 },
      { img: 'choco-vinyl', x: 91, y: 80, w: 16, mw: 28, mx: 86, my: 90, depth: 1, rot: -12 },
      { img: 'choco-headphones', x: 60, y: 88, w: 15, mw: 28, mx: 18, my: 92, depth: 0.55, rot: 8 },
      { img: 'choco-tube', x: 57, y: 24, w: 10, mw: 17, mx: 90, my: 6, depth: 0.3, rot: -24 },
    ],
    notif: {
      app: 'Test Runner',
      icon: '✓',
      color: '#7B4A2D',
      title: '90% passing',
      body: 'The other 10% are “flaky”. We don’t talk about them.',
    },
  },
  {
    id: 'yahoo',
    name: 'Yahoo',
    display: 'Yahoo<span class="bang">!</span>',
    role: 'Senior Software Engineer',
    when: 'Feb 2017 — Sep 2021',
    where: 'Bay Area',
    year: 2017,
    theme: { bg: '#6001D2', ink: '#FFFFFF', accent: '#C8A8FF', soft: '#7E1FFF', name: '#FFFFFF' },
    pattern: 'rings',
    line: 'Moved to California and joined the company with the exclamation mark. Spent four and a half years making ad reports arrive before anyone forgot why they asked.',
    stats: [
      { to: 50, suffix: '%', label: 'less time waiting on reports' },
      { to: 4.5, dp: 1, suffix: ' yrs', label: 'of being purple' },
      { text: 'Self-serve', label: 'cohort reports, no ticket required' },
    ],
    tape: ['React', 'Java', 'Async services', 'Campaign Insights', 'Cohort reports', 'Anomaly detection', 'Data quality'],
    props: [
      { img: 'yahoo-bang', x: 84, y: 45, w: 12, mw: 26, mx: 82, my: 22, depth: 0.8, rot: 12 },
      { img: 'yahoo-chart', x: 64, y: 86, w: 18, mw: 32, mx: 20, my: 91, depth: 0.6, rot: -6 },
      { img: 'yahoo-hourglass', x: 92, y: 80, w: 12, mw: 22, mx: 88, my: 88, depth: 1, rot: 18 },
      { img: 'yahoo-magnifier', x: 58, y: 23, w: 14, mw: 24, mx: 36, my: 8, depth: 0.35, rot: -16 },
    ],
    notif: {
      app: 'Yahoo Mail',
      icon: 'Y!',
      color: '#6001D2',
      title: 'You have (1) new message',
      body: 'It’s from 2009. It says “FW: FW: FW: funny”.',
    },
  },
  {
    id: 'houzz',
    name: 'Houzz',
    role: 'Software Engineer',
    when: 'Sep 2021 — Jun 2023',
    where: 'Bay Area',
    year: 2021,
    theme: { bg: '#F8F6F2', ink: '#222222', accent: '#3E9A10', soft: '#E8E5DC', name: '#4DBC15' },
    pattern: 'lines',
    line: 'Two years at the place people go to stare at kitchens they will never afford. Rebuilt the home feed in TypeScript and taught search to look everywhere at once.',
    stats: [
      { to: 1, label: 'search box for all results' },
      { text: 'LCP↓', label: 'photo pages, via preconnect + lazy hydration' },
      { to: 1, suffix: '-click', label: 'A/B experiments in Prismic' },
    ],
    tape: ['TypeScript', 'React', 'Unified search', 'Prismic CMS', 'A/B tests', 'Lazy hydration', 'LCP'],
    props: [
      { img: 'houzz-sofa', x: 78, y: 42, w: 28, mw: 48, mx: 72, my: 24, depth: 0.7, rot: -4 },
      { img: 'houzz-lamp', x: 93, y: 66, w: 14, mw: 26, mx: 90, my: 86, depth: 1, rot: 4 },
      { img: 'houzz-plant', x: 60, y: 86, w: 15, mw: 26, mx: 16, my: 90, depth: 0.55, rot: 6 },
      { img: 'houzz-house', x: 57, y: 21, w: 12, mw: 22, mx: 26, my: 8, depth: 0.3, rot: -8 },
    ],
    notif: {
      app: 'Houzz',
      icon: 'h',
      color: '#4DBC15',
      title: 'Someone saved 412 photos',
      body: 'All of the same kitchen island. It’s going great for them.',
    },
  },
  {
    id: 'typeface',
    name: 'Typeface',
    role: 'Senior Software Engineer',
    when: 'Nov 2023 — 2025',
    where: 'Bay Area',
    year: 2023,
    theme: { bg: '#FD243E', ink: '#111013', accent: '#111013', soft: '#FF6B7D', name: '#111013' },
    pattern: 'stripes',
    line: 'Made an enterprise AI marketing platform feel fast. Deleted two-thirds of the JavaScript and nobody noticed, which was the whole point.',
    stats: [
      { to: 65, prefix: '−', suffix: '%', label: 'JS bundle, code-split + lazy loaded' },
      { text: '60m→2s', label: 'marketing site builds with Next.js ISR' },
      { to: 2, suffix: '×', label: 'release cadence with CMS landing pages' },
    ],
    foot: 'Also: shipped the Canva plugin that helped close a major enterprise deal, and won the <b>2024 Typeface Hackathon</b>.',
    tape: ['Next.js', 'GraphQL', 'ISR', 'WebSockets', 'Code-splitting', 'Canva plugin', 'Infinite canvas', 'Hackathon 2024'],
    props: [
      { img: 'tf-cursor', x: 83, y: 40, w: 17, mw: 30, mx: 84, my: 20, depth: 0.9, rot: -8 },
      { img: 'tf-clamp', x: 64, y: 84, w: 19, mw: 34, mx: 22, my: 91, depth: 0.6, rot: 6 },
      { img: 'tf-canvas', x: 91, y: 80, w: 16, mw: 28, mx: 86, my: 89, depth: 1, rot: 10 },
      { img: 'tf-rosette', x: 57, y: 22, w: 11, mw: 20, mx: 50, my: 7, depth: 0.35, rot: -12 },
    ],
    notif: {
      app: 'Webpack',
      icon: '⬡',
      color: '#111013',
      title: 'Bundle is 65% smaller',
      body: 'Webpack is taking some time off to process this.',
    },
  },
  {
    id: 'zoom',
    name: 'Zoom',
    role: '<span class="redact" tabindex="0" title="Classified">Engineer</span> Engineer',
    when: '2025 — now',
    where: 'Classified',
    year: 2025,
    mystery: true,
    theme: { bg: '#00031F', ink: '#D1DEF2', accent: '#0B5CFF', soft: '#00053D', name: '#0B5CFF' },
    pattern: 'spot',
    line: 'Joined in 2025. Something to do with Zoom’s Meeting SDK and Video SDK for the web, which is about all I’m allowed to say. The rest is <span class="redact" tabindex="0">still on mute</span>.',
    stats: [
      { text: 'Meeting SDK', label: 'Zoom meetings & webinars, embedded in other apps' },
      { text: 'Video SDK', label: 'video, audio & screen share for your own UI' },
      { text: '<span class="redact" tabindex="0">nice try</span>', label: 'numbers pending declassification' },
    ],
    foot: 'Full details once I’m allowed to share them. Until then, please enjoy this <b>very mysterious webcam</b>.',
    tape: ['Meeting SDK', 'Video SDK', 'For the web', '[REDACTED]', 'You’re on mute', 'Camera on', '2025 → now'],
    props: [
      { img: 'zoom-camera', x: 80, y: 40, w: 21, depth: 0.8, rot: -6 },
      { img: 'zoom-tiles', x: 63, y: 84, w: 18, depth: 0.6, rot: 5 },
      { img: 'zoom-mic', x: 92, y: 80, w: 11, depth: 1, rot: 10 },
      { img: 'zoom-folder', x: 57, y: 22, w: 11, depth: 0.35, rot: -10 },
    ],
  },
]

export interface Project {
  repo: string
  name: string
  img: string
  blurb: string
  tags: string[]
  live?: string
  stars: number
  bg: string
  ink: string
}

export const PROJECTS: Project[] = [
  {
    repo: 'jiaobei',
    name: '擲筊 Jiaobei',
    img: 'p-jiaobei',
    blurb: 'Ask the gods a yes/no question. A 240 Hz physics engine answers. The gods have not complained about latency.',
    tags: ['three.js', 'Rapier'],
    live: 'https://davidyen1124.github.io/jiaobei/',
    stars: 1,
    bg: '#FF4A1C',
    ink: '#111111',
  },
  {
    repo: 'caltrain-mcp',
    name: 'Caltrain MCP',
    img: 'p-train',
    blurb: 'Caltrain timetables as a remote MCP server, so your AI can also just miss the 5:12.',
    tags: ['Next.js', 'MCP'],
    live: 'https://caltrain-mcp-rho.vercel.app',
    stars: 10,
    bg: '#E9E4DA',
    ink: '#111111',
  },
  {
    repo: 'chinese-band',
    name: 'Chinese Band',
    img: 'p-gong',
    blurb: 'Guzheng and opera percussion you can play in the browser. The award-winning 2012 Android app, fourteen years later.',
    tags: ['TypeScript', 'Web Audio'],
    live: 'https://davidyen1124.github.io/chinese-band/',
    stars: 1,
    bg: '#FFD23F',
    ink: '#111111',
  },
  {
    repo: 'taiwan-weather-live',
    name: 'Taiwan Weather',
    img: 'p-cloud',
    blurb: 'A pixel-faithful web version of the 天氣預報 iOS app. Forecast for Taipei: humid, with a chance of humid.',
    tags: ['TypeScript', 'Vite'],
    live: 'https://davidyen1124.github.io/taiwan-weather-live/',
    stars: 2,
    bg: '#3D8BFF',
    ink: '#FFFFFF',
  },
  {
    repo: 'beaver-bounce',
    name: 'Beaver Bounce',
    img: 'p-beaver',
    blurb: 'One beaver. One pool float. Absolutely no brakes. A DVD-logo screensaver for people still waiting on the corner hit.',
    tags: ['React', 'Vite'],
    live: 'https://davidyen1124.github.io/beaver-bounce/',
    stars: 2,
    bg: '#FF8FB1',
    ink: '#111111',
  },
  {
    repo: 'infinite-neck',
    name: 'Infinite Neck',
    img: 'p-neck',
    blurb: 'Scroll, and one calm guy grows an unreasonable amount of neck. This is the same technology as this website.',
    tags: ['JavaScript', 'Scroll'],
    live: 'https://davidyen1124.github.io/infinite-neck/',
    stars: 1,
    bg: '#9CF0C0',
    ink: '#111111',
  },
  {
    repo: 'fortune-cookie',
    name: 'Fortune Cookie',
    img: 'p-fortune',
    blurb: 'The best part of Chinese takeout, minus the takeout. A real scanned cookie, real physics, and fortunes picked by Math.random(), which is about as qualified.',
    tags: ['three.js', 'Rapier'],
    live: 'https://davidyen1124.github.io/fortune-cookie/',
    stars: 1,
    bg: '#C8A8FF',
    ink: '#111111',
  },
  {
    repo: 'Facebot',
    name: 'Facebot',
    img: 'p-robot',
    blurb: 'An unofficial Facebook API from 2014. Still my most-starred repo. I peaked early and I’ve made peace with it.',
    tags: ['Python'],
    stars: 112,
    bg: '#2D5BFF',
    ink: '#FFFFFF',
  },
  {
    repo: 'fireworks',
    name: 'Fireworks',
    img: 'p-rocket',
    blurb: 'Click to explode things. Digitally. The fire department has been informed and was not interested.',
    tags: ['JavaScript', 'Canvas'],
    live: 'https://davidyen1124.github.io/fireworks/',
    stars: 4,
    bg: '#7CE0FF',
    ink: '#111111',
  },
  {
    repo: 'some-overly-unnecessary-project',
    name: 'Soup, in 3D',
    img: 'p-soup',
    blurb: 'A GPU-melting scene of swirling soup bowls. Nobody asked. The soup was served anyway.',
    tags: ['React', 'Three.js'],
    live: 'https://davidyen1124.github.io/some-overly-unnecessary-project/',
    stars: 2,
    bg: '#FFB23F',
    ink: '#111111',
  },
]

/** The rest of the pile, all public. */
export const MORE_REPOS = [
  'arithmetic-as-a-service',
  'mrt-app',
  'pixel-eyes',
  'citrus-stare',
  'cursed-face',
  'manhattan-loudness',
  'beaveragent',
  'ultra-short',
  'taiwan-satellite-viewer',
  'totp-website',
  'bug-match',
  'decision-tree',
  'winter-solstice',
  'paranormal-ish',
  'extremely-normal-readings',
  'overthinking-dinner',
  'cowculator',
  'third-time-charm',
  'pizza-party',
  'bug-bash',
  'cat-poop',
  'boombox',
  'pixel-alchemist',
  'eraser-dsl-omg-so-fancy',
  'museum-dot-map',
]

export const HERO_PROPS: Prop[] = [
  { img: 'hero-laptop', x: 70, y: 33, w: 18, mw: 44, mx: 70, my: 29, depth: 0.6, rot: -6 },
  { img: 'hero-boba', x: 11, y: 33, w: 9, mw: 22, mx: 16, my: 26, depth: 0.9, rot: 10 },
  { img: 'hero-keycap', x: 37, y: 26, w: 7.5, mw: 15, mx: 42, my: 22, depth: 0.35, rot: -14 },
]

/** What the fake Chrome camera/mic prompt on the Zoom screen says after you answer it.
 *  It is plain HTML: nothing ever calls getUserMedia, so nothing is ever turned on. */
export const PERMISSION = {
  allow: {
    app: 'Zoom',
    icon: '●',
    color: '#0B5CFF',
    title: 'Joined with video. Kind of.',
    body: 'Nothing was turned on. This is a static website, it can’t see you. You are, however, still on mute.',
  },
  block: {
    app: 'Chrome',
    icon: '⊘',
    color: '#5F6368',
    title: 'Camera and microphone blocked',
    body: 'Fair. The very mysterious webcam respects your boundaries.',
  },
} satisfies Record<string, Notif>

export const HERO_NOTIF: Notif = {
  app: 'LinkedIn',
  icon: 'in',
  color: '#0A66C2',
  title: 'Recruiter: “Hi Dvaid!!”',
  body: 'Saw your profile. You’d be perfect for a role you are wildly overqualified for.',
}

export const PROJECTS_NOTIF: Notif = {
  app: 'GitHub',
  icon: '★',
  color: '#111111',
  title: 'Someone starred your repo!',
  body: 'It was you. From your other laptop.',
}

export const END_NOTIF: Notif = {
  app: 'Mom',
  icon: '♥',
  color: '#FF4A1C',
  title: 'you put your website online?',
  body: 'ok. very nice. are you eating?',
}

export const LOADER_LINES = [
  'Compiling personality (tsc --strict)…',
  'Tree-shaking the bad jokes…',
  'Rehydrating (drinking water)…',
  'Removing unused JavaScript (most of it)…',
  'Asking the rubber duck…',
]
