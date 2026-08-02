/**
 * Tiny game engine — runs the core update/render loop every frame.
 */

import {
  startControls,
  stopControls,
  isLeftPressed,
  isRightPressed,
  consumeJump,
} from './controls.js';

/** @type {HTMLCanvasElement | null} */
let canvas = null;
/** @type {CanvasRenderingContext2D | null} */
let ctx = null;

function bindCanvas() {
  const el = document.getElementById('gameCanvas');
  if (!(el instanceof HTMLCanvasElement)) {
    throw new Error('Game canvas (#gameCanvas) not found');
  }

  canvas = el;
  canvas.width = 960;
  canvas.height = 540;
  ctx = canvas.getContext('2d');

  // Store ctx globally so screens/helpers can draw with it.
  globalThis.ctx = ctx;
  globalThis.canvas = canvas;

  return { canvas, ctx };
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

export class GameEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.dragon = null;
    this.level = null;
    this.platforms = [];
    this.groundY = 468;

    this._running = false;
    this._rafId = 0;
    this._lastTime = 0;
  }

  /**
   * Begin the game with a dragon and level.
   * Calls onReady when assets are prepared, then starts the loop.
   * @param {import('./Dragon.js').Dragon} dragon
   * @param {object} level
   * @param {() => void} [onReady] - fired when assets are ready
   */
  async start(dragon, level, onReady) {
    if (this._running) return;

    this.dragon = dragon;
    this.level = level;
    this.platforms = level?.platforms ?? [];
    this.groundY = level?.groundY ?? 468;

    if (dragon) {
      dragon.groundY = this.groundY;
    }

    try {
      await this.loadAssets(level);

      const bound = bindCanvas();
      this.canvas = bound.canvas;
      this.ctx = bound.ctx;
      this.groundY = level?.groundY ?? this.canvas.height - 72;
      if (dragon) dragon.groundY = this.groundY;
    } catch (error) {
      console.error('GameEngine.start failed while loading:', error);
    } finally {
      // Never leave the player on an infinite loading screen.
      if (typeof onReady === 'function') {
        try {
          onReady();
        } catch (readyError) {
          console.error('onReady callback failed:', readyError);
        }
      }
    }

    if (!this.canvas || !this.ctx) {
      try {
        const bound = bindCanvas();
        this.canvas = bound.canvas;
        this.ctx = bound.ctx;
      } catch (error) {
        console.error('Could not bind game canvas:', error);
        return;
      }
    }

    this._running = true;
    startControls();
    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame((time) => this.loop(time));
  }

  /**
   * Prepare level / font assets before gameplay begins.
   * Always resolves within a short timeout so loading cannot hang.
   * @param {object} [level]
   */
  async loadAssets(level) {
    const jobs = [];

    // Fonts can hang if a remote stylesheet never finishes — cap the wait.
    if (document.fonts?.ready) {
      jobs.push(withTimeout(document.fonts.ready, 600));
    }

    const assetUrls = level?.assets ?? [];
    for (const url of assetUrls) {
      jobs.push(
        withTimeout(
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = url;
          }),
          600,
        ),
      );
    }

    // Brief pause so the loading screen can paint once.
    jobs.push(new Promise((resolve) => setTimeout(resolve, 200)));

    await withTimeout(Promise.all(jobs), 900);
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
    if (!this._running || !ctx || !canvas) return;

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
    if (!dragon || !canvas) return;

    // Left / right movement
    dragon.vx = 0;

    if (isLeftPressed()) {
      dragon.vx = -dragon.speed;
      dragon.facing = -1;
    }
    if (isRightPressed()) {
      dragon.vx = dragon.speed;
      dragon.facing = 1;
    }

    // Jump on keydown tap (queued) while grounded — no double jumps.
    if (consumeJump()) {
      dragon.jump();
    }

    const prevBottom = dragon.y + dragon.radius * 0.9;

    dragon.update(dt, {
      width: canvas.width,
      groundY: this.groundY,
    });

    // Land on / collide with platforms every frame.
    this.resolvePlatformCollisions(dragon, prevBottom);
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

      // Landing on top while falling.
      const wasAbove = prevBottom <= platform.top + 6;
      if (
        (wasAbove && dragon.vy >= 0) ||
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

  /** Draw the current frame from the active level. */
  render() {
    if (!ctx || !canvas || !this.level || !this.dragon) return;

    this.drawLevelBackground();

    for (const platform of this.platforms) {
      platform.draw(ctx);
    }

    this.dragon.draw(ctx);
  }

  drawLevelBackground() {
    if (!ctx || !canvas || !this.level) return;

    const width = canvas.width;
    const height = canvas.height;
    const level = this.level;
    const groundY = this.groundY;
    const bg = level.backgroundColor || '#7ec8ff';

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, bg);
    sky.addColorStop(0.55, '#b8f0ff');
    sky.addColorStop(1, '#fff6b0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = level.hillColor || '#7adf8a';
    ctx.beginPath();
    ctx.moveTo(0, groundY - 20);
    ctx.quadraticCurveTo(width * 0.25, groundY - 90, width * 0.5, groundY - 30);
    ctx.quadraticCurveTo(width * 0.75, groundY + 20, width, groundY - 50);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = level.groundColor || '#5ecf6e';
    ctx.fillRect(0, groundY, width, height - groundY);
    ctx.fillStyle = level.groundTopColor || '#f4d35e';
    ctx.fillRect(0, groundY, width, 10);

    ctx.fillStyle = '#ffe566';
    ctx.beginPath();
    ctx.arc(width - 90, 70, 40, 0, Math.PI * 2);
    ctx.fill();
  }
}

export { bindCanvas };
export default GameEngine;
