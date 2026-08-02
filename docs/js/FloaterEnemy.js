import { BaseEnemy } from './BaseEnemy.js';

export class FloaterEnemy extends BaseEnemy {
  constructor(x, y) {
    super(x, y, 'rgb(120, 220, 255)');
    this.centerX = x;
    this.centerY = y;
    this.angle = 0;
  }

  update(delta) {
    this.angle += delta * 0.002;

    this.x = this.centerX + Math.cos(this.angle) * 30;
    this.y = this.centerY + Math.sin(this.angle) * 20;
  }
}

export default FloaterEnemy;
