// ---------------------------------------------------------
// Dragon Adventure – Killable Enemy
// A special foe the dragon can defeat (for Level 2)
// ---------------------------------------------------------

export class KillableEnemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    // Friendly size, easy to see
    this.width = 36;
    this.height = 36;

    // Bright berry color so kids spot it quickly
    this.color = '#ff4d6d';

    // Special flags used by the game engine
    this.isKillable = true;
    this.defeated = false;

    // Tiny idle bob
    this.timer = 0;
    this.baseY = y;
  }

  update(delta = 16) {
    if (this.defeated) return;

    this.timer += delta;
    // Soft up-and-down bob while waiting on a platform
    this.y = this.baseY + Math.sin(this.timer * 0.004) * 3;
  }

  /** Call this when the dragon stomps the enemy. */
  defeat() {
    this.defeated = true;
  }

  draw(ctx) {
    if (this.defeated) return;

    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Cute eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 6, this.y + 8, 8, 8);
    ctx.fillRect(this.x + 22, this.y + 8, 8, 8);

    ctx.fillStyle = '#1b2a4a';
    ctx.fillRect(this.x + 9, this.y + 11, 3, 3);
    ctx.fillRect(this.x + 25, this.y + 11, 3, 3);

    // Tiny frown so it looks like a "bossy" foe
    ctx.strokeStyle = '#1b2a4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + 26, 6, Math.PI + 0.2, -0.2);
    ctx.stroke();
  }
}

export default KillableEnemy;
