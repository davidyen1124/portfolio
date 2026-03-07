const CONFIG = {
  WALL_HEIGHT: 6,
  ROOM_SIZE: 16,
  WALL_THICKNESS: 0.8,

  PAINTING: {
    WIDTH: 2.6,
    HEIGHT: 2.1,
    ELEVATION: 2.4,
    FRAME_THICKNESS: 0.2,
    FRAME_THICKNESS_REPO: 0.22,
    FRAME_THICKNESS_RESUME: 0.24,
    CANVAS_WIDTH: 512,
    CANVAS_HEIGHT: 341,
    MIN_SPACING: 1.35,
    WALL_OFFSET: 0.62
  },

  MOVEMENT: {
    SPEED: 120,
    DECELERATION: 10.0,
    BOUNDARY_OFFSET: 1,
    GRAVITY: 30,
    JUMP_SPEED: 8,
    GROUND_LEVEL: 1.8
  },

  COLORS: {
    SKY: 0x8bd0ff,
    FOG: 0xd2efff,
    PANEL_TEXT: '#fff8d6',
    PANEL_MUTED: '#cde2a0',
    REPO_PANEL: '#203d2a',
    RESUME_PANEL: '#51381f'
  },

  LIGHTING: {
    AMBIENT: {
      COLOR: 0xffffff,
      INTENSITY: 0.85
    },
    SUN: {
      COLOR: 0xfff2c2,
      INTENSITY: 0.7
    },
    TORCH: {
      COLOR: 0xffc86a,
      INTENSITY: 0.9,
      DISTANCE: 9
    },
    SPOT: {
      COLOR: 0xfff3c6,
      INTENSITY: 0.65,
      DISTANCE: 20,
      ANGLE: Math.PI / 5,
      PENUMBRA: 0.28
    }
  },

  WORLD: {
    TILE_SIZE: 16,
    WALL_REPEAT: 8
  },

  LANGUAGE_COLORS: {
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Java: '#b07219',
    Ruby: '#701516',
    PHP: '#4F5D95',
    TypeScript: '#2b7489',
    'C#': '#178600',
    Go: '#00ADD8',
    'C++': '#f34b7d',
    C: '#555555'
  }
}

let camera, scene, renderer, controls
let moveForward = false
let moveBackward = false
let moveLeft = false
let moveRight = false
let prevTime = performance.now()
const velocity = new THREE.Vector3()
const direction = new THREE.Vector3()
let verticalVelocity = 0
let canJump = true
let raycaster
const cameraPos = { x: 0, y: 1.7, z: 0 }

let repositories = []
let paintingMeshes = []
let resumeSections = []

// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search)
const customGithubUser = urlParams.get('github')
const isCustomUser = customGithubUser && customGithubUser !== 'davidyen1124'
const githubUsername = customGithubUser || 'davidyen1124'

let isMobile = false
let joystickRightX = 0
let joystickRightY = 0
let mobileYaw = 0
let mobilePitch = 0
const mobileLookSpeed = 1.3
const mobileMovementSpeedFactor = 1
const textureCache = new Map()

if ('ontouchstart' in window) {
  isMobile = true
}

function pixelFill(context, color, x, y, width, height) {
  context.fillStyle = color
  context.fillRect(x, y, width, height)
}

function createNoiseTexture(type) {
  const size = CONFIG.WORLD.TILE_SIZE
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = size
  canvas.height = size

  switch (type) {
  case 'stone': {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const stone = ['#8d9699', '#7b8386', '#a7b0b3'][(x + y) % 3]
        pixelFill(context, stone, x, y, 1, 1)
      }
    }
    for (let y = 0; y < size; y += 4) {
      pixelFill(context, '#6d7477', 0, y, size, 1)
    }
    for (let x = 0; x < size; x += 4) {
      pixelFill(context, '#b3bbbe', x, 0, 1, size)
    }
    break
  }
  case 'smoothstone': {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const smooth = ['#b8bcbe', '#a9adaf', '#c7cbcd'][(x + y * 2) % 3]
        pixelFill(context, smooth, x, y, 1, 1)
      }
    }
    for (let y = 0; y < size; y += 8) {
      pixelFill(context, '#d9dddf', 0, y, size, 1)
    }
    for (let x = 0; x < size; x += 8) {
      pixelFill(context, '#94989a', x, 0, 1, size)
    }
    break
  }
  case 'cobble': {
    pixelFill(context, '#7f878a', 0, 0, size, size)
    for (let y = 0; y < size; y += 4) {
      for (let x = 0; x < size; x += 4) {
        const color = ['#6e7679', '#969ea1', '#878f92'][(x / 4 + y / 4) % 3]
        pixelFill(context, color, x, y, 4, 4)
      }
    }
    pixelFill(context, '#555d60', 0, 3, size, 1)
    pixelFill(context, '#555d60', 3, 0, 1, size)
    break
  }
  case 'planks': {
    pixelFill(context, '#9e723b', 0, 0, size, size)
    for (let y = 0; y < size; y += 4) {
      pixelFill(context, '#7b572d', 0, y, size, 1)
      pixelFill(context, '#bc9053', 0, y + 1, size, 1)
    }
    pixelFill(context, '#714d26', 4, 5, 2, 2)
    pixelFill(context, '#714d26', 10, 11, 2, 2)
    break
  }
  case 'log': {
    pixelFill(context, '#6d421f', 0, 0, size, size)
    for (let x = 0; x < size; x += 4) {
      pixelFill(context, '#8b5b30', x, 0, 2, size)
    }
    pixelFill(context, '#4f2f16', 0, 0, 1, size)
    pixelFill(context, '#4f2f16', size - 1, 0, 1, size)
    break
  }
  case 'glow': {
    pixelFill(context, '#c68f1f', 0, 0, size, size)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const glow = ['#ffd867', '#eeb93d', '#fff0ac'][(x + y) % 3]
        pixelFill(context, glow, x, y, 1, 1)
      }
    }
    pixelFill(context, '#fff8d0', 5, 5, 6, 6)
    break
  }
  }

  return canvas
}

function getTexture(type, repeatX = 1, repeatY = 1) {
  const cacheKey = `${type}:${repeatX}:${repeatY}`
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)
  }

  const texture = new THREE.CanvasTexture(createNoiseTexture(type))
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.needsUpdate = true
  textureCache.set(cacheKey, texture)
  return texture
}

function createPixelMaterial(type, repeatX = 1, repeatY = 1, overrides = {}) {
  return new THREE.MeshStandardMaterial({
    map: getTexture(type, repeatX, repeatY),
    roughness: 0.95,
    metalness: 0.02,
    ...overrides
  })
}

function drawPixelCard(context, panelColor) {
  context.fillStyle = panelColor
  context.fillRect(0, 0, context.canvas.width, context.canvas.height)

  context.fillStyle = '#0f0b05'
  context.fillRect(12, 12, context.canvas.width - 24, context.canvas.height - 24)

  context.fillStyle = panelColor
  context.fillRect(24, 24, context.canvas.width - 48, context.canvas.height - 48)
  context.strokeStyle = '#f7d46a'
  context.lineWidth = 4
  context.strokeRect(24, 24, context.canvas.width - 48, context.canvas.height - 48)
}

function clipCardContent(context) {
  context.save()
  context.beginPath()
  context.rect(40, 72, context.canvas.width - 80, context.canvas.height - 120)
  context.clip()
}

function unclipCardContent(context) {
  context.restore()
}

function fitTextWidth(context, text, maxWidth, initialSize, minSize, weight = 'bold') {
  let size = initialSize
  while (size > minSize) {
    context.font = `${weight} ${size}px monospace`
    if (context.measureText(text).width <= maxWidth) break
    size -= 2
  }
  context.font = `${weight} ${size}px monospace`
  return size
}

function fitWrappedText(context, text, options) {
  const {
    maxWidth,
    maxLines,
    maxHeight,
    initialSize,
    minSize,
    weight = 'normal'
  } = options

  let size = initialSize
  while (size >= minSize) {
    const lineHeight = Math.round(size * 1.3)
    context.font = `${weight} ${size}px monospace`
    const lines = wrapTextLines(context, text, maxWidth, lineHeight, maxLines)
    const totalHeight = lines.length * lineHeight
    const widestLine = lines.reduce(
      (max, line) => Math.max(max, context.measureText(line).width),
      0
    )

    if (widestLine <= maxWidth && totalHeight <= maxHeight) {
      return { lines, size, lineHeight }
    }
    size -= 2
  }

  const fallbackSize = minSize
  const fallbackLineHeight = Math.round(fallbackSize * 1.3)
  context.font = `${weight} ${fallbackSize}px monospace`
  return {
    lines: wrapTextLines(context, text, maxWidth, fallbackLineHeight, maxLines),
    size: fallbackSize,
    lineHeight: fallbackLineHeight
  }
}

function drawCenteredLines(context, lines, x, startY, lineHeight) {
  let y = startY
  for (const line of lines) {
    context.fillText(line, x, y)
    y += lineHeight
  }
}

function drawPanelLabel(context, text, x, y, width) {
  context.fillStyle = '#29180c'
  context.fillRect(x - width / 2, y - 18, width, 28)
  context.strokeStyle = '#f7d46a'
  context.lineWidth = 3
  context.strokeRect(x - width / 2, y - 18, width, 28)
  context.fillStyle = '#fff4c7'
  context.font = 'bold 18px monospace'
  context.textAlign = 'center'
  context.fillText(text, x, y + 2)
}

class Painting {
  constructor(data, x, y, z, rotation) {
    this.data = data
    this.x = x
    this.y = y
    this.z = z
    this.rotation = rotation
  }

  drawContent() {}

  getUserData(material) {
    return { originalMaterial: material.clone() }
  }

  getFrameMaterial() {
    return createPixelMaterial('planks', 1, 1)
  }

  getAccentColor() {
    return '#f7d46a'
  }

  create() {
    let frameThickness = CONFIG.PAINTING.FRAME_THICKNESS

    if (this instanceof RepoPainting) {
      frameThickness = CONFIG.PAINTING.FRAME_THICKNESS_REPO
    } else if (this instanceof ResumePainting) {
      frameThickness = CONFIG.PAINTING.FRAME_THICKNESS_RESUME
    }

    const frameGeometry = new THREE.BoxGeometry(
      CONFIG.PAINTING.WIDTH + 0.36,
      CONFIG.PAINTING.HEIGHT + 0.36,
      frameThickness
    )
    const frameMaterial = this.getFrameMaterial()
    const frame = new THREE.Mesh(frameGeometry, frameMaterial)
    frame.castShadow = true
    frame.receiveShadow = true
    frame.position.set(this.x, this.y, this.z)
    frame.rotation.y = this.rotation
    scene.add(frame)

    const canvas = document.createElement('canvas')
    canvas.width = CONFIG.PAINTING.CANVAS_WIDTH
    canvas.height = CONFIG.PAINTING.CANVAS_HEIGHT
    const context = canvas.getContext('2d')
    context.imageSmoothingEnabled = false
    const texture = new THREE.CanvasTexture(canvas)
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    this.drawContent(context, texture)

    const paintingGeometry = new THREE.BoxGeometry(
      CONFIG.PAINTING.WIDTH,
      CONFIG.PAINTING.HEIGHT,
      0.05
    )
    const paintingMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.85,
      metalness: 0,
      emissive: new THREE.Color(this.getAccentColor()),
      emissiveIntensity: 0.15,
      emissiveMap: texture
    })
    const painting = new THREE.Mesh(paintingGeometry, paintingMaterial)
    painting.castShadow = true
    painting.receiveShadow = true
    painting.position.set(this.x, this.y, this.z)
    const surfaceOffset = frameThickness / 2 + 0.04

    if (this.rotation === 0) painting.position.z += surfaceOffset
    else if (this.rotation === Math.PI) painting.position.z -= surfaceOffset
    else if (this.rotation === Math.PI / 2) painting.position.x += surfaceOffset
    else if (this.rotation === -Math.PI / 2) painting.position.x -= surfaceOffset

    painting.rotation.y = this.rotation
    painting.userData = this.getUserData(paintingMaterial)
    scene.add(painting)
    paintingMeshes.push(painting)

  }
}

class RepoPainting extends Painting {
  getFrameMaterial() {
    return createPixelMaterial('cobble', 1, 1)
  }

  getAccentColor() {
    return '#74d278'
  }

  drawContent(context) {
    const repo = this.data
    drawPixelCard(context, CONFIG.COLORS.REPO_PANEL)
    drawPanelLabel(context, 'PROJECT', context.canvas.width / 2, 56, 160)
    clipCardContent(context)

    const repoName = repo.name
    fitTextWidth(context, repoName, context.canvas.width - 108, 28, 18)
    context.textAlign = 'center'
    context.fillStyle = CONFIG.COLORS.PANEL_TEXT
    context.fillText(repoName, context.canvas.width / 2, 108)

    if (repo.description) {
      const descriptionBlock = fitWrappedText(context, repo.description, {
        maxWidth: context.canvas.width - 108,
        maxLines: 4,
        maxHeight: 92,
        initialSize: 17,
        minSize: 13
      })
      context.fillStyle = CONFIG.COLORS.PANEL_MUTED
      context.font = `${descriptionBlock.size}px monospace`
      drawCenteredLines(
        context,
        descriptionBlock.lines,
        context.canvas.width / 2,
        148,
        descriptionBlock.lineHeight
      )
    }

    context.fillStyle = '#fff4c7'
    context.font = '16px monospace'
    context.fillText(
      `Stars ${repo.stargazers_count} | Forks ${repo.forks_count}`,
      context.canvas.width / 2,
      context.canvas.height - 92
    )
    if (repo.language) {
      const langColor = CONFIG.LANGUAGE_COLORS[repo.language] || '#888888'
      context.fillStyle = langColor
      context.beginPath()
      context.arc(
        context.canvas.width / 2 - 50,
        context.canvas.height - 40,
        8,
        0,
        2 * Math.PI
      )
      context.fill()
      context.fillStyle = CONFIG.COLORS.PANEL_TEXT
      context.fillText(
        repo.language,
        context.canvas.width / 2,
        context.canvas.height - 54
      )
    }
    context.fillStyle = '#d0ecba'
    context.font = '14px monospace'
    const updated = new Date(repo.updated_at).toLocaleDateString()
    context.fillText(
      `Updated: ${updated}`,
      context.canvas.width / 2,
      context.canvas.height - 22
    )
    unclipCardContent(context)
  }

  getUserData(material) {
    return {
      url: this.data.html_url,
      name: this.data.name,
      originalMaterial: material.clone()
    }
  }
}

class ResumePainting extends Painting {
  getFrameMaterial() {
    return createPixelMaterial('planks', 1, 1)
  }

  getAccentColor() {
    return '#ffde7a'
  }

  drawContent(context) {
    const section = this.data
    drawPixelCard(context, CONFIG.COLORS.RESUME_PANEL)
    drawPanelLabel(context, 'RESUME', context.canvas.width / 2, 56, 150)
    clipCardContent(context)

    const titleSize = fitTextWidth(
      context,
      section.title,
      context.canvas.width - 108,
      24,
      15
    )
    const bodyBlock = fitWrappedText(context, section.text, {
      maxWidth: context.canvas.width - 108,
      maxLines: 6,
      maxHeight: 150,
      initialSize: 17,
      minSize: 12
    })
    const titleHeight = titleSize + 4
    const gapAfterTitle = 16
    const totalHeight = titleHeight + gapAfterTitle + bodyBlock.lines.length * bodyBlock.lineHeight
    const startY = Math.max(92, (context.canvas.height - totalHeight) / 2)
    context.fillStyle = CONFIG.COLORS.PANEL_TEXT
    context.font = `bold ${titleSize}px monospace`
    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.fillText(section.title, context.canvas.width / 2, startY)
    context.fillStyle = '#eadfb5'
    context.font = `${bodyBlock.size}px monospace`
    drawCenteredLines(
      context,
      bodyBlock.lines,
      context.canvas.width / 2,
      startY + titleHeight + gapAfterTitle,
      bodyBlock.lineHeight
    )
    context.textBaseline = 'alphabetic'
    unclipCardContent(context)
  }

  getUserData(material) {
    return {
      url: this.data.url,
      name: this.data.title,
      originalMaterial: material.clone(),
      isResume: true
    }
  }
}

async function loadRepositories() {
  try {
    const repoPromise = fetch(
      `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=20`
    ).then((res) => res.json())
    
    const promises = [repoPromise]
    
    // Only load resume data for default user
    if (!isCustomUser) {
      const resumePromise = fetch('assets/resume.json')
        .then((res) => res.json())
        .catch((resumeError) => {
          console.error('Error loading resume data:', resumeError)
          return []
        })
      
      promises.push(resumePromise)
    }

    const results = await Promise.all(promises)
    const repoData = results[0]
    
    repositories = repoData || []
    
    if (!isCustomUser && results.length > 1) {
      const resumeData = results[1]
      if (resumeData && resumeData.length > 0) {
        resumeSections = resumeData
      }
    }

    // Update page title and heading
    updatePageTitle()
    
    // Initialize even if we couldn't get repositories
    init()
    document.getElementById('loading').style.display = 'none'
  } catch (error) {
    console.error('Error loading data:', error)
    
    // Update page title and heading
    updatePageTitle()
    
    // Still init the museum
    repositories = []
    init()
    document.getElementById('loading').style.display = 'none'
  }
}

function updatePageTitle() {
  const title = isCustomUser ? githubUsername : 'David Yen'
  const pageTitle = document.getElementById('page-title')
  const museumTitle = document.getElementById('museum-title')
  
  if (pageTitle) pageTitle.textContent = title
  if (museumTitle) museumTitle.textContent = title
}

function init() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(CONFIG.COLORS.SKY)
  scene.fog = new THREE.Fog(CONFIG.COLORS.FOG, 18, 42)

  const ambientLight = new THREE.AmbientLight(
    CONFIG.LIGHTING.AMBIENT.COLOR,
    CONFIG.LIGHTING.AMBIENT.INTENSITY
  )
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(
    CONFIG.LIGHTING.SUN.COLOR,
    CONFIG.LIGHTING.SUN.INTENSITY
  )
  sunLight.castShadow = true
  sunLight.shadow.mapSize.set(1024, 1024)
  sunLight.position.set(12, 18, 8)
  scene.add(sunLight)

  const wallLights = [
    [
      new THREE.Vector3(0, CONFIG.WALL_HEIGHT - 0.9, -CONFIG.ROOM_SIZE / 2),
      new THREE.Vector3(0, CONFIG.PAINTING.ELEVATION, -CONFIG.ROOM_SIZE + 0.5)
    ],
    [
      new THREE.Vector3(0, CONFIG.WALL_HEIGHT - 0.9, CONFIG.ROOM_SIZE / 2),
      new THREE.Vector3(0, CONFIG.PAINTING.ELEVATION, CONFIG.ROOM_SIZE - 0.5)
    ],
    [
      new THREE.Vector3(CONFIG.ROOM_SIZE / 2, CONFIG.WALL_HEIGHT - 0.9, 0),
      new THREE.Vector3(CONFIG.ROOM_SIZE - 0.5, CONFIG.PAINTING.ELEVATION, 0)
    ],
    [
      new THREE.Vector3(-CONFIG.ROOM_SIZE / 2, CONFIG.WALL_HEIGHT - 0.9, 0),
      new THREE.Vector3(-CONFIG.ROOM_SIZE + 0.5, CONFIG.PAINTING.ELEVATION, 0)
    ]
  ]
  wallLights.forEach(([position, target]) => createWallSpotlight(position, target))
  scene.add(camera)

  createGround()
  createWalls()

  createPaintings()

  if (!isMobile) {
    controls = new THREE.PointerLockControls(camera, document.body)

    const blocker = document.getElementById('blocker')
    const instructions = document.getElementById('instructions')
    const enterWorld = document.getElementById('enter-world')

    function lockControls(event) {
      if (event) event.stopPropagation()
      controls.lock()
    }

    instructions.addEventListener('click', lockControls)
    if (enterWorld) enterWorld.addEventListener('click', lockControls)

    controls.addEventListener('lock', function () {
      instructions.style.display = 'none'
      blocker.style.display = 'none'

      controls
        .getObject()
        .position.set(cameraPos.x, cameraPos.y, cameraPos.z)
    })

    controls.addEventListener('unlock', function () {
      velocity.x = 0
      velocity.z = 0
      blocker.style.display = 'flex'
      instructions.style.display = 'block'
    })

    scene.add(controls.getObject())

    const onKeyDown = function (event) {
      switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = true
        break
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true
        break
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true
        break
      case 'ArrowRight':
      case 'KeyD':
        moveRight = true
        break
      case 'Space':
        if (canJump) {
          verticalVelocity = CONFIG.MOVEMENT.JUMP_SPEED
          canJump = false
        }
        break
      }
    }

    const onKeyUp = function (event) {
      switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = false
        break
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false
        break
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false
        break
      case 'ArrowRight':
      case 'KeyD':
        moveRight = false
        break
      case 'Space':
        break
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
  } else {
    document.getElementById('blocker').style.display = 'none'
    document.getElementById('instructions').style.display = 'none'

    document.getElementById('joystick-left').style.display = 'block'
    document.getElementById('joystick-right').style.display = 'block'

    mobileYaw = 0
    mobilePitch = 0

    initJoysticks()
  }

  raycaster = new THREE.Raycaster()

  document.addEventListener('click', onMouseClick, false)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  // Three.js v0.132.2 may not support some of these settings
  if (renderer.physicallyCorrectLights !== undefined) {
    renderer.physicallyCorrectLights = true
  }
  if (THREE.sRGBEncoding !== undefined) {
    renderer.outputEncoding = THREE.sRGBEncoding
  }
  if (THREE.ACESFilmicToneMapping !== undefined) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping
  }
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  document.body.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize)

  animate()
}

function createWalls() {
  const wallMaterial = createPixelMaterial(
    'stone',
    CONFIG.WORLD.WALL_REPEAT,
    2
  )

  const wallSpecs = [
    {
      width: CONFIG.ROOM_SIZE * 2,
      depth: CONFIG.WALL_THICKNESS,
      x: 0,
      z: -CONFIG.ROOM_SIZE
    },
    {
      width: CONFIG.ROOM_SIZE * 2,
      depth: CONFIG.WALL_THICKNESS,
      x: 0,
      z: CONFIG.ROOM_SIZE
    },
    {
      width: CONFIG.WALL_THICKNESS,
      depth: CONFIG.ROOM_SIZE * 2,
      x: CONFIG.ROOM_SIZE,
      z: 0
    },
    {
      width: CONFIG.WALL_THICKNESS,
      depth: CONFIG.ROOM_SIZE * 2,
      x: -CONFIG.ROOM_SIZE,
      z: 0
    }
  ]

  wallSpecs.forEach(({ width, depth, x, z }) => {
    addWallBlock(width, depth, x, z, wallMaterial)
  })

  const trimMaterial = createPixelMaterial('smoothstone', 1, 1)
  const pillarPositions = [
    [CONFIG.ROOM_SIZE, CONFIG.WALL_HEIGHT / 2, CONFIG.ROOM_SIZE],
    [CONFIG.ROOM_SIZE, CONFIG.WALL_HEIGHT / 2, -CONFIG.ROOM_SIZE],
    [-CONFIG.ROOM_SIZE, CONFIG.WALL_HEIGHT / 2, CONFIG.ROOM_SIZE],
    [-CONFIG.ROOM_SIZE, CONFIG.WALL_HEIGHT / 2, -CONFIG.ROOM_SIZE]
  ]

  pillarPositions.forEach(([x, y, z]) => {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, CONFIG.WALL_HEIGHT + 1.2, 1.2),
      trimMaterial
    )
    pillar.position.set(x, y + 0.6, z)
    pillar.castShadow = true
    pillar.receiveShadow = true
    scene.add(pillar)
    createTorch(new THREE.Vector3(x * 0.92, CONFIG.WALL_HEIGHT - 0.4, z * 0.92))
  })
}

function createGround() {
  const floorGeometry = new THREE.PlaneGeometry(
    CONFIG.ROOM_SIZE * 2,
    CONFIG.ROOM_SIZE * 2
  )
  const floor = new THREE.Mesh(
    floorGeometry,
    createPixelMaterial('smoothstone', 8, 8)
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)
}

function addWallBlock(width, depth, x, z, material) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(width, CONFIG.WALL_HEIGHT, depth),
    material
  )
  wall.castShadow = true
  wall.receiveShadow = true
  wall.position.set(x, CONFIG.WALL_HEIGHT / 2, z)
  scene.add(wall)
}

function maxPaintingsForSurface(length) {
  let count = Math.floor(length / (CONFIG.PAINTING.WIDTH + CONFIG.PAINTING.MIN_SPACING))
  while (count > 0) {
    const spacing =
      (length - CONFIG.PAINTING.WIDTH * count) / (count + 1)
    if (spacing >= CONFIG.PAINTING.MIN_SPACING) return count
    count--
  }
  return 0
}

function getSlotsForSurface(surface, count) {
  const spacing =
    (surface.length - CONFIG.PAINTING.WIDTH * count) / (count + 1)
  const firstCenter =
    surface.start + spacing + CONFIG.PAINTING.WIDTH / 2

  const slots = []
  for (let i = 0; i < count; i++) {
    const position = firstCenter + i * (CONFIG.PAINTING.WIDTH + spacing)
    if (surface.axis === 'x') {
      slots.push({ x: position, z: surface.fixed, rotation: surface.rotation })
    } else {
      slots.push({ x: surface.fixed, z: position, rotation: surface.rotation })
    }
  }
  return slots
}

function placePaintingsOnSurfaces(items, surfaces, isResume) {
  const remaining = [...items]

  surfaces.forEach((surface) => {
    if (remaining.length === 0) return

    const capacity = surface.capacity ?? maxPaintingsForSurface(surface.length)
    const count = Math.min(capacity, remaining.length)
    if (count <= 0) return

    const slots = getSlotsForSurface(surface, count)
    slots.forEach((slot) => {
      const item = remaining.shift()
      createPainting(
        item,
        slot.x,
        CONFIG.PAINTING.ELEVATION,
        slot.z,
        slot.rotation,
        isResume
      )
    })
  })
}

function createTorch(position) {
  const torchBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.8, 0.22),
    createPixelMaterial('log', 1, 1)
  )
  torchBase.position.copy(position)
  scene.add(torchBase)

  const ember = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.35, 0.35),
    createPixelMaterial('glow', 1, 1, {
      emissive: 0xffc456,
      emissiveIntensity: 0.55
    })
  )
  ember.position.set(position.x, position.y + 0.52, position.z)
  scene.add(ember)

  const torchLight = new THREE.PointLight(
    CONFIG.LIGHTING.TORCH.COLOR,
    CONFIG.LIGHTING.TORCH.INTENSITY,
    CONFIG.LIGHTING.TORCH.DISTANCE
  )
  torchLight.position.set(position.x, position.y + 0.7, position.z)
  scene.add(torchLight)
}

function createPaintings() {
  const wallOffset = CONFIG.PAINTING.WALL_OFFSET
  const resumePaintings = isCustomUser ? [] : [...resumeSections]
  const projectPaintings = [...repositories]
  const fullWallStart = -13
  const fullWallLength = 26

  if (!isCustomUser) {
    const summaryIndex = resumePaintings.findIndex(
      painting => painting.title === 'Summary'
    )
    if (summaryIndex > 0) {
      const [summary] = resumePaintings.splice(summaryIndex, 1)
      resumePaintings.unshift(summary)
    }
  }

  const resumeSurfaces = [
    {
      axis: 'x',
      fixed: CONFIG.ROOM_SIZE - wallOffset,
      start: fullWallStart,
      length: fullWallLength,
      rotation: Math.PI,
      capacity: 3
    },
    {
      axis: 'z',
      fixed: -CONFIG.ROOM_SIZE + wallOffset,
      start: fullWallStart,
      length: fullWallLength,
      rotation: Math.PI / 2,
      capacity: 3
    }
  ]

  const projectSurfaces = [
    {
      axis: 'x',
      fixed: -CONFIG.ROOM_SIZE + wallOffset,
      start: fullWallStart,
      length: fullWallLength,
      rotation: 0,
      capacity: 6
    },
    {
      axis: 'z',
      fixed: CONFIG.ROOM_SIZE - wallOffset,
      start: fullWallStart,
      length: fullWallLength,
      rotation: -Math.PI / 2,
      capacity: 6
    }
  ]

  if (!isCustomUser) {
    placePaintingsOnSurfaces(resumePaintings, resumeSurfaces, true)
  }
  placePaintingsOnSurfaces(
    projectPaintings,
    isCustomUser
      ? projectSurfaces.concat(resumeSurfaces)
      : projectSurfaces,
    false
  )
}

function createPainting(data, x, y, z, rotation, isResume = false) {
  let painting
  if (isResume) {
    painting = new ResumePainting(data, x, y, z, rotation)
  } else {
    painting = new RepoPainting(data, x, y, z, rotation)
  }
  painting.create()
}

function createWallSpotlight(position, target) {
  const light = new THREE.SpotLight(
    CONFIG.LIGHTING.SPOT.COLOR,
    CONFIG.LIGHTING.SPOT.INTENSITY
  )
  if (light.distance !== undefined) {
    light.distance = CONFIG.LIGHTING.SPOT.DISTANCE
  }
  if (light.angle !== undefined) {
    light.angle = CONFIG.LIGHTING.SPOT.ANGLE
  }
  if (light.penumbra !== undefined) {
    light.penumbra = CONFIG.LIGHTING.SPOT.PENUMBRA
  }
  light.castShadow = true
  light.position.copy(position)
  light.target.position.copy(target)
  scene.add(light)
  scene.add(light.target)
}

function wrapTextLines(context, text, maxWidth, lineHeight, maxLines) {
  // Check if the text contains newline characters
  if (text.includes('\n')) {
    // Split by newlines first
    const textLines = text.split('\n')
    const lines = []
    
    // For each line, apply normal word wrapping if needed
    for (let i = 0; i < textLines.length && lines.length < maxLines; i++) {
      const lineWords = textLines[i].split(' ')
      let currentLine = ''
      
      for (let n = 0; n < lineWords.length; n++) {
        const testLine = currentLine + lineWords[n] + ' '
        const metrics = context.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && n > 0) {
          lines.push(currentLine.trim())
          currentLine = lineWords[n] + ' '
          if (lines.length >= maxLines) {
            lines[lines.length - 1] += '...'
            return lines
          }
        } else {
          currentLine = testLine
        }
      }
      
      if (currentLine.trim()) {
        lines.push(currentLine.trim())
        if (lines.length >= maxLines) {
          lines[lines.length - 1] += '...'
          return lines
        }
      }
    }
    
    return lines
  } else {
    // Original word wrapping logic for text without newlines
    const words = text.split(' ')
    let line = ''
    const lines = []

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = context.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim())
        line = words[n] + ' '
        if (lines.length >= maxLines) {
          lines[lines.length - 1] += '...'
          return lines
        }
      } else {
        line = testLine
      }
    }

    lines.push(line.trim())
    return lines
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onMouseClick() {
  if (!isMobile && controls && controls.isLocked) {
    handlePaintingRaycast()
  } else if (isMobile) {
    handlePaintingRaycast()
  }
}

function handlePaintingRaycast() {
  raycaster.setFromCamera(new THREE.Vector2(), camera)
  const intersects = raycaster.intersectObjects(paintingMeshes)

  if (intersects.length > 0) {
    const object = intersects[0].object

    cameraPos.x = isMobile
      ? camera.position.x
      : controls.getObject().position.x
    cameraPos.y = isMobile
      ? camera.position.y
      : controls.getObject().position.y
    cameraPos.z = isMobile
      ? camera.position.z
      : controls.getObject().position.z

    window.open(object.userData.url, '_blank', 'noopener,noreferrer')
  }
}

function initJoysticks() {
  const leftEl = document.getElementById('joystick-left')
  const rightEl = document.getElementById('joystick-right')

  let leftTouchId = null
  let leftCenter = { x: 0, y: 0 }
  let rightTouchId = null
  let rightCenter = { x: 0, y: 0 }

  function handleTouchStart(e) {
    e.preventDefault()
    for (let touch of e.changedTouches) {
      const rectLeft = leftEl.getBoundingClientRect()
      const rectRight = rightEl.getBoundingClientRect()

      if (
        touch.pageX >= rectLeft.left &&
        touch.pageX <= rectLeft.right &&
        touch.pageY >= rectLeft.top &&
        touch.pageY <= rectLeft.bottom
      ) {
        leftTouchId = touch.identifier
        leftCenter = {
          x: rectLeft.left + rectLeft.width / 2,
          y: rectLeft.top + rectLeft.height / 2
        }
      } else if (
        touch.pageX >= rectRight.left &&
        touch.pageX <= rectRight.right &&
        touch.pageY >= rectRight.top &&
        touch.pageY <= rectRight.bottom
      ) {
        rightTouchId = touch.identifier
        rightCenter = {
          x: rectRight.left + rectRight.width / 2,
          y: rectRight.top + rectRight.height / 2
        }
      }
    }
  }

  function handleTouchMove(e) {
    e.preventDefault()
    for (let touch of e.changedTouches) {
      if (touch.identifier === leftTouchId) {
        const dx = touch.pageX - leftCenter.x
        const dy = touch.pageY - leftCenter.y

        moveForward = dy > 10
        moveBackward = dy < -10
        moveLeft = dx < -10
        moveRight = dx > 10

        const stick = leftEl.querySelector('.joystick')
        if (stick) {
          const maxDist = 30
          const dist = Math.sqrt(dx * dx + dy * dy)
          const factor = dist > maxDist ? maxDist / dist : 1

          stick.style.transform = `translate(${dx * factor}px, ${
            dy * factor
          }px)`
        }
      } else if (touch.identifier === rightTouchId) {
        const dx = touch.pageX - rightCenter.x
        const dy = touch.pageY - rightCenter.y

        const maxDist = 40
        const deadzone = 5
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > deadzone) {
          const normalizedDist = Math.min(
            1,
            (dist - deadzone) / (maxDist - deadzone)
          )
          joystickRightX = (dx / dist) * normalizedDist
          joystickRightY = (dy / dist) * normalizedDist
        } else {
          joystickRightX = 0
          joystickRightY = 0
        }

        const stick = rightEl.querySelector('.joystick')
        if (stick) {
          const visualFactor = dist > maxDist ? maxDist / dist : 1
          stick.style.transform = `translate(${dx * visualFactor}px, ${
            dy * visualFactor
          }px)`
        }
      }
    }
  }

  function handleTouchEnd(e) {
    e.preventDefault()
    for (let touch of e.changedTouches) {
      if (touch.identifier === leftTouchId) {
        leftTouchId = null
        moveForward = false
        moveBackward = false
        moveLeft = false
        moveRight = false

        const stick = leftEl.querySelector('.joystick')
        if (stick) {
          stick.style.transform = 'translate(0px, 0px)'
        }
      } else if (touch.identifier === rightTouchId) {
        rightTouchId = null
        joystickRightX = 0
        joystickRightY = 0

        const stick = rightEl.querySelector('.joystick')
        if (stick) {
          stick.style.transform = 'translate(0px, 0px)'
        }
      }
    }
  }

  leftEl.addEventListener('touchstart', handleTouchStart, {
    passive: false
  })
  leftEl.addEventListener('touchmove', handleTouchMove, {
    passive: false
  })
  leftEl.addEventListener('touchend', handleTouchEnd, { passive: false })
  leftEl.addEventListener('touchcancel', handleTouchEnd, {
    passive: false
  })

  rightEl.addEventListener('touchstart', handleTouchStart, {
    passive: false
  })
  rightEl.addEventListener('touchmove', handleTouchMove, {
    passive: false
  })
  rightEl.addEventListener('touchend', handleTouchEnd, { passive: false })
  rightEl.addEventListener('touchcancel', handleTouchEnd, {
    passive: false
  })
}

function animate() {
  requestAnimationFrame(animate)

  const time = performance.now()
  const delta = (time - prevTime) / 1000

  velocity.x -= velocity.x * CONFIG.MOVEMENT.DECELERATION * delta
  velocity.z -= velocity.z * CONFIG.MOVEMENT.DECELERATION * delta
  verticalVelocity -= CONFIG.MOVEMENT.GRAVITY * delta

  direction.z = Number(moveForward) - Number(moveBackward)
  direction.x = Number(moveRight) - Number(moveLeft)
  direction.normalize()

  if (moveForward || moveBackward)
    velocity.z -= direction.z * CONFIG.MOVEMENT.SPEED * delta
  if (moveLeft || moveRight)
    velocity.x -= direction.x * CONFIG.MOVEMENT.SPEED * delta

  if (!isMobile) {
    if (controls && controls.isLocked === true) {
      const player = controls.getObject()

      controls.moveRight(-velocity.x * delta)
      controls.moveForward(-velocity.z * delta)
      player.position.y += verticalVelocity * delta

      if (player.position.y < CONFIG.MOVEMENT.GROUND_LEVEL) {
        player.position.y = CONFIG.MOVEMENT.GROUND_LEVEL
        verticalVelocity = 0
        canJump = true
      }

      if (
        player.position.x <
        -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
      )
        player.position.x =
          -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
      if (
        player.position.x >
        CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
      )
        player.position.x =
          CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
      if (
        player.position.z <
        -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
      )
        player.position.z =
          -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
      if (
        player.position.z >
        CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
      )
        player.position.z =
          CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET

      cameraPos.x = player.position.x
      cameraPos.y = player.position.y
      cameraPos.z = player.position.z
    }
  } else {
    const forward = new THREE.Vector3(
      Math.sin(mobileYaw),
      0,
      Math.cos(mobileYaw)
    )

    const right = new THREE.Vector3(
      Math.sin(mobileYaw + Math.PI / 2),
      0,
      Math.cos(mobileYaw + Math.PI / 2)
    )

    if (moveForward || moveBackward) {
      camera.position.x -=
        forward.x * velocity.z * delta * mobileMovementSpeedFactor
      camera.position.z -=
        forward.z * velocity.z * delta * mobileMovementSpeedFactor
    }

    if (moveLeft || moveRight) {
      camera.position.x -=
        right.x * velocity.x * delta * mobileMovementSpeedFactor
      camera.position.z -=
        right.z * velocity.x * delta * mobileMovementSpeedFactor
    }

    camera.position.y += verticalVelocity * delta
    if (camera.position.y < CONFIG.MOVEMENT.GROUND_LEVEL) {
      camera.position.y = CONFIG.MOVEMENT.GROUND_LEVEL
      verticalVelocity = 0
      canJump = true
    }

    if (
      camera.position.x <
      -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
    ) {
      camera.position.x =
        -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
    }
    if (
      camera.position.x >
      CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
    ) {
      camera.position.x =
        CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
    }
    if (
      camera.position.z <
      -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
    ) {
      camera.position.z =
        -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
    }
    if (
      camera.position.z >
      CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
    ) {
      camera.position.z =
        CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
    }

    mobileYaw -= joystickRightX * mobileLookSpeed * delta

    mobilePitch -= joystickRightY * mobileLookSpeed * delta

    mobilePitch = Math.max(
      -Math.PI / 2 + 0.01,
      Math.min(Math.PI / 2 - 0.01, mobilePitch)
    )

    camera.rotation.set(0, 0, 0)
    camera.rotateY(mobileYaw)
    camera.rotateX(mobilePitch)

    cameraPos.x = camera.position.x
    cameraPos.y = camera.position.y
    cameraPos.z = camera.position.z
  }

  prevTime = time
  renderer.render(scene, camera)
}

loadRepositories()
