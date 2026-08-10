// ---------------------------------------------------------
// Dragon Adventure – Killable Enemy (special foe)
// Teal bossy dragon — stomp it, or get touched twice!
// ---------------------------------------------------------

import { BaseEnemy } from './BaseEnemy.js';

const FOE_SRC = 'assets/foe-dragon-sprite.png';

let foeSprite = null;
let foeSpriteLoading = null;

function loadFoeSprite() {
  if (foeSprite?.complete && foeSprite.naturalWidth > 0) {
    return Promise.resolve(foeSprite);
  }
  if (foeSpriteLoading) return foeSpriteLoading;

  foeSpriteLoading = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      foeSprite = img;
      resolve(img);
    };
    img.onerror = () => {
      console.warn('Foe dragon sprite failed to load — using drawn fallback');
      foeSprite = null;
      resolve(null);
    };
    img.src = FOE_SRC;
  });

  return foeSpriteLoading;
}

loadFoeSprite();

export class KillableEnemy extends BaseEnemy {
  constructor(x, y) {
    // Teal body color (used by the drawn fallback)
    super(x, y, '#1f8a8a');

    // A bit bigger than regular foes — this is the special one!
    this.width = 48;
    this.height = 48;

    // Still in the game until stomped
    this.alive = true;

    // Used by the game engine for stomp / 2-hit checks
    this.isKillable = true;

    // Simple left–right patrol
    this.speed = 1.0;
    this.direction = 1; // 1 = right, -1 = left
    this.patrolLeft = x - 40;
    this.patrolRight = x + 40;

    // “Poof” flash after defeat (milliseconds left)
    this.poofTimer = 0;
    this.poofColor = '#ff9f1c'; // orange flash matching the wings

    this.sprite = foeSprite;
    loadFoeSprite().then((img) => {
      this.sprite = img;
    });
  }

  /**
   * Move back and forth — but freeze once defeated.
   */
  update(delta = 16) {
    // Keep the poof flash ticking even after defeat
    if (this.poofTimer > 0) {
      this.poofTimer -= delta;
      if (this.poofTimer < 0) this.poofTimer = 0;
    }

    // Stop all movement when not alive
    if (!this.alive) return;

    this.x += this.speed * this.direction;

    // Turn around at the ends of the patrol path
    if (this.x <= this.patrolLeft) {
      this.x = this.patrolLeft;
      this.direction = 1;
    } else if (this.x >= this.patrolRight) {
      this.x = this.patrolRight;
      this.direction = -1;
    }
  }

  /**
   * Stomp / defeat — hide the foe and flash a little poof.
   */
  defeat() {
    if (!this.alive) return;

    this.alive = false;
    this.poofTimer = 320; // short, cheerful flash
    this.poofColor = '#ff9f1c';
  }

  /**
   * Draw the enemy only while alive.
   * After defeat, briefly draw a poof flash, then nothing.
   */
  draw(ctx) {
    // Tiny color-flash poof after defeat
    if (!this.alive) {
      if (this.poofTimer > 0) {
        this.#drawPoof(ctx);
      }
      return;
    }

    const drawW = this.width * 1.35;
    const drawH = this.height * 1.35;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
      ctx.save();
      ctx.translate(cx, cy);
      // Sprite faces right; flip when patrolling left
      ctx.scale(this.direction, 1);
      ctx.drawImage(this.sprite, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
      return;
    }

    this.#drawFallback(ctx, cx, cy, drawW, drawH);
  }

  /** Simple teal dragon if the image is still loading. */
  #drawFallback(ctx, cx, cy, w, h) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(this.direction, 1);

    // Wings
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath();
    ctx.moveTo(-4, -4);
    ctx.quadraticCurveTo(-w * 0.45, -h * 0.35, -w * 0.4, h * 0.05);
    ctx.quadraticCurveTo(-w * 0.15, 0, -2, 4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(4, -4);
    ctx.quadraticCurveTo(w * 0.45, -h * 0.35, w * 0.4, h * 0.05);
    ctx.quadraticCurveTo(w * 0.15, 0, 2, 4);
    ctx.fill();

    // Body
    ctx.fillStyle = '#1f8a8a';
    ctx.strokeStyle = '#1b2a4a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 4, w * 0.28, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Belly
    ctx.fillStyle = '#f6e7b0';
    ctx.beginPath();
    ctx.ellipse(2, 8, w * 0.12, h * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#1f8a8a';
    ctx.beginPath();
    ctx.ellipse(w * 0.12, -h * 0.12, w * 0.2, h * 0.18, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.ellipse(w * 0.16, -h * 0.14, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b2a4a';
    ctx.beginPath();
    ctx.arc(w * 0.17, -h * 0.14, 2, 0, Math.PI * 2);
    ctx.fill();

    // Spikes
    ctx.fillStyle = '#ff6b35';
    for (let i = 0; i < 3; i++) {
      const sx = -6 + i * 7;
      const sy = -h * 0.22;
      ctx.beginPath();
      ctx.moveTo(sx, sy + 8);
      ctx.lineTo(sx + 3, sy);
      ctx.lineTo(sx + 6, sy + 8);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  /** Soft expanding flash so kids see the poof. */
  #drawPoof(ctx) {
    const progress = 1 - this.poofTimer / 320; // 0 → 1
    const radius = 12 + progress * 22;
    const alpha = 1 - progress;

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);

    ctx.fillStyle = this.poofColor;
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      radius,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      radius * 0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.restore();
  }
}

export default KillableEnemy;
