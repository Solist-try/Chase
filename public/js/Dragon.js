// ---------------------------------------------------------
// Dragon Adventure – Dragon Character
// Simple, readable, rainbow-friendly logic
// ---------------------------------------------------------

export class Dragon {
  constructor(startX, startY) {
    // Position
    this.x = startX;
    this.y = startY;

    // Size (friendly, visible)
    this.width = 40;
    this.height = 40;

    // Movement
    this.speed = 3; // gentle speed for kids
    this.velocityY = 0;

    // State
    this.onGround = false;

    // Appearance
    this.color = 'rgb(255, 100, 200)'; // cute pinkish dragon (can be changed)

    // Animation placeholder
    this.frame = 0;
    this.frameTimer = 0;
  }

  updateAnimation(delta) {
    // Simple frame switcher (placeholder)
    this.frameTimer += delta;
    if (this.frameTimer > 150) {
      this.frame = (this.frame + 1) % 2; // two-frame animation
      this.frameTimer = 0;
    }
  }

  draw(ctx) {
    // Tiny bob when the animation frame flips
    const bob = this.frame === 0 ? 0 : 2;

    // Simple rectangle dragon (replace with sprite later)
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y + bob, this.width, this.height);

    // Cute eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 8, this.y + 10 + bob, 8, 8);
    ctx.fillRect(this.x + 24, this.y + 10 + bob, 8, 8);

    ctx.fillStyle = 'black';
    ctx.fillRect(this.x + 11, this.y + 13 + bob, 4, 4);
    ctx.fillRect(this.x + 27, this.y + 13 + bob, 4, 4);

    // Tiny smile
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.arc(this.x + 20, this.y + 25 + bob, 8, 0, Math.PI);
    ctx.stroke();
  }
}

export default Dragon;
