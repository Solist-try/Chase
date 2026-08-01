import type { LevelConfig } from './types';

/** Forest path — more space, a second NPC, more stars. */
export const level2: LevelConfig = {
  id: 'forest-2',
  name: 'Whispering Woods',
  goal: 'Find 5 stars and meet Oakley the owl.',
  width: 1600,
  height: 900,
  background: '#6bb8a8',
  groundColor: '#4f9a57',
  spawn: { x: 100, y: 790 },
  solids: [
    { rect: { x: 0, y: 0, width: 1600, height: 48 }, color: '#3f7f46' },
    { rect: { x: 0, y: 852, width: 1600, height: 48 }, color: '#3f7f46' },
    { rect: { x: 0, y: 0, width: 48, height: 900 }, color: '#3f7f46' },
    { rect: { x: 1552, y: 0, width: 48, height: 900 }, color: '#3f7f46' },
    { rect: { x: 220, y: 280, width: 80, height: 200 }, color: '#3d6b45' },
    { rect: { x: 480, y: 500, width: 200, height: 48 }, color: '#6fbf73' },
    { rect: { x: 780, y: 220, width: 160, height: 48 }, color: '#6fbf73' },
    { rect: { x: 1100, y: 420, width: 120, height: 180 }, color: '#3d6b45' },
    { rect: { x: 1320, y: 600, width: 160, height: 48 }, color: '#6fbf73' },
  ],
  collectibles: [
    { id: 'star-1', position: { x: 250, y: 200 }, kind: 'star' },
    { id: 'star-2', position: { x: 540, y: 440 }, kind: 'star' },
    { id: 'star-3', position: { x: 840, y: 160 }, kind: 'star' },
    { id: 'star-4', position: { x: 1160, y: 340 }, kind: 'star' },
    { id: 'star-5', position: { x: 1380, y: 540 }, kind: 'star' },
    { id: 'heart-1', position: { x: 700, y: 700 }, kind: 'heart' },
  ],
  npcs: [
    {
      id: 'oakley',
      name: 'Oakley',
      role: 'owl',
      position: { x: 900, y: 640 },
      color: '#c4a35a',
      dialogue: [
        {
          speaker: 'Oakley',
          text: 'Hoo! The woods are friendly if you stay on the path.',
        },
        {
          speaker: 'Oakley',
          text: 'Collect every star and you unlock a secret clearing!',
        },
      ],
      patrol: { minX: 860, maxX: 1040, speed: 40 },
    },
    {
      id: 'pip',
      name: 'Pip',
      role: 'guide',
      position: { x: 160, y: 620 },
      color: '#5b8def',
      dialogue: [
        {
          speaker: 'Pip',
          text: 'I came along! Press E near friends to talk.',
        },
      ],
    },
  ],
  assets: {
    backgroundImage: 'assets/backgrounds/forest.svg',
    music: 'assets/sounds/forest-theme.wav',
  },
};
