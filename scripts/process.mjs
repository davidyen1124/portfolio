// Converts art/raw/*.png into trimmed, responsive WebP files in public/img.
// usage: node scripts/process.mjs [name ...]
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const RAW = 'art/raw'
const OUT = 'public/img'
fs.mkdirSync(OUT, { recursive: true })

const SIZES_JSON = 'src/art-sizes.json'
const sizes = fs.existsSync(SIZES_JSON) ? JSON.parse(fs.readFileSync(SIZES_JSON, 'utf8')) : {}
const args = process.argv.slice(2)
const files = fs
  .readdirSync(RAW)
  .filter((f) => f.endsWith('.png') && (!args.length || args.includes(path.basename(f, '.png'))))

// [suffix, longest edge, quality]
const SIZES = [
  ['', 1200, 82],
  ['-sm', 520, 80],
]

for (const f of files) {
  const name = path.basename(f, '.png')
  // trim the transparent margin so every toy's box hugs its silhouette, then pad a hair
  const trimmed = await sharp(path.join(RAW, f)).trim({ threshold: 2 }).png().toBuffer()
  const meta = await sharp(trimmed).metadata()
  const pad = Math.round(Math.max(meta.width, meta.height) * 0.02)
  const padded = await sharp(trimmed)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  const out = []
  const widths = []
  for (const [suffix, edge, q] of SIZES) {
    const info = await sharp(padded)
      .resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: q, alphaQuality: 90, effort: 6 })
      .toFile(path.join(OUT, name + suffix + '.webp'))
    widths.push(info.width)
    out.push(`${info.width}x${info.height} ${Math.round(info.size / 1024)}KB`)
  }
  // real pixel widths, so srcset's w descriptors tell the truth for tall toys
  sizes[name] = widths
  console.log(name.padEnd(18), out.join('  '))
}
fs.writeFileSync(SIZES_JSON, JSON.stringify(sizes, Object.keys(sizes).sort(), 0).replace(/],/g, '],\n ') + '\n')
