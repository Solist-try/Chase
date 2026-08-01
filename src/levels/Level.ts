import { rectsOverlap, bodyToRect } from '@engine/collisions';
import type { Rect } from '@engine/types';
import type { Renderer } from '@engine/Renderer';
import { Dragon } from '@characters/Dragon';
import { NPC } from '@characters/NPC';
import type { Collectible, LevelConfig } from './types';

export interface LevelRuntimeState {
  starsCollected: number;
  starsTotal: number;
  goalComplete: boolean;
}

/** Runtime level: solids, collectibles, NPCs, and drawing. */
export class Level {
  readonly config: LevelConfig;
  readonly solids: Rect[];
  collectibles: Collectible[];
  npcs: NPC[];
  private treePhase = 0;

  constructor(config: LevelConfig) {
    this.config = config;
    this.solids = config.solids.map((s) => ({ ...s.rect }));
    this.collectibles = config.collectibles.map((c) => ({
      ...c,
      position: { ...c.position },
      collected: false,
    }));
    this.npcs = config.npcs.map(
      (n) =>
        new NPC({
          id: n.id,
          name: n.name,
          role: n.role,
          x: n.position.x,
          y: n.position.y,
          width: 44,
          height: 44,
          color: n.color,
          dialogue: n.dialogue,
          patrol: n.patrol,
        }),
    );
  }

  getState(): LevelRuntimeState {
    const starsTotal = this.collectibles.filter((c) => c.kind === 'star').length;
    const starsCollected = this.collectibles.filter(
      (c) => c.kind === 'star' && c.collected,
    ).length;
    return {
      starsCollected,
      starsTotal,
      goalComplete: starsCollected >= starsTotal && starsTotal > 0,
    };
  }

  update(dt: number, dragon: Dragon): NPC | null {
    this.treePhase += dt;
    for (const npc of this.npcs) {
      npc.update(dt);
    }

    this.pickupCollectibles(dragon);

    const nearby = this.npcs.find((npc) => dragon.isNear(npc, 70)) ?? null;
    return nearby;
  }

  private pickupCollectibles(dragon: Dragon): void {
    const bounds = dragon.bounds;
    for (const item of this.collectibles) {
      if (item.collected) continue;
      const itemRect: Rect = {
        x: item.position.x,
        y: item.position.y,
        width: 28,
        height: 28,
      };
      if (!rectsOverlap(bounds, itemRect)) continue;
      item.collected = true;
      if (item.kind === 'star') {
        dragon.collectStar();
      } else {
        dragon.heal(1);
      }
    }
  }

  draw(renderer: Renderer): void {
    const { width, height, background, groundColor, solids } = this.config;
    renderer.fillRect({ x: 0, y: 0, width, height }, background);

    // Soft hills for atmosphere
    renderer.ctx.fillStyle = groundColor;
    renderer.ctx.beginPath();
    renderer.ctx.ellipse(200, height - 40, 220, 90, 0, 0, Math.PI * 2);
    renderer.ctx.ellipse(700, height - 20, 280, 110, 0, 0, Math.PI * 2);
    renderer.ctx.ellipse(1100, height - 50, 240, 100, 0, 0, Math.PI * 2);
    renderer.ctx.fill();

    // Decorative trees
    this.drawTree(renderer, 180, 520, 0.9);
    this.drawTree(renderer, 640, 480, 1.1);
    this.drawTree(renderer, 1050, 540, 1);

    for (let i = 0; i < solids.length; i++) {
      const solid = solids[i];
      const color = solid.color ?? '#5aae61';
      renderer.drawRoundedRect(solid.rect, 8, color);
    }

    for (const item of this.collectibles) {
      if (item.collected) continue;
      this.drawCollectible(renderer, item);
    }

    for (const npc of this.npcs) {
      npc.draw(renderer);
    }
  }

  private drawCollectible(renderer: Renderer, item: Collectible): void {
    const bounce = Math.sin(this.treePhase * 5 + item.position.x * 0.01) * 4;
    const x = item.position.x;
    const y = item.position.y + bounce;

    if (item.kind === 'star') {
      renderer.ctx.fillStyle = '#ffd166';
      renderer.ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const outer = 14;
        const inner = 6;
        const ox = x + 14 + Math.cos(angle) * outer;
        const oy = y + 14 + Math.sin(angle) * outer;
        const ix = x + 14 + Math.cos(angle + Math.PI / 5) * inner;
        const iy = y + 14 + Math.sin(angle + Math.PI / 5) * inner;
        if (i === 0) renderer.ctx.moveTo(ox, oy);
        else renderer.ctx.lineTo(ox, oy);
        renderer.ctx.lineTo(ix, iy);
      }
      renderer.ctx.closePath();
      renderer.ctx.fill();
    } else {
      renderer.drawCircle({ x: x + 10, y: y + 12 }, 8, '#ff6b8a');
      renderer.drawCircle({ x: x + 20, y: y + 12 }, 8, '#ff6b8a');
      renderer.ctx.fillStyle = '#ff6b8a';
      renderer.ctx.beginPath();
      renderer.ctx.moveTo(x + 4, y + 14);
      renderer.ctx.lineTo(x + 15, y + 26);
      renderer.ctx.lineTo(x + 26, y + 14);
      renderer.ctx.fill();
    }
  }

  private drawTree(
    renderer: Renderer,
    x: number,
    y: number,
    scale: number,
  ): void {
    const sway = Math.sin(this.treePhase * 1.5 + x) * 3;
    const trunkW = 18 * scale;
    const trunkH = 50 * scale;
    renderer.fillRect(
      { x: x - trunkW / 2, y: y, width: trunkW, height: trunkH },
      '#8d6e4a',
    );
    renderer.drawCircle(
      { x: x + sway, y: y - 10 * scale },
      36 * scale,
      '#3f8f4a',
    );
    renderer.drawCircle(
      { x: x - 18 * scale + sway, y: y + 8 * scale },
      28 * scale,
      '#4aa356',
    );
    renderer.drawCircle(
      { x: x + 18 * scale + sway, y: y + 8 * scale },
      28 * scale,
      '#4aa356',
    );
  }

  /** Debug helper — unused in production drawing. */
  debugPlayerRect(renderer: Renderer, dragon: Dragon): void {
    renderer.strokeRect(bodyToRect(dragon.body), '#ffffff', 1);
  }
}
