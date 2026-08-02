/**
 * Level 1 — sunny meadow with colorful platforms.
 */

export const Level1 = {
  name: 'Level 1',

  /** Background fill color used by GameEngine.render() */
  background: '#7ec8ff',
  groundColor: '#5ecf6e',

  /** Where the dragon starts. */
  startPosition: {
    x: 120,
    y: 420,
  },

  /** Platforms the dragon can stand on. */
  platforms: [
    { x: 220, y: 390, width: 160, height: 28, color: '#ff9f1c' },
    { x: 430, y: 310, width: 150, height: 28, color: '#00bbf9' },
    { x: 650, y: 250, width: 170, height: 28, color: '#9b5de5' },
    { x: 780, y: 400, width: 120, height: 28, color: '#ff4d6d' },
  ],

  /** Shiny stars / coins to draw. */
  collectibles: [
    { x: 280, y: 340 },
    { x: 490, y: 260 },
    { x: 720, y: 200 },
    { x: 840, y: 350 },
    { x: 160, y: 450 },
  ],
};

export default Level1;
