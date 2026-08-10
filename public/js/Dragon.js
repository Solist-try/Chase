// ---------------------------------------------------------
// Dragon Adventure – Dragon Character
// Mint-green baby dragon sprite (kid-friendly)
// ---------------------------------------------------------

const SPRITE_SRC = 'assets/baby-dragon-sprite.png';

/** Shared image so we only load the sprite once. */
let sharedSprite = null;
let sharedSpriteLoading = null;

function loadDragonSprite() {
  if (sharedSprite?.complete && sharedSprite.naturalWidth > 0) {
    return Promise.resolve(sharedSprite);
  }
  if (sharedSpriteLoading) return sharedSpriteLoading;

  sharedSpriteLoading = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      sharedSprite = img;
      resolve(img);
    };
    img.onerror = () => {
      console.warn('Dragon sprite failed to load — using drawn fallback');
      sharedSprite = null;
      resolve(null);
    };
    img.src = SPRITE_SRC;
  });

  return sharedSpriteLoading;
}

// Kick off load as soon as this module is imported.
loadDragonSprite();

export class Dragon {
  constructor(startX, startY) {
    // Position
    this.x = startX;
    this.y = startY;

    // Hitbox size (sprite draws a bit larger around it)
    this.width = 48;
    this.height = 48;

    // Movement
    this.speed = 3;
    this.velocityY = 0;

    // State
    this.onGround = false;
    this.facing = 1; // 1 = right, -1 = left

    // Appearance (used by drawn fallback)
    this.color = '#6fd6b0';

    // Animation
    this.frame = 0;
    this.frameTimer = 0;

    this.sprite = sharedSprite;
    loadDragonSprite().then((img) => {
      this.sprite = img;
    });
  }

  updateAnimation(delta) {
    this.frameTimer += delta;
    if (this.frameTimer > 180) {
      this.frame = (this.frame + 1) % 2;
      this.frameTimer = 0;
    }
  }

  draw(ctx) {
    const bob = this.frame === 0 ? 0 : 2;
    const drawW = this.width * 1.35;
    const drawH = this.height * 1.35;
    const drawX = this.x + this.width / 2 - drawW / 2;
    const drawY = this.y + this.height - drawH + bob;

    if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
      ctx.save();
      // Flip horizontally when facing left
      if (this.facing < 0) {
        ctx.translate(drawX + drawW, drawY);
        ctx.scale(-1, 1);
        ctx.drawImage(this.sprite, 0, 0, drawW, drawH);
      } else {
        ctx.drawImage(this.sprite, drawX, drawY, drawW, drawH);
      }
      ctx.restore();
      return;
    }

    // Fallback: simple mint dragon if the image is still loading / missing
    this.#drawFallback(ctx, bob);
  }

  #drawFallback(ctx, bob) {
    const x = this.x;
    const y = this.y + bob;
    const w = this.width;
    const h = this.height;
    const cx = x + w / 2;

    ctx.save();
    if (this.facing < 0) {
      ctx.translate(cx, 0);
      ctx.scale(-1, 1);
      ctx.translate(-cx, 0);
    }

    // Tail
    ctx.fillStyle = '#45a898';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.15, y + h * 0.55);
    ctx.quadraticCurveTo(x - 8, y + h * 0.4, x + 4, y + h * 0.2);
    ctx.quadraticCurveTo(x + 10, y + h * 0.45, x + w * 0.25, y + h * 0.65);
    ctx.fill();

    // Wing
    ctx.fillStyle = '#c9b6f2';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.35, y + h * 0.35);
    ctx.quadraticCurveTo(x + w * 0.1, y + h * 0.05, x + w * 0.45, y + h * 0.15);
    ctx.quadraticCurveTo(x + w * 0.55, y + h * 0.25, x + w * 0.4, y + h * 0.4);
    ctx.fill();

    // Body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.58, w * 0.32, h * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = '#e8d4f0';
    ctx.beginPath();
    ctx.ellipse(cx + 2, y + h * 0.62, w * 0.16, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(cx + 4, y + h * 0.28, w * 0.28, h * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#2b1b4a';
    ctx.beginPath();
    ctx.arc(cx + 10, y + h * 0.26, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx + 12, y + h * 0.24, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = '#7fe0c0';
    ctx.beginPath();
    ctx.ellipse(cx + 16, y + h * 0.34, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Horn
    ctx.fillStyle = '#f7f7f7';
    ctx.beginPath();
    ctx.moveTo(cx - 2, y + 4);
    ctx.lineTo(cx + 4, y + 14);
    ctx.lineTo(cx - 6, y + 14);
    ctx.closePath();
    ctx.fill();

    // Legs
    ctx.fillStyle = '#45a898';
    ctx.fillRect(x + w * 0.28, y + h * 0.78, 8, 10);
    ctx.fillRect(x + w * 0.55, y + h * 0.78, 8, 10);

    ctx.restore();
  }
}

export default Dragon;
