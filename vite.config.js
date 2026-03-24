import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** En dev, redirige /site_architecture-archviz1/... vers / pour que les liens GitHub Pages marchent aussi en local. */
const GH_PAGES_PREFIX = '/site_architecture-archviz1'

function devStripGithubPagesPrefix() {
  return {
    name: 'dev-strip-gh-pages-prefix',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url || ''
        const q = raw.includes('?') ? raw.slice(raw.indexOf('?')) : ''
        const pathOnly = q ? raw.slice(0, raw.indexOf('?')) : raw
        if (pathOnly === GH_PAGES_PREFIX || pathOnly.startsWith(`${GH_PAGES_PREFIX}/`)) {
          let rest = pathOnly.slice(GH_PAGES_PREFIX.length) || '/'
          req.url = rest + q
        }
        next()
      })
    },
  }
}

export default defineConfig({
  // Chemins relatifs : fonctionne sur GitHub Pages (sous-dossier), Cloudflare Pages (racine) et en local.
  base: './',
  plugins: [devStripGithubPagesPrefix()],
  server: {
    port: 8080,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        bureau: resolve(__dirname, 'bureau-etudes.html'),
      },
    },
  },
})
