// ---------------------------------------------------------
// Dragon Adventure – Level 1
// Bright, simple, kid-friendly level layout
// ---------------------------------------------------------

import { WalkerEnemy } from './WalkerEnemy.js';
import { HopperEnemy } from './HopperEnemy.js';
import { FloaterEnemy } from './FloaterEnemy.js';

export class Level1 {
  constructor(canvas) {
    this.name = 'Level 1';
    this.background = 'linear-gradient(to bottom, #ff9a9e, #fad0c4)';
    this.goalText = 'Collect every star and coin!';

    this.platforms = [
      { x: 0, y: canvas.height - 40, width: canvas.width, height: 40 },
      { x: 80, y: canvas.height - 120, width: 120, height: 20 },
      { x: 260, y: canvas.height - 200, width: 140, height: 20 },
      { x: 450, y: canvas.height - 160, width: 100, height: 20 },
    ];

    // Stars + coins the dragon can pick up
    this.collectibles = [
      { x: 100, y: canvas.height - 150, type: 'star', radius: 10, collected: false },
      { x: 300, y: canvas.height - 230, type: 'star', radius: 10, collected: false },
      { x: 480, y: canvas.height - 190, type: 'star', radius: 10, collected: false },
      { x: 200, y: canvas.height - 90, type: 'coin', radius: 8, collected: false },
      { x: 360, y: canvas.height - 220, type: 'coin', radius: 8, collected: false },
      { x: 520, y: canvas.height - 90, type: 'coin', radius: 8, collected: false },
      { x: 140, y: canvas.height - 250, type: 'coin', radius: 8, collected: false },
      { x: 420, y: canvas.height - 250, type: 'coin', radius: 8, collected: false },
    ];

    this.enemies = [
      new WalkerEnemy(200, canvas.height - 75),
      new HopperEnemy(420, canvas.height - 195),
      new FloaterEnemy(150, canvas.height - 260),
    ];

    this.startX = 40;
    this.startY = canvas.height - 80;
  }
}

export default Level1;
