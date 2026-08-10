// ---------------------------------------------------------
// Dragon Adventure – Killable Enemy
// Patrols left and right. Stomp it for a tiny “poof”!
// ---------------------------------------------------------

import { BaseEnemy } from './BaseEnemy.js';

export class KillableEnemy extends BaseEnemy {
  constructor(x, y) {
    // Bright berry body so kids can spot it
    super(x, y, '#ff4d6d');

    this.width = 36;
    this.height = 36;

    // Still in the game until stomped
    this.alive = true;

    // Used by the game engine for stomp checks
    this.isKillable = true;

    // Simple left–right patrol
    this.speed = 1.0;
    this.direction = 1; // 1 = right, -1 = left
    this.patrolLeft = x - 40;
    this.patrolRight = x + 40;

    // “Poof” flash after defeat (milliseconds left)
    this.poofTimer = 0;
    this.poofColor = '#fffaf0';
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
    this.poofTimer = 280; // short, cheerful flash
    this.poofColor = '#ffe566'; // sunny yellow “poof”
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

    // Normal body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Cute eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 6, this.y + 8, 8, 8);
    ctx.fillRect(this.x + 22, this.y + 8, 8, 8);

    ctx.fillStyle = '#1b2a4a';
    ctx.fillRect(this.x + 9, this.y + 11, 3, 3);
    ctx.fillRect(this.x + 25, this.y + 11, 3, 3);

    // Tiny frown — a “bossy” look
    ctx.strokeStyle = '#1b2a4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + 26, 6, Math.PI + 0.2, -0.2);
    ctx.stroke();
  }

  /** Soft expanding flash so kids see the poof. */
  #drawPoof(ctx) {
    const progress = 1 - this.poofTimer / 280; // 0 → 1
    const radius = 10 + progress * 18;
    const alpha = 1 - progress;

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);

    // Outer flash ring
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

    // Bright white center spark
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
