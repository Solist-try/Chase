import type { Rect, Vector2 } from '@engine/types';
import type { DialogueLine } from '@characters/NPC';

export interface SolidBlock {
  rect: Rect;
  color?: string;
}

export interface Collectible {
  id: string;
  position: Vector2;
  kind: 'star' | 'heart';
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

export interface LevelConfig {
  id: string;
  name: string;
  /** Short kid-friendly goal text shown in the HUD. */
  goal: string;
  width: number;
  height: number;
  background: string;
  groundColor: string;
  spawn: Vector2;
  solids: SolidBlock[];
  collectibles: Collectible[];
  npcs: NPCSpawn[];
  /** Optional path hints for art under src/assets or src/levels/assets. */
  assets?: {
    backgroundImage?: string;
    music?: string;
  };
}
