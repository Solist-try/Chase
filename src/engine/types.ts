/** Shared geometry and entity types for the canvas game engine. */

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
  pause: boolean;
}

export interface PhysicsBody {
  position: Vector2;
  velocity: Vector2;
  size: Size;
  grounded: boolean;
  solid: boolean;
}

export type CollisionSide = 'top' | 'bottom' | 'left' | 'right';

export interface CollisionResult {
  collided: boolean;
  side?: CollisionSide;
  overlap?: Vector2;
}
