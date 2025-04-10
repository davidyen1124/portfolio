import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { CONFIG } from '../config.js';

export function setupDesktopControls(camera, scene) {
  const controls = new PointerLockControls(camera, document.body);
  
  const blocker = document.getElementById('blocker');
  const instructions = document.getElementById('instructions');
  
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  
  instructions.addEventListener('click', function () {
    controls.lock();
  });
  
  controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
  });
  
  controls.addEventListener('unlock', function () {
    blocker.style.display = 'flex';
    instructions.style.display = 'block';
  });
  
  scene.add(controls.object);
  
  const onKeyDown = function (event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = true;
        break;
    }
  };
  
  const onKeyUp = function (event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = false;
        break;
    }
  };
  
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  
  return { 
    controls, 
    moveState: { 
      getMoveForward: () => moveForward,
      getMoveBackward: () => moveBackward,
      getMoveLeft: () => moveLeft,
      getMoveRight: () => moveRight,
      setMoveForward: (value) => { moveForward = value; },
      setMoveBackward: (value) => { moveBackward = value; },
      setMoveLeft: (value) => { moveLeft = value; },
      setMoveRight: (value) => { moveRight = value; }
    }
  };
}

export function setupMobileControls() {
  document.getElementById('blocker').style.display = 'none';
  document.getElementById('instructions').style.display = 'none';
  
  document.getElementById('joystick-left').style.display = 'block';
  document.getElementById('joystick-right').style.display = 'block';
  
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let joystickRightX = 0;
  let joystickRightY = 0;
  let mobileYaw = 0;
  let mobilePitch = 0;
  
  const leftEl = document.getElementById('joystick-left');
  const rightEl = document.getElementById('joystick-right');
  
  let leftTouchId = null;
  let leftCenter = { x: 0, y: 0 };
  let rightTouchId = null;
  let rightCenter = { x: 0, y: 0 };
  
  function handleTouchStart(e) {
    e.preventDefault();
    for (let touch of e.changedTouches) {
      const rectLeft = leftEl.getBoundingClientRect();
      const rectRight = rightEl.getBoundingClientRect();
      
      if (
        touch.pageX >= rectLeft.left &&
        touch.pageX <= rectLeft.right &&
        touch.pageY >= rectLeft.top &&
        touch.pageY <= rectLeft.bottom
      ) {
        leftTouchId = touch.identifier;
        leftCenter = {
          x: rectLeft.left + rectLeft.width / 2,
          y: rectLeft.top + rectLeft.height / 2
        };
      } else if (
        touch.pageX >= rectRight.left &&
        touch.pageX <= rectRight.right &&
        touch.pageY >= rectRight.top &&
        touch.pageY <= rectRight.bottom
      ) {
        rightTouchId = touch.identifier;
        rightCenter = {
          x: rectRight.left + rectRight.width / 2,
          y: rectRight.top + rectRight.height / 2
        };
      }
    }
  }
  
  function handleTouchMove(e) {
    e.preventDefault();
    for (let touch of e.changedTouches) {
      if (touch.identifier === leftTouchId) {
        const dx = touch.pageX - leftCenter.x;
        const dy = touch.pageY - leftCenter.y;
        
        moveForward = dy < -10;
        moveBackward = dy > 10;
        moveLeft = dx < -10;
        moveRight = dx > 10;
        
        const stick = leftEl.querySelector('.joystick');
        if (stick) {
          const maxDist = 30;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const factor = dist > maxDist ? maxDist / dist : 1;
          
          stick.style.transform = `translate(${dx * factor}px, ${
            dy * factor
          }px)`;
        }
      } else if (touch.identifier === rightTouchId) {
        const dx = touch.pageX - rightCenter.x;
        const dy = touch.pageY - rightCenter.y;
        
        const maxDist = 40;
        const deadzone = 5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > deadzone) {
          const normalizedDist = Math.min(
            1,
            (dist - deadzone) / (maxDist - deadzone)
          );
          joystickRightX = (dx / dist) * normalizedDist;
          joystickRightY = (dy / dist) * normalizedDist;
        } else {
          joystickRightX = 0;
          joystickRightY = 0;
        }
        
        const stick = rightEl.querySelector('.joystick');
        if (stick) {
          const visualFactor = dist > maxDist ? maxDist / dist : 1;
          stick.style.transform = `translate(${dx * visualFactor}px, ${
            dy * visualFactor
          }px)`;
        }
      }
    }
  }
  
  function handleTouchEnd(e) {
    e.preventDefault();
    for (let touch of e.changedTouches) {
      if (touch.identifier === leftTouchId) {
        leftTouchId = null;
        moveForward = false;
        moveBackward = false;
        moveLeft = false;
        moveRight = false;
        
        const stick = leftEl.querySelector('.joystick');
        if (stick) {
          stick.style.transform = 'translate(0px, 0px)';
        }
      } else if (touch.identifier === rightTouchId) {
        rightTouchId = null;
        joystickRightX = 0;
        joystickRightY = 0;
        
        const stick = rightEl.querySelector('.joystick');
        if (stick) {
          stick.style.transform = 'translate(0px, 0px)';
        }
      }
    }
  }
  
  leftEl.addEventListener('touchstart', handleTouchStart, {
    passive: false
  });
  leftEl.addEventListener('touchmove', handleTouchMove, {
    passive: false
  });
  leftEl.addEventListener('touchend', handleTouchEnd, { passive: false });
  leftEl.addEventListener('touchcancel', handleTouchEnd, {
    passive: false
  });
  
  rightEl.addEventListener('touchstart', handleTouchStart, {
    passive: false
  });
  rightEl.addEventListener('touchmove', handleTouchMove, {
    passive: false
  });
  rightEl.addEventListener('touchend', handleTouchEnd, { passive: false });
  rightEl.addEventListener('touchcancel', handleTouchEnd, {
    passive: false
  });
  
  return {
    moveState: {
      getMoveForward: () => moveForward,
      getMoveBackward: () => moveBackward,
      getMoveLeft: () => moveLeft,
      getMoveRight: () => moveRight,
      getJoystickRightX: () => joystickRightX,
      getJoystickRightY: () => joystickRightY,
      getMobileYaw: () => mobileYaw,
      getMobilePitch: () => mobilePitch,
      setMoveForward: (value) => { moveForward = value; },
      setMoveBackward: (value) => { moveBackward = value; },
      setMoveLeft: (value) => { moveLeft = value; },
      setMoveRight: (value) => { moveRight = value; },
      setJoystickRightX: (value) => { joystickRightX = value; },
      setJoystickRightY: (value) => { joystickRightY = value; },
      setMobileYaw: (value) => { mobileYaw = value; },
      setMobilePitch: (value) => { mobilePitch = value; }
    }
  };
}
