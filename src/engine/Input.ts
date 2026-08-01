import { Controls, type PlatformerVirtual } from './controls';
import type { InputState } from './types';

/**
 * Thin compatibility wrapper around {@link Controls}.
 * Prefer `Controls` directly for new platformer code.
 */
export class InputManager {
  private readonly controls = new Controls();

  dispose(): void {
    this.controls.dispose();
  }

  setVirtual(partial: PlatformerVirtual): void {
    this.controls.setVirtual(partial);
  }

  clearVirtual(): void {
    this.controls.clearVirtual();
  }

  /** Poll without advancing buffers (dt = 0). Prefer engine.handleInput. */
  getState(): InputState {
    return this.controls.poll(0);
  }

  poll(dt: number): InputState {
    return this.controls.poll(dt);
  }

  getControls(): Controls {
    return this.controls;
  }

  reset(): InputState {
    return this.controls.reset();
  }
}
