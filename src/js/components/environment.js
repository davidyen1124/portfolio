import * as THREE from 'three';
import { CONFIG } from '../config.js';

export function createWalls(scene) {
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: CONFIG.COLORS.WALLS,
    roughness: 0.8,
    metalness: 0.2
  });

  const northWallGeometry = new THREE.BoxGeometry(
    CONFIG.ROOM_SIZE * 2,
    CONFIG.WALL_HEIGHT,
    0.1
  );
  const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
  northWall.position.set(0, CONFIG.WALL_HEIGHT / 2, -CONFIG.ROOM_SIZE);
  scene.add(northWall);

  const southWallGeometry = new THREE.BoxGeometry(
    CONFIG.ROOM_SIZE * 2,
    CONFIG.WALL_HEIGHT,
    0.1
  );
  const southWall = new THREE.Mesh(southWallGeometry, wallMaterial);
  southWall.position.set(0, CONFIG.WALL_HEIGHT / 2, CONFIG.ROOM_SIZE);
  scene.add(southWall);

  const eastWallGeometry = new THREE.BoxGeometry(
    0.1,
    CONFIG.WALL_HEIGHT,
    CONFIG.ROOM_SIZE * 2
  );
  const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
  eastWall.position.set(CONFIG.ROOM_SIZE, CONFIG.WALL_HEIGHT / 2, 0);
  scene.add(eastWall);

  const westWallGeometry = new THREE.BoxGeometry(
    0.1,
    CONFIG.WALL_HEIGHT,
    CONFIG.ROOM_SIZE * 2
  );
  const westWall = new THREE.Mesh(westWallGeometry, wallMaterial);
  westWall.position.set(-CONFIG.ROOM_SIZE, CONFIG.WALL_HEIGHT / 2, 0);
  scene.add(westWall);
}

export function createFloorAndCeiling(scene) {
  const floorGeometry = new THREE.PlaneGeometry(
    CONFIG.ROOM_SIZE * 2,
    CONFIG.ROOM_SIZE * 2
  );
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: CONFIG.COLORS.FLOOR,
    roughness: 0.7,
    metalness: 0.3
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  const ceilingGeometry = new THREE.PlaneGeometry(
    CONFIG.ROOM_SIZE * 2,
    CONFIG.ROOM_SIZE * 2
  );
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: CONFIG.COLORS.CEILING,
    roughness: 0.9,
    metalness: 0.15
  });
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = CONFIG.WALL_HEIGHT;
  scene.add(ceiling);
}
