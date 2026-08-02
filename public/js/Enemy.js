// ---------------------------------------------------------
// Dragon Adventure – Enemy Character
// Cute, slow-moving, non-scary enemy logic
// ---------------------------------------------------------

import { BaseEnemy } from './BaseEnemy.js';

export class Enemy extends BaseEnemy {
  constructor(x, y) {
    super(x, y, 'rgb(255, 180, 80)'); // friendly orange creature

    this.speed = 1.2; // slow, kid-friendly
    this.direction = 1; // 1 = right, -1 = left
  }

  update() {
    // Simple left-right patrol
    this.x += this.speed * this.direction;

    // Reverse direction at edges
    if (this.x < 20) this.direction = 1;
    if (this.x > 580) this.direction = -1;
  }
}

export default Enemy;
