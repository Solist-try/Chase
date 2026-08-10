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
    this.lost = false;
    this.onWin = null;
    this.onLose = null;
    this._jumpLocked = false;

    // Camera for long levels (Level 2 and friends)
    this.cameraX = 0;
    this.worldWidth = level.worldWidth || canvas.width;

    // Special foe can touch the dragon twice — then the dragon is out
    this.hearts = 2;
    this.hurtCooldown = 0; // brief invincible time after a hit

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
      hearts: document.getElementById('heartMeter'),
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
    // After a win or loss, keep drawing but stop gameplay updates.
    if (this.won || this.lost) return;

    // Count down hurt invincibility
    if (this.hurtCooldown > 0) {
      this.hurtCooldown -= delta;
      if (this.hurtCooldown < 0) this.hurtCooldown = 0;
    }

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

    // Keep the dragon inside the world (may be wider than the screen)
    if (this.dragon.x < 0) this.dragon.x = 0;
    if (this.dragon.x + this.dragon.width > this.worldWidth) {
      this.dragon.x = this.worldWidth - this.dragon.width;
    }

    // Camera follows the dragon (for long Mario-style courses)
    this.#updateCamera();

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
      }
    }

    // Fell into the void (gap / off the bottom) — out on every level
    if (this.dragon.y > this.canvas.height + 40) {
      this.#loseGame('void');
    }

    // Tick breakable-block flash timers (color flash after a bump)
    this.level.platforms.forEach((p) => {
      if (p.breakable && p.broken && p.flashTimer > 0) {
        p.flashTimer -= delta;
        if (p.flashTimer < 0) p.flashTimer = 0;
      }
    });

    // ---------------------------
    // Platform collisions
    // ---------------------------
    this.level.platforms.forEach((p) => {
      // Broken blocks are gone (after the flash finishes)
      if (p.breakable && p.broken) return;

      const horizontalOverlap =
        this.dragon.x < p.x + p.width &&
        this.dragon.x + this.dragon.width > p.x;

      // Hit a breakable block from below (classic bump!)
      if (
        p.breakable &&
        !p.broken &&
        horizontalOverlap &&
        this.dragon.velocityY < 0 &&
        this.dragon.y < p.y + p.height &&
        this.dragon.y > p.y + p.height - 16
      ) {
        p.broken = true;
        p.flashTimer = 280; // short color-flash bounce
        this.dragon.velocityY = 2; // soft bounce down
        if (this.hud.levelGoal) {
          this.hud.levelGoal.textContent = 'Crash! The block broke!';
        }
        return;
      }

      // Land on top of platform
      if (
        horizontalOverlap &&
        this.dragon.y + this.dragon.height > p.y &&
        this.dragon.y + this.dragon.height < p.y + p.height
      ) {
        this.dragon.y = p.y - this.dragon.height;
        this.dragon.velocityY = 0;
        this.dragon.onGround = true;

        // Ride moving platforms (sideways and up/down)
        if (p.moving) {
          if (typeof p.prevX === 'number') {
            this.dragon.x += p.x - p.prevX;
          }
          if (typeof p.prevY === 'number') {
            this.dragon.y += p.y - p.prevY;
          }
        }
      }
    });

    // Cute two-frame bob animation
    this.dragon.updateAnimation(delta);

    // Update all enemy types (walker, hopper, floater, killable, …)
    // Always call update so killable “poof” timers can finish.
    this.level.enemies.forEach((enemy) => enemy.update(delta));

    // ---------------------------
    // Dragon stomp + foe touches
    // ---------------------------
    this.level.enemies.forEach((enemy) => {
      // Skip foes that were already defeated (alive === false)
      if (enemy.alive === false) return;

      const dragonBottom = this.dragon.y + this.dragon.height;
      const enemyTop = enemy.y;

      const horizontalOverlap =
        this.dragon.x < enemy.x + enemy.width &&
        this.dragon.x + this.dragon.width > enemy.x;

      // Landing on the enemy’s head while falling (a little forgiving for kids)
      const verticalStomp =
        dragonBottom > enemyTop &&
        dragonBottom < enemyTop + 18 &&
        this.dragon.velocityY > 0 &&
        this.dragon.y + this.dragon.height * 0.45 < enemyTop + enemy.height;

      // A) Stomp — jump on a killable foe to defeat it
      if (
        horizontalOverlap &&
        verticalStomp &&
        enemy.isKillable &&
        typeof enemy.defeat === 'function'
      ) {
        enemy.defeat();
        this.dragon.velocityY = -10; // happy bounce up
        this.dragon.y = enemyTop - this.dragon.height; // sit cleanly on top
        if (this.hud.levelGoal) {
          this.hud.levelGoal.textContent = 'Nice stomp! The special foe is gone!';
        }
        return;
      }

      // B) Body touch — special foe hurts the dragon (2 touches = out)
      const bodyOverlap =
        dragonBottom > enemy.y + 4 &&
        this.dragon.y < enemy.y + enemy.height - 4;

      if (!horizontalOverlap || !bodyOverlap || verticalStomp) return;

      // Soft knockback for every foe
      const push = this.dragon.x < enemy.x ? -1 : 1;
      this.dragon.x += push * 18;
      this.dragon.velocityY = -6;

      // Only the special killable foe uses the 2-hit rule
      if (enemy.isKillable && this.hurtCooldown <= 0) {
        this.#hurtBySpecialFoe();
      }
    });

    // ---------------------------
    // Key + door puzzle (Level 2)
    // ---------------------------
    this.#updateKeyAndDoor();

    // ---------------------------
    // Collectibles pickup + HUD
    // ---------------------------
    this.collectPickups();
  }

  /**
   * Simple puzzle: grab the key, touch the door to unlock,
   * then walk through to the final goal platform.
   */
  #updateKeyAndDoor() {
    const key = this.level.key;
    const door = this.level.door;
    const dragon = this.dragon;

    // A) Touch the key → collect it
    if (key && !key.collected) {
      const keyR = 14;
      const closestX = Math.max(dragon.x, Math.min(key.x, dragon.x + dragon.width));
      const closestY = Math.max(dragon.y, Math.min(key.y, dragon.y + dragon.height));
      const dx = key.x - closestX;
      const dy = key.y - closestY;
      if (dx * dx + dy * dy <= keyR * keyR) {
        key.collected = true;
        if (this.hud.levelGoal) {
          this.hud.levelGoal.textContent = 'You found the key! Open the door!';
        }
      }
    }

    if (!door) return;

    const doorW = door.width || 36;
    const doorH = door.height || 130;

    // B) Touch the door with the key → unlock
    if (door.locked && key && key.collected) {
      const touchesDoor =
        dragon.x < door.x + doorW &&
        dragon.x + dragon.width > door.x &&
        dragon.y < door.y + doorH &&
        dragon.y + dragon.height > door.y;

      if (touchesDoor) {
        door.locked = false;
        if (this.hud.levelGoal) {
          this.hud.levelGoal.textContent = 'Door open! Climb to the goal!';
        }
      }
    }

    // C) Locked door blocks the path to the final goal platform
    if (door.locked) {
      this.#resolveLockedDoorCollision(door, doorW, doorH);
    }
  }

  /** Push the dragon out of a locked door so they can’t pass. */
  #resolveLockedDoorCollision(door, doorW, doorH) {
    const dragon = this.dragon;
    const overlaps =
      dragon.x < door.x + doorW &&
      dragon.x + dragon.width > door.x &&
      dragon.y < door.y + doorH &&
      dragon.y + dragon.height > door.y;

    if (!overlaps) return;

    const dragonCenterX = dragon.x + dragon.width / 2;
    const doorCenterX = door.x + doorW / 2;

    if (dragonCenterX < doorCenterX) {
      dragon.x = door.x - dragon.width;
    } else {
      dragon.x = door.x + doorW;
    }

    // Keep the dragon inside the world after the shove
    if (dragon.x < 0) dragon.x = 0;
    if (dragon.x + dragon.width > this.worldWidth) {
      dragon.x = this.worldWidth - dragon.width;
    }
  }

  /** Special foe touched the dragon — lose one heart. Two hits = lose. */
  #hurtBySpecialFoe() {
    this.hearts -= 1;
    this.hurtCooldown = 1200; // invincible for a short moment
    this.dragon.hurtFlash = 400; // blink pink briefly
    this.updateHud();

    if (this.hud.levelGoal) {
      this.hud.levelGoal.textContent =
        this.hearts <= 0
          ? 'Oh no! The special foe got you!'
          : 'Ouch! One more touch and you’re out!';
    }

    if (this.hearts <= 0) {
      this.#loseGame('foe');
    }
  }

  /**
   * End the level as a loss.
   * @param {'void' | 'foe' | string} [reason]
   */
  #loseGame(reason = 'foe') {
    if (this.lost || this.won) return;
    this.lost = true;
    this.loseReason = reason;
    this.running = false;
    this.hearts = 0;
    this.updateHud();

    if (this.hud.levelGoal) {
      this.hud.levelGoal.textContent =
        reason === 'void'
          ? 'Oh no! You fell into the void!'
          : 'Oh no! The special foe got you!';
    }

    if (typeof this.onLose === 'function') {
      this.onLose(reason);
    }
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
    if (this.hud.levelGoal && !this.won && !this.lost && this.hurtCooldown <= 0) {
      this.hud.levelGoal.textContent =
        this.level.goalText || 'Collect every star and coin!';
    }

    // Hearts for the special-foe 2-hit rule (Level 2)
    if (this.hud.hearts) {
      const icons = this.hud.hearts.querySelectorAll('.hud__heart');
      icons.forEach((heart, index) => {
        heart.classList.toggle('is-empty', index >= this.hearts);
      });
    }
  }

  #updateCamera() {
    const viewW = this.canvas.width;
    const maxCam = Math.max(0, this.worldWidth - viewW);
    // Keep the dragon a bit left-of-center so kids see what’s ahead
    const target = this.dragon.x - viewW * 0.35;
    this.cameraX = Math.max(0, Math.min(target, maxCam));
  }

  render() {
    // Screen-space rainbow sky
    this.ctx.fillStyle = this.#backgroundStyle();
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // World-space drawing (moves with the camera)
    this.ctx.save();
    this.ctx.translate(-this.cameraX, 0);

    // Darker “rainbow cave” tint in the middle section
    const cave = this.level.caveZone;
    if (cave) {
      this.ctx.fillStyle = cave.tint || 'rgba(40, 16, 70, 0.45)';
      this.ctx.fillRect(cave.x, 0, cave.width, this.canvas.height);
    }

    // Draw platforms (skip broken breakables once the flash is done)
    this.level.platforms.forEach((p) => {
      if (p.breakable && p.broken) {
        if (p.flashTimer > 0) {
          this.#drawBreakFlash(p);
        }
        return;
      }

      this.ctx.fillStyle = p.color || '#8ED6FF';
      this.ctx.fillRect(p.x, p.y, p.width, p.height);

      // Little shine on the goal platform
      if (p.isGoal) {
        this.ctx.fillStyle = 'rgba(255, 250, 240, 0.45)';
        this.ctx.fillRect(p.x + 6, p.y + 4, p.width - 12, 6);
      }
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
        const phase = (twinklePhase + index * 0.18) % 1;
        drawStarCollectible(this.ctx, c.x, c.y, radius, phase);
      }
    });

    // Puzzle key (only while not collected)
    if (this.level.key && !this.level.key.collected) {
      this.#drawKey(this.level.key);
    }

    // Puzzle door (looks different when unlocked)
    if (this.level.door) {
      this.#drawDoor(this.level.door);
    }

    // Draw enemies
    this.level.enemies.forEach((enemy) => enemy.draw(this.ctx));

    // Draw dragon (blink when hurt)
    if (this.hurtCooldown > 0 && Math.floor(this.animTime / 80) % 2 === 0) {
      this.ctx.globalAlpha = 0.45;
      this.dragon.draw(this.ctx);
      this.ctx.globalAlpha = 1;
    } else {
      this.dragon.draw(this.ctx);
    }

    this.ctx.restore();

    // Win banner (screen space)
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

  /** Simple gold key — drawn only while not collected. */
  #drawKey(key) {
    const bob = Math.sin(this.animTime / 220) * 3;
    const x = key.x;
    const y = key.y + bob;

    this.ctx.save();
    this.ctx.fillStyle = '#ffe566';
    this.ctx.strokeStyle = '#c9a227';
    this.ctx.lineWidth = 2;

    // Key ring
    this.ctx.beginPath();
    this.ctx.arc(x - 6, y, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Shaft
    this.ctx.fillRect(x - 2, y - 3, 18, 6);

    // Teeth
    this.ctx.fillRect(x + 10, y + 3, 4, 6);
    this.ctx.fillRect(x + 15, y + 3, 3, 4);

    this.ctx.restore();
  }

  /** Closed door when locked; open doorway when unlocked. */
  #drawDoor(door) {
    const w = door.width || 36;
    const h = door.height || 130;

    this.ctx.save();

    if (door.locked) {
      // Solid locked door
      this.ctx.fillStyle = '#8b4513';
      this.ctx.fillRect(door.x, door.y, w, h);

      this.ctx.fillStyle = '#6b3410';
      this.ctx.fillRect(door.x + 4, door.y + 8, w - 8, h - 16);

      // Lock plate + keyhole
      this.ctx.fillStyle = '#ffe566';
      this.ctx.fillRect(door.x + w - 14, door.y + h * 0.45, 8, 12);
      this.ctx.fillStyle = '#1b2a4a';
      this.ctx.beginPath();
      this.ctx.arc(door.x + w - 10, door.y + h * 0.48, 2.2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillRect(door.x + w - 11, door.y + h * 0.5, 2, 5);
    } else {
      // Unlocked — open doorway (frame + ajar panel)
      this.ctx.fillStyle = '#5c4030';
      this.ctx.fillRect(door.x, door.y, 6, h); // left frame
      this.ctx.fillRect(door.x + w - 6, door.y, 6, h); // right frame
      this.ctx.fillRect(door.x, door.y, w, 8); // top lintel

      // Door swung open (thin panel to the side)
      this.ctx.fillStyle = '#a36b3e';
      this.ctx.fillRect(door.x + w - 4, door.y + 8, 10, h - 8);

      // Soft open glow in the passage
      this.ctx.fillStyle = 'rgba(255, 229, 102, 0.28)';
      this.ctx.fillRect(door.x + 6, door.y + 8, w - 12, h - 8);
    }

    this.ctx.restore();
  }

  /**
   * Short bounce color-flash when a breakable block is smashed from below.
   * Brightens, expands a little, then fades out so kids see the smash.
   */
  #drawBreakFlash(block) {
    const duration = 280;
    const progress = 1 - (block.flashTimer || 0) / duration; // 0 → 1
    const expand = progress * 10;
    const alpha = 1 - progress;

    this.ctx.save();
    this.ctx.globalAlpha = Math.max(0, alpha);

    // Warm flash fill (slightly bigger than the block)
    this.ctx.fillStyle = '#ffe566';
    this.ctx.fillRect(
      block.x - expand / 2,
      block.y - expand / 2 - progress * 6, // tiny upward bounce
      block.width + expand,
      block.height + expand,
    );

    // Bright center pop
    this.ctx.fillStyle = '#fffaf0';
    this.ctx.fillRect(
      block.x + block.width * 0.2,
      block.y + block.height * 0.2 - progress * 6,
      block.width * 0.6,
      block.height * 0.6,
    );

    this.ctx.restore();
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
