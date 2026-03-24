/**
 * Scan public/models/*.glb → src/data/models-manifest.json (importé dans le bundle JS).
 * Exécuté automatiquement avant chaque "npm run dev" et "npm run build".
 * Le champ "v" = mtime du fichier en secondes → cache navigateur invalidé quand le fichier change.
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const modelsDir = path.join(root, 'public', 'models')
const outFile = path.join(root, 'src', 'data', 'models-manifest.json')

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true })
}
fs.mkdirSync(path.dirname(outFile), { recursive: true })

/** Ordre d’affichage sur la page (le reste des .glb est trié alphabétiquement après). */
const PREFERRED_ORDER = [
  'blender_convert_leCarthageNice.glb',
  'blender_convert_ARLEQUIN_CAGNES.glb',
]

function sortModelFiles(names) {
  const set = new Set(names)
  const ordered = []
  for (const f of PREFERRED_ORDER) {
    if (set.has(f)) {
      ordered.push(f)
      set.delete(f)
    }
  }
  const rest = [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  return [...ordered, ...rest]
}

const files = sortModelFiles(
  fs.readdirSync(modelsDir).filter((f) => f.toLowerCase().endsWith('.glb'))
).map((f) => {
    const fpath = path.join(modelsDir, f)
    const v = String(Math.floor(fs.statSync(fpath).mtimeMs / 1000))
    return { file: f, v }
  })

const manifest = { files }
fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
console.log(`[models-manifest] ${files.length} fichier(s) → src/data/models-manifest.json`)
