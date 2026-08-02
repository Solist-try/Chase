/**
 * Tiny game engine — runs the core update/render loop every frame.
 */

export class GameEngine {
  /**
   * @param {object} [options]
   * @param {HTMLCanvasElement} [options.canvas]
   * @param {(dt: number) => void} [options.update]
   * @param {(ctx: CanvasRenderingContext2D | null) => void} [options.render]
   */
  constructor(options = {}) {
    this.canvas = options.canvas ?? null;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.onUpdate = options.update ?? null;
    this.onRender = options.render ?? null;

    this._running = false;
    this._rafId = 0;
    this._lastTime = 0;
  }

  /** Begin the animation loop. */
  start() {
    if (this._running) return;
    this._running = true;
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
  }

  /**
   * One frame: update → render → schedule next frame.
   * @param {number} time
   */
  loop(time) {
    if (!this._running) return;

    const dt = Math.min(0.05, (time - this._lastTime) / 1000);
    this._lastTime = time;

    this.update(dt);
    this.render();

    this._rafId = requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  /**
   * Update game state for this frame.
   * @param {number} dt - Seconds since last frame
   */
  update(dt) {
    if (typeof this.onUpdate === 'function') {
      this.onUpdate(dt);
    }
  }

  /** Draw the current frame. */
  render() {
    if (typeof this.onRender === 'function') {
      this.onRender(this.ctx);
    }
  }
}

export default GameEngine;
