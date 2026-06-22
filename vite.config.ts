import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** GitHub Pages and similar hosts use 404.html as the SPA entry on unknown paths */
function spaFallback404() {
  return {
    name: 'spa-fallback-404',
    closeBundle() {
      const index = resolve('dist', 'index.html')
      const notFound = resolve('dist', '404.html')
      if (existsSync(index)) copyFileSync(index, notFound)
    },
  }
}

export default defineConfig({
  plugins: [react(), spaFallback404()],
})
