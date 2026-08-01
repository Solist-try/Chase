import { AIR_CONTROL } from './physics';
import type { Direction, InputState, PhysicsBody } from './types';

export interface MoveConfig {
  speed: number;
  jumpForce: number;
  /** When true, character can move freely in 4 directions (top-down). */
  topDown?: boolean;
}

const DEFAULT_CONFIG: MoveConfig = {
  speed: 220,
  jumpForce: 520,
  topDown: true,
};

/** Apply kid-friendly keyboard movement to a physics body. */
export function applyMovement(
  body: PhysicsBody,
  input: InputState,
  config: Partial<MoveConfig> = {},
): Direction {
  const { speed, jumpForce, topDown } = { ...DEFAULT_CONFIG, ...config };
  let direction: Direction = 'none';

  if (topDown) {
    let vx = 0;
    let vy = 0;
    if (input.left) {
      vx -= 1;
      direction = 'left';
    }
    if (input.right) {
      vx += 1;
      direction = 'right';
    }
    if (input.up) {
      vy -= 1;
      direction = direction === 'none' ? 'up' : direction;
    }
    if (input.down) {
      vy += 1;
      direction = direction === 'none' ? 'down' : direction;
    }

    if (vx !== 0 && vy !== 0) {
      const inv = 1 / Math.SQRT2;
      vx *= inv;
      vy *= inv;
    }

    body.velocity.x = vx * speed;
    body.velocity.y = vy * speed;
    return direction;
  }

  // Side-scrolling / platformer movement
  const control = body.grounded ? 1 : AIR_CONTROL;
  let vx = 0;
  if (input.left) {
    vx -= 1;
    direction = 'left';
  }
  if (input.right) {
    vx += 1;
    direction = 'right';
  }
  body.velocity.x = vx * speed * control;

  if (input.up && body.grounded) {
    body.velocity.y = -jumpForce;
    body.grounded = false;
  }

  return direction;
}

export function facingFromVelocity(vx: number, vy: number, fallback: Direction): Direction {
  if (Math.abs(vx) > Math.abs(vy)) {
    if (vx > 0) return 'right';
    if (vx < 0) return 'left';
  } else {
    if (vy > 0) return 'down';
    if (vy < 0) return 'up';
  }
  return fallback;
}
