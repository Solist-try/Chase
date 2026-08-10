import { BaseEnemy } from './BaseEnemy.js';

const GHOST_SRC = 'assets/ghost-floater-sprite.png';

let ghostSprite = null;
let ghostSpriteLoading = null;

function loadGhostSprite() {
  if (ghostSprite?.complete && ghostSprite.naturalWidth > 0) {
    return Promise.resolve(ghostSprite);
  }
  if (ghostSpriteLoading) return ghostSpriteLoading;

  ghostSpriteLoading = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      ghostSprite = img;
      resolve(img);
    };
    img.onerror = () => {
      console.warn('Ghost floater sprite failed to load — using drawn fallback');
      ghostSprite = null;
      resolve(null);
    };
    img.src = GHOST_SRC;
  });

  return ghostSpriteLoading;
}

loadGhostSprite();

export class FloaterEnemy extends BaseEnemy {
  constructor(x, y) {
    // Keep a soft blue tint for the drawn fallback only
    super(x, y, 'rgb(245, 248, 255)');
    this.width = 42;
    this.height = 48;
    this.centerX = x;
    this.centerY = y;
    this.angle = 0;
    this.bob = 0;

    this.sprite = ghostSprite;
    loadGhostSprite().then((img) => {
      this.sprite = img;
    });
  }

  update(delta) {
    this.angle += delta * 0.002;
    this.bob += delta * 0.006;

    this.x = this.centerX + Math.cos(this.angle) * 30;
    this.y = this.centerY + Math.sin(this.angle) * 20;
  }

  draw(ctx) {
    const wobble = Math.sin(this.bob) * 2;
    const drawW = this.width * 1.15;
    const drawH = this.height * 1.15;
    const drawX = this.x + this.width / 2 - drawW / 2;
    const drawY = this.y + this.height / 2 - drawH / 2 + wobble;

    if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
      ctx.drawImage(this.sprite, drawX, drawY, drawW, drawH);
      return;
    }

    this.#drawFallback(ctx, drawX, drawY, drawW, drawH);
  }

  #drawFallback(ctx, x, y, w, h) {
    // Cute white ghost if the sprite is still loading / missing
    ctx.save();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#3b1f5a';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Head + body
    ctx.moveTo(x + w * 0.15, y + h * 0.35);
    ctx.quadraticCurveTo(x + w * 0.15, y + h * 0.05, x + w * 0.5, y + h * 0.05);
    ctx.quadraticCurveTo(x + w * 0.85, y + h * 0.05, x + w * 0.85, y + h * 0.35);
    // Arms
    ctx.quadraticCurveTo(x + w * 0.98, y + h * 0.45, x + w * 0.88, y + h * 0.55);
    // Wavy bottom
    ctx.lineTo(x + w * 0.88, y + h * 0.72);
    ctx.quadraticCurveTo(x + w * 0.78, y + h * 0.95, x + w * 0.66, y + h * 0.78);
    ctx.quadraticCurveTo(x + w * 0.55, y + h * 0.95, x + w * 0.44, y + h * 0.78);
    ctx.quadraticCurveTo(x + w * 0.32, y + h * 0.95, x + w * 0.22, y + h * 0.78);
    ctx.lineTo(x + w * 0.12, y + h * 0.55);
    ctx.quadraticCurveTo(x + w * 0.02, y + h * 0.45, x + w * 0.15, y + h * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#2a1545';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.36, y + h * 0.38, w * 0.07, h * 0.11, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.64, y + h * 0.38, w * 0.07, h * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + w * 0.38, y + h * 0.34, 2, 0, Math.PI * 2);
    ctx.arc(x + w * 0.66, y + h * 0.34, 2, 0, Math.PI * 2);
    ctx.fill();

    // Blush
    ctx.fillStyle = 'rgba(255, 150, 180, 0.55)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.28, y + h * 0.48, w * 0.06, h * 0.035, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.72, y + h * 0.48, w * 0.06, h * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.fillStyle = '#2a1545';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.56, w * 0.12, h * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff8fb5';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.59, w * 0.07, h * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export default FloaterEnemy;
