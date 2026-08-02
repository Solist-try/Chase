// ---------------------------------------------------------
// Dragon Adventure – Enemy Character
// Cute, slow-moving, non-scary enemy logic
// ---------------------------------------------------------

export class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.width = 35;
    this.height = 35;

    this.speed = 1.2; // slow, kid-friendly
    this.direction = 1; // 1 = right, -1 = left

    this.color = 'rgb(255, 180, 80)'; // friendly orange creature
  }

  update() {
    // Simple left-right patrol
    this.x += this.speed * this.direction;

    // Reverse direction at edges
    if (this.x < 20) this.direction = 1;
    if (this.x > 580) this.direction = -1;
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

export default Enemy;
