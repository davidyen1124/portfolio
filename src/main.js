import './css/style.css';
import * as THREE from 'three';
import { CONFIG } from './js/config.js';
import { loadRepositories } from './js/api.js';
import { createWalls, createFloorAndCeiling } from './js/components/environment.js';
import { createPaintings } from './js/components/paintings.js';
import { setupDesktopControls, setupMobileControls } from './js/components/controls.js';

let camera, scene, renderer, raycaster;
let flashlight;
let paintingMeshes = [];
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const cameraPos = { x: 0, y: 1.7, z: 0 };

let isMobile = false;
const mobileLookSpeed = 1.3;
const mobileMovementSpeedFactor = 1;

if ('ontouchstart' in window) {
  isMobile = true;
}

async function init() {
  document.getElementById('loading').style.display = 'flex';
  
  const { repositories, spotifyTrack } = await loadRepositories();
  
  if (repositories.length === 0) {
    return;
  }
  
  document.getElementById('loading').style.display = 'none';
  
  setupScene();
  
  createFloorAndCeiling(scene);
  createWalls(scene);
  
  paintingMeshes = createPaintings(scene, repositories, spotifyTrack);
  
  let controls, moveState;
  
  if (!isMobile) {
    const desktopSetup = setupDesktopControls(camera, scene);
    controls = desktopSetup.controls;
    moveState = desktopSetup.moveState;
    
    controls.addEventListener('lock', function () {
      controls.object.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
    });
  } else {
    const mobileSetup = setupMobileControls();
    moveState = mobileSetup.moveState;
  }
  
  raycaster = new THREE.Raycaster();
  document.addEventListener('click', function() {
    if (!isMobile && controls && controls.isLocked) {
      handlePaintingRaycast();
    } else if (isMobile) {
      handlePaintingRaycast();
    }
  }, false);
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
  
  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  animate(controls, moveState);
}

function setupScene() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.COLORS.BACKGROUND);
  scene.fog = new THREE.Fog(CONFIG.COLORS.BACKGROUND, 8, 20);
  
  const ambientLight = new THREE.AmbientLight(
    CONFIG.LIGHTING.AMBIENT.COLOR,
    CONFIG.LIGHTING.AMBIENT.INTENSITY
  );
  scene.add(ambientLight);
  
  flashlight = new THREE.SpotLight(
    CONFIG.LIGHTING.FLASHLIGHT.COLOR,
    CONFIG.LIGHTING.FLASHLIGHT.INTENSITY,
    CONFIG.LIGHTING.FLASHLIGHT.DISTANCE,
    CONFIG.LIGHTING.FLASHLIGHT.ANGLE,
    CONFIG.LIGHTING.FLASHLIGHT.PENUMBRA,
    CONFIG.LIGHTING.FLASHLIGHT.DECAY
  );
  flashlight.position.set(0, 0, 0);
  flashlight.target.position.set(0, 0, -1);
  
  const rimLight = new THREE.DirectionalLight(
    CONFIG.LIGHTING.RIM.COLOR,
    CONFIG.LIGHTING.RIM.INTENSITY
  );
  rimLight.position.set(1, 5, 1);
  scene.add(rimLight);
  
  const spotLight1 = new THREE.SpotLight(
    CONFIG.LIGHTING.SPOT.COLOR,
    CONFIG.LIGHTING.SPOT.INTENSITY,
    CONFIG.LIGHTING.SPOT.DISTANCE,
    CONFIG.LIGHTING.SPOT.ANGLE,
    CONFIG.LIGHTING.SPOT.PENUMBRA
  );
  spotLight1.position.set(
    CONFIG.ROOM_SIZE / 2,
    CONFIG.WALL_HEIGHT - 1,
    -CONFIG.ROOM_SIZE / 2
  );
  scene.add(spotLight1);
  
  const spotLight2 = new THREE.SpotLight(
    CONFIG.LIGHTING.SPOT.COLOR,
    CONFIG.LIGHTING.SPOT.INTENSITY,
    CONFIG.LIGHTING.SPOT.DISTANCE,
    CONFIG.LIGHTING.SPOT.ANGLE,
    CONFIG.LIGHTING.SPOT.PENUMBRA
  );
  spotLight2.position.set(
    -CONFIG.ROOM_SIZE / 2,
    CONFIG.WALL_HEIGHT - 1,
    CONFIG.ROOM_SIZE / 2
  );
  scene.add(spotLight2);
  
  camera.add(flashlight);
  camera.add(flashlight.target);
  scene.add(camera);
}

function handlePaintingRaycast() {
  raycaster.setFromCamera(new THREE.Vector2(), camera);
  const intersects = raycaster.intersectObjects(paintingMeshes);
  
  if (intersects.length > 0) {
    const object = intersects[0].object;
    
    cameraPos.x = isMobile
      ? camera.position.x
      : controls.object.position.x;
    cameraPos.y = isMobile
      ? camera.position.y
      : controls.object.position.y;
    cameraPos.z = isMobile
      ? camera.position.z
      : controls.object.position.z;
    
    window.open(object.userData.url, '_blank');
  }
}

function animate(controls, moveState) {
  requestAnimationFrame(() => animate(controls, moveState));
  
  const time = performance.now();
  const delta = (time - prevTime) / 1000;
  
  velocity.x -= velocity.x * CONFIG.MOVEMENT.DECELERATION * delta;
  velocity.z -= velocity.z * CONFIG.MOVEMENT.DECELERATION * delta;
  
  direction.z = Number(moveState.getMoveForward ? moveState.getMoveForward() : moveState.moveForward) - 
                Number(moveState.getMoveBackward ? moveState.getMoveBackward() : moveState.moveBackward);
  direction.x = Number(moveState.getMoveRight ? moveState.getMoveRight() : moveState.moveRight) - 
                Number(moveState.getMoveLeft ? moveState.getMoveLeft() : moveState.moveLeft);
  direction.normalize();
  
  if (moveState.getMoveForward ? moveState.getMoveForward() : moveState.moveForward || 
      moveState.getMoveBackward ? moveState.getMoveBackward() : moveState.moveBackward)
    velocity.z -= direction.z * CONFIG.MOVEMENT.SPEED * delta;
  if (moveState.getMoveLeft ? moveState.getMoveLeft() : moveState.moveLeft || 
      moveState.getMoveRight ? moveState.getMoveRight() : moveState.moveRight)
    velocity.x -= direction.x * CONFIG.MOVEMENT.SPEED * delta;
  
  if (!isMobile) {
    if (controls && controls.isLocked === true) {
      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);
      
      if (
        controls.object.position.x <
        -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
      )
        controls.object.position.x =
          -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET;
      if (
        controls.object.position.x >
        CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
      )
        controls.object.position.x =
          CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET;
      if (
        controls.object.position.z <
        -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
      )
        controls.object.position.z =
          -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET;
      if (
        controls.object.position.z >
        CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
      )
        controls.object.position.z =
          CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET;
      
      cameraPos.x = controls.object.position.x;
      cameraPos.y = controls.object.position.y;
      cameraPos.z = controls.object.position.z;
    }
  } else {
    const mobileYaw = moveState.getMobileYaw ? moveState.getMobileYaw() : moveState.mobileYaw;
    const mobilePitch = moveState.getMobilePitch ? moveState.getMobilePitch() : moveState.mobilePitch;
    const joystickRightX = moveState.getJoystickRightX ? moveState.getJoystickRightX() : moveState.joystickRightX;
    const joystickRightY = moveState.getJoystickRightY ? moveState.getJoystickRightY() : moveState.joystickRightY;
    
    const forward = new THREE.Vector3(
      Math.sin(mobileYaw),
      0,
      Math.cos(mobileYaw)
    );
    
    const right = new THREE.Vector3(
      Math.sin(mobileYaw + Math.PI / 2),
      0,
      Math.cos(mobileYaw + Math.PI / 2)
    );
    
    if (moveState.getMoveForward ? moveState.getMoveForward() : moveState.moveForward || 
        moveState.getMoveBackward ? moveState.getMoveBackward() : moveState.moveBackward) {
      camera.position.x -=
        forward.x * velocity.z * delta * mobileMovementSpeedFactor;
      camera.position.z -=
        forward.z * velocity.z * delta * mobileMovementSpeedFactor;
    }
    
    if (moveState.getMoveLeft ? moveState.getMoveLeft() : moveState.moveLeft || 
        moveState.getMoveRight ? moveState.getMoveRight() : moveState.moveRight) {
      camera.position.x -=
        right.x * velocity.x * delta * mobileMovementSpeedFactor;
      camera.position.z -=
        right.z * velocity.x * delta * mobileMovementSpeedFactor;
    }
    
    if (
      camera.position.x <
      -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
    ) {
      camera.position.x =
        -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET;
    }
    if (
      camera.position.x >
      CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
    ) {
      camera.position.x =
        CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET;
    }
    if (
      camera.position.z <
      -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET
    ) {
      camera.position.z =
        -CONFIG.ROOM_SIZE + CONFIG.MOVEMENT.BOUNDARY_OFFSET;
    }
    if (
      camera.position.z >
      CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET
    ) {
      camera.position.z =
        CONFIG.ROOM_SIZE - CONFIG.MOVEMENT.BOUNDARY_OFFSET;
    }
    
    if (moveState.setMobileYaw) {
      moveState.setMobileYaw(mobileYaw - joystickRightX * mobileLookSpeed * delta);
    }
    
    if (moveState.setMobilePitch) {
      let newPitch = mobilePitch - joystickRightY * mobileLookSpeed * delta;
      newPitch = Math.max(
        -Math.PI / 2 + 0.01,
        Math.min(Math.PI / 2 - 0.01, newPitch)
      );
      moveState.setMobilePitch(newPitch);
    }
    
    camera.rotation.set(0, 0, 0);
    camera.rotateY(mobileYaw);
    camera.rotateX(mobilePitch);
    
    cameraPos.x = camera.position.x;
    cameraPos.y = camera.position.y;
    cameraPos.z = camera.position.z;
  }
  
  prevTime = time;
  renderer.render(scene, camera);
}

init();
