import type { InputState } from './types';

/** Kid-friendly platformer bindings. */
export const CONTROL_BINDINGS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  down: ['ArrowDown', 'KeyS'],
  /** Space is primary; Up / W kept as forgiving extras. */
  jump: ['Space', 'ArrowUp', 'KeyW'],
  dash: ['ShiftLeft', 'ShiftRight'],
  /** Talk / interact — kept off Space so jump stays reliable. */
  action: ['KeyE', 'Enter'],
  pause: ['Escape', 'KeyP'],
} as const;

/**
 * Short, safe dash tuning for age ~8.
 * Fast enough to feel fun, short enough to stay controllable.
 */
export const DASH_CONFIG = {
  /** Peak horizontal dash speed (px/s). */
  speed: 400,
  /** How long the boost lasts (seconds). */
  duration: 0.12,
  /** Time before another dash (seconds). */
  cooldown: 0.5,
  /** Allow one dash while airborne before landing. */
  allowAirDash: true,
  /** Soften vertical speed during dash so arcs stay readable. */
  airVerticalScale: 0.35,
  /** Tiny jump-buffer style window so early Shift still counts. */
  inputBuffer: 0.1,
} as const;

export type PlatformerVirtual = Partial<
  Pick<InputState, 'left' | 'right' | 'down' | 'jump' | 'dash' | 'action' | 'pause'>
>;

const EMPTY: InputState = {
  up: false,
  down: false,
  left: false,
  right: false,
  jump: false,
  dash: false,
  action: false,
  pause: false,
};

/**
 * Traditional platformer controls with smooth, forgiving polling.
 *
 * - Arrow keys / WASD → move
 * - Space (also Up / W) → jump
 * - Shift → short safe dash
 * - E / Enter → talk
 */
export class Controls {
  private keys = new Set<string>();
  private virtual: PlatformerVirtual = {};
  private pauseHeld = false;
  private jumpHeld = false;
  private dashHeld = false;

  /** Extra forgiveness windows (seconds). */
  private jumpBuffer = 0;
  private dashBuffer = 0;

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  setVirtual(partial: PlatformerVirtual): void {
    this.virtual = { ...this.virtual, ...partial };
  }

  clearVirtual(): void {
    this.virtual = {};
  }

  /** Advance buffers and return this frame's platformer input. */
  poll(dt: number): InputState {
    const left =
      this.isDown(CONTROL_BINDINGS.left) || !!this.virtual.left;
    const right =
      this.isDown(CONTROL_BINDINGS.right) || !!this.virtual.right;
    const down =
      this.isDown(CONTROL_BINDINGS.down) || !!this.virtual.down;
    const jumpDown =
      this.isDown(CONTROL_BINDINGS.jump) || !!this.virtual.jump;
    const dashDown =
      this.isDown(CONTROL_BINDINGS.dash) || !!this.virtual.dash;
    const action =
      this.isDown(CONTROL_BINDINGS.action) || !!this.virtual.action;

    // Rising-edge + hold buffering → late / early presses still feel fair
    if (jumpDown && !this.jumpHeld) {
      this.jumpBuffer = Math.max(this.jumpBuffer, 0.14);
    }
    if (dashDown && !this.dashHeld) {
      this.dashBuffer = Math.max(this.dashBuffer, DASH_CONFIG.inputBuffer);
    }
    this.jumpHeld = jumpDown;
    this.dashHeld = dashDown;

    this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
    this.dashBuffer = Math.max(0, this.dashBuffer - dt);

    const pauseKey =
      this.isDown(CONTROL_BINDINGS.pause) || !!this.virtual.pause;
    const pause = pauseKey && !this.pauseHeld;
    this.pauseHeld = pauseKey;

    // `up` mirrors jump for legacy callers; movement uses left/right.
    return {
      left,
      right,
      down,
      up: jumpDown,
      jump: jumpDown || this.jumpBuffer > 0,
      dash: dashDown || this.dashBuffer > 0,
      action,
      pause,
    };
  }

  /** Consume the buffered jump press (call when a jump actually starts). */
  consumeJumpBuffer(): void {
    this.jumpBuffer = 0;
  }

  /** Consume the buffered dash press (call when a dash actually starts). */
  consumeDashBuffer(): void {
    this.dashBuffer = 0;
  }

  hasJumpBuffer(): boolean {
    return this.jumpBuffer > 0;
  }

  hasDashBuffer(): boolean {
    return this.dashBuffer > 0;
  }

  reset(): InputState {
    this.keys.clear();
    this.virtual = {};
    this.pauseHeld = false;
    this.jumpHeld = false;
    this.dashHeld = false;
    this.jumpBuffer = 0;
    this.dashBuffer = 0;
    return { ...EMPTY };
  }

  private isDown(codes: readonly string[]): boolean {
    return codes.some((code) => this.keys.has(code));
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
    if (shouldPreventDefault(event.code)) {
      event.preventDefault();
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };
}

function shouldPreventDefault(code: string): boolean {
  return (
    code.startsWith('Arrow') ||
    code === 'Space' ||
    code === 'ShiftLeft' ||
    code === 'ShiftRight'
  );
}
