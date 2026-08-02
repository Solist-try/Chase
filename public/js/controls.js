/**
 * Keyboard controls — a simple left / right / jump object for GameEngine.
 */

export const controls = {
  left: false,
  right: false,
  jump: false,
};

function applyKey(event, isDown) {
  const key = (event.key || '').toLowerCase();
  const code = event.code || '';

  if (key === 'arrowleft' || key === 'a' || code === 'ArrowLeft' || code === 'KeyA') {
    controls.left = isDown;
  }
  if (key === 'arrowright' || key === 'd' || code === 'ArrowRight' || code === 'KeyD') {
    controls.right = isDown;
  }
  if (
    key === ' ' ||
    key === 'spacebar' ||
    key === 'space' ||
    key === 'arrowup' ||
    key === 'w' ||
    code === 'Space' ||
    code === 'ArrowUp' ||
    code === 'KeyW'
  ) {
    controls.jump = isDown;
    if (isDown) event.preventDefault();
  }
}

function onKeyDown(event) {
  applyKey(event, true);
}

function onKeyUp(event) {
  applyKey(event, false);
}

/** Start listening for keyboard input. */
export function startControls() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

/** Stop listening and clear pressed keys. */
export function stopControls() {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  controls.left = false;
  controls.right = false;
  controls.jump = false;
}

export default controls;
