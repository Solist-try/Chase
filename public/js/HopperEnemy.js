import { BaseEnemy } from './BaseEnemy.js';

export class HopperEnemy extends BaseEnemy {
  constructor(x, y) {
    super(x, y, 'rgb(180, 120, 255)');
    this.baseY = y;
    this.timer = 0;
  }

  update(delta) {
    this.timer += delta;

    // Hop motion (sin wave)
    this.y = this.baseY + Math.sin(this.timer * 0.005) * 20;
  }
}

export default HopperEnemy;
