// ---------------------------------------------------------
// Dragon Adventure – Simple Game Engine
// Clean, readable, kid-friendly logic
// ---------------------------------------------------------

import { drawStarCollectible, drawCoinCollectible, loadStarSprite, loadCoinSprite } from './starSprite.js';

export class GameEngine {
  constructor(canvas, level, dragon, controls) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.level = level;
    this.dragon = dragon;
    this.controls = controls;

    this.lastTime = 0;
    this.animTime = 0;
    this.gravity = 0.4; // gentle gravity for kids

    // Warm the collectible sprite caches
    loadStarSprite();
    loadCoinSprite();

    // Prefer the full-width ground platform from the level when present.
    const ground =
      level.platforms.find((p) => p.width >= canvas.width) || level.platforms[0];
    this.groundLevel = ground
      ? ground.y - dragon.height
      : canvas.height - dragon.height;

    this.running = false;
    this.won = false;
    this.onWin = null;
    this._jumpLocked = false;

    this.starsCollected = 0;
    this.coinsCollected = 0;
    this.starsTotal = level.collectibles.filter((c) => c.type === 'star').length;
    this.coinsTotal = level.collectibles.filter((c) => c.type === 'coin').length;

    this.hud = {
      starCount: document.getElementById('starCount'),
      starTotal: document.querySelector('#gameHud .hud__stat[aria-label="Stars"] .hud__stat-total'),
      coinCount: document.getElementById('coinCount'),
      coinTotal: document.querySelector('#gameHud .hud__stat[aria-label="Coins"] .hud__stat-total'),
      levelGoal: document.getElementById('levelGoal'),
    };

    this.updateHud();
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
    this.animTime += delta;

    this.update(delta);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(delta) {
    // After a win, keep drawing but stop gameplay updates.
    if (this.won) return;

    // Level-specific logic (e.g. Level 2 moving platform)
    if (typeof this.level.update === 'function') {
      this.level.update(delta);
    }

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
    if (this.controls.left) {
      this.dragon.x -= moveSpeed;
      this.dragon.facing = -1;
    }
    if (this.controls.right) {
      this.dragon.x += moveSpeed;
      this.dragon.facing = 1;
    }

    // Keep the dragon on the screen
    if (this.dragon.x < 0) this.dragon.x = 0;
    if (this.dragon.x + this.dragon.width > this.canvas.width) {
      this.dragon.x = this.canvas.width - this.dragon.width;
    }

    // ---------------------------
    // Jump (only when grounded — no double jumps)
    // ---------------------------
    if (this.controls.jump && this.dragon.onGround && !this._jumpLocked) {
      this.dragon.velocityY = -11; // gentle but high enough for Level 1 platforms
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
    // (Only if a floor platform is actually under the dragon —
    //  Level 2 has a gap, so we must not float over empty air.)
    // ---------------------------
    if (this.dragon.y >= this.groundLevel) {
      const standingOnFloor = this.level.platforms.some(
        (p) =>
          p.y >= this.groundLevel - 1 &&
          this.dragon.x + this.dragon.width > p.x + 2 &&
          this.dragon.x < p.x + p.width - 2,
      );

      if (standingOnFloor) {
        this.dragon.y = this.groundLevel;
        this.dragon.velocityY = 0;
        this.dragon.onGround = true;
      } else if (this.dragon.y > this.canvas.height + 40) {
        // Fell in a gap — gentle respawn at the level start
        this.dragon.x = this.level.startX ?? 40;
        this.dragon.y = this.level.startY ?? this.groundLevel;
        this.dragon.velocityY = 0;
      }
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

        // Ride moving platforms sideways
        if (p.moving && typeof p.prevX === 'number') {
          this.dragon.x += p.x - p.prevX;
        }
      }
    });

    // Cute two-frame bob animation
    this.dragon.updateAnimation(delta);

    // Update all enemy types (walker, hopper, floater, killable, …)
    // Always call update so killable “poof” timers can finish.
    this.level.enemies.forEach((enemy) => enemy.update(delta));

    // Enemy bumps — stomp defeat for killable foes, gentle bounce otherwise
    this.level.enemies.forEach((enemy) => {
      const stillHere = enemy.alive !== false && !enemy.defeated;
      if (!stillHere) return;

      const overlapping =
        this.dragon.x < enemy.x + enemy.width &&
        this.dragon.x + this.dragon.width > enemy.x &&
        this.dragon.y < enemy.y + enemy.height &&
        this.dragon.y + this.dragon.height > enemy.y;

      if (!overlapping) return;

      const stomping =
        enemy.isKillable &&
        this.dragon.velocityY > 0 &&
        this.dragon.y + this.dragon.height - enemy.y < 18;

      if (stomping && typeof enemy.defeat === 'function') {
        enemy.defeat();
        this.dragon.velocityY = -8; // happy bounce after a stomp
        return;
      }

      this.dragon.x -= 20 * this.dragon.speed;
      this.dragon.velocityY = -6;
    });

    // ---------------------------
    // Collectibles pickup + HUD
    // ---------------------------
    this.collectPickups();
  }

  collectPickups() {
    const dragon = this.dragon;

    this.level.collectibles.forEach((item) => {
      if (item.collected) return;

      const radius = item.radius || 10;
      const closestX = Math.max(dragon.x, Math.min(item.x, dragon.x + dragon.width));
      const closestY = Math.max(dragon.y, Math.min(item.y, dragon.y + dragon.height));
      const dx = item.x - closestX;
      const dy = item.y - closestY;
      const hit = dx * dx + dy * dy <= radius * radius;

      if (!hit) return;

      item.collected = true;
      if (item.type === 'coin') {
        this.coinsCollected += 1;
      } else {
        this.starsCollected += 1;
      }
      this.updateHud();
    });

    const allGone = this.level.collectibles.every((item) => item.collected);
    if (allGone && !this.won) {
      this.won = true;
      if (this.hud.levelGoal) {
        this.hud.levelGoal.textContent = 'You did it! Level complete!';
      }
      if (typeof this.onWin === 'function') {
        this.onWin();
      }
    }
  }

  updateHud() {
    if (this.hud.starCount) {
      this.hud.starCount.textContent = String(this.starsCollected);
    }
    if (this.hud.starTotal) {
      this.hud.starTotal.textContent = `/${this.starsTotal}`;
    }
    if (this.hud.coinCount) {
      this.hud.coinCount.textContent = String(this.coinsCollected);
    }
    if (this.hud.coinTotal) {
      this.hud.coinTotal.textContent = `/${this.coinsTotal}`;
    }
    if (this.hud.levelGoal && !this.won) {
      this.hud.levelGoal.textContent =
        this.level.goalText || 'Collect every star and coin!';
    }
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

    // Draw remaining collectibles
    const twinklePhase = (this.animTime % 1600) / 1600;
    this.level.collectibles.forEach((c, index) => {
      if (c.collected) return;
      const radius = c.radius || 10;

      if (c.type === 'coin') {
        const phase = (twinklePhase + index * 0.11) % 1;
        drawCoinCollectible(this.ctx, c.x, c.y, radius, phase);
      } else {
        // Cute shiny 5-point star sprite (with drawn fallback)
        const phase = (twinklePhase + index * 0.18) % 1;
        drawStarCollectible(this.ctx, c.x, c.y, radius, phase);
      }
    });

    // Draw all enemy types
    this.level.enemies.forEach((enemy) => enemy.draw(this.ctx));

    // Draw dragon (eyes + smile live in Dragon.draw)
    this.dragon.draw(this.ctx);

    // Win banner
    if (this.won) {
      this.ctx.fillStyle = 'rgba(27, 42, 74, 0.45)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#fffaf0';
      this.ctx.font = 'bold 28px Fredoka, Nunito, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('You win!', this.canvas.width / 2, this.canvas.height / 2 - 10);

      this.ctx.font = 'bold 16px Nunito, sans-serif';
      this.ctx.fillText(
        'All stars and coins collected!',
        this.canvas.width / 2,
        this.canvas.height / 2 + 22,
      );
    }
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
