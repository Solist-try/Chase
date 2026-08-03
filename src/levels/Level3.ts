import type { LevelConfig } from './types';
import { makeBounds } from './types';

/**
 * Level 3 — Cotton Candy Cliffs
 * Gather shiny coins, then reach the celebration tree.
 */
export const Level3: LevelConfig = {
  id: 'level-3',
  name: 'Cotton Candy Cliffs',
  theme: 'cotton',
  goal: {
    type: 'reach_tree',
    description: 'Collect 5 rainbow gems, then reach the candy tree!',
    collectCount: 5,
    marker: {
      kind: 'tree',
      position: { x: 1680, y: 620 },
      radius: 80,
    },
  },
  width: 1920,
  height: 900,
  spawn: { x: 90, y: 780 },
  platforms: [
    ...makeBounds(1920, 900, 48),
    {
      id: 'p1',
      kind: 'platform',
      rect: { x: 240, y: 700, width: 140, height: 28 },
    },
    {
      id: 'p2',
      kind: 'cloud',
      rect: { x: 460, y: 580, width: 150, height: 28 },
    },
    {
      id: 'p3',
      kind: 'platform',
      rect: { x: 700, y: 480, width: 160, height: 28 },
    },
    {
      id: 'p4',
      kind: 'cloud',
      rect: { x: 980, y: 600, width: 140, height: 28 },
    },
    {
      id: 'p5',
      kind: 'platform',
      rect: { x: 1220, y: 500, width: 160, height: 28 },
    },
    {
      id: 'p6',
      kind: 'bridge',
      rect: { x: 1480, y: 640, width: 180, height: 28 },
    },
    {
      id: 'p7',
      kind: 'platform',
      rect: { x: 1700, y: 720, width: 140, height: 28 },
    },
  ],
  enemies: [
    {
      id: 'sprout-1',
      kind: 'sprout',
      position: { x: 560, y: 820 },
      patrol: { minX: 500, maxX: 680, speed: 24 },
    },
    {
      id: 'bumble-1',
      kind: 'bumble',
      position: { x: 1050, y: 820 },
      patrol: { minX: 980, maxX: 1180, speed: 30 },
    },
    {
      id: 'blob-1',
      kind: 'blob',
      position: { x: 1500, y: 820 },
      patrol: { minX: 1440, maxX: 1600, speed: 26 },
    },
  ],
  collectibles: [
    { id: 'coin-1', position: { x: 280, y: 640 }, kind: 'gem' },
    { id: 'coin-2', position: { x: 500, y: 520 }, kind: 'gem' },
    { id: 'coin-3', position: { x: 740, y: 420 }, kind: 'gem' },
    { id: 'coin-4', position: { x: 1020, y: 540 }, kind: 'gem' },
    { id: 'coin-5', position: { x: 1260, y: 440 }, kind: 'gem' },
    { id: 'star-1', position: { x: 1520, y: 580 }, kind: 'star' },
    { id: 'heart-1', position: { x: 880, y: 800 }, kind: 'heart' },
  ],
  npcs: [
    {
      id: 'pip',
      name: 'Pip',
      role: 'guide',
      position: { x: 160, y: 808 },
      color: '#5b8def',
      dialogue: [
        {
          speaker: 'Pip',
          text: 'Rainbow gems first — then race to the sparkly tree!',
        },
      ],
    },
  ],
  assets: {
    backgroundImage: 'assets/backgrounds/menu.svg',
    music: 'assets/sounds/meadow-theme.wav',
  },
};

/** @deprecated Alias for older imports */
export const level3 = Level3;
