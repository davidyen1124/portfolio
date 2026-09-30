// Generates every illustration with Codex CLI's built-in image_gen tool.
// usage: node scripts/gen.mjs [--force] [-j 5] [name ...]   (default: every entry in art/manifest.mjs)
// Each entry runs one `codex exec`; the PNG it produces is copied to art/raw/<name>.png.
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ASSETS, STYLE } from '../art/manifest.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const RAW = path.join(ROOT, 'art/raw')
const LOG = path.join(ROOT, 'art/logs')
const GEN = path.join(os.homedir(), '.codex/generated_images')
fs.mkdirSync(RAW, { recursive: true })
fs.mkdirSync(LOG, { recursive: true })

const argv = process.argv.slice(2)
const force = argv.includes('--force')
const jIdx = argv.indexOf('-j')
const jobs = jIdx >= 0 ? Number(argv[jIdx + 1]) : 5
const names = argv.filter((a, i) => !a.startsWith('-') && argv[i - 1] !== '-j')

const todo = ASSETS.filter((a) => (names.length ? names.includes(a.name) : true)).filter(
  (a) => force || !fs.existsSync(path.join(RAW, a.name + '.png')),
)

const brief = (a) =>
  [
    'Use your built-in image_gen tool to create exactly ONE image from the brief below, then reply with just DONE.',
    'Do not write code, do not edit or create files, do not generate more than one image.',
    'This asset MUST have a genuinely transparent background (real alpha channel). Request a transparent background from image_gen and preserve the alpha.',
    '',
    `Canvas: ${a.size}.`,
    '',
    'BRIEF:',
    a.prompt,
    '',
    STYLE,
  ].join('\n')

function run(a) {
  return new Promise((resolve) => {
    const args = ['exec', '--skip-git-repo-check', '-c', 'model_reasoning_effort="low"', '-C', RAW, '--json', '-']
    const t0 = Date.now()
    const p = spawn('codex', args, { stdio: ['pipe', 'pipe', 'pipe'] })
    const out = fs.createWriteStream(path.join(LOG, a.name + '.jsonl'))
    let first = ''
    p.stdout.on('data', (d) => {
      if (!first) first = d.toString()
      out.write(d)
    })
    p.stderr.pipe(fs.createWriteStream(path.join(LOG, a.name + '.err')))
    p.stdin.end(brief(a))
    p.on('close', (code) => {
      out.end()
      const tid = (first.match(/"thread_id":"([^"]+)"/) || [])[1]
      const dir = tid && path.join(GEN, tid)
      const pngs = dir && fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.png')) : []
      const secs = Math.round((Date.now() - t0) / 1000)
      if (pngs.length) {
        const newest = pngs
          .map((f) => path.join(dir, f))
          .sort((x, y) => fs.statSync(y).mtimeMs - fs.statSync(x).mtimeMs)[0]
        fs.copyFileSync(newest, path.join(RAW, a.name + '.png'))
        console.log(`ok   ${a.name.padEnd(18)} ${secs}s`)
      } else console.log(`FAIL ${a.name.padEnd(18)} exit=${code} ${secs}s thread=${tid}`)
      resolve()
    })
  })
}

const queue = [...todo]
console.log(`generating ${queue.length} image(s), ${jobs} at a time`)
await Promise.all(
  Array.from({ length: Math.min(jobs, queue.length) }, async () => {
    while (queue.length) await run(queue.shift())
  }),
)
console.log('all done')
