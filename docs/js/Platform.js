/**
 * Solid platform the dragon can stand on.
 */

export class Platform {
  /**
   * @param {object} options
   * @param {number} options.x
   * @param {number} options.y
   * @param {number} options.width
   * @param {number} options.height
   * @param {string} [options.color]
   * @param {string} [options.topColor]
   */
  constructor(options = {}) {
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.width = options.width ?? 120;
    this.height = options.height ?? 28;
    this.color = options.color ?? '#ff8c42';
    this.topColor = options.topColor ?? '#ffe566';
  }

  get left() {
    return this.x;
  }

  get right() {
    return this.x + this.width;
  }

  get top() {
    return this.y;
  }

  get bottom() {
    return this.y + this.height;
  }

  /**
   * Draw a rounded (or plain) rectangle path.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {number} r
   */
  roundPath(ctx, x, y, w, h, r) {
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
      return;
    }
    ctx.rect(x, y, w, h);
  }

  /**
   * Draw the platform.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    // Soft shadow
    ctx.fillStyle = 'rgba(27, 42, 74, 0.12)';
    ctx.fillRect(this.x + 4, this.y + 6, this.width, this.height);

    // Body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    this.roundPath(ctx, this.x, this.y, this.width, this.height, 10);
    ctx.fill();

    // Bright top lip
    ctx.fillStyle = this.topColor;
    ctx.beginPath();
    this.roundPath(ctx, this.x + 4, this.y + 3, this.width - 8, 8, 6);
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#1b2a4a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    this.roundPath(ctx, this.x, this.y, this.width, this.height, 10);
    ctx.stroke();
  }
}

export default Platform;
