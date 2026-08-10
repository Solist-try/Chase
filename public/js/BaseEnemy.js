// ---------------------------------------------------------
// Dragon Adventure – Base Enemy Class
// Shared logic for all enemy types
// ---------------------------------------------------------

export class BaseEnemy {
  constructor(x, y, color = 'orange') {
    this.x = x;
    this.y = y;

    this.width = 35;
    this.height = 35;

    this.color = color;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Cute eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 8, this.y + 8, 8, 8);
    ctx.fillRect(this.x + 20, this.y + 8, 8, 8);

    ctx.fillStyle = 'black';
    ctx.fillRect(this.x + 11, this.y + 11, 4, 4);
    ctx.fillRect(this.x + 23, this.y + 11, 4, 4);
  }
}

export default BaseEnemy;
