import type { CollisionResult, PhysicsBody, Rect, Vector2 } from './types';

export function bodyToRect(body: PhysicsBody): Rect {
  return {
    x: body.position.x,
    y: body.position.y,
    width: body.size.width,
    height: body.size.height,
  };
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function getOverlap(a: Rect, b: Rect): Vector2 {
  const overlapX =
    Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const overlapY =
    Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return { x: overlapX, y: overlapY };
}

/** Axis-aligned bounding-box collision with simple resolution. */
export function resolveAabb(
  moving: PhysicsBody,
  obstacle: Rect,
): CollisionResult {
  const a = bodyToRect(moving);
  if (!rectsOverlap(a, obstacle)) {
    return { collided: false };
  }

  const overlap = getOverlap(a, obstacle);
  if (overlap.x < overlap.y) {
    if (a.x + a.width / 2 < obstacle.x + obstacle.width / 2) {
      moving.position.x -= overlap.x;
      moving.velocity.x = Math.min(0, moving.velocity.x);
      return { collided: true, side: 'right', overlap };
    }
    moving.position.x += overlap.x;
    moving.velocity.x = Math.max(0, moving.velocity.x);
    return { collided: true, side: 'left', overlap };
  }

  if (a.y + a.height / 2 < obstacle.y + obstacle.height / 2) {
    moving.position.y -= overlap.y;
    moving.velocity.y = Math.min(0, moving.velocity.y);
    moving.grounded = true;
    return { collided: true, side: 'bottom', overlap };
  }

  moving.position.y += overlap.y;
  moving.velocity.y = Math.max(0, moving.velocity.y);
  return { collided: true, side: 'top', overlap };
}

export function collideWithWorld(
  body: PhysicsBody,
  solids: Rect[],
): CollisionResult[] {
  body.grounded = false;
  return solids.map((solid) => resolveAabb(body, solid));
}

export function pointInRect(point: Vector2, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function distance(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}
