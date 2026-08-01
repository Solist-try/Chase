import type { LevelConfig } from './types';

/** Meadow start — learn to walk, talk to Pip, collect stars. */
export const level1: LevelConfig = {
  id: 'meadow-1',
  name: 'Sunny Meadow',
  goal: 'Collect 3 stars and say hi to Pip!',
  width: 1280,
  height: 720,
  background: '#8fd3e8',
  groundColor: '#6fbf73',
  spawn: { x: 80, y: 620 },
  solids: [
    { rect: { x: 0, y: 0, width: 1280, height: 40 }, color: '#5aae61' },
    { rect: { x: 0, y: 680, width: 1280, height: 40 }, color: '#5aae61' },
    { rect: { x: 0, y: 0, width: 40, height: 720 }, color: '#5aae61' },
    { rect: { x: 1240, y: 0, width: 40, height: 720 }, color: '#5aae61' },
    { rect: { x: 260, y: 220, width: 120, height: 40 }, color: '#7bc47f' },
    { rect: { x: 520, y: 400, width: 160, height: 40 }, color: '#7bc47f' },
    { rect: { x: 820, y: 180, width: 140, height: 40 }, color: '#7bc47f' },
    { rect: { x: 960, y: 480, width: 100, height: 100 }, color: '#8d6e4a' },
  ],
  collectibles: [
    { id: 'star-1', position: { x: 300, y: 160 }, kind: 'star' },
    { id: 'star-2', position: { x: 580, y: 340 }, kind: 'star' },
    { id: 'star-3', position: { x: 870, y: 120 }, kind: 'star' },
    { id: 'heart-1', position: { x: 1000, y: 420 }, kind: 'heart' },
  ],
  npcs: [
    {
      id: 'pip',
      name: 'Pip',
      role: 'guide',
      position: { x: 420, y: 500 },
      color: '#5b8def',
      dialogue: [
        {
          speaker: 'Pip',
          text: 'Hi Ember! Arrows or WASD to run, Space to jump!',
        },
        {
          speaker: 'Pip',
          text: 'Hold Shift for a short dash — then grab those shiny stars!',
        },
      ],
      patrol: { minX: 380, maxX: 560, speed: 50 },
    },
  ],
  assets: {
    backgroundImage: 'assets/backgrounds/meadow.svg',
    music: 'assets/sounds/meadow-theme.wav',
  },
};
