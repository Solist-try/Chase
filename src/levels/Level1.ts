import type { LevelConfig } from './types';
import { makeBounds } from './types';

/**
 * Level 1 — Lime Meadow
 * Learn to run & jump, collect stars, say hi to Pip.
 */
export const Level1: LevelConfig = {
  id: 'level-1',
  name: 'Lime Meadow',
  theme: 'lime',
  goal: {
    type: 'collect_stars',
    description: 'Collect 3 stars and say hi to Pip!',
    collectCount: 3,
    friendId: 'pip',
  },
  width: 1280,
  height: 720,
  spawn: { x: 80, y: 620 },
  platforms: [
    ...makeBounds(1280, 720, 40),
    {
      id: 'p1',
      kind: 'platform',
      rect: { x: 260, y: 520, width: 140, height: 28 },
    },
    {
      id: 'p2',
      kind: 'platform',
      rect: { x: 480, y: 420, width: 160, height: 28 },
    },
    {
      id: 'p3',
      kind: 'platform',
      rect: { x: 740, y: 320, width: 140, height: 28 },
    },
    {
      id: 'p4',
      kind: 'cloud',
      rect: { x: 980, y: 480, width: 120, height: 28 },
    },
  ],
  enemies: [
    {
      id: 'blob-1',
      kind: 'blob',
      position: { x: 600, y: 648 },
      patrol: { minX: 560, maxX: 720, speed: 28 },
    },
  ],
  collectibles: [
    { id: 'star-1', position: { x: 300, y: 460 }, kind: 'star' },
    { id: 'star-2', position: { x: 530, y: 360 }, kind: 'star' },
    { id: 'star-3', position: { x: 780, y: 260 }, kind: 'star' },
    { id: 'coin-1', position: { x: 400, y: 620 }, kind: 'coin' },
    { id: 'coin-2', position: { x: 900, y: 620 }, kind: 'coin' },
    { id: 'heart-1', position: { x: 1020, y: 420 }, kind: 'heart' },
  ],
  npcs: [
    {
      id: 'pip',
      name: 'Pip',
      role: 'guide',
      position: { x: 420, y: 636 },
      color: '#5b8def',
      dialogue: [
        {
          speaker: 'Pip',
          text: 'Hi Ember! Arrows or WASD to run, Space to jump!',
        },
        {
          speaker: 'Pip',
          text: 'Those green blobs are just shy — a soft bump is all!',
        },
      ],
      patrol: { minX: 380, maxX: 520, speed: 40 },
    },
  ],
  assets: {
    backgroundImage: 'assets/backgrounds/meadow.svg',
    music: 'assets/sounds/meadow-theme.wav',
  },
};

/** @deprecated Alias for older imports */
export const level1 = Level1;
