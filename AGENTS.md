# Agent notes

A scroll-driven portfolio: TypeScript + Vite + GSAP ScrollTrigger + Lenis, deployed to GitHub Pages at https://davidyen1124.github.io/portfolio/ (Vite `base: '/portfolio/'`). There is no custom domain. Keep it that way.

## Layout of the code

- `src/content.ts`: every word, number, colour and toy position. Facts must match `public/resume.pdf`. Jokes are welcome, but only when they are obviously jokes.
- `src/render.ts`: builds the company screens, hero toys and project cards from the content.
- `src/scenes.ts`: all scroll choreography. Each scene after the hero has `margin-top: -100vh` and a sticky `.stage`, so it slides over the previous one. A scene's timeline spans three screens: entering, alone, covered.
- `src/ui/`: the fake notifications, cookie banner and DavidBot.
- `art/manifest.mjs` + `scripts/gen.mjs`: images come from Codex CLI's `image_gen`. `scripts/process.mjs` writes `public/img/*.webp` and `src/art-sizes.json`.

## Gotchas that already bit once

- GSAP inlines `translate/rotate/scale: none` on every element it animates. Never rely on those CSS properties on an animated element. Centre toys with the `.prop__c` wrapper, and put hover effects on elements GSAP doesn't touch.
- Never put a CSS `transition` on `transform` for an element GSAP tweens: GSAP will read the mid-transition value.
- `srcset` with `w` descriptors makes an image's intrinsic size come from `sizes`, so size toys with `width: 100%`, never `auto`.
- `[hidden]` loses to any `display:` rule; add an explicit `[hidden] { display: none }`.
- Phones and portrait tablets use the stacked layout; the breakpoint is duplicated in `style.css` and `scenes.ts` (`stacked`).

## Before pushing

```bash
npm run build
npm run dev -- --port 5199 &   # then:
npm run qa -- --vp desktop,tablet,mobile,small
node scripts/qa-ui.mjs
```

Both should report zero issues, then look at the contact sheets in `qa-shots/`.
