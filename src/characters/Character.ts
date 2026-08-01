import { bodyToRect, distance } from '@engine/collisions';
import { applyMovement, facingFromVelocity, type MoveConfig } from '@engine/movement';
import { createBody, integrate } from '@engine/physics';
import type {
  Direction,
  InputState,
  PhysicsBody,
  Rect,
  Vector2,
} from '@engine/types';
import type { Renderer } from '@engine/Renderer';

export interface CharacterOptions {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  move?: Partial<MoveConfig>;
}

/** Base entity for the player dragon and friendly NPCs. */
export abstract class Character {
  readonly id: string;
  readonly name: string;
  readonly body: PhysicsBody;
  readonly color: string;
  facing: Direction = 'down';
  protected moveConfig: Partial<MoveConfig>;
  protected animTime = 0;

  constructor(options: CharacterOptions) {
    this.id = options.id;
    this.name = options.name;
    this.color = options.color;
    this.moveConfig = options.move ?? {};
    this.body = createBody(
      options.x,
      options.y,
      options.width,
      options.height,
      true,
    );
  }

  get center(): Vector2 {
    return {
      x: this.body.position.x + this.body.size.width / 2,
      y: this.body.position.y + this.body.size.height / 2,
    };
  }

  get bounds(): Rect {
    return bodyToRect(this.body);
  }

  isNear(other: Character, range: number): boolean {
    return distance(this.center, other.center) <= range;
  }

  update(dt: number, input?: InputState, solids: Rect[] = []): void {
    this.animTime += dt;
    if (input) {
      const dir = applyMovement(this.body, input, this.moveConfig);
      if (dir !== 'none') {
        this.facing = dir;
      } else {
        this.facing = facingFromVelocity(
          this.body.velocity.x,
          this.body.velocity.y,
          this.facing,
        );
      }
    }
    integrate(this.body, dt);
    this.afterIntegrate(solids);
  }

  protected afterIntegrate(_solids: Rect[]): void {
    // Subclasses resolve collisions here.
  }

  abstract draw(renderer: Renderer): void;
}
