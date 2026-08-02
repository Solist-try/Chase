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

    this.platforms = [
      { x: 0, y: canvas.height - 40, width: canvas.width, height: 40 },
      { x: 80, y: canvas.height - 120, width: 120, height: 20 },
      { x: 260, y: canvas.height - 200, width: 140, height: 20 },
      { x: 450, y: canvas.height - 160, width: 100, height: 20 },
    ];

    this.collectibles = [
      { x: 100, y: canvas.height - 150 },
      { x: 300, y: canvas.height - 230 },
      { x: 480, y: canvas.height - 190 },
    ];

    // Cute walker, hopper, and floater enemies
    this.enemies = [
      new WalkerEnemy(200, canvas.height - 75),
      new WalkerEnemy(420, canvas.height - 195),
      new HopperEnemy(320, canvas.height - 235),
      new FloaterEnemy(500, canvas.height - 250),
    ];

    // Where the dragon begins (used if a screen prefers level spawn)
    this.startX = 40;
    this.startY = canvas.height - 80;
  }
}

export default Level1;
