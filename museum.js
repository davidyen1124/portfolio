const CONFIG = {
  WALL_HEIGHT: 5,
  ROOM_SIZE: 15,

  PAINTING: {
    WIDTH: 2.5,
    HEIGHT: 2,
    SPACING: 3,
    ELEVATION: 1.5,
    FRAME_THICKNESS: 0.1,
    FRAME_THICKNESS_REPO: 0.1,
    FRAME_THICKNESS_SPOTIFY: 0.08,
    FRAME_THICKNESS_RESUME: 0.12,
    CANVAS_WIDTH: 512,
    CANVAS_HEIGHT: 341,
    PAINTINGS_PER_WALL: 3,
    ALBUM_ART_SIZE: 200,
    MIN_SPACING: 1.5,
    WALL_OFFSET: 0.15
  },

  MOVEMENT: {
    SPEED: 120,
    DECELERATION: 10.0,
    BOUNDARY_OFFSET: 1
  },

  COLORS: {
    BACKGROUND: 0x1a2c42,
    FLOOR: 0x1e2d3d,
    CEILING: 0x213040,
    WALLS: 0x2c425e,
    FRAME: 0x7e6338,
    FRAME_REPO: 0x7e6338,
    FRAME_SPOTIFY: 0x1db954,
    FRAME_RESUME: 0x3f6e74,
    TEXT: '#cccccc',
    BACKGROUND_DARK: '#1a1a1a'
  },

  LIGHTING: {
    AMBIENT: {
      COLOR: 0x404040,
      INTENSITY: 0.7 // Increased for better visibility
    },
    FLASHLIGHT: {
      COLOR: 0xffffff,
      INTENSITY: 1.5,
      DISTANCE: 15,
      ANGLE: Math.PI / 6,
      PENUMBRA: 0.5,
      DECAY: 1
    },
    RIM: {
      COLOR: 0xffa366,
      INTENSITY: 0.3
    },
    SPOT: {
      COLOR: 0xffffcc,
      INTENSITY: 0.3,
      DISTANCE: 15,
      ANGLE: Math.PI / 4,
      PENUMBRA: 0.5
    },
    PAINTING_SPOT: {
      COLOR: 0xffffff,
      INTENSITY: 2.0,
      DISTANCE: 5,
      ANGLE: Math.PI / 10,
      PENUMBRA: 0.2,
      DECAY: 1.5,
      HEIGHT_OFFSET: 2.5 // Distance above painting for spotlight
    }
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
let raycaster
let flashlight
const cameraPos = { x: 0, y: 1.7, z: 0 }

let repositories = []
let paintingMeshes = []
let spotifyTrack = null

const resumeSections = [
  {
    isResume: true,
    title: 'Summary',
    text: 'Software engineer, 9+ years. Skilled in JS, TS, Node.js, React, Python.',
    url: 'resume.pdf'
  },
  {
    isResume: true,
    title: 'Typeface (2023\u2013Present)',
    text: 'Cut bundle size, enhanced search, built components.',
    url: 'resume.pdf'
  },
  {
    isResume: true,
    title: 'Houzz (2021\u20132023)',
    text: 'Refactored home feed, unified search results.',
    url: 'resume.pdf'
  },
  {
    isResume: true,
    title: 'Yahoo (2017\u20132021)',
    text: 'Custom report tool, faster generation.',
    url: 'resume.pdf'
  },
  {
    isResume: true,
    title: 'Dcard (2013\u20132015)',
    text: 'Redesigned forum, drove user growth.',
    url: 'resume.pdf'
  }
]

let isMobile = false
let joystickRightX = 0
let joystickRightY = 0
let mobileYaw = 0
let mobilePitch = 0
const mobileLookSpeed = 1.3
const mobileMovementSpeedFactor = 1

if ('ontouchstart' in window) {
  isMobile = true
}

class Painting {
  constructor(data, x, y, z, rotation) {
    this.data = data
    this.x = x
    this.y = y
    this.z = z
    this.rotation = rotation
  }

  drawContent(context, texture) {}

  getUserData(material) {
    return { originalMaterial: material.clone() }
  }

  create() {
    let frameColor = CONFIG.COLORS.FRAME
    let frameThickness = CONFIG.PAINTING.FRAME_THICKNESS

    if (this instanceof RepoPainting) {
      frameColor = CONFIG.COLORS.FRAME_REPO
      frameThickness = CONFIG.PAINTING.FRAME_THICKNESS_REPO
    } else if (this instanceof SpotifyPainting) {
      frameColor = CONFIG.COLORS.FRAME_SPOTIFY
      frameThickness = CONFIG.PAINTING.FRAME_THICKNESS_SPOTIFY
    } else if (this instanceof ResumePainting) {
      frameColor = CONFIG.COLORS.FRAME_RESUME
      frameThickness = CONFIG.PAINTING.FRAME_THICKNESS_RESUME
    }

    // Create a more sophisticated frame with beveled edges
    const frameGeometry = new THREE.BoxGeometry(
      CONFIG.PAINTING.WIDTH + 0.2,
      CONFIG.PAINTING.HEIGHT + 0.2,
      frameThickness
    )
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: frameColor,
      roughness: 0.2,  // More polished look
      metalness: 0.8   // More metallic appearance
    })
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
    context.fillStyle = CONFIG.COLORS.BACKGROUND_DARK
    context.fillRect(0, 0, canvas.width, canvas.height)
    const texture = new THREE.CanvasTexture(canvas)
    this.drawContent(context, texture)

    const paintingGeometry = new THREE.BoxGeometry(
      CONFIG.PAINTING.WIDTH,
      CONFIG.PAINTING.HEIGHT,
      0.05
    )
    const paintingMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.4,   // Slightly glossier canvas
      metalness: 0.1,
      emissive: 0x666666,
      emissiveMap: texture
    })
    const painting = new THREE.Mesh(paintingGeometry, paintingMaterial)
    painting.castShadow = true
    painting.receiveShadow = true
    painting.position.set(this.x, this.y, this.z)

    if (this.rotation === 0) painting.position.z += 0.06
    else if (this.rotation === Math.PI) painting.position.z -= 0.06
    else if (this.rotation === Math.PI / 2) painting.position.x += 0.06
    else if (this.rotation === -Math.PI / 2) painting.position.x -= 0.06

    painting.rotation.y = this.rotation
    painting.userData = this.getUserData(paintingMaterial)
    scene.add(painting)
    paintingMeshes.push(painting)
    
    // Removed individual spotlights per painting to prevent WebGL texture limits
  }
  
  // Method to add a spotlight above the painting
  addSpotlight() {
    const spotlight = new THREE.SpotLight(
      CONFIG.LIGHTING.PAINTING_SPOT.COLOR,
      CONFIG.LIGHTING.PAINTING_SPOT.INTENSITY
    )
    
    // Set optional parameters if supported by the THREE.js version
    if (spotlight.distance !== undefined) {
      spotlight.distance = CONFIG.LIGHTING.PAINTING_SPOT.DISTANCE
    }
    if (spotlight.angle !== undefined) {
      spotlight.angle = CONFIG.LIGHTING.PAINTING_SPOT.ANGLE
    }
    if (spotlight.penumbra !== undefined) {
      spotlight.penumbra = CONFIG.LIGHTING.PAINTING_SPOT.PENUMBRA
    }
    if (spotlight.decay !== undefined) {
      spotlight.decay = CONFIG.LIGHTING.PAINTING_SPOT.DECAY
    }
    
    spotlight.castShadow = true
    if (spotlight.shadow && spotlight.shadow.mapSize) {
      spotlight.shadow.mapSize.set(512, 512)
    }
    if (spotlight.shadow && spotlight.shadow.bias !== undefined) {
      spotlight.shadow.bias = -0.0001
    }
    
    // Position the spotlight above the painting
    let spotlightX = this.x
    let spotlightY = this.y + CONFIG.LIGHTING.PAINTING_SPOT.HEIGHT_OFFSET
    let spotlightZ = this.z
    
    // Target position adjustment based on painting orientation
    let targetX = this.x
    let targetY = this.y
    let targetZ = this.z
    
    spotlight.position.set(spotlightX, spotlightY, spotlightZ)
    
    // Create and position the target
    const targetObject = new THREE.Object3D()
    targetObject.position.set(targetX, targetY, targetZ)
    scene.add(targetObject)
    
    // Set the spotlight to point at the target
    spotlight.target = targetObject
    
    // Add the spotlight to the scene
    scene.add(spotlight)
  }
}

class RepoPainting extends Painting {
  drawContent(context) {
    const repo = this.data
    context.fillStyle = CONFIG.COLORS.TEXT
    const repoName = repo.name
    context.font = 'bold 36px Arial'
    const nameWidth = context.measureText(repoName).width
    if (nameWidth > context.canvas.width - 40) context.font = 'bold 24px Arial'
    context.textAlign = 'center'
    context.fillText(repoName, context.canvas.width / 2, 50)
    if (repo.description) {
      context.font = '18px Arial'
      wrapText(
        context,
        repo.description,
        context.canvas.width / 2,
        100,
        context.canvas.width - 40,
        25
      )
    }
    context.font = '16px Arial'
    context.fillText(
      `⭐ Stars: ${repo.stargazers_count} | 🍴 Forks: ${repo.forks_count}`,
      context.canvas.width / 2,
      context.canvas.height - 80
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
      context.fillStyle = CONFIG.COLORS.TEXT
      context.fillText(
        repo.language,
        context.canvas.width / 2,
        context.canvas.height - 40
      )
    }
    context.font = '14px Arial'
    const updated = new Date(repo.updated_at).toLocaleDateString()
    context.fillText(
      `Updated: ${updated}`,
      context.canvas.width / 2,
      context.canvas.height - 15
    )
  }

  getUserData(material) {
    return {
      url: this.data.html_url,
      name: this.data.name,
      originalMaterial: material.clone()
    }
  }
}

class SpotifyPainting extends Painting {
  drawContent(context, texture) {
    const track = this.data
    const albumArt = new Image()
    albumArt.crossOrigin = 'Anonymous'
    albumArt.onload = function () {
      context.drawImage(
        albumArt,
        (context.canvas.width - CONFIG.PAINTING.ALBUM_ART_SIZE) / 2,
        30,
        CONFIG.PAINTING.ALBUM_ART_SIZE,
        CONFIG.PAINTING.ALBUM_ART_SIZE
      )
      context.fillStyle = CONFIG.COLORS.TEXT
      context.font = 'bold 32px Arial'
      context.textAlign = 'center'
      context.fillText(
        track.name,
        context.canvas.width / 2,
        CONFIG.PAINTING.ALBUM_ART_SIZE + 60
      )
      context.font = '18px Arial'
      context.fillText(
        track.artists,
        context.canvas.width / 2,
        CONFIG.PAINTING.ALBUM_ART_SIZE + 100
      )
      context.fillText(
        track.album,
        context.canvas.width / 2,
        CONFIG.PAINTING.ALBUM_ART_SIZE + 130
      )
      texture.needsUpdate = true
    }
    albumArt.src = track.albumArt
  }

  getUserData(material) {
    return {
      url: this.data.spotifyUrl,
      name: `${this.data.name} by ${this.data.artists}`,
      originalMaterial: material.clone(),
      isSpotify: true
    }
  }
}

class ResumePainting extends Painting {
  drawContent(context) {
    const section = this.data
    context.font = '18px Arial'
    const lines = wrapTextLines(
      context,
      section.text,
      context.canvas.width - 40,
      25,
      5
    )
    const titleHeight = 32
    const gapAfterTitle = 20
    const totalHeight = titleHeight + gapAfterTitle + lines.length * 25
    const startY = (context.canvas.height - totalHeight) / 2
    context.fillStyle = CONFIG.COLORS.TEXT
    context.font = 'bold 32px Arial'
    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.fillText(section.title, context.canvas.width / 2, startY)
    context.font = '18px Arial'
    let y = startY + titleHeight + gapAfterTitle
    for (const line of lines) {
      context.fillText(line, context.canvas.width / 2, y)
      y += 25
    }
    context.textBaseline = 'alphabetic'
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
      'https://api.github.com/users/davidyen1124/repos?sort=updated&per_page=20'
    ).then((res) => res.json())
    const spotifyPromise = fetch(
      'https://spotify.daviddennislinda.com/api/recently-played'
    )
      .then((res) => res.json())
      .catch((spotifyError) => {
        console.error('Error loading Spotify data:', spotifyError)
        return null
      })

    const [repoData, spotifyData] = await Promise.all([
      repoPromise,
      spotifyPromise
    ])

    repositories = repoData
    if (spotifyData) {
      spotifyTrack = spotifyData
    }

    // Initialize even if we couldn't get repositories
    init()
    document.getElementById('loading').style.display = 'none'
  } catch (error) {
    console.error('Error loading repositories:', error)
    
    // Still init the museum with resume sections only if there's an error
    repositories = []
    init()
    document.getElementById('loading').style.display = 'none'
  }
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
  // Museum atmosphere background color
  scene.background = new THREE.Color(0x1a2c42) // Using original CONFIG.COLORS.BACKGROUND
  // Lighter fog for better visibility 
  scene.fog = new THREE.Fog(0x1a2c42, 15, 30)

  const ambientLight = new THREE.AmbientLight(
    CONFIG.LIGHTING.AMBIENT.COLOR,
    CONFIG.LIGHTING.AMBIENT.INTENSITY
  )
  scene.add(ambientLight)
  
  // Add a few global spotlights to illuminate the paintings instead of individual lights
  // North wall spotlight
  const northWallLight = new THREE.SpotLight(0xffffff, 1.0)
  northWallLight.position.set(0, CONFIG.WALL_HEIGHT - 1, -CONFIG.ROOM_SIZE/2)
  northWallLight.target.position.set(0, CONFIG.PAINTING.ELEVATION, -CONFIG.ROOM_SIZE + 0.5)
  scene.add(northWallLight)
  scene.add(northWallLight.target)
  
  // South wall spotlight
  const southWallLight = new THREE.SpotLight(0xffffff, 1.0)
  southWallLight.position.set(0, CONFIG.WALL_HEIGHT - 1, CONFIG.ROOM_SIZE/2)
  southWallLight.target.position.set(0, CONFIG.PAINTING.ELEVATION, CONFIG.ROOM_SIZE - 0.5)
  scene.add(southWallLight)
  scene.add(southWallLight.target)
  
  // East wall spotlight
  const eastWallLight = new THREE.SpotLight(0xffffff, 1.0)
  eastWallLight.position.set(CONFIG.ROOM_SIZE/2, CONFIG.WALL_HEIGHT - 1, 0)
  eastWallLight.target.position.set(CONFIG.ROOM_SIZE - 0.5, CONFIG.PAINTING.ELEVATION, 0)
  scene.add(eastWallLight)
  scene.add(eastWallLight.target)
  
  // West wall spotlight
  const westWallLight = new THREE.SpotLight(0xffffff, 1.0)
  westWallLight.position.set(-CONFIG.ROOM_SIZE/2, CONFIG.WALL_HEIGHT - 1, 0)
  westWallLight.target.position.set(-CONFIG.ROOM_SIZE + 0.5, CONFIG.PAINTING.ELEVATION, 0)
  scene.add(westWallLight)
  scene.add(westWallLight.target)

  flashlight = new THREE.SpotLight(
    CONFIG.LIGHTING.FLASHLIGHT.COLOR,
    CONFIG.LIGHTING.FLASHLIGHT.INTENSITY
  )
  
  // Set optional parameters if supported by the THREE.js version
  if (flashlight.distance !== undefined) {
    flashlight.distance = CONFIG.LIGHTING.FLASHLIGHT.DISTANCE
  }
  if (flashlight.angle !== undefined) {
    flashlight.angle = CONFIG.LIGHTING.FLASHLIGHT.ANGLE
  }
  if (flashlight.penumbra !== undefined) {
    flashlight.penumbra = CONFIG.LIGHTING.FLASHLIGHT.PENUMBRA
  }
  if (flashlight.decay !== undefined) {
    flashlight.decay = CONFIG.LIGHTING.FLASHLIGHT.DECAY
  }
  
  flashlight.castShadow = true
  if (flashlight.shadow && flashlight.shadow.mapSize) {
    flashlight.shadow.mapSize.set(1024, 1024)
  }
  if (flashlight.shadow && flashlight.shadow.bias !== undefined) {
    flashlight.shadow.bias = -0.0001
  }
  flashlight.position.set(0, 0, 0)
  flashlight.target.position.set(0, 0, -1)

  const rimLight = new THREE.DirectionalLight(
    CONFIG.LIGHTING.RIM.COLOR,
    CONFIG.LIGHTING.RIM.INTENSITY
  )
  rimLight.castShadow = true
  rimLight.shadow.mapSize.set(1024, 1024)
  rimLight.position.set(1, 5, 1)
  scene.add(rimLight)

  const spotLight1 = new THREE.SpotLight(
    CONFIG.LIGHTING.SPOT.COLOR,
    CONFIG.LIGHTING.SPOT.INTENSITY
  )
  // Set optional parameters if supported
  if (spotLight1.distance !== undefined) {
    spotLight1.distance = CONFIG.LIGHTING.SPOT.DISTANCE
  }
  if (spotLight1.angle !== undefined) {
    spotLight1.angle = CONFIG.LIGHTING.SPOT.ANGLE
  }
  if (spotLight1.penumbra !== undefined) {
    spotLight1.penumbra = CONFIG.LIGHTING.SPOT.PENUMBRA
  }
  
  spotLight1.castShadow = true
  if (spotLight1.shadow && spotLight1.shadow.mapSize) {
    spotLight1.shadow.mapSize.set(1024, 1024)
  }
  spotLight1.position.set(
    CONFIG.ROOM_SIZE / 2,
    CONFIG.WALL_HEIGHT - 1,
    -CONFIG.ROOM_SIZE / 2
  )
  scene.add(spotLight1)

  const spotLight2 = new THREE.SpotLight(
    CONFIG.LIGHTING.SPOT.COLOR,
    CONFIG.LIGHTING.SPOT.INTENSITY
  )
  // Set optional parameters if supported
  if (spotLight2.distance !== undefined) {
    spotLight2.distance = CONFIG.LIGHTING.SPOT.DISTANCE
  }
  if (spotLight2.angle !== undefined) {
    spotLight2.angle = CONFIG.LIGHTING.SPOT.ANGLE
  }
  if (spotLight2.penumbra !== undefined) {
    spotLight2.penumbra = CONFIG.LIGHTING.SPOT.PENUMBRA
  }
  
  spotLight2.castShadow = true
  if (spotLight2.shadow && spotLight2.shadow.mapSize) {
    spotLight2.shadow.mapSize.set(1024, 1024)
  }
  spotLight2.position.set(
    -CONFIG.ROOM_SIZE / 2,
    CONFIG.WALL_HEIGHT - 1,
    CONFIG.ROOM_SIZE / 2
  )
  scene.add(spotLight2)

  camera.add(flashlight)
  camera.add(flashlight.target)
  scene.add(camera)

  const floorGeometry = new THREE.PlaneGeometry(
    CONFIG.ROOM_SIZE * 2,
    CONFIG.ROOM_SIZE * 2
  )

  // Simplify floor - just use a color instead of texture to reduce WebGL resources
  const floorColor = 0x333333

  // Create glossy floor material - simplified to just use color
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: floorColor,
    roughness: 0.05,  // Very low roughness for glossiness
    metalness: 0.3
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = 0
  floor.receiveShadow = true
  scene.add(floor)

  // Create a more detailed ceiling with recessed panels - common in museums
  const ceilingGeometry = new THREE.PlaneGeometry(
    CONFIG.ROOM_SIZE * 2,
    CONFIG.ROOM_SIZE * 2
  )
  
  // Simplify ceiling - just use a color instead of texture
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.0
  })
  
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = CONFIG.WALL_HEIGHT
  ceiling.receiveShadow = true
  scene.add(ceiling)

  createWalls()

  createPaintings()

  if (!isMobile) {
    controls = new THREE.PointerLockControls(camera, document.body)

    const blocker = document.getElementById('blocker')
    const instructions = document.getElementById('instructions')

    instructions.addEventListener('click', function () {
      controls.lock()
    })

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
  // Simplified wall material - just use color instead of texture
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5f0, // Light off-white
    roughness: 0.9,  // Matte finish
    metalness: 0.0   // No metallic properties
  })

  const northWallGeometry = new THREE.BoxGeometry(
    CONFIG.ROOM_SIZE * 2,
    CONFIG.WALL_HEIGHT,
    0.1
  )
  const northWall = new THREE.Mesh(northWallGeometry, wallMaterial)
  northWall.castShadow = true
  northWall.receiveShadow = true
  northWall.position.set(0, CONFIG.WALL_HEIGHT / 2, -CONFIG.ROOM_SIZE)
  scene.add(northWall)

  const southWallGeometry = new THREE.BoxGeometry(
    CONFIG.ROOM_SIZE * 2,
    CONFIG.WALL_HEIGHT,
    0.1
  )
  const southWall = new THREE.Mesh(southWallGeometry, wallMaterial)
  southWall.castShadow = true
  southWall.receiveShadow = true
  southWall.position.set(0, CONFIG.WALL_HEIGHT / 2, CONFIG.ROOM_SIZE)
  scene.add(southWall)

  const eastWallGeometry = new THREE.BoxGeometry(
    0.1,
    CONFIG.WALL_HEIGHT,
    CONFIG.ROOM_SIZE * 2
  )
  const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial)
  eastWall.castShadow = true
  eastWall.receiveShadow = true
  eastWall.position.set(CONFIG.ROOM_SIZE, CONFIG.WALL_HEIGHT / 2, 0)
  scene.add(eastWall)

  const westWallGeometry = new THREE.BoxGeometry(
    0.1,
    CONFIG.WALL_HEIGHT,
    CONFIG.ROOM_SIZE * 2
  )
  const westWall = new THREE.Mesh(westWallGeometry, wallMaterial)
  westWall.castShadow = true
  westWall.receiveShadow = true
  westWall.position.set(-CONFIG.ROOM_SIZE, CONFIG.WALL_HEIGHT / 2, 0)
  scene.add(westWall)
  
  // Add baseboards along the walls (a common museum feature)
  const baseboardMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222, // Dark color for baseboards
    roughness: 0.5,
    metalness: 0.2
  })
  
  // North baseboard
  const northBaseboardGeometry = new THREE.BoxGeometry(CONFIG.ROOM_SIZE * 2, 0.3, 0.12)
  const northBaseboard = new THREE.Mesh(northBaseboardGeometry, baseboardMaterial)
  northBaseboard.position.set(0, 0.15, -CONFIG.ROOM_SIZE + 0.06)
  scene.add(northBaseboard)
  
  // South baseboard
  const southBaseboardGeometry = new THREE.BoxGeometry(CONFIG.ROOM_SIZE * 2, 0.3, 0.12)
  const southBaseboard = new THREE.Mesh(southBaseboardGeometry, baseboardMaterial)
  southBaseboard.position.set(0, 0.15, CONFIG.ROOM_SIZE - 0.06)
  scene.add(southBaseboard)
  
  // East baseboard
  const eastBaseboardGeometry = new THREE.BoxGeometry(0.12, 0.3, CONFIG.ROOM_SIZE * 2)
  const eastBaseboard = new THREE.Mesh(eastBaseboardGeometry, baseboardMaterial)
  eastBaseboard.position.set(CONFIG.ROOM_SIZE - 0.06, 0.15, 0)
  scene.add(eastBaseboard)
  
  // West baseboard
  const westBaseboardGeometry = new THREE.BoxGeometry(0.12, 0.3, CONFIG.ROOM_SIZE * 2)
  const westBaseboard = new THREE.Mesh(westBaseboardGeometry, baseboardMaterial)
  westBaseboard.position.set(-CONFIG.ROOM_SIZE + 0.06, 0.15, 0)
  scene.add(westBaseboard)
}

function createPaintings() {
  const wallCount = 4
  const wallLength = CONFIG.ROOM_SIZE * 2
  const paintingWidth = CONFIG.PAINTING.WIDTH
  const wallOffset = CONFIG.PAINTING.WALL_OFFSET
  const availableLength = wallLength

  // Adjust repository list so each wall has the same number of paintings
  // and spacing meets the minimum requirement
  let layoutAdjusted = false
  const maxIterations = 100 // Safety limit to prevent infinite loops
  let iterations = 0
  
  while (!layoutAdjusted && iterations < maxIterations) {
    iterations++
    const totalPaintings =
      resumeSections.length +
      repositories.length +
      (spotifyTrack ? 1 : 0)

    if (totalPaintings % wallCount !== 0) {
      const removeCount = totalPaintings % wallCount
      repositories.splice(-removeCount)
      continue
    }

    const perWall = totalPaintings / wallCount
    const spacing =
      (availableLength - paintingWidth * perWall) / (perWall + 1)

    if (spacing < CONFIG.PAINTING.MIN_SPACING && repositories.length > 0) {
      repositories.pop()
      continue
    }

    layoutAdjusted = true
  }

  const basePaintings = [...resumeSections, ...repositories]
  let allPaintings = [...basePaintings]
  const paintingsPerWall =
    (basePaintings.length + (spotifyTrack ? 1 : 0)) / wallCount

  if (spotifyTrack) {
    const centerIndex = Math.floor(paintingsPerWall / 2)
    allPaintings.splice(centerIndex, 0, {
      isSpotify: true,
      spotifyData: spotifyTrack
    })
  }

  const spaceBetween =
    (availableLength - paintingWidth * paintingsPerWall) /
    (paintingsPerWall + 1)

  const firstCenter =
    -CONFIG.ROOM_SIZE + spaceBetween + paintingWidth / 2

  let index = 0

  for (let wallIndex = 0; wallIndex < wallCount; wallIndex++) {
    for (let i = 0; i < paintingsPerWall; i++) {
      const painting = allPaintings[index++]
      const pos = firstCenter + i * (paintingWidth + spaceBetween)

      let x, z, rotation

      switch (wallIndex) {
      case 0:
        x = pos
        z = -CONFIG.ROOM_SIZE + wallOffset
        rotation = 0
        break
      case 1:
        x = CONFIG.ROOM_SIZE - wallOffset
        z = pos
        rotation = -Math.PI / 2
        break
      case 2:
        x = pos
        z = CONFIG.ROOM_SIZE - wallOffset
        rotation = Math.PI
        break
      case 3:
        x = -CONFIG.ROOM_SIZE + wallOffset
        z = pos
        rotation = Math.PI / 2
        break
      }

      if (painting.isSpotify) {
        createPainting(
          painting.spotifyData,
          x,
          CONFIG.PAINTING.ELEVATION,
          z,
          rotation,
          true
        )
      } else if (painting.isResume) {
        createPainting(
          painting,
          x,
          CONFIG.PAINTING.ELEVATION,
          z,
          rotation,
          false,
          true
        )
      } else {
        createPainting(
          painting,
          x,
          CONFIG.PAINTING.ELEVATION,
          z,
          rotation
        )
      }
    }
  }
}
function createPainting(data, x, y, z, rotation, isSpotify = false, isResume = false) {
  let painting
  if (isSpotify) {
    painting = new SpotifyPainting(data, x, y, z, rotation)
  } else if (isResume) {
    painting = new ResumePainting(data, x, y, z, rotation)
  } else {
    painting = new RepoPainting(data, x, y, z, rotation)
  }
  painting.create()
}



function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let lines = 0
  const maxLines = 5

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = context.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y)
      line = words[n] + ' '
      y += lineHeight
      lines++

      if (lines >= maxLines) {
        if (n < words.length - 1) {
          context.fillText(line + '...', x, y)
          return
        }
      }
    } else {
      line = testLine
    }
  }

  context.fillText(line, x, y)
}

function wrapTextLines(context, text, maxWidth, lineHeight, maxLines) {
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
  let lastRightTouchX = 0
  let lastRightTouchY = 0

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
        lastRightTouchX = touch.pageX
        lastRightTouchY = touch.pageY
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

  direction.z = Number(moveForward) - Number(moveBackward)
  direction.x = Number(moveRight) - Number(moveLeft)
  direction.normalize()

  if (moveForward || moveBackward)
    velocity.z -= direction.z * CONFIG.MOVEMENT.SPEED * delta
  if (moveLeft || moveRight)
    velocity.x -= direction.x * CONFIG.MOVEMENT.SPEED * delta

  if (!isMobile) {
    if (controls && controls.isLocked === true) {
      controls.moveRight(-velocity.x * delta)
      controls.moveForward(-velocity.z * delta)

      if (
        controls.getObject().position.x <
        -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
      )
        controls.getObject().position.x =
          -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
      if (
        controls.getObject().position.x >
        CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
      )
        controls.getObject().position.x =
          CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
      if (
        controls.getObject().position.z <
        -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
      )
        controls.getObject().position.z =
          -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
      if (
        controls.getObject().position.z >
        CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
      )
        controls.getObject().position.z =
          CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET

      cameraPos.x = controls.getObject().position.x
      cameraPos.y = controls.getObject().position.y
      cameraPos.z = controls.getObject().position.z
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