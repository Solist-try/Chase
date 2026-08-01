import { collideWithWorld } from '@engine/collisions';
import type { InputState, Rect } from '@engine/types';
import type { Renderer } from '@engine/Renderer';
import { Character, type CharacterOptions } from './Character';

export interface DragonStats {
  stars: number;
  health: number;
  maxHealth: number;
}

/** Playable dragon — soft colors, big hitbox, forgiving movement for age 8. */
export class Dragon extends Character {
  stats: DragonStats = {
    stars: 0,
    health: 3,
    maxHealth: 3,
  };

  constructor(
    options: Omit<CharacterOptions, 'id' | 'name' | 'color' | 'width' | 'height'> & {
      name?: string;
      width?: number;
      height?: number;
    },
  ) {
    super({
      id: 'player-dragon',
      name: options.name ?? 'Ember',
      color: '#e85d4c',
      width: options.width ?? 48,
      height: options.height ?? 48,
      x: options.x,
      y: options.y,
      move: {
        speed: 240,
        topDown: true,
        ...options.move,
      },
    });
  }

  override update(dt: number, input?: InputState, solids: Rect[] = []): void {
    super.update(dt, input, solids);
  }

  protected override afterIntegrate(solids: Rect[]): void {
    collideWithWorld(this.body, solids);
  }

  collectStar(): void {
    this.stats.stars += 1;
  }

  heal(amount = 1): void {
    this.stats.health = Math.min(
      this.stats.maxHealth,
      this.stats.health + amount,
    );
  }

  draw(renderer: Renderer): void {
    const { x, y } = this.body.position;
    const { width, height } = this.body.size;
    const bob = Math.sin(this.animTime * 6) * 2;
    const ctx = renderer.ctx;

    // Soft shadow
    ctx.fillStyle = 'rgba(27, 42, 74, 0.18)';
    ctx.beginPath();
    ctx.ellipse(
      x + width / 2,
      y + height - 4,
      width * 0.35,
      6,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Body
    renderer.drawRoundedRect(
      { x, y: y + bob, width, height: height - 6 },
      16,
      this.color,
    );

    // Belly
    renderer.drawRoundedRect(
      {
        x: x + width * 0.22,
        y: y + height * 0.35 + bob,
        width: width * 0.56,
        height: height * 0.4,
      },
      12,
      '#ffd7a8',
    );

    // Eyes
    const eyeY = y + height * 0.28 + bob;
    renderer.drawCircle({ x: x + width * 0.32, y: eyeY }, 5, '#fffaf0');
    renderer.drawCircle({ x: x + width * 0.68, y: eyeY }, 5, '#fffaf0');
    renderer.drawCircle({ x: x + width * 0.34, y: eyeY }, 2.5, '#1b2a4a');
    renderer.drawCircle({ x: x + width * 0.7, y: eyeY }, 2.5, '#1b2a4a');

    // Tiny wings
    ctx.fillStyle = '#c94438';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + height * 0.4 + bob);
    ctx.quadraticCurveTo(x - 10, y + height * 0.2 + bob, x + 8, y + height * 0.15 + bob);
    ctx.quadraticCurveTo(x + 2, y + height * 0.3 + bob, x + 4, y + height * 0.4 + bob);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + width - 4, y + height * 0.4 + bob);
    ctx.quadraticCurveTo(
      x + width + 10,
      y + height * 0.2 + bob,
      x + width - 8,
      y + height * 0.15 + bob,
    );
    ctx.quadraticCurveTo(
      x + width - 2,
      y + height * 0.3 + bob,
      x + width - 4,
      y + height * 0.4 + bob,
    );
    ctx.fill();
  }
}
