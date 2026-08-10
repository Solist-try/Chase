// ---------------------------------------------------------
// Dragon Adventure – Level 2
// Rainbow meadow with stacks, a moving platform, and a gap!
// ---------------------------------------------------------

import { KillableEnemy } from './KillableEnemy.js';

export class Level2 {
  constructor(canvas) {
    this.name = 'Level 2';
    this.canvas = canvas;

    // Bright rainbow diagonal sky
    this.background =
      'linear-gradient(135deg, #ff4d6d 0%, #ff9f1c 18%, #ffe566 36%, #80ed99 54%, #00bbf9 72%, #b5179e 100%)';

    this.goalText = 'Ride the moving platform and clear the special foe!';

    const groundY = canvas.height - 40;

    // Ground with a gap in the middle (kids jump the gap or use the float pad)
    const gapStart = 290;
    const gapEnd = 380;
    const groundLeft = {
      x: 0,
      y: groundY,
      width: gapStart,
      height: 40,
      color: '#8ED6FF',
    };
    const groundRight = {
      x: gapEnd,
      y: groundY,
      width: canvas.width - gapEnd,
      height: 40,
      color: '#8ED6FF',
    };

    // Two tall vertical stacks (stepping stones going up)
    const leftStack = [
      { x: 70, y: groundY - 70, width: 90, height: 18, color: '#80ed99' },
      { x: 70, y: groundY - 140, width: 90, height: 18, color: '#80ed99' },
      { x: 70, y: groundY - 210, width: 90, height: 18, color: '#80ed99' },
    ];

    const rightStack = [
      { x: 480, y: groundY - 70, width: 90, height: 18, color: '#ffd166' },
      { x: 480, y: groundY - 140, width: 90, height: 18, color: '#ffd166' },
      { x: 480, y: groundY - 210, width: 90, height: 18, color: '#ffd166' },
    ];

    // Mid-level shelf for the special killable enemy
    const midShelf = {
      x: 260,
      y: groundY - 150,
      width: 120,
      height: 18,
      color: '#ff8fab',
    };

    // Moving horizontal platform (updated every frame in update())
    // minX / maxX are the left-edge travel limits
    this.movingPlatform = {
      x: 220,
      y: groundY - 90,
      width: 110,
      height: 18,
      color: '#c77dff',
      minX: 180,
      maxX: 340,
      speed: 1.1,
      direction: 1, // 1 = right, -1 = left
      moving: true,
    };

    // Small floating platform over the gap
    this.gapPlatform = {
      x: 310,
      y: groundY - 240,
      width: 70,
      height: 16,
      color: '#00bbf9',
    };

    this.platforms = [
      groundLeft,
      groundRight,
      ...leftStack,
      ...rightStack,
      midShelf,
      this.movingPlatform,
      this.gapPlatform,
    ];

    // Collectibles arranged in a gentle curved path
    this.collectibles = this.#makeCurvedCollectibles(canvas);

    // One special killable enemy on the mid-level platform
    this.enemies = [
      new KillableEnemy(midShelf.x + 40, midShelf.y - 40),
    ];

    // Safe starting spot on the left ground
    this.startX = 40;
    this.startY = groundY - 50;
    this.groundY = groundY;
  }

  /**
   * Place stars and coins along a curved path kids can follow.
   */
  #makeCurvedCollectibles(canvas) {
    const items = [];
    const count = 8;
    const startX = 90;
    const endX = 560;
    const baseY = canvas.height - 100;

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1); // 0 → 1 along the path
      const x = startX + (endX - startX) * t;

      // Curve up in the middle, then gently down (a smiling rainbow arc)
      const arc = Math.sin(t * Math.PI) * 120;
      const y = baseY - arc;

      // Mix stars and coins along the path
      const type = i % 2 === 0 ? 'star' : 'coin';

      items.push({
        x,
        y,
        type,
        radius: 14,
        collected: false,
      });
    }

    return items;
  }

  /**
   * Called every frame by the game engine.
   * Moves the horizontal platform back and forth.
   */
  update(_delta = 16) {
    const p = this.movingPlatform;
    if (!p) return;

    // Remember where we were so the dragon can ride along
    p.prevX = p.x;

    // Slide sideways
    p.x += p.speed * p.direction;

    // Bounce at the ends of the path
    if (p.x <= p.minX) {
      p.x = p.minX;
      p.direction = 1;
    } else if (p.x >= p.maxX) {
      p.x = p.maxX;
      p.direction = -1;
    }
  }
}

export default Level2;
