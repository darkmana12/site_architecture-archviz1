import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // Chemins relatifs : OK en local, sur GitHub Pages (sous-dossier) et domaine racine — pas de nom de repo en dur
  base: './',
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
