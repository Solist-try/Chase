import { BaseEnemy } from './BaseEnemy.js';

const SNAKE_SRC = 'assets/snake-walker-sprite.png';

let snakeSprite = null;
let snakeSpriteLoading = null;

function loadSnakeSprite() {
  if (snakeSprite?.complete && snakeSprite.naturalWidth > 0) {
    return Promise.resolve(snakeSprite);
  }
  if (snakeSpriteLoading) return snakeSpriteLoading;

  snakeSpriteLoading = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      snakeSprite = img;
      resolve(img);
    };
    img.onerror = () => {
      console.warn('Snake walker sprite failed to load — using drawn fallback');
      snakeSprite = null;
      resolve(null);
    };
    img.src = SNAKE_SRC;
  });

  return snakeSpriteLoading;
}

loadSnakeSprite();

export class WalkerEnemy extends BaseEnemy {
  constructor(x, y) {
    super(x, y, 'rgb(40, 200, 190)');
    this.width = 52;
    this.height = 44;
    this.speed = 1.2;
    this.direction = 1; // 1 = right, -1 = left
    this.wobble = 0;

    this.sprite = snakeSprite;
    loadSnakeSprite().then((img) => {
      this.sprite = img;
    });
  }

  update(delta = 16) {
    this.x += this.speed * this.direction;
    this.wobble += delta * 0.01;

    // Turn around at the edges of the level
    if (this.x < 20) this.direction = 1;
    if (this.x + this.width > 620) this.direction = -1;
  }

  draw(ctx) {
    const bob = Math.sin(this.wobble) * 1.5;
    const drawW = this.width * 1.2;
    const drawH = this.height * 1.25;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2 + bob;

    if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
      ctx.save();
      ctx.translate(cx, cy);
      // Sprite art faces right; flip when walking left
      ctx.scale(this.direction, 1);
      ctx.drawImage(this.sprite, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
      return;
    }

    this.#drawFallback(ctx, cx, cy, drawW, drawH);
  }

  #drawFallback(ctx, cx, cy, w, h) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(this.direction, 1);

    // Soft ground shadow
    ctx.fillStyle = 'rgba(60, 140, 70, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, h * 0.42, w * 0.38, h * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Coiled body (teal)
    ctx.fillStyle = '#2ec4b6';
    ctx.strokeStyle = '#1b2a4a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(4, 6, w * 0.28, h * 0.22, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Belly hint
    ctx.fillStyle = '#f4a261';
    ctx.beginPath();
    ctx.ellipse(8, 10, w * 0.12, h * 0.14, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#2ec4b6';
    ctx.beginPath();
    ctx.ellipse(w * 0.18, -h * 0.08, w * 0.22, h * 0.22, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Spikes
    ctx.fillStyle = '#2b1b4a';
    for (let i = 0; i < 3; i++) {
      const sx = w * 0.02 + i * 6;
      const sy = -h * 0.28 - i * 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy + 10);
      ctx.lineTo(sx + 4, sy);
      ctx.lineTo(sx + 8, sy + 10);
      ctx.closePath();
      ctx.fill();
    }

    // Eye
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.arc(w * 0.24, -h * 0.1, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b2a4a';
    ctx.beginPath();
    ctx.arc(w * 0.25, -h * 0.1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(w * 0.26, -h * 0.12, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Tongue
    ctx.strokeStyle = '#ff6b8a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.36, -h * 0.02);
    ctx.lineTo(w * 0.44, 0);
    ctx.moveTo(w * 0.44, 0);
    ctx.lineTo(w * 0.48, -3);
    ctx.moveTo(w * 0.44, 0);
    ctx.lineTo(w * 0.48, 3);
    ctx.stroke();

    ctx.restore();
  }
}

export default WalkerEnemy;
