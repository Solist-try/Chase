import { collideWithWorld } from './collisions';
import { InputManager } from './Input';
import { integrate } from './physics';
import type { InputState, PhysicsBody, Rect } from './types';

/**
 * Difficulty profile tuned for ~age 8:
 * floaty jumps, coyote time, jump buffer, slow enemies.
 */
export const KIDS_DIFFICULTY = {
  /** Horizontal run speed (px/s). Slightly slower than a typical Mario-like (~220). */
  moveSpeed: 190,
  /** Upward jump impulse (px/s). Higher = easier gaps. */
  jumpForce: 580,
  /** World gravity (px/s²). Lower = longer hang time. */
  gravity: 1350,
  /** Cap on downward speed so falls feel gentle. */
  maxFallSpeed: 680,
  /** Extra air steering while jumping (0–1). */
  airControl: 0.9,
  /** Jump still allowed shortly after walking off a ledge (seconds). */
  coyoteTime: 0.14,
  /** Jump pressed slightly early still counts (seconds). */
  jumpBuffer: 0.14,
  /** Variable jump: release jump early to cut height. */
  jumpCutMultiplier: 0.45,
  /** Ground friction when no left/right input. */
  groundFriction: 0.78,
  /** Default patrol / chase speed for enemies (px/s). */
  enemySpeed: 45,
  /** Max dt clamp so spikes don't fling the player. */
  maxDelta: 1 / 20,
} as const;

export type KidsDifficulty = typeof KIDS_DIFFICULTY;

export interface GameEngineOptions {
  canvas: HTMLCanvasElement;
  /** Override any kid-difficulty knobs. */
  difficulty?: Partial<KidsDifficulty>;
  /** Called every frame after core physics helpers are available. */
  onUpdate?: (dt: number, input: InputState, engine: GameEngine) => void;
  /** Called every frame after the canvas is cleared. */
  onRender?: (ctx: CanvasRenderingContext2D, engine: GameEngine) => void;
  /** Fired when pause is toggled (Esc / P) or setPaused(). */
  onPauseChange?: (paused: boolean) => void;
  /** Clear color before onRender. */
  clearColor?: string;
}

interface JumpMemory {
  coyoteTimer: number;
  bufferTimer: number;
  jumpHeld: boolean;
}

/**
 * Core browser game engine: rAF loop, input, update/render, kid-friendly physics.
 */
export class GameEngine {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly input: InputManager;
  readonly difficulty: KidsDifficulty;

  private running = false;
  private rafId = 0;
  private lastTime = 0;
  private paused = false;
  private readonly jumpMemory = new WeakMap<PhysicsBody, JumpMemory>();
  private readonly onUpdate?: GameEngineOptions['onUpdate'];
  private readonly onRender?: GameEngineOptions['onRender'];
  private readonly onPauseChange?: GameEngineOptions['onPauseChange'];
  private readonly clearColor: string;
  private currentInput: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
    pause: false,
  };

  constructor(options: GameEngineOptions) {
    const ctx = options.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context is not available');
    }

    this.canvas = options.canvas;
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.input = new InputManager();
    this.difficulty = { ...KIDS_DIFFICULTY, ...options.difficulty };
    this.onUpdate = options.onUpdate;
    this.onRender = options.onRender;
    this.onPauseChange = options.onPauseChange;
    this.clearColor = options.clearColor ?? '#7ec8e3';
  }

  /** Start the main requestAnimationFrame loop. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  /** Stop the loop and release keyboard listeners. */
  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.input.dispose();
  }

  setPaused(value: boolean): void {
    if (this.paused === value) return;
    this.paused = value;
    this.onPauseChange?.(this.paused);
  }

  isPaused(): boolean {
    return this.paused;
  }

  getInput(): InputState {
    return this.currentInput;
  }

  // ---------------------------------------------------------------------------
  // Frame pipeline
  // ---------------------------------------------------------------------------

  private tick = (now: number): void => {
    if (!this.running) return;

    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(rawDt, this.difficulty.maxDelta);

    this.handleInput();
    if (!this.paused) {
      this.update(dt);
    }
    this.render();

    this.rafId = requestAnimationFrame(this.tick);
  };

  /** Read keyboard / virtual controls for this frame. */
  handleInput(): void {
    this.currentInput = this.input.getState();

    if (this.currentInput.pause) {
      this.setPaused(!this.paused);
    }
  }

  /** Advance simulation. Gameplay systems hook in via onUpdate. */
  update(dt: number): void {
    this.onUpdate?.(dt, this.currentInput, this);
  }

  /** Draw the frame. Clears the canvas, then calls onRender. */
  render(): void {
    const { ctx, canvas, clearColor } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = clearColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.onRender?.(ctx, this);
  }

  // ---------------------------------------------------------------------------
  // Physics — gravity, jump arc, horizontal movement (kid-tuned)
  // ---------------------------------------------------------------------------

  /**
   * Apply horizontal run + forgiving jump arc to a body.
   * Use for the player in side-scrolling / platform levels.
   */
  applyPlayerPhysics(
    body: PhysicsBody,
    input: InputState,
    solids: Rect[] = [],
    dt: number,
  ): void {
    this.applyHorizontalMovement(body, input, dt);
    this.applyJumpArc(body, input, dt);
    this.applyGravity(body, dt);
    integrate(body, dt);
    collideWithWorld(body, solids);
    this.refreshCoyote(body);
  }

  /** Left/right movement with soft ground friction and strong air control. */
  applyHorizontalMovement(
    body: PhysicsBody,
    input: InputState,
    _dt: number,
  ): void {
    const { moveSpeed, airControl, groundFriction } = this.difficulty;
    const control = body.grounded ? 1 : airControl;

    let axis = 0;
    if (input.left) axis -= 1;
    if (input.right) axis += 1;

    if (axis !== 0) {
      body.velocity.x = axis * moveSpeed * control;
      return;
    }

    if (body.grounded) {
      body.velocity.x *= groundFriction;
      if (Math.abs(body.velocity.x) < 6) body.velocity.x = 0;
    } else {
      body.velocity.x *= 0.96;
    }
  }

  /**
   * Forgiving jump: coyote time + input buffer + variable jump height.
   * Holding jump longer makes a higher arc; releasing cuts the jump short.
   */
  applyJumpArc(body: PhysicsBody, input: InputState, dt: number): void {
    const memory = this.getJumpMemory(body);
    const { jumpForce, coyoteTime, jumpBuffer, jumpCutMultiplier } =
      this.difficulty;

    if (body.grounded) {
      memory.coyoteTimer = coyoteTime;
    } else {
      memory.coyoteTimer = Math.max(0, memory.coyoteTimer - dt);
    }

    if (input.up) {
      memory.bufferTimer = jumpBuffer;
    } else {
      memory.bufferTimer = Math.max(0, memory.bufferTimer - dt);
    }

    const canJump = memory.coyoteTimer > 0;
    const wantsJump = memory.bufferTimer > 0;

    if (canJump && wantsJump) {
      body.velocity.y = -jumpForce;
      body.grounded = false;
      memory.coyoteTimer = 0;
      memory.bufferTimer = 0;
      memory.jumpHeld = true;
    }

    // Variable jump arc: release early → shorter hop (easier to control landings)
    if (memory.jumpHeld && !input.up && body.velocity.y < 0) {
      body.velocity.y *= jumpCutMultiplier;
      memory.jumpHeld = false;
    }

    if (body.grounded || body.velocity.y >= 0) {
      memory.jumpHeld = false;
    }
  }

  /** Soft gravity with a gentle terminal velocity. */
  applyGravity(body: PhysicsBody, dt: number): void {
    if (body.grounded) return;
    const { gravity, maxFallSpeed } = this.difficulty;
    body.velocity.y = Math.min(
      body.velocity.y + gravity * dt,
      maxFallSpeed,
    );
  }

  /**
   * Slow horizontal enemy motion for kids.
   * Returns the signed velocity to apply (already difficulty-scaled).
   */
  getEnemySpeed(multiplier = 1): number {
    return this.difficulty.enemySpeed * multiplier;
  }

  /** Move an enemy body left/right at the kid-tuned slow speed. */
  applyEnemyPatrol(
    body: PhysicsBody,
    direction: 1 | -1,
    dt: number,
    bounds?: { minX: number; maxX: number },
  ): 1 | -1 {
    let dir = direction;
    body.velocity.x = dir * this.getEnemySpeed();
    body.velocity.y = 0;
    body.position.x += body.velocity.x * dt;

    if (!bounds) return dir;

    if (body.position.x <= bounds.minX) {
      body.position.x = bounds.minX;
      dir = 1;
    } else if (body.position.x >= bounds.maxX) {
      body.position.x = bounds.maxX;
      dir = -1;
    }
    return dir;
  }

  private refreshCoyote(body: PhysicsBody): void {
    if (!body.grounded) return;
    const memory = this.getJumpMemory(body);
    memory.coyoteTimer = this.difficulty.coyoteTime;
  }

  private getJumpMemory(body: PhysicsBody): JumpMemory {
    let memory = this.jumpMemory.get(body);
    if (!memory) {
      memory = { coyoteTimer: 0, bufferTimer: 0, jumpHeld: false };
      this.jumpMemory.set(body, memory);
    }
    return memory;
  }
}
