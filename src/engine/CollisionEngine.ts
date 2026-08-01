import {
  bodyToRect,
  collideWithWorld,
  rectsOverlap,
  resolveAabb,
} from './collisions';
import type { CollisionResult, PhysicsBody, Rect, Vector2 } from './types';

/** Soft bounce away from cute enemies — no damage. */
export const ENEMY_BOUNCE = {
  horizontal: 260,
  vertical: 240,
  /** Separation so bodies don't stick together. */
  separation: 4,
  /** Ignore repeat bumps briefly for a smooth feel. */
  cooldown: 0.35,
} as const;

export interface PlatformCollisionResult {
  hits: CollisionResult[];
  /** True when the body is standing on a platform this frame. */
  grounded: boolean;
  /** True when this frame is a fresh landing after being airborne. */
  landed: boolean;
  /** Platform rect underfoot, if any. */
  floor: Rect | null;
}

export interface EnemyBody {
  body: PhysicsBody;
  /** Optional center override; defaults to body center. */
  center?: Vector2;
}

export interface EnemyBounceResult {
  bounced: boolean;
  enemy: EnemyBody | null;
  direction: 1 | -1;
}

/**
 * Dedicated collision helpers for the kids platformer:
 * platforms, jump landings, and non-harmful enemy bounces.
 */
export class CollisionEngine {
  private wasGrounded = new WeakMap<PhysicsBody, boolean>();
  private enemyCooldown = new WeakMap<PhysicsBody, number>();

  /**
   * Resolve AABB collisions against solid platforms.
   * Sets `body.grounded` when standing on a top surface.
   */
  resolvePlatforms(body: PhysicsBody, platforms: Rect[]): PlatformCollisionResult {
    const airborneBefore = !(this.wasGrounded.get(body) ?? body.grounded);
    const hits = collideWithWorld(body, platforms);

    let floor: Rect | null = null;
    for (let i = 0; i < hits.length; i++) {
      if (hits[i]?.collided && hits[i]?.side === 'bottom') {
        floor = platforms[i] ?? null;
        break;
      }
    }

    const grounded = body.grounded;
    const landed = grounded && airborneBefore;
    this.wasGrounded.set(body, grounded);

    return { hits, grounded, landed, floor };
  }

  /**
   * Jump landing detection — true only on the frame the dragon
   * first touches a platform from above after being airborne.
   */
  detectLanding(body: PhysicsBody, platforms: Rect[]): boolean {
    return this.resolvePlatforms(body, platforms).landed;
  }

  /** Whether the body currently stands on any platform top. */
  isOnPlatform(body: PhysicsBody): boolean {
    return body.grounded;
  }

  /**
   * Non-harmful enemy collision: dragon bounces back with a soft hop.
   * Never reduces health — cute bumps only.
   */
  resolveEnemyBounce(
    dragon: PhysicsBody,
    enemies: EnemyBody[],
    dt = 0,
  ): EnemyBounceResult {
    const cooldown = Math.max(0, (this.enemyCooldown.get(dragon) ?? 0) - dt);
    this.enemyCooldown.set(dragon, cooldown);
    if (cooldown > 0) {
      return { bounced: false, enemy: null, direction: 1 };
    }

    const dragonRect = bodyToRect(dragon);
    const dragonCenter = centerOf(dragon);

    for (const enemy of enemies) {
      const enemyRect = bodyToRect(enemy.body);
      if (!rectsOverlap(dragonRect, enemyRect)) continue;

      const enemyCenter = enemy.center ?? centerOf(enemy.body);
      const direction: 1 | -1 = dragonCenter.x < enemyCenter.x ? -1 : 1;

      // Soft launch away + tiny hop so the bump reads clearly but stays gentle
      dragon.velocity.x = direction * ENEMY_BOUNCE.horizontal;
      dragon.velocity.y = -ENEMY_BOUNCE.vertical;
      dragon.grounded = false;
      dragon.position.x += direction * ENEMY_BOUNCE.separation;
      this.wasGrounded.set(dragon, false);
      this.enemyCooldown.set(dragon, ENEMY_BOUNCE.cooldown);

      // Nudge the shy enemy the other way a little
      enemy.body.velocity.x = -direction * 40;
      enemy.body.position.x -= direction * ENEMY_BOUNCE.separation;

      return { bounced: true, enemy, direction };
    }

    return { bounced: false, enemy: null, direction: 1 };
  }

  /** One-off solid resolve (walls, one-way tests, etc.). */
  resolveSolid(body: PhysicsBody, solid: Rect): CollisionResult {
    return resolveAabb(body, solid);
  }

  reset(body?: PhysicsBody): void {
    if (body) {
      this.wasGrounded.delete(body);
      this.enemyCooldown.delete(body);
      return;
    }
    this.wasGrounded = new WeakMap();
    this.enemyCooldown = new WeakMap();
  }
}

function centerOf(body: PhysicsBody): Vector2 {
  return {
    x: body.position.x + body.size.width / 2,
    y: body.position.y + body.size.height / 2,
  };
}
