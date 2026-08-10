// ---------------------------------------------------------
// Dragon Adventure – Level 2
// A long, multi-section rainbow course (Mario-style!)
// Left → Middle → Cave → Tower goal
// ---------------------------------------------------------

import { KillableEnemy } from './KillableEnemy.js';
import { WalkerEnemy } from './WalkerEnemy.js';
import { FloaterEnemy } from './FloaterEnemy.js';

export class Level2 {
  constructor(canvas) {
    this.name = 'Level 2';
    this.canvas = canvas;

    // Wider than one screen — the camera will follow the dragon
    this.worldWidth = 1920;

    // Bright rainbow diagonal sky (cave gets a darker tint on top)
    this.background =
      'linear-gradient(135deg, #ff4d6d 0%, #ff9f1c 18%, #ffe566 36%, #80ed99 54%, #00bbf9 72%, #b5179e 100%)';

    // Darker “rainbow cave” band in the middle of the world
    this.caveZone = {
      x: 900,
      width: 420,
      // Drawn as a soft purple overlay by the game engine
      tint: 'rgba(40, 16, 70, 0.48)',
    };

    this.goalText =
      'Find the key, open the door, then climb the tower! Jump on the boss dragon — 2 touches and you’re out!';

    const groundY = canvas.height - 40;
    this.groundY = groundY;

    // -------------------------------------------------
    // A) Ground (full width of the long world)
    //    with a small jump-gap in the LEFT section
    // -------------------------------------------------
    const leftGapStart = 260;
    const leftGapEnd = 320;

    const groundPieces = [
      { x: 0, y: groundY, width: leftGapStart, height: 40, color: '#8ED6FF' },
      {
        x: leftGapEnd,
        y: groundY,
        width: this.worldWidth - leftGapEnd,
        height: 40,
        color: '#8ED6FF',
      },
    ];

    // -------------------------------------------------
    // B) LEFT section — two stacked platforms + gap
    // -------------------------------------------------
    const leftStack = [
      { x: 80, y: groundY - 80, width: 100, height: 18, color: '#80ed99' },
      { x: 80, y: groundY - 150, width: 100, height: 18, color: '#80ed99' },
    ];

    // Little helper pad over the left gap
    const leftGapPad = {
      x: 270,
      y: groundY - 70,
      width: 55,
      height: 16,
      color: '#00bbf9',
    };

    // Mid shelf for the special foe (between left and middle)
    const foeShelf = {
      x: 380,
      y: groundY - 140,
      width: 120,
      height: 18,
      color: '#ff8fab',
    };

    // -------------------------------------------------
    // MIDDLE section — moving platforms + breakable blocks
    // -------------------------------------------------
    this.movingHorizontal = {
      x: 560,
      y: groundY - 100,
      width: 110,
      height: 18,
      color: '#c77dff',
      minX: 540,
      maxX: 760,
      speed: 1.2,
      direction: 1,
      moving: true,
      moveAxis: 'x',
    };

    this.movingVertical = {
      x: 820,
      y: groundY - 80,
      width: 90,
      height: 18,
      color: '#ffd166',
      minY: groundY - 200,
      maxY: groundY - 70,
      speed: 0.9,
      direction: -1, // start going up
      moving: true,
      moveAxis: 'y',
    };

    // Breakable blocks — bump from below to smash (flash, then gone)
    this.breakableBlocks = [
      {
        x: 660,
        y: groundY - 170,
        width: 48,
        height: 48,
        color: '#e76f51',
        breakable: true,
        broken: false,
      },
      {
        x: 720,
        y: groundY - 170,
        width: 48,
        height: 48,
        color: '#f4a261',
        breakable: true,
        broken: false,
      },
      {
        x: 1000,
        y: groundY - 150,
        width: 48,
        height: 48,
        color: '#e76f51',
        breakable: true,
        broken: false,
      },
    ];

    // -------------------------------------------------
    // CAVE section — narrow platforms (darker zone overlay)
    // -------------------------------------------------
    const cavePlatforms = [
      { x: 960, y: groundY - 60, width: 70, height: 16, color: '#9b5de5' },
      { x: 1060, y: groundY - 110, width: 60, height: 16, color: '#9b5de5' },
      { x: 1140, y: groundY - 70, width: 65, height: 16, color: '#7b2cbf' },
      { x: 1220, y: groundY - 130, width: 55, height: 16, color: '#9b5de5' },
      { x: 1290, y: groundY - 90, width: 70, height: 16, color: '#7b2cbf' },
    ];

    // -------------------------------------------------
    // RIGHT section — tall tower + goal at the top
    // -------------------------------------------------
    const towerX = 1520;
    const tower = [
      { x: towerX, y: groundY - 70, width: 100, height: 18, color: '#ff9f1c' },
      { x: towerX + 20, y: groundY - 130, width: 100, height: 18, color: '#ff9f1c' },
      { x: towerX, y: groundY - 190, width: 100, height: 18, color: '#ff9f1c' },
      { x: towerX + 20, y: groundY - 250, width: 100, height: 18, color: '#ff9f1c' },
    ];

    // Final goal platform at the top of the tower
    this.goalPlatform = {
      x: towerX - 10,
      y: groundY - 310,
      width: 140,
      height: 20,
      color: '#ffe566',
      isGoal: true,
    };

    // Approach ledge before the tower
    const towerApproach = {
      x: 1420,
      y: groundY - 50,
      width: 80,
      height: 18,
      color: '#80ed99',
    };

    // -------------------------------------------------
    // Simple puzzle — key + door (blocks the tower until unlocked)
    // -------------------------------------------------
    this.key = {
      x: 1220 + 28,
      y: groundY - 130 - 28,
      collected: false,
    };

    this.door = {
      x: 1488,
      y: groundY - 130,
      width: 36,
      height: 130,
      locked: true,
    };

    this.platforms = [
      ...groundPieces,
      ...leftStack,
      leftGapPad,
      foeShelf,
      this.movingHorizontal,
      this.movingVertical,
      ...this.breakableBlocks,
      ...cavePlatforms,
      towerApproach,
      ...tower,
      this.goalPlatform,
    ];

    // -------------------------------------------------
    // C) Collectibles — curved star path + cave bonus cluster
    // -------------------------------------------------
    this.collectibles = [
      ...this.#makeCurvedStars(12),
      ...this.#makeCaveBonusCluster(),
    ];

    // -------------------------------------------------
    // D) Enemies
    // -------------------------------------------------
    const walker = new WalkerEnemy(1100, groundY - 44 - 16);
    // Keep the snake in the cave
    walker.patrolLeft = 980;
    walker.patrolRight = 1280;

    this.enemies = [
      new KillableEnemy(foeShelf.x + 36, foeShelf.y - 48),
      walker,
      new FloaterEnemy(towerX + 40, groundY - 220),
    ];

    // Safe start on the left ground
    this.startX = 40;
    this.startY = groundY - 50;
  }

  /** 10–12 stars along a long curved rainbow path. */
  #makeCurvedStars(count = 12) {
    const items = [];
    const startX = 100;
    const endX = 1480;
    const baseY = this.groundY - 90;

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const x = startX + (endX - startX) * t;
      // Two gentle hills along the course
      const arc = Math.sin(t * Math.PI * 2) * 55 + Math.sin(t * Math.PI) * 40;
      const y = baseY - arc - 20;

      items.push({
        x,
        y,
        type: 'star',
        radius: 14,
        collected: false,
      });
    }

    return items;
  }

  /** Extra coins tucked in the darker cave — a bonus treat! */
  #makeCaveBonusCluster() {
    const cx = 1160;
    const cy = this.groundY - 180;
    const spots = [
      [0, 0],
      [-28, 18],
      [28, 18],
      [-14, 40],
      [14, 40],
      [0, 58],
    ];

    return spots.map(([dx, dy]) => ({
      x: cx + dx,
      y: cy + dy,
      type: 'coin',
      radius: 14,
      collected: false,
    }));
  }

  /**
   * Called every frame by the game engine.
   * Updates both moving platforms (and remembers prev positions for riding).
   */
  update(_delta = 16) {
    this.#updateHorizontalPlatform(this.movingHorizontal);
    this.#updateVerticalPlatform(this.movingVertical);
  }

  #updateHorizontalPlatform(p) {
    if (!p) return;
    p.prevX = p.x;
    p.prevY = p.y;

    p.x += p.speed * p.direction;

    if (p.x <= p.minX) {
      p.x = p.minX;
      p.direction = 1;
    } else if (p.x >= p.maxX) {
      p.x = p.maxX;
      p.direction = -1;
    }
  }

  #updateVerticalPlatform(p) {
    if (!p) return;
    p.prevX = p.x;
    p.prevY = p.y;

    p.y += p.speed * p.direction;

    if (p.y <= p.minY) {
      p.y = p.minY;
      p.direction = 1; // go down
    } else if (p.y >= p.maxY) {
      p.y = p.maxY;
      p.direction = -1; // go up
    }
  }
}

export default Level2;
