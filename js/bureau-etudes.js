import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import manifest from '../src/data/models-manifest.json'
import modelsInfo from '../src/data/models-info.json'

// ─── Génération des blocs depuis le manifeste ────────────────────────────────

const DESC_VIEWER =
  '<span class="op-desc-visu">Visionneuse\u00a03D</span>\u00a0:<br>Rotate\u00a0: Clic gauche<br>Zoom\u00a0: Molette<br>D\u00e9placer\u00a0: Clic droit'

function cleanTitle(filename) {
  return filename
    .replace(/\.glb$/i, '')
    .replace(/^(blender_convert_|blender_|convert_)/i, '')
    .replace(/[_-]+/g, ' ')
    .trim()
}

function buildBlock(entry, index) {
  const { file, v, title, location, description } = entry
  const num = String(index + 1).padStart(2, '0')
  const displayTitle = title || cleanTitle(file)
  const displayLoc = location || ''
  const displayDesc = description ? `${description}<br><br>${DESC_VIEWER}` : DESC_VIEWER
  const ariaLabel = `${displayTitle}${displayLoc ? ` \u2014 ${displayLoc}` : ''} \u2014 mod\u00e8le 3D`

  const item = document.createElement('div')
  item.className = 'op-item'
  item.dataset.op = ''
  item.innerHTML = `
    <span class="op-num">${num}</span>
    <div class="op-inner">
      <div class="op-img">
        <div class="op-img-inner">
          <div class="be-viewport be-loading"
               data-model-file="${file}"
               ${v ? `data-model-v="${v}"` : ''}
               role="img"
               aria-label="${ariaLabel}"></div>
        </div>
      </div>
      <div class="op-info">
        ${displayLoc ? `<p class="op-cat">${displayLoc}</p>` : ''}
        <h2 class="op-title">${displayTitle}</h2>
        <div class="op-rule"></div>
        <p class="op-desc">${displayDesc}</p>
      </div>
    </div>`
  return item
}

// ─── Animations (observer d'entrée + hover) ──────────────────────────────────

function setupItemObservers(container) {
  container.querySelectorAll('.op-item').forEach((el) => {
    el.addEventListener('mouseenter', () => el.classList.add('frame-hover'))
    el.addEventListener('mouseleave', () => el.classList.remove('frame-hover'))
  })

  const opObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        const item = e.target
        const ic = item.querySelector('.op-img')
        const inner = item.querySelector('.op-img-inner')
        if (ic) ic.classList.add('revealing')
        if (inner) setTimeout(() => inner.classList.add('open'), 80)
        item.classList.add('inview')
        opObs.unobserve(item)
      })
    },
    { threshold: 0.2 }
  )

  container.querySelectorAll('[data-op]').forEach((el) => opObs.observe(el))
}

// ─── Viewer 3D ───────────────────────────────────────────────────────────────

function fitCameraToContent(camera, controls, object, margin = 1.35) {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 0.001)
  const dist = maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360))
  const offset = dist * margin
  camera.position.set(center.x + offset * 0.65, center.y + offset * 0.45, center.z + offset)
  camera.near = Math.max(maxDim / 200, 0.001)
  camera.far = maxDim * 200
  camera.updateProjectionMatrix()
  controls.target.copy(center)
  controls.update()
}

function createViewer(container) {
  const file = (container.dataset.modelFile || '').trim()
  const v = (container.dataset.modelV || '').trim()
  if (!file) {
    container.classList.remove('be-loading')
    container.classList.add('be-error')
    container.textContent = 'Fichier .glb non spécifié.'
    return
  }

  const src = publicAssetUrl(v ? `models/${file}?v=${v}` : `models/${file}`)
  const width = container.clientWidth || 800
  const height = container.clientHeight || 450

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2e2a26)

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.01, 500000)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06

  const amb = new THREE.AmbientLight(0xffffff, 0.55)
  const keyLight = new THREE.DirectionalLight(0xfff4e8, 1.15)
  keyLight.position.set(8, 14, 10)
  const fill = new THREE.DirectionalLight(0xc8d4ff, 0.35)
  fill.position.set(-6, 4, -8)
  scene.add(amb, keyLight, fill)

  container.innerHTML = ''
  container.appendChild(renderer.domElement)

  let raf = 0
  function tick() {
    raf = requestAnimationFrame(tick)
    controls.update()
    renderer.render(scene, camera)
  }
  tick()

  const ro = new ResizeObserver(() => {
    const w = container.clientWidth
    const h = container.clientHeight
    if (w < 2 || h < 2) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
  ro.observe(container)

  const loader = new GLTFLoader()
  loader.load(
    src,
    (gltf) => {
      scene.add(gltf.scene)
      fitCameraToContent(camera, controls, gltf.scene)
      container.classList.remove('be-loading')
      container.classList.add('be-ready')
    },
    undefined,
    () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      controls.dispose()
      container.classList.remove('be-loading')
      container.classList.add('be-error')
      container.innerHTML = ''
      container.textContent =
        'Impossible de charger le modèle. Vérifiez le fichier .glb dans public/models/.'
    }
  )
}

function bindViewportObservers(scope) {
  const root = scope || document
  root.querySelectorAll('.be-viewport[data-model-file]').forEach((el) => {
    if (el.dataset.beViewerBound === '1') return
    el.dataset.beViewerBound = '1'
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          io.unobserve(e.target)
          createViewer(e.target)
        })
      },
      { rootMargin: '80px', threshold: 0.05 }
    )
    io.observe(el)
  })
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

/** URLs des .glb dans public/models/ (déployés à la racine du site). Résolu en URL absolue pour le loader Three.js. */
function publicAssetUrl(path) {
  const p = path.replace(/^\//, '')
  const s = `${import.meta.env.BASE_URL}${p}`
  try {
    return new URL(s, window.location.href).href
  } catch {
    return s
  }
}

function init() {
  const container = document.getElementById('portfolio-be')
  if (!container) return

  const info = modelsInfo

  if (!manifest.files || !manifest.files.length) {
    container.innerHTML =
      '<p style="padding:4rem 4rem 2rem;color:var(--dim);font-size:.9rem;">Aucun fichier .glb trouvé dans public/models/.</p>'
    return
  }

  container.innerHTML = ''
  manifest.files.forEach((entry, i) => {
    const extra = info[entry.file] || {}
    container.appendChild(buildBlock({ ...entry, ...extra }, i))
  })

  setupItemObservers(container)
  bindViewportObservers(container)
}

init()
