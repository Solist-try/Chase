// ---------------------------------------------------------
// Dragon Adventure – Simple Game Engine
// Clean, readable, kid-friendly logic
// ---------------------------------------------------------

export class GameEngine {
  constructor(canvas, level, dragon, controls) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.level = level;
    this.dragon = dragon;
    this.controls = controls;

    this.lastTime = 0;
    this.gravity = 0.4; // gentle gravity for kids

    // Prefer the full-width ground platform from the level when present.
    const ground =
      level.platforms.find((p) => p.width >= canvas.width) || level.platforms[0];
    this.groundLevel = ground
      ? ground.y - dragon.height
      : canvas.height - dragon.height;

    this.running = false;
    this._jumpLocked = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(timestamp) {
    if (!this.running) return;

    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(delta);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(delta) {
    // ---------------------------
    // Apply gravity
    // ---------------------------
    this.dragon.velocityY += this.gravity;

    // Soft fall-speed cap so long drops stay gentle
    if (this.dragon.velocityY > 12) {
      this.dragon.velocityY = 12;
    }

    // ---------------------------
    // Horizontal movement (+ gentle dash with Shift)
    // ---------------------------
    const moveSpeed = this.controls.dash
      ? this.dragon.speed * 1.75
      : this.dragon.speed;
    if (this.controls.left) this.dragon.x -= moveSpeed;
    if (this.controls.right) this.dragon.x += moveSpeed;

    // Keep the dragon on the screen
    if (this.dragon.x < 0) this.dragon.x = 0;
    if (this.dragon.x + this.dragon.width > this.canvas.width) {
      this.dragon.x = this.canvas.width - this.dragon.width;
    }

    // ---------------------------
    // Jump (only when grounded — no double jumps)
    // ---------------------------
    if (this.controls.jump && this.dragon.onGround && !this._jumpLocked) {
      this.dragon.velocityY = -10; // gentle jump
      this.dragon.onGround = false;
      this._jumpLocked = true;
    }
    if (!this.controls.jump) {
      this._jumpLocked = false;
    }

    // ---------------------------
    // Apply vertical movement
    // ---------------------------
    this.dragon.y += this.dragon.velocityY;

    // ---------------------------
    // Ground collision
    // ---------------------------
    if (this.dragon.y >= this.groundLevel) {
      this.dragon.y = this.groundLevel;
      this.dragon.velocityY = 0;
      this.dragon.onGround = true;
    }

    // ---------------------------
    // Platform collisions
    // ---------------------------
    this.level.platforms.forEach((p) => {
      if (
        this.dragon.x < p.x + p.width &&
        this.dragon.x + this.dragon.width > p.x &&
        this.dragon.y + this.dragon.height > p.y &&
        this.dragon.y + this.dragon.height < p.y + p.height
      ) {
        // Land on platform
        this.dragon.y = p.y - this.dragon.height;
        this.dragon.velocityY = 0;
        this.dragon.onGround = true;
      }
    });

    // Cute two-frame bob animation
    this.dragon.updateAnimation(delta);

    // ---------------------------
    // Enemies (slow patrol)
    // ---------------------------
    (this.level.enemies || []).forEach((enemy) => {
      enemy.update();

      // Soft bump — nudge the dragon back a little (never scary)
      if (this.#overlaps(this.dragon, enemy)) {
        this.dragon.x += enemy.direction > 0 ? -8 : 8;
        if (this.dragon.x < 0) this.dragon.x = 0;
        if (this.dragon.x + this.dragon.width > this.canvas.width) {
          this.dragon.x = this.canvas.width - this.dragon.width;
        }
      }
    });
  }

  render() {
    // Clear screen (supports solid colors or CSS-like linear-gradient strings)
    this.ctx.fillStyle = this.#backgroundStyle();
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw platforms (including the ground strip from Level1)
    this.level.platforms.forEach((p) => {
      this.ctx.fillStyle = p.color || '#8ED6FF';
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    // Draw collectibles (optional)
    (this.level.collectibles || []).forEach((c) => {
      this.ctx.fillStyle = 'yellow';
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw enemies
    (this.level.enemies || []).forEach((enemy) => {
      enemy.draw(this.ctx);
    });

    // Draw dragon (eyes + smile live in Dragon.draw)
    this.dragon.draw(this.ctx);
  }

  #overlaps(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /** Turn level.background into a canvas fill style. */
  #backgroundStyle() {
    const bg = this.level.background || '#7ec8ff';

    if (typeof bg === 'string' && bg.includes('linear-gradient')) {
      const colors = bg.match(/#[0-9a-fA-F]{3,8}/g) || ['#ff9a9e', '#fad0c4'];
      const gradient = this.ctx.createLinearGradient(
        0,
        0,
        0,
        this.canvas.height,
      );
      colors.forEach((color, index) => {
        const stop = colors.length === 1 ? 0 : index / (colors.length - 1);
        gradient.addColorStop(stop, color);
      });
      return gradient;
    }

    return bg;
  }

  pause() {
    this.running = false;
  }

  resume() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  /** Alias used by the router when leaving the game screen. */
  stop() {
    this.pause();
  }
}

export default GameEngine;
