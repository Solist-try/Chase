import { KIDS_DIFFICULTY } from '@engine/GameEngine';
import type { InputState, Rect } from '@engine/types';
import type { Renderer } from '@engine/Renderer';
import type { EnemyKind } from '@levels/types';
import { Character, type CharacterOptions } from './Character';

const ENEMY_COLORS: Record<EnemyKind, string> = {
  blob: '#80ED99',
  bumble: '#FFD166',
  sprout: '#00BBF9',
};

export interface EnemyOptions
  extends Omit<CharacterOptions, 'id' | 'name' | 'color' | 'width' | 'height'> {
  id: string;
  kind: EnemyKind;
  color?: string;
  patrol?: { minX: number; maxX: number; speed?: number };
}

/**
 * Slow, cute, non-scary enemy.
 * Soft patrol only — no spikes, no chases, no scary faces.
 */
export class Enemy extends Character {
  readonly kind: EnemyKind;
  private patrol?: { minX: number; maxX: number; speed: number };
  private patrolDir: 1 | -1 = 1;

  constructor(options: EnemyOptions) {
    const color = options.color ?? ENEMY_COLORS[options.kind];
    super({
      id: options.id,
      name: options.kind,
      color,
      x: options.x,
      y: options.y,
      width: 36,
      height: 32,
      move: options.move,
    });
    this.kind = options.kind;
    if (options.patrol) {
      this.patrol = {
        minX: options.patrol.minX,
        maxX: options.patrol.maxX,
        // Even slower than the global kid enemy cap
        speed: options.patrol.speed ?? KIDS_DIFFICULTY.enemySpeed * 0.7,
      };
    }
  }

  override update(dt: number, _input?: InputState, _solids: Rect[] = []): void {
    this.animTime += dt;
    if (!this.patrol) {
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      return;
    }

    this.body.velocity.x = this.patrol.speed * this.patrolDir;
    this.body.velocity.y = 0;
    this.body.position.x += this.body.velocity.x * dt;

    if (this.body.position.x <= this.patrol.minX) {
      this.body.position.x = this.patrol.minX;
      this.patrolDir = 1;
    } else if (this.body.position.x >= this.patrol.maxX) {
      this.body.position.x = this.patrol.maxX;
      this.patrolDir = -1;
    }
    this.facing = this.patrolDir > 0 ? 'right' : 'left';
  }

  draw(renderer: Renderer): void {
    const { x, y } = this.body.position;
    const { width, height } = this.body.size;
    const bob = Math.sin(this.animTime * 3) * 2;
    const ctx = renderer.ctx;

    if (this.kind === 'blob') {
      renderer.drawRoundedRect(
        { x, y: y + bob, width, height },
        14,
        this.color,
      );
      // Friendly eyes
      renderer.drawCircle({ x: x + 12, y: y + 12 + bob }, 4, '#FFFAF0');
      renderer.drawCircle({ x: x + 24, y: y + 12 + bob }, 4, '#FFFAF0');
      renderer.drawCircle({ x: x + 13, y: y + 12 + bob }, 2, '#1B2A4A');
      renderer.drawCircle({ x: x + 25, y: y + 12 + bob }, 2, '#1B2A4A');
      // Smile
      ctx.strokeStyle = '#1B2A4A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + width / 2, y + 18 + bob, 6, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      return;
    }

    if (this.kind === 'bumble') {
      // Soft bee-like oval — no stinger
      renderer.drawRoundedRect(
        { x, y: y + bob, width, height: height - 2 },
        12,
        this.color,
      );
      ctx.fillStyle = '#1B2A4A';
      ctx.fillRect(x + 8, y + 10 + bob, width - 16, 4);
      ctx.fillRect(x + 8, y + 18 + bob, width - 16, 4);
      renderer.drawCircle({ x: x + 12, y: y + 10 + bob }, 3, '#FFFAF0');
      renderer.drawCircle({ x: x + 24, y: y + 10 + bob }, 3, '#FFFAF0');
      // Tiny wing puffs
      ctx.fillStyle = 'rgba(255, 250, 240, 0.85)';
      ctx.beginPath();
      ctx.ellipse(x + 4, y + 6 + bob, 8, 5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(x + width - 4, y + 6 + bob, 8, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // sprout — little plant buddy
    ctx.fillStyle = '#8D6E4A';
    ctx.fillRect(x + width / 2 - 3, y + height - 8 + bob, 6, 10);
    renderer.drawCircle(
      { x: x + width / 2, y: y + height * 0.4 + bob },
      14,
      this.color,
    );
    renderer.drawCircle({ x: x + 14, y: y + 12 + bob }, 3, '#1B2A4A');
    renderer.drawCircle({ x: x + 22, y: y + 12 + bob }, 3, '#1B2A4A');
  }
}
