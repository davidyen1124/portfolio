import { defineConfig } from 'vite'

// Served from https://davidyen1124.github.io/portfolio/
export default defineConfig({
  base: '/portfolio/',
  build: { target: 'es2022', assetsInlineLimit: 0 },
})
