import { defineConfig } from 'vite'

// The browser app lives in `web/` and imports the library straight from `src/`. It builds to
// `dist-web` (gitignored) and is never published to npm.
export default defineConfig({
  root: 'web',
  base: './',
  build: {
    outDir: '../dist-web',
    emptyOutDir: true,
  },
})
