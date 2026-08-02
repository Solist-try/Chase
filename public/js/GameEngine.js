/**
 * Tiny game engine — runs the core update/render loop every frame.
 */

import {
  startControls,
  stopControls,
  isLeftPressed,
  isRightPressed,
  isJumpPressed,
} from './controls.js';

const canvas = document.getElementById('gameCanvas');

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Game canvas (#gameCanvas) not found');
}

// Logical game size
canvas.width = 960;
canvas.height = 540;

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

// Store ctx globally so screens/helpers can draw with it.
globalThis.ctx = ctx;
globalThis.canvas = canvas;

export class GameEngine {
  /**
   * @param {object} [options]
   * @param {import('./Dragon.js').Dragon} [options.dragon]
   * @param {import('./Platform.js').Platform[]} [options.platforms]
   * @param {number} [options.groundY]
   * @param {(dt: number) => void} [options.update]
   * @param {() => void} [options.render]
   */
  constructor(options = {}) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.dragon = options.dragon ?? null;
    this.platforms = options.platforms ?? [];
    this.groundY = options.groundY ?? canvas.height - 72;
    this.onUpdate = options.update ?? null;
    this.onRender = options.render ?? null;

    this._running = false;
    this._rafId = 0;
    this._lastTime = 0;
    this._jumpLocked = false;
  }

  /** Begin the animation loop. */
  start() {
    if (this._running) return;
    this._running = true;
    startControls();
    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame((time) => this.loop(time));
  }

  /** Stop the animation loop. */
  stop() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }
    stopControls();
  }

  /**
   * One frame: clear → update → render → schedule next frame.
   * @param {number} time
   */
  loop(time) {
    if (!this._running) return;

    const dt = Math.min(0.05, (time - this._lastTime) / 1000);
    this._lastTime = time;

    // Clear the canvas each frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.update(dt);
    this.render();

    this._rafId = requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  /**
   * Update game state for this frame.
   * Reads controls, moves the dragon, then resolves platform collisions.
   * @param {number} dt - Seconds since last frame
   */
  update(dt) {
    const dragon = this.dragon;

    if (dragon) {
      // Example: ArrowLeft → dragon.vx = -speed
      dragon.vx = 0;

      if (isLeftPressed()) {
        dragon.vx = -dragon.speed;
        dragon.facing = -1;
      }
      if (isRightPressed()) {
        dragon.vx = dragon.speed;
        dragon.facing = 1;
      }

      // On jump key: if dragon is on ground → vy = -jumpForce (no double jumps).
      if (isJumpPressed()) {
        if (!this._jumpLocked) {
          dragon.jump();
        }
        this._jumpLocked = true;
      } else {
        this._jumpLocked = false;
      }

      const prevBottom = dragon.y + dragon.radius * 0.9;

      dragon.update(dt, {
        width: canvas.width,
        groundY: this.groundY,
      });

      // Platform collision detection
      this.resolvePlatformCollisions(dragon, prevBottom);
    }

    if (typeof this.onUpdate === 'function') {
      this.onUpdate(dt);
    }
  }

  /**
   * Resolve dragon vs platform overlaps (land on top, bump sides/ceiling).
   * @param {import('./Dragon.js').Dragon} dragon
   * @param {number} prevBottom
   */
  resolvePlatformCollisions(dragon, prevBottom) {
    const halfW = dragon.radius * 1.05;
    const halfH = dragon.radius * 0.9;

    for (const platform of this.platforms) {
      const left = dragon.x - halfW;
      const right = dragon.x + halfW;
      const top = dragon.y - halfH;
      const bottom = dragon.y + halfH;

      const overlaps =
        right > platform.left &&
        left < platform.right &&
        bottom > platform.top &&
        top < platform.bottom;

      if (!overlaps) continue;

      const overlapLeft = right - platform.left;
      const overlapRight = platform.right - left;
      const overlapTop = bottom - platform.top;
      const overlapBottom = platform.bottom - top;
      const minOverlap = Math.min(
        overlapLeft,
        overlapRight,
        overlapTop,
        overlapBottom,
      );

      // Landing on top while falling (or walking off onto a ledge).
      const wasAbove = prevBottom <= platform.top + 4;
      if (
        (wasAbove && dragon.vy >= 0 && overlapTop <= halfH + 8) ||
        (minOverlap === overlapTop && dragon.vy >= 0)
      ) {
        dragon.y = platform.top - halfH;
        dragon.vy = 0;
        dragon.onGround = true;
        continue;
      }

      // Hit underside while jumping up.
      if (minOverlap === overlapBottom && dragon.vy < 0) {
        dragon.y = platform.bottom + halfH;
        dragon.vy = 0;
        continue;
      }

      // Side bumps.
      if (minOverlap === overlapLeft) {
        dragon.x = platform.left - halfW;
        dragon.vx = 0;
      } else if (minOverlap === overlapRight) {
        dragon.x = platform.right + halfW;
        dragon.vx = 0;
      }
    }
  }

  /** Draw the current frame. */
  render() {
    if (typeof this.onRender === 'function') {
      this.onRender();
    }

    // Draw platforms if the custom render did not already handle them.
    // game.js draws them explicitly for layering control.
  }
}

export { canvas, ctx };
export default GameEngine;
