import { CollisionEngine } from '@engine/CollisionEngine';
import { bodyToRect, distance, rectsOverlap } from '@engine/collisions';
import type { Rect, Vector2 } from '@engine/types';
import type { Renderer } from '@engine/Renderer';
import { Dragon } from '@characters/Dragon';
import { Enemy } from '@characters/Enemy';
import { NPC } from '@characters/NPC';
import { getTheme } from './themes';
import type { Collectible, LevelConfig, LevelGoal } from './types';

export interface LevelRuntimeState {
  starsCollected: number;
  starsTotal: number;
  coinsCollected: number;
  coinsTotal: number;
  goalComplete: boolean;
  goalDescription: string;
}

/** Runtime level: platforms, collectibles, cute enemies, NPCs, goals. */
export class Level {
  readonly config: LevelConfig;
  readonly solids: Rect[];
  collectibles: Collectible[];
  npcs: NPC[];
  enemies: Enemy[];
  private treePhase = 0;
  private friendMet = false;
  private friendTalked = false;
  private markerReached = false;
  private readonly collisions = new CollisionEngine();

  constructor(config: LevelConfig) {
    this.config = config;
    this.solids = config.platforms.map((p) => ({ ...p.rect }));
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
    this.enemies = config.enemies.map(
      (e) =>
        new Enemy({
          id: e.id,
          kind: e.kind,
          x: e.position.x,
          y: e.position.y,
          color: e.color,
          patrol: e.patrol,
        }),
    );
  }

  get goal(): LevelGoal {
    return this.config.goal;
  }

  getState(): LevelRuntimeState {
    const starsTotal = this.collectibles.filter((c) => c.kind === 'star').length;
    const starsCollected = this.collectibles.filter(
      (c) => c.kind === 'star' && c.collected,
    ).length;
    const coinsTotal = this.collectibles.filter((c) => c.kind === 'coin').length;
    const coinsCollected = this.collectibles.filter(
      (c) => c.kind === 'coin' && c.collected,
    ).length;

    return {
      starsCollected,
      starsTotal,
      coinsCollected,
      coinsTotal,
      goalComplete: this.isGoalComplete(),
      goalDescription: this.config.goal.description,
    };
  }

  /** Mark that the player opened dialogue with a friend NPC. */
  noteTalkedTo(npcId: string): void {
    if (this.config.goal.friendId === npcId) {
      this.friendTalked = true;
      this.friendMet = true;
    }
  }

  update(dt: number, dragon: Dragon): NPC | null {
    this.treePhase += dt;

    for (const npc of this.npcs) {
      npc.update(dt);
    }
    for (const enemy of this.enemies) {
      enemy.update(dt);
    }

    this.pickupCollectibles(dragon);
    // Non-harmful: dragon bounce animation + soft physics knockback
    const bump = this.collisions.resolveEnemyBounce(
      dragon.body,
      this.enemies.map((enemy) => ({
        body: enemy.body,
        center: enemy.center,
      })),
      dt,
    );
    if (bump.bounced) {
      dragon.playBounce();
      const hit = this.enemies.find((enemy) => enemy.body === bump.enemy?.body);
      hit?.reactToBump();
    }
    this.checkMarker(dragon);
    this.checkFriendProximity(dragon);

    const nearby = this.npcs.find((npc) => dragon.isNear(npc, 70)) ?? null;
    return nearby;
  }

  private isGoalComplete(): boolean {
    const { goal } = this.config;
    const stars = this.collectibles.filter(
      (c) => c.kind === 'star' && c.collected,
    ).length;
    const coins = this.collectibles.filter(
      (c) => c.kind === 'coin' && c.collected,
    ).length;
    const need = goal.collectCount ?? 0;

    switch (goal.type) {
      case 'collect_stars':
        return stars >= need;
      case 'collect_coins':
        return coins >= need;
      case 'find_friend':
        return this.friendMet;
      case 'talk_to_friend':
        return this.friendTalked;
      case 'reach_tree': {
        const coinsOk = need <= 0 || coins >= need;
        return coinsOk && this.markerReached;
      }
      default:
        return false;
    }
  }

  private checkFriendProximity(dragon: Dragon): void {
    const friendId = this.config.goal.friendId;
    if (!friendId) return;
    const friend = this.npcs.find((n) => n.id === friendId);
    if (friend && dragon.isNear(friend, 90)) {
      this.friendMet = true;
    }
  }

  private checkMarker(dragon: Dragon): void {
    const marker = this.config.goal.marker;
    if (!marker) return;
    const radius = marker.radius ?? 70;
    if (distance(dragon.center, marker.position) <= radius) {
      this.markerReached = true;
    }
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
      if (item.kind === 'star') dragon.collectStar();
      else if (item.kind === 'heart') dragon.heal(1);
      else dragon.collectCoin();
    }
  }

  draw(renderer: Renderer): void {
    const theme = getTheme(this.config.theme);
    const { width, height, platforms } = this.config;

    renderer.fillRect({ x: 0, y: 0, width, height }, theme.background);

    // Soft lower wash / hills
    renderer.ctx.fillStyle = theme.backgroundBottom;
    renderer.ctx.beginPath();
    renderer.ctx.ellipse(200, height - 20, 240, 100, 0, 0, Math.PI * 2);
    renderer.ctx.ellipse(700, height, 300, 120, 0, 0, Math.PI * 2);
    renderer.ctx.ellipse(width - 200, height - 30, 260, 110, 0, 0, Math.PI * 2);
    renderer.ctx.fill();

    // Decorative clouds
    this.drawCloud(renderer, 180, 120, theme.cloud);
    this.drawCloud(renderer, 620, 80, theme.cloud);
    this.drawCloud(renderer, 1100, 140, theme.cloud);

    // Goal tree / marker
    if (this.config.goal.marker) {
      this.drawGoalMarker(renderer, this.config.goal.marker.position, theme.accent);
    }

    for (const platform of platforms) {
      const color =
        platform.color ??
        (platform.kind === 'ground' || platform.kind === 'wall'
          ? theme.ground
          : platform.kind === 'cloud'
            ? theme.cloud
            : theme.platform);
      const radius = platform.kind === 'cloud' ? 16 : 8;
      renderer.drawRoundedRect(platform.rect, radius, color);
      if (platform.kind === 'cloud') {
        renderer.ctx.fillStyle = theme.cloud;
        renderer.ctx.beginPath();
        renderer.ctx.arc(
          platform.rect.x + 20,
          platform.rect.y + 6,
          16,
          0,
          Math.PI * 2,
        );
        renderer.ctx.arc(
          platform.rect.x + platform.rect.width - 20,
          platform.rect.y + 6,
          16,
          0,
          Math.PI * 2,
        );
        renderer.ctx.fill();
      }
    }

    for (const item of this.collectibles) {
      if (item.collected) continue;
      this.drawCollectible(renderer, item, theme.accent);
    }

    for (const enemy of this.enemies) {
      enemy.draw(renderer);
    }
    for (const npc of this.npcs) {
      npc.draw(renderer);
    }
  }

  private drawGoalMarker(
    renderer: Renderer,
    position: Vector2,
    accent: string,
  ): void {
    const sway = Math.sin(this.treePhase * 1.4) * 3;
    // Trunk
    renderer.fillRect(
      { x: position.x - 10, y: position.y, width: 20, height: 70 },
      '#8d6e4a',
    );
    // Rainbow canopy layers
    const colors = ['#FF4D6D', '#FF9F1C', '#FFE566', '#80ED99', '#00BBF9', '#B5179E'];
    colors.forEach((color, i) => {
      renderer.drawCircle(
        {
          x: position.x + sway * (i % 2 === 0 ? 1 : -0.5),
          y: position.y - 10 - i * 6,
        },
        34 - i * 3,
        color,
      );
    });
    // Sparkle tip
    renderer.drawCircle(
      { x: position.x, y: position.y - 48 },
      6,
      accent,
    );
  }

  private drawCloud(renderer: Renderer, x: number, y: number, color: string): void {
    renderer.drawCircle({ x, y }, 22, color);
    renderer.drawCircle({ x: x + 24, y: y - 6 }, 28, color);
    renderer.drawCircle({ x: x + 50, y: y }, 20, color);
  }

  private drawCollectible(
    renderer: Renderer,
    item: Collectible,
    accent: string,
  ): void {
    const bounce = Math.sin(this.treePhase * 5 + item.position.x * 0.01) * 4;
    const x = item.position.x;
    const y = item.position.y + bounce;

    if (item.kind === 'star') {
      renderer.ctx.fillStyle = accent;
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
      return;
    }

    if (item.kind === 'coin') {
      renderer.drawCircle({ x: x + 14, y: y + 14 }, 12, '#FFD166');
      renderer.drawCircle({ x: x + 14, y: y + 14 }, 8, '#FFE566');
      renderer.drawText('$', x + 14, y + 15, {
        size: 12,
        align: 'center',
        color: '#E85D04',
      });
      return;
    }

    // heart
    renderer.drawCircle({ x: x + 10, y: y + 12 }, 8, '#ff6b8a');
    renderer.drawCircle({ x: x + 20, y: y + 12 }, 8, '#ff6b8a');
    renderer.ctx.fillStyle = '#ff6b8a';
    renderer.ctx.beginPath();
    renderer.ctx.moveTo(x + 4, y + 14);
    renderer.ctx.lineTo(x + 15, y + 26);
    renderer.ctx.lineTo(x + 26, y + 14);
    renderer.ctx.fill();
  }

  /** Debug helper. */
  debugPlayerRect(renderer: Renderer, dragon: Dragon): void {
    renderer.strokeRect(bodyToRect(dragon.body), '#ffffff', 1);
  }
}
