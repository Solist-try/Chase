/**
 * Level 1 — sunny meadow with colorful platforms.
 */

import { Platform } from '../Platform.js';

export const Level1 = {
  name: 'Level 1',
  backgroundColor: '#7ec8ff',
  groundColor: '#5ecf6e',
  groundTopColor: '#f4d35e',
  hillColor: '#7adf8a',
  groundY: 468,

  /** Where the dragon starts (stands on the meadow floor). */
  startPosition: {
    x: 140,
    y: 436,
  },

  /** Platforms the dragon can stand on. */
  platforms: [
    new Platform({ x: 220, y: 390, width: 160, height: 28 }),
    new Platform({
      x: 430,
      y: 310,
      width: 150,
      height: 28,
      color: '#00bbf9',
      topColor: '#b8f0ff',
    }),
    new Platform({
      x: 650,
      y: 250,
      width: 170,
      height: 28,
      color: '#9b5de5',
      topColor: '#e0b0ff',
    }),
    new Platform({
      x: 780,
      y: 400,
      width: 120,
      height: 28,
      color: '#ff4d6d',
      topColor: '#ffb3c1',
    }),
  ],
};

export default Level1;
