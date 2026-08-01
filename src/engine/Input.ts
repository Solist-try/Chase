import type { InputState } from './types';

const EMPTY: InputState = {
  up: false,
  down: false,
  left: false,
  right: false,
  action: false,
  pause: false,
};

/** Keyboard + on-screen control bridge for the canvas game. */
export class InputManager {
  private keys = new Set<string>();
  private virtual: Partial<InputState> = {};
  private pausePressed = false;

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  setVirtual(partial: Partial<InputState>): void {
    this.virtual = { ...this.virtual, ...partial };
  }

  clearVirtual(): void {
    this.virtual = {};
  }

  getState(): InputState {
    const keyboard: InputState = {
      up: this.keys.has('ArrowUp') || this.keys.has('KeyW'),
      down: this.keys.has('ArrowDown') || this.keys.has('KeyS'),
      left: this.keys.has('ArrowLeft') || this.keys.has('KeyA'),
      right: this.keys.has('ArrowRight') || this.keys.has('KeyD'),
      action: this.keys.has('Space') || this.keys.has('KeyE'),
      pause: false,
    };

    const pauseKey = this.keys.has('Escape') || this.keys.has('KeyP');
    const pause = pauseKey && !this.pausePressed;
    this.pausePressed = pauseKey;

    return {
      up: keyboard.up || !!this.virtual.up,
      down: keyboard.down || !!this.virtual.down,
      left: keyboard.left || !!this.virtual.left,
      right: keyboard.right || !!this.virtual.right,
      action: keyboard.action || !!this.virtual.action,
      pause: pause || !!this.virtual.pause,
    };
  }

  reset(): InputState {
    this.keys.clear();
    this.virtual = {};
    return { ...EMPTY };
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(
        event.code,
      )
    ) {
      event.preventDefault();
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };
}
