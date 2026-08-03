import { rectsOverlap } from '@engine/collisions';
import type { Rect } from '@engine/types';
import type { Renderer } from '@engine/Renderer';
import { soundEngine } from '@engine/SoundEngine';
import type { CollectibleKind, CollectibleSpawn } from '@levels/types';
import type { Dragon } from './Dragon';

export type { CollectibleSpawn };

const SIZE = 32;

const RAINBOW = [
  '#FF4D6D',
  '#FF9F1C',
  '#FFE566',
  '#80ED99',
  '#00BBF9',
  '#B5179E',
];

/**
 * Pickup item: shiny stars or rainbow gems (plus optional hearts).
 * Handles sparkle animation, collect SFX, and dragon / HUD counters.
 */
export class Collectible {
  readonly id: string;
  readonly kind: CollectibleKind;
  position: { x: number; y: number };
  collected = false;

  private animTime = 0;
  /** Short sparkle burst after pickup before the item vanishes from view. */
  private popTimer = 0;

  constructor(spawn: CollectibleSpawn) {
    this.id = spawn.id;
    this.kind = spawn.kind === 'coin' ? 'gem' : spawn.kind;
    this.position = { ...spawn.position };
  }

  get bounds(): Rect {
    return {
      x: this.position.x,
      y: this.position.y,
      width: SIZE,
      height: SIZE,
    };
  }

  get isGem(): boolean {
    return this.kind === 'gem' || this.kind === 'coin';
  }

  update(dt: number): void {
    this.animTime += dt;
    if (this.popTimer > 0) {
      this.popTimer = Math.max(0, this.popTimer - dt);
    }
  }

  /**
   * If the dragon touches this item, collect it:
   * play sound, update dragon counters (HUD reads level state next frame).
   */
  tryCollect(dragon: Dragon): boolean {
    if (this.collected) return false;
    if (!rectsOverlap(dragon.bounds, this.bounds)) return false;

    this.collected = true;
    this.popTimer = 0.28;
    this.playCollectSound();

    if (this.kind === 'star') {
      dragon.collectStar();
    } else if (this.kind === 'heart') {
      dragon.heal(1);
    } else {
      dragon.collectGem();
    }

    return true;
  }

  /** Draw while active, or a brief sparkle pop after collection. */
  draw(renderer: Renderer): void {
    if (this.collected && this.popTimer <= 0) return;

    const bounce = Math.sin(this.animTime * 5 + this.position.x * 0.01) * 4;
    const x = this.position.x;
    const y = this.position.y + bounce;
    const ctx = renderer.ctx;

    if (this.collected) {
      this.drawPopSparkles(ctx, x + SIZE / 2, y + SIZE / 2);
      return;
    }

    this.drawIdleSparkles(ctx, x + SIZE / 2, y + SIZE / 2);

    if (this.kind === 'star') {
      this.drawStar(ctx, x, y);
    } else if (this.kind === 'heart') {
      this.drawHeart(renderer, x, y);
    } else {
      this.drawRainbowGem(ctx, x, y);
    }
  }

  private playCollectSound(): void {
    soundEngine.playCollect(this.kind === 'coin' ? 'gem' : this.kind);
  }

  private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const cx = x + SIZE / 2;
    const cy = y + SIZE / 2;
    const spin = Math.sin(this.animTime * 3) * 0.15;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(spin);
    ctx.fillStyle = '#FFD166';
    ctx.strokeStyle = '#1B2A4A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      const outer = 14;
      const inner = 6;
      const ox = Math.cos(angle) * outer;
      const oy = Math.sin(angle) * outer;
      const ix = Math.cos(angle + Math.PI / 5) * inner;
      const iy = Math.sin(angle + Math.PI / 5) * inner;
      if (i === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
      ctx.lineTo(ix, iy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawRainbowGem(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
  ): void {
    const cx = x + SIZE / 2;
    const cy = y + SIZE / 2;
    const colorIndex =
      Math.floor(this.animTime * 3 + this.position.x * 0.05) % RAINBOW.length;
    const color = RAINBOW[colorIndex];
    const next = RAINBOW[(colorIndex + 1) % RAINBOW.length];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(this.animTime * 2) * 0.12);

    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(12, 0);
    ctx.lineTo(0, 14);
    ctx.lineTo(-12, 0);
    ctx.closePath();
    const grad = ctx.createLinearGradient(-12, -14, 12, 14);
    grad.addColorStop(0, color);
    grad.addColorStop(1, next);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#1B2A4A';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 250, 240, 0.65)';
    ctx.beginPath();
    ctx.moveTo(-2, -8);
    ctx.lineTo(4, -2);
    ctx.lineTo(-4, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawHeart(renderer: Renderer, x: number, y: number): void {
    renderer.drawCircle({ x: x + 10, y: y + 12 }, 8, '#ff6b8a');
    renderer.drawCircle({ x: x + 20, y: y + 12 }, 8, '#ff6b8a');
    renderer.ctx.fillStyle = '#ff6b8a';
    renderer.ctx.beginPath();
    renderer.ctx.moveTo(x + 4, y + 14);
    renderer.ctx.lineTo(x + 15, y + 26);
    renderer.ctx.lineTo(x + 26, y + 14);
    renderer.ctx.fill();
  }

  private drawIdleSparkles(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
  ): void {
    const t = this.animTime * 6;
    for (let i = 0; i < 4; i++) {
      const angle = t + i * (Math.PI / 2);
      const radius = 18 + Math.sin(t * 1.4 + i) * 3;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      const alpha = 0.45 + Math.sin(t + i) * 0.35;
      ctx.fillStyle = `rgba(255, 255, 102, ${alpha})`;
      drawTwinkle(ctx, px, py, 2.5 + (i % 2));
    }
  }

  private drawPopSparkles(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
  ): void {
    const progress = 1 - this.popTimer / 0.28;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 8 + progress * 22;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      ctx.fillStyle = RAINBOW[i % RAINBOW.length];
      drawTwinkle(ctx, px, py, 3 * (1 - progress));
    }
  }
}

function drawTwinkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r * 0.55, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r * 0.55, y);
  ctx.closePath();
  ctx.fill();
}
