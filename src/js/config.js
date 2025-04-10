export const CONFIG = {
  WALL_HEIGHT: 5,
  ROOM_SIZE: 15,

  PAINTING: {
    WIDTH: 2.5,
    HEIGHT: 2,
    SPACING: 3,
    ELEVATION: 1.5,
    FRAME_THICKNESS: 0.1,
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
    TEXT: '#cccccc',
    BACKGROUND_DARK: '#1a1a1a'
  },

  LIGHTING: {
    AMBIENT: {
      COLOR: 0x404040,
      INTENSITY: 0.5
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
};
