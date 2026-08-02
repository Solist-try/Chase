/**
 * Player dragon — simple position, size, and jump state.
 */

export class Dragon {
  /**
   * @param {object} [options]
   * @param {number} [options.x]
   * @param {number} [options.y]
   * @param {string} [options.color]
   */
  constructor(options = {}) {
    this.x = options.x ?? 120;
    this.y = options.y ?? 400;

    this.width = options.width ?? 48;
    this.height = options.height ?? 48;

    this.velocityY = 0;
    this.speed = options.speed ?? 5; // pixels per frame
    this.onGround = false;

    this.color = options.color ?? '#2bb673';
  }
}

export default Dragon;
