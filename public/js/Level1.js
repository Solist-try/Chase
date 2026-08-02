// ---------------------------------------------------------
// Dragon Adventure – Level 1
// Bright, simple, kid-friendly level layout
// ---------------------------------------------------------

export class Level1 {
  constructor(canvas) {
    this.name = 'Level 1';

    // Background color (rainbow-friendly)
    // Canvas draws this as a vertical gradient using the hex colors.
    this.background = 'linear-gradient(to bottom, #ff9a9e, #fad0c4)';

    // Platforms (simple rectangles)
    // You can add more later
    this.platforms = [
      {
        x: 0,
        y: canvas.height - 40,
        width: canvas.width,
        height: 40,
        color: '#ffd166',
      }, // ground
      {
        x: 80,
        y: canvas.height - 120,
        width: 120,
        height: 20,
        color: '#00bbf9',
      },
      {
        x: 260,
        y: canvas.height - 200,
        width: 140,
        height: 20,
        color: '#9b5de5',
      },
      {
        x: 450,
        y: canvas.height - 160,
        width: 100,
        height: 20,
        color: '#ff4d6d',
      },
    ];

    // Collectibles (stars or gems)
    this.collectibles = [
      { x: 100, y: canvas.height - 150 },
      { x: 300, y: canvas.height - 230 },
      { x: 480, y: canvas.height - 190 },
    ];

    // Where the dragon begins (standing on the ground)
    this.startX = 40;
    this.startY = canvas.height - 80;
  }
}

export default Level1;
