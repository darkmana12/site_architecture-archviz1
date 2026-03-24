/**
 * Scan public/models/*.glb → public/models-manifest.json
 * Exécuté automatiquement avant chaque "npm run dev" et "npm run build".
 * Le champ "v" = mtime du fichier en secondes → cache navigateur invalidé quand le fichier change.
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const modelsDir = path.join(root, 'public', 'models')
const outFile = path.join(root, 'public', 'models-manifest.json')

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true })
}

const files = fs
  .readdirSync(modelsDir)
  .filter((f) => f.toLowerCase().endsWith('.glb'))
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  .map((f) => {
    const fpath = path.join(modelsDir, f)
    const v = String(Math.floor(fs.statSync(fpath).mtimeMs / 1000))
    return { file: f, v }
  })

const manifest = { files }
fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
console.log(`[models-manifest] ${files.length} fichier(s) → public/models-manifest.json`)
