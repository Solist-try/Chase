import { Level1 } from './Level1';
import { Level2 } from './Level2';
import { Level3 } from './Level3';
import { Level } from './Level';
import type { LevelConfig } from './types';

const LEVELS: Record<string, LevelConfig> = {
  [Level1.id]: Level1,
  [Level2.id]: Level2,
  [Level3.id]: Level3,
};

export const LEVEL_ORDER = [Level1.id, Level2.id, Level3.id] as const;

export function listLevels(): LevelConfig[] {
  return LEVEL_ORDER.map((id) => LEVELS[id]);
}

export function getLevelConfig(id: string): LevelConfig {
  const config = LEVELS[id];
  if (!config) {
    throw new Error(`Unknown level id: ${id}`);
  }
  return config;
}

export function loadLevel(id: string): Level {
  return new Level(getLevelConfig(id));
}

export function getNextLevelId(currentId: string): string | null {
  const index = LEVEL_ORDER.indexOf(currentId as (typeof LEVEL_ORDER)[number]);
  if (index < 0 || index >= LEVEL_ORDER.length - 1) return null;
  return LEVEL_ORDER[index + 1];
}
