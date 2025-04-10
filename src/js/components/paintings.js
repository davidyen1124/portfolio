import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { wrapText } from '../utils/text.js';

export function createPaintings(scene, repositories, spotifyTrack) {
  const paintingMeshes = [];
  const allPaintings = [...repositories];

  if (spotifyTrack) {
    allPaintings.splice(1, 0, {
      isSpotify: true,
      spotifyData: spotifyTrack
    });
  }

  const totalPaintings = allPaintings.length;
  const wallCount = 4;

  const baseCountPerWall = Math.floor(totalPaintings / wallCount);
  const remainder = totalPaintings % wallCount;

  const wallLength = CONFIG.ROOM_SIZE * 2;
  const paintingWidth = CONFIG.PAINTING.WIDTH;
  const wallOffset = CONFIG.PAINTING.WALL_OFFSET;

  let paintingCounter = 0;

  for (let wallIndex = 0; wallIndex < wallCount; wallIndex++) {
    const paintingsOnThisWall =
      baseCountPerWall + (wallIndex < remainder ? 1 : 0);

    if (paintingsOnThisWall <= 0) continue;

    const totalGapSpace = wallLength - paintingsOnThisWall * paintingWidth;
    const spaceBetween = totalGapSpace / (paintingsOnThisWall + 1);

    for (let i = 0; i < paintingsOnThisWall; i++) {
      const painting = allPaintings[paintingCounter++];

      const positionOnWall =
        -CONFIG.ROOM_SIZE +
        spaceBetween +
        (paintingWidth + spaceBetween) * i;

      let x, z, rotation;

      switch (wallIndex) {
        case 0:
          x = positionOnWall;
          z = -CONFIG.ROOM_SIZE + wallOffset;
          rotation = 0;
          break;
        case 1:
          x = CONFIG.ROOM_SIZE - wallOffset;
          z = positionOnWall;
          rotation = -Math.PI / 2;
          break;
        case 2:
          x = positionOnWall;
          z = CONFIG.ROOM_SIZE - wallOffset;
          rotation = Math.PI;
          break;
        case 3:
          x = -CONFIG.ROOM_SIZE + wallOffset;
          z = positionOnWall;
          rotation = Math.PI / 2;
          break;
      }

      if (painting.isSpotify) {
        const paintingMesh = createPainting(
          scene,
          painting.spotifyData,
          x,
          CONFIG.PAINTING.ELEVATION,
          z,
          rotation,
          true
        );
        paintingMeshes.push(paintingMesh);
      } else {
        const paintingMesh = createPainting(
          scene,
          painting,
          x,
          CONFIG.PAINTING.ELEVATION,
          z,
          rotation
        );
        paintingMeshes.push(paintingMesh);
      }
    }
  }

  return paintingMeshes;
}

function createPainting(scene, data, x, y, z, rotation, isSpotify = false) {
  const frameGeometry = new THREE.BoxGeometry(
    CONFIG.PAINTING.WIDTH + 0.2,
    CONFIG.PAINTING.HEIGHT + 0.2,
    CONFIG.PAINTING.FRAME_THICKNESS
  );
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: CONFIG.COLORS.FRAME,
    roughness: 0.4,
    metalness: 0.7
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.set(x, y, z);
  frame.rotation.y = rotation;
  scene.add(frame);

  const canvas = document.createElement('canvas');
  canvas.width = CONFIG.PAINTING.CANVAS_WIDTH;
  canvas.height = CONFIG.PAINTING.CANVAS_HEIGHT;
  const context = canvas.getContext('2d');

  context.fillStyle = CONFIG.COLORS.BACKGROUND_DARK;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);

  if (isSpotify) {
    const track = data;

    const albumArt = new Image();
    albumArt.crossOrigin = 'Anonymous';

    albumArt.onload = function () {
      context.drawImage(
        albumArt,
        (canvas.width - CONFIG.PAINTING.ALBUM_ART_SIZE) / 2,
        30,
        CONFIG.PAINTING.ALBUM_ART_SIZE,
        CONFIG.PAINTING.ALBUM_ART_SIZE
      );

      context.fillStyle = CONFIG.COLORS.TEXT;
      context.font = 'bold 32px Arial';
      context.textAlign = 'center';
      context.fillText(
        track.name,
        canvas.width / 2,
        CONFIG.PAINTING.ALBUM_ART_SIZE + 60
      );

      context.font = '18px Arial';
      context.fillText(
        track.artists,
        canvas.width / 2,
        CONFIG.PAINTING.ALBUM_ART_SIZE + 100
      );

      context.fillText(
        track.album,
        canvas.width / 2,
        CONFIG.PAINTING.ALBUM_ART_SIZE + 130
      );

      texture.needsUpdate = true;
    };

    albumArt.src = track.albumArt;
  } else {
    const repo = data;

    context.fillStyle = CONFIG.COLORS.TEXT;

    const repoName = repo.name;
    context.font = 'bold 36px Arial';
    const nameWidth = context.measureText(repoName).width;
    if (nameWidth > canvas.width - 40) {
      context.font = 'bold 24px Arial';
    }
    context.textAlign = 'center';
    context.fillText(repoName, canvas.width / 2, 50);

    if (repo.description) {
      context.font = '18px Arial';
      wrapText(
        context,
        repo.description,
        canvas.width / 2,
        100,
        canvas.width - 40,
        25
      );
    }

    context.font = '16px Arial';
    context.fillText(
      `⭐ Stars: ${repo.stargazers_count} | 🍴 Forks: ${repo.forks_count}`,
      canvas.width / 2,
      canvas.height - 80
    );

    if (repo.language) {
      const langColor = CONFIG.LANGUAGE_COLORS[repo.language] || '#888888';

      context.fillStyle = langColor;
      context.beginPath();
      context.arc(
        canvas.width / 2 - 50,
        canvas.height - 40,
        8,
        0,
        2 * Math.PI
      );
      context.fill();

      context.fillStyle = CONFIG.COLORS.TEXT;
      context.fillText(
        repo.language,
        canvas.width / 2,
        canvas.height - 40
      );
    }

    context.font = '14px Arial';
    const updated = new Date(repo.updated_at).toLocaleDateString();
    context.fillText(
      `Updated: ${updated}`,
      canvas.width / 2,
      canvas.height - 15
    );
  }

  const paintingGeometry = new THREE.BoxGeometry(
    CONFIG.PAINTING.WIDTH,
    CONFIG.PAINTING.HEIGHT,
    0.05
  );

  const paintingMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.5,
    metalness: 0.1,
    emissive: 0x666666,
    emissiveMap: texture
  });

  const painting = new THREE.Mesh(paintingGeometry, paintingMaterial);
  painting.position.set(x, y, z);

  if (rotation === 0) painting.position.z += 0.06;
  else if (rotation === Math.PI) painting.position.z -= 0.06;
  else if (rotation === Math.PI / 2) painting.position.x += 0.06;
  else if (rotation === -Math.PI / 2) painting.position.x -= 0.06;

  painting.rotation.y = rotation;

  if (isSpotify) {
    painting.userData = {
      url: data.spotifyUrl,
      name: `${data.name} by ${data.artists}`,
      originalMaterial: paintingMaterial.clone(),
      isSpotify: true
    };
  } else {
    painting.userData = {
      url: data.html_url,
      name: data.name,
      originalMaterial: paintingMaterial.clone()
    };
  }

  scene.add(painting);

  return painting;
}
