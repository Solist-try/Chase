import { KIDS_DIFFICULTY } from '@engine/GameEngine';
import type { InputState, Rect } from '@engine/types';
import type { Renderer } from '@engine/Renderer';
import type { EnemyKind } from '@levels/types';
import { Character, type CharacterOptions } from './Character';

/** Default candy colors — soft, never menacing. */
const ENEMY_COLORS: Record<EnemyKind, string> = {
  blob: '#80ED99',
  bumble: '#FFD166',
  sprout: '#00BBF9',
};

/** Slow walk speeds (px/s) — below the kid enemy cap. */
const WALK_SPEED: Record<EnemyKind, number> = {
  blob: 28,
  bumble: 32,
  sprout: 24,
};

export interface EnemyPatrol {
  minX: number;
  maxX: number;
  /** Optional override; defaults to a slow kind-based walk. */
  speed?: number;
}

export interface EnemyOptions
  extends Omit<CharacterOptions, 'id' | 'name' | 'color' | 'width' | 'height'> {
  id: string;
  kind: EnemyKind;
  color?: string;
  patrol?: EnemyPatrol;
}

/**
 * Cute, slow enemy with a simple left–right patrol.
 * No spikes, chases, or scary faces — collision only makes the dragon bounce.
 */
export class Enemy extends Character {
  readonly kind: EnemyKind;
  private patrol?: { minX: number; maxX: number; speed: number };
  private patrolDir: 1 | -1 = 1;
  private walkPhase = 0;
  private pauseTimer = 0;
  private surprisedTimer = 0;

  constructor(options: EnemyOptions) {
    const color = options.color ?? ENEMY_COLORS[options.kind];
    super({
      id: options.id,
      name: friendlyName(options.kind),
      color,
      x: options.x,
      y: options.y,
      width: 40,
      height: 34,
      move: options.move,
    });
    this.kind = options.kind;

    if (options.patrol) {
      this.patrol = {
        minX: options.patrol.minX,
        maxX: options.patrol.maxX,
        speed:
          options.patrol.speed ??
          Math.min(WALK_SPEED[options.kind], KIDS_DIFFICULTY.enemySpeed * 0.75),
      };
    }
  }

  /** Brief “oops!” squash when the dragon bumps into this buddy. */
  reactToBump(): void {
    this.surprisedTimer = 0.35;
    this.pauseTimer = 0.2;
  }

  override update(dt: number, _input?: InputState, _solids: Rect[] = []): void {
    this.animTime += dt;
    this.surprisedTimer = Math.max(0, this.surprisedTimer - dt);
    this.pauseTimer = Math.max(0, this.pauseTimer - dt);

    if (!this.patrol || this.pauseTimer > 0) {
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      return;
    }

    // Slow left–right patrol with a tiny pause at each end
    this.body.velocity.x = this.patrol.speed * this.patrolDir;
    this.body.velocity.y = 0;
    this.body.position.x += this.body.velocity.x * dt;
    this.walkPhase += Math.abs(this.body.velocity.x) * dt * 0.12;

    if (this.body.position.x <= this.patrol.minX) {
      this.body.position.x = this.patrol.minX;
      this.patrolDir = 1;
      this.pauseTimer = 0.35;
    } else if (this.body.position.x >= this.patrol.maxX) {
      this.body.position.x = this.patrol.maxX;
      this.patrolDir = -1;
      this.pauseTimer = 0.35;
    }

    this.facing = this.patrolDir > 0 ? 'right' : 'left';
  }

  draw(renderer: Renderer): void {
    const { x, y } = this.body.position;
    const { width, height } = this.body.size;
    const walkBob = Math.abs(Math.sin(this.walkPhase)) * 3;
    const surprise = this.surprisedTimer > 0 ? 1 : 0;
    const squash = surprise ? 1.12 : 1;
    const stretch = surprise ? 0.88 : 1;
    const bob = walkBob + (surprise ? -4 : 0);
    const ctx = renderer.ctx;

    // Soft shadow
    ctx.fillStyle = 'rgba(27, 42, 74, 0.14)';
    ctx.beginPath();
    ctx.ellipse(
      x + width / 2,
      y + height - 2,
      width * 0.34,
      5,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.save();
    ctx.translate(x + width / 2, y + height);
    ctx.scale(
      (this.patrolDir || 1) * squash,
      stretch,
    );
    ctx.translate(-width / 2, -height);

    if (this.kind === 'blob') {
      this.drawBlob(renderer, width, height, bob);
    } else if (this.kind === 'bumble') {
      this.drawBumble(renderer, width, height, bob);
    } else {
      this.drawSprout(renderer, width, height, bob);
    }

    ctx.restore();
  }

  private drawBlob(
    renderer: Renderer,
    width: number,
    height: number,
    bob: number,
  ): void {
    const ctx = renderer.ctx;
    // Round jelly body
    renderer.drawRoundedRect(
      { x: 2, y: 4 + bob, width: width - 4, height: height - 6 },
      16,
      this.color,
    );
    // Belly shine
    renderer.drawRoundedRect(
      { x: width * 0.28, y: height * 0.4 + bob, width: width * 0.44, height: height * 0.28 },
      10,
      '#C9FBD8',
    );
    this.drawCuteFace(ctx, width, height, bob, true);
    // Tiny feet for walk read
    const foot = Math.sin(this.walkPhase) * 3;
    ctx.fillStyle = '#52B788';
    roundFoot(ctx, 8, height - 6 + bob + foot, 10);
    roundFoot(ctx, width - 18, height - 6 + bob - foot, 10);
  }

  private drawBumble(
    renderer: Renderer,
    width: number,
    height: number,
    bob: number,
  ): void {
    const ctx = renderer.ctx;
    // Fluffy bee body — no stinger
    renderer.drawRoundedRect(
      { x: 3, y: 6 + bob, width: width - 6, height: height - 10 },
      14,
      this.color,
    );
    ctx.fillStyle = '#1B2A4A';
    ctx.fillRect(10, 12 + bob, width - 20, 4);
    ctx.fillRect(10, 20 + bob, width - 20, 4);
    // Soft wing puffs
    const flap = Math.sin(this.animTime * 10) * 3;
    ctx.fillStyle = 'rgba(255, 250, 240, 0.9)';
    ctx.beginPath();
    ctx.ellipse(6, 8 + bob + flap, 9, 6, -0.5, 0, Math.PI * 2);
    ctx.ellipse(width - 6, 8 + bob - flap, 9, 6, 0.5, 0, Math.PI * 2);
    ctx.fill();
    this.drawCuteFace(ctx, width, height, bob, false);
  }

  private drawSprout(
    renderer: Renderer,
    width: number,
    height: number,
    bob: number,
  ): void {
    const ctx = renderer.ctx;
    // Stem
    ctx.fillStyle = '#8D6E4A';
    ctx.fillRect(width / 2 - 3, height - 12 + bob, 6, 12);
    // Leaf cheeks
    ctx.fillStyle = '#80ED99';
    ctx.beginPath();
    ctx.ellipse(8, height * 0.55 + bob, 8, 5, -0.5, 0, Math.PI * 2);
    ctx.ellipse(width - 8, height * 0.55 + bob, 8, 5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Round leafy head
    renderer.drawCircle(
      { x: width / 2, y: height * 0.38 + bob },
      15,
      this.color,
    );
    this.drawCuteFace(ctx, width, height * 0.85, bob, true);
  }

  private drawCuteFace(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    bob: number,
    rosy: boolean,
  ): void {
    const eyeY = height * 0.34 + bob;
    // Big friendly eyes
    ctx.fillStyle = '#FFFAF0';
    ctx.beginPath();
    ctx.arc(width * 0.34, eyeY, 5, 0, Math.PI * 2);
    ctx.arc(width * 0.66, eyeY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1B2A4A';
    ctx.beginPath();
    ctx.arc(width * 0.36, eyeY, 2.4, 0, Math.PI * 2);
    ctx.arc(width * 0.68, eyeY, 2.4, 0, Math.PI * 2);
    ctx.fill();
    // Smile (never frown)
    ctx.strokeStyle = '#1B2A4A';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.48 + bob, 7, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    if (rosy) {
      ctx.fillStyle = '#FF85A1';
      ctx.beginPath();
      ctx.arc(width * 0.22, height * 0.48 + bob, 3, 0, Math.PI * 2);
      ctx.arc(width * 0.78, height * 0.48 + bob, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function friendlyName(kind: EnemyKind): string {
  switch (kind) {
    case 'blob':
      return 'Jelly';
    case 'bumble':
      return 'Bumble';
    case 'sprout':
      return 'Sprout';
  }
}

function roundFoot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
): void {
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y, w / 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}
