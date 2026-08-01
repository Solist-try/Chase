import type { Rect, Vector2 } from '@engine/types';
import type { DialogueLine } from '@characters/NPC';
import type { RainbowThemeId } from './themes';

/** Solid walkable surface in a level. */
export interface Platform {
  id?: string;
  rect: Rect;
  /** Overrides theme platform color when set. */
  color?: string;
  kind?: 'ground' | 'platform' | 'cloud' | 'bridge' | 'wall';
}

/** @deprecated Prefer {@link Platform} — kept for older solid-block naming. */
export type SolidBlock = Platform;

export type CollectibleKind = 'star' | 'coin' | 'heart';

export interface Collectible {
  id: string;
  position: Vector2;
  kind: CollectibleKind;
  collected?: boolean;
}

export interface NPCSpawn {
  id: string;
  name: string;
  role: string;
  position: Vector2;
  color: string;
  dialogue: DialogueLine[];
  patrol?: { minX: number; maxX: number; speed?: number };
}

/** Cute, slow, non-scary enemy kinds. */
export type EnemyKind = 'blob' | 'bumble' | 'sprout';

export interface EnemySpawn {
  id: string;
  kind: EnemyKind;
  position: Vector2;
  /** Soft candy colors — defaults per kind if omitted. */
  color?: string;
  patrol?: { minX: number; maxX: number; speed?: number };
}

/**
 * Friendly win condition — never “defeat the boss”, always something warm.
 */
export type GoalType =
  | 'collect_stars'
  | 'collect_coins'
  | 'reach_tree'
  | 'find_friend'
  | 'talk_to_friend';

export interface LevelGoal {
  type: GoalType;
  /** Kid-facing HUD sentence. */
  description: string;
  /** Stars / coins needed when type is collect_*. */
  collectCount?: number;
  /** Friend NPC id for find_friend / talk_to_friend. */
  friendId?: string;
  /** World marker for reach_tree (and similar). */
  marker?: {
    position: Vector2;
    kind: 'tree' | 'flag' | 'door';
    radius?: number;
  };
}

export interface LevelConfig {
  id: string;
  name: string;
  /** Rainbow color story for the stage. */
  theme: RainbowThemeId;
  goal: LevelGoal;
  width: number;
  height: number;
  spawn: Vector2;
  platforms: Platform[];
  enemies: EnemySpawn[];
  collectibles: Collectible[];
  npcs: NPCSpawn[];
  /** Optional path hints for art under src/assets. */
  assets?: {
    backgroundImage?: string;
    music?: string;
  };
}

/** Helper to build a floor + wall frame for templates. */
export function makeBounds(
  width: number,
  height: number,
  thickness = 40,
  color?: string,
): Platform[] {
  return [
    {
      id: 'ceiling',
      kind: 'wall',
      color,
      rect: { x: 0, y: 0, width, height: thickness },
    },
    {
      id: 'floor',
      kind: 'ground',
      color,
      rect: { x: 0, y: height - thickness, width, height: thickness },
    },
    {
      id: 'wall-left',
      kind: 'wall',
      color,
      rect: { x: 0, y: 0, width: thickness, height },
    },
    {
      id: 'wall-right',
      kind: 'wall',
      color,
      rect: { x: width - thickness, y: 0, width: thickness, height },
    },
  ];
}
