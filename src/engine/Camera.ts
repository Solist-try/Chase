import type { Size, Vector2 } from './types';

/** Smooth camera that follows a target inside world bounds. */
export class Camera {
  position: Vector2 = { x: 0, y: 0 };
  private readonly viewport: Size;
  private readonly world: Size;
  private readonly lerp = 0.12;

  constructor(viewport: Size, world: Size) {
    this.viewport = viewport;
    this.world = world;
  }

  follow(target: Vector2): void {
    const desiredX = target.x - this.viewport.width / 2;
    const desiredY = target.y - this.viewport.height / 2;

    this.position.x += (desiredX - this.position.x) * this.lerp;
    this.position.y += (desiredY - this.position.y) * this.lerp;

    this.position.x = clamp(
      this.position.x,
      0,
      Math.max(0, this.world.width - this.viewport.width),
    );
    this.position.y = clamp(
      this.position.y,
      0,
      Math.max(0, this.world.height - this.viewport.height),
    );
  }

  worldToScreen(point: Vector2): Vector2 {
    return {
      x: point.x - this.position.x,
      y: point.y - this.position.y,
    };
  }

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.translate(-Math.round(this.position.x), -Math.round(this.position.y));
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
