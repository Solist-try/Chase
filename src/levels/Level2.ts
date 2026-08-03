import type { LevelConfig } from './types';
import { makeBounds } from './types';

/**
 * Level 2 — Sky Parade
 * Find your friend Oakley under the big tree.
 */
export const Level2: LevelConfig = {
  id: 'level-2',
  name: 'Sky Parade',
  theme: 'sky',
  goal: {
    type: 'find_friend',
    description: 'Find Oakley waiting by the rainbow tree!',
    friendId: 'oakley',
    marker: {
      kind: 'tree',
      position: { x: 1380, y: 700 },
      radius: 90,
    },
  },
  width: 1600,
  height: 900,
  spawn: { x: 100, y: 790 },
  platforms: [
    ...makeBounds(1600, 900, 48),
    {
      id: 'p1',
      kind: 'platform',
      rect: { x: 280, y: 700, width: 160, height: 28 },
    },
    {
      id: 'p2',
      kind: 'platform',
      rect: { x: 520, y: 580, width: 180, height: 28 },
    },
    {
      id: 'p3',
      kind: 'cloud',
      rect: { x: 820, y: 460, width: 160, height: 28 },
    },
    {
      id: 'p4',
      kind: 'platform',
      rect: { x: 1100, y: 600, width: 140, height: 28 },
    },
    {
      id: 'p5',
      kind: 'bridge',
      rect: { x: 1280, y: 720, width: 200, height: 28 },
    },
  ],
  enemies: [
    {
      id: 'bumble-1',
      kind: 'bumble',
      position: { x: 500, y: 820 },
      patrol: { minX: 420, maxX: 640, speed: 32 },
    },
    {
      id: 'blob-1',
      kind: 'blob',
      position: { x: 960, y: 820 },
      patrol: { minX: 900, maxX: 1100, speed: 26 },
    },
  ],
  collectibles: [
    { id: 'coin-1', position: { x: 320, y: 640 }, kind: 'gem' },
    { id: 'coin-2', position: { x: 560, y: 520 }, kind: 'gem' },
    { id: 'coin-3', position: { x: 860, y: 400 }, kind: 'gem' },
    { id: 'star-1', position: { x: 1140, y: 540 }, kind: 'star' },
    { id: 'star-2', position: { x: 1340, y: 660 }, kind: 'star' },
    { id: 'heart-1', position: { x: 700, y: 800 }, kind: 'heart' },
  ],
  npcs: [
    {
      id: 'pip',
      name: 'Pip',
      role: 'guide',
      position: { x: 180, y: 808 },
      color: '#5b8def',
      dialogue: [
        {
          speaker: 'Pip',
          text: 'Oakley is by the tall tree at the end — you can do it!',
        },
      ],
    },
    {
      id: 'oakley',
      name: 'Oakley',
      role: 'owl',
      position: { x: 1360, y: 676 },
      color: '#c4a35a',
      dialogue: [
        {
          speaker: 'Oakley',
          text: 'Hoo-ray! You found me. The sky looks great on you!',
        },
        {
          speaker: 'Oakley',
          text: 'Rest here, then press N when you are ready for candy clouds.',
        },
      ],
    },
  ],
  assets: {
    backgroundImage: 'assets/backgrounds/forest.svg',
    music: 'assets/sounds/forest-theme.wav',
  },
};

/** @deprecated Alias for older imports */
export const level2 = Level2;
