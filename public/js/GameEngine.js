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
   * @param {number} [options.groundY]
   * @param {(dt: number) => void} [options.update]
   * @param {() => void} [options.render]
   */
  constructor(options = {}) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.dragon = options.dragon ?? null;
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
   * Reads controls and modifies dragon velocity, then applies physics.
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

      dragon.update(dt, {
        width: canvas.width,
        groundY: this.groundY,
      });
    }

    if (typeof this.onUpdate === 'function') {
      this.onUpdate(dt);
    }
  }

  /** Draw the current frame. */
  render() {
    if (typeof this.onRender === 'function') {
      this.onRender();
    }
  }
}

export { canvas, ctx };
export default GameEngine;
