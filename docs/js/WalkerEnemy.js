import { BaseEnemy } from './BaseEnemy.js';

export class WalkerEnemy extends BaseEnemy {
  constructor(x, y) {
    super(x, y, 'rgb(255, 180, 80)');
    this.speed = 1.2;
    this.direction = 1;
  }

  update() {
    this.x += this.speed * this.direction;

    if (this.x < 20) this.direction = 1;
    if (this.x > 580) this.direction = -1;
  }
}

export default WalkerEnemy;
