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

/** One-shot jump tap buffer so short presses are not missed between frames. */
let jumpQueued = false;

function isJumpKey(event) {
  return (
    event.code === 'Space' ||
    event.key === ' ' ||
    event.code === 'ArrowUp' ||
    event.key === 'ArrowUp' ||
    event.code === 'KeyW' ||
    event.key === 'w' ||
    event.key === 'W'
  );
}

function setKey(event, isDown) {
  // Prefer event.code (layout-independent); also accept event.key names.
  if (Object.prototype.hasOwnProperty.call(keys, event.code)) {
    keys[event.code] = isDown;
  }
  if (Object.prototype.hasOwnProperty.call(keys, event.key)) {
    keys[event.key] = isDown;
  }

  // Letter keys: event.key is "a"/"d"/"w" while keys uses KeyA/KeyD/KeyW.
  const letter = event.key?.length === 1 ? event.key.toLowerCase() : '';
  if (letter === 'a') keys.KeyA = isDown;
  if (letter === 'd') keys.KeyD = isDown;
  if (letter === 'w') keys.KeyW = isDown;

  // Space is reported as event.code === 'Space' and event.key === ' '.
  if (event.code === 'Space' || event.key === ' ') {
    keys.Space = isDown;
    if (isDown) event.preventDefault();
  }

  // Queue jump on the frame the key is first pressed.
  if (isDown && isJumpKey(event)) {
    jumpQueued = true;
    event.preventDefault();
  }
}

function onKeyDown(event) {
  if (event.repeat) return;
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
  jumpQueued = false;
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

/** True once per jump tap; clears the queue. */
export function consumeJump() {
  if (!jumpQueued) return false;
  jumpQueued = false;
  return true;
}

export default keys;
