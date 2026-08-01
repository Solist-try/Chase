import type { PhysicsBody, Vector2 } from './types';

/** Gravity and simple velocity integration for platform-style movement. */
export const GRAVITY = 1800;
export const MAX_FALL_SPEED = 900;
export const FRICTION = 0.82;
export const AIR_CONTROL = 0.55;

export function applyGravity(body: PhysicsBody, dt: number): void {
  if (body.grounded) return;
  body.velocity.y = Math.min(body.velocity.y + GRAVITY * dt, MAX_FALL_SPEED);
}

export function integrate(body: PhysicsBody, dt: number): Vector2 {
  const next = {
    x: body.position.x + body.velocity.x * dt,
    y: body.position.y + body.velocity.y * dt,
  };
  body.position = next;
  return next;
}

export function applyFriction(body: PhysicsBody, grounded: boolean): void {
  if (!grounded) return;
  body.velocity.x *= FRICTION;
  if (Math.abs(body.velocity.x) < 4) {
    body.velocity.x = 0;
  }
}

export function createBody(
  x: number,
  y: number,
  width: number,
  height: number,
  solid = true,
): PhysicsBody {
  return {
    position: { x, y },
    velocity: { x: 0, y: 0 },
    size: { width, height },
    grounded: false,
    solid,
  };
}
