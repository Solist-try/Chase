import { BaseEnemy } from './BaseEnemy.js';

const FROG_SRC = 'assets/frog-hopper-sprite.png';

let frogSprite = null;
let frogSpriteLoading = null;

function loadFrogSprite() {
  if (frogSprite?.complete && frogSprite.naturalWidth > 0) {
    return Promise.resolve(frogSprite);
  }
  if (frogSpriteLoading) return frogSpriteLoading;

  frogSpriteLoading = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      frogSprite = img;
      resolve(img);
    };
    img.onerror = () => {
      console.warn('Frog hopper sprite failed to load — using drawn fallback');
      frogSprite = null;
      resolve(null);
    };
    img.src = FROG_SRC;
  });

  return frogSpriteLoading;
}

loadFrogSprite();

export class HopperEnemy extends BaseEnemy {
  constructor(x, y) {
    super(x, y, 'rgb(90, 190, 90)');
    this.width = 46;
    this.height = 46;
    this.baseY = y;
    this.timer = 0;
    this.squash = 1;

    this.sprite = frogSprite;
    loadFrogSprite().then((img) => {
      this.sprite = img;
    });
  }

  update(delta) {
    this.timer += delta;

    // Hop motion (sin wave)
    const hop = Math.sin(this.timer * 0.005);
    this.y = this.baseY + hop * 20;

    // Tiny squash/stretch so the jump feels springy
    this.squash = 1 + hop * 0.08;
  }

  draw(ctx) {
    const drawW = this.width * 1.2;
    const drawH = this.height * 1.2 * this.squash;
    const drawX = this.x + this.width / 2 - drawW / 2;
    // Keep feet roughly planted while the body stretches
    const drawY = this.y + this.height - drawH;

    if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
      ctx.drawImage(this.sprite, drawX, drawY, drawW, drawH);
      return;
    }

    this.#drawFallback(ctx, drawX, drawY, drawW, drawH);
  }

  #drawFallback(ctx, x, y, w, h) {
    ctx.save();
    ctx.strokeStyle = '#4a2040';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';

    // Body
    ctx.fillStyle = '#5cbc5c';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.55, w * 0.38, h * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Belly
    ctx.fillStyle = '#c8efb0';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.6, w * 0.18, h * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#5cbc5c';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.32, w * 0.36, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#3a1840';
    ctx.beginPath();
    ctx.arc(x + w * 0.34, y + h * 0.28, w * 0.1, 0, Math.PI * 2);
    ctx.arc(x + w * 0.66, y + h * 0.28, w * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + w * 0.37, y + h * 0.25, 2.2, 0, Math.PI * 2);
    ctx.arc(x + w * 0.69, y + h * 0.25, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Blush
    ctx.fillStyle = 'rgba(255, 140, 170, 0.7)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.24, y + h * 0.4, w * 0.06, h * 0.035, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.76, y + h * 0.4, w * 0.06, h * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#4a2040';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.42, w * 0.1, 0.15, Math.PI - 0.15);
    ctx.stroke();

    // Feet
    ctx.fillStyle = '#5cbc5c';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.28, y + h * 0.86, w * 0.14, h * 0.08, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.72, y + h * 0.86, w * 0.14, h * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

export default HopperEnemy;
