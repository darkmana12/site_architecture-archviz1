import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/** Les visionneuses sont définies dans bureau-etudes.html (data-src sur chaque .be-viewport). */

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
  const src = (container.dataset.src || '').trim()
  if (!src) {
    container.classList.remove('be-loading')
    container.classList.add('be-error')
    container.textContent =
      'Ajoutez votre fichier .glb dans public/models/ et renseignez data-src sur ce bloc.'
    return
  }

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
  const key = new THREE.DirectionalLight(0xfff4e8, 1.15)
  key.position.set(8, 14, 10)
  const fill = new THREE.DirectionalLight(0xc8d4ff, 0.35)
  fill.position.set(-6, 4, -8)
  scene.add(amb, key, fill)

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
        'Impossible de charger le modèle. Vérifiez le chemin du fichier .glb.'
    }
  )
}

function bindViewportObservers(scope) {
  const root = scope || document
  root.querySelectorAll('.be-viewport[data-src]').forEach((el) => {
    if (el.dataset.beViewerBound === '1') return
    el.dataset.beViewerBound = '1'
    const src = (el.getAttribute('data-src') || '').trim()
    if (!src) {
      el.classList.remove('be-loading')
      el.classList.add('be-error')
      el.textContent =
        'Ajoutez votre fichier .glb dans public/models/ et renseignez data-src sur ce bloc.'
      return
    }
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

const portfolioBe = document.getElementById('portfolio-be')
if (portfolioBe) bindViewportObservers(portfolioBe)
