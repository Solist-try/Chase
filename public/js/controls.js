/**
 * Keyboard controls — track which keys are currently pressed.
 */

/** @type {Record<string, boolean>} */
export const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  Space: false,
  KeyA: false,
  KeyD: false,
  KeyW: false,
};

function setKey(event, isDown) {
  // Prefer event.code (layout-independent); also accept event.key names.
  if (Object.prototype.hasOwnProperty.call(keys, event.code)) {
    keys[event.code] = isDown;
  }
  if (Object.prototype.hasOwnProperty.call(keys, event.key)) {
    keys[event.key] = isDown;
  }

  // Space is reported as event.code === 'Space' and event.key === ' '.
  if (event.code === 'Space' || event.key === ' ') {
    keys.Space = isDown;
    if (isDown) event.preventDefault();
  }
}

function onKeyDown(event) {
  setKey(event, true);
}

function onKeyUp(event) {
  setKey(event, false);
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

  for (const key of Object.keys(keys)) {
    keys[key] = false;
  }
}

/** Convenience helpers used by the game engine. */
export function isLeftPressed() {
  return keys.ArrowLeft || keys.KeyA;
}

export function isRightPressed() {
  return keys.ArrowRight || keys.KeyD;
}

export function isJumpPressed() {
  return keys.Space || keys.ArrowUp || keys.KeyW;
}

export default keys;
