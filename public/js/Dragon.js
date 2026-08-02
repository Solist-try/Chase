/**
 * Player dragon — position, velocity, physics, and drawing.
 */

export class Dragon {
  /**
   * @param {object} [options]
   * @param {number} [options.x]
   * @param {number} [options.y]
   * @param {number} [options.groundY]
   * @param {string} [options.color]
   */
  constructor(options = {}) {
    // Position
    this.x = options.x ?? 120;
    this.y = options.y ?? 360;

    // Velocity
    this.vx = 0;
    this.vy = 0;

    // Movement / physics
    this.speed = 260;
    this.jumpForce = 520;
    this.gravity = 1400;

    // Animation + facing
    this.facing = 1;
    this.animTime = 0;
    this.wingFlap = 0;
    this.onGround = true;

    // Size + world bounds
    this.radius = 36;
    this.groundY = options.groundY ?? 468;
    this.color = options.color ?? '#2bb673';
    this.wingColor = '#ff6b6b';
  }

  /**
   * Apply keyboard input to velocity.
   * @param {{ left?: boolean, right?: boolean, jump?: boolean }} input
   */
  handleInput(input = {}) {
    this.vx = 0;

    if (input.left) {
      this.vx = -this.speed;
      this.facing = -1;
    }
    if (input.right) {
      this.vx = this.speed;
      this.facing = 1;
    }

    if (input.jump && this.onGround) {
      this.vy = -this.jumpForce;
      this.onGround = false;
    }
  }

  /**
   * Apply physics for one frame.
   * @param {number} dt - Seconds since last frame
   * @param {{ width?: number, groundY?: number }} [world]
   */
  update(dt, world = {}) {
    const groundY = world.groundY ?? this.groundY;
    const width = world.width ?? 960;

    // Gravity
    this.vy += this.gravity * dt;

    // Integrate position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Floor collision
    const floorY = groundY - this.radius * 0.9;
    if (this.y >= floorY) {
      this.y = floorY;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // Keep the dragon on screen
    const margin = this.radius + 8;
    if (this.x < margin) this.x = margin;
    if (this.x > width - margin) this.x = width - margin;

    // Animations
    this.animTime += dt;
    const moving = Math.abs(this.vx) > 1;
    const flapSpeed = this.onGround ? (moving ? 10 : 4) : 14;
    this.wingFlap = Math.sin(this.animTime * flapSpeed);
  }

  /**
   * Draw the dragon.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const bob = this.onGround ? Math.sin(this.animTime * 6) * 2 : 0;
    const wingLift = -28 + this.wingFlap * (this.onGround ? 10 : 18);

    ctx.save();
    ctx.translate(this.x, this.y + bob);
    ctx.scale(this.facing, 1);

    // Wing
    ctx.fillStyle = this.wingColor;
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.quadraticCurveTo(-42, wingLift, -2, -30);
    ctx.closePath();
    ctx.fill();

    // Body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 1.15, this.radius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(this.radius * 0.85, -12, 22, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.beginPath();
    ctx.ellipse(this.radius * 1.25, -6, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = '#fff6b0';
    ctx.beginPath();
    ctx.ellipse(4, 10, this.radius * 0.55, this.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.radius * 0.95, -16, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b2a4a';
    ctx.beginPath();
    ctx.arc(this.radius * 0.98, -16, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Little feet
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(-14, this.radius * 0.7, 10, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(16, this.radius * 0.7, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export default Dragon;
