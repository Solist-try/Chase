// ---------------------------------------------------------
// Shared collectible sprites (stars + dragon coins)
// ---------------------------------------------------------

const STAR_SRC = 'assets/star-sprite.png';
const COIN_SRC = 'assets/coin-sprite.png';

let starSprite = null;
let starSpriteLoading = null;
let coinSprite = null;
let coinSpriteLoading = null;

export function loadStarSprite() {
  if (starSprite?.complete && starSprite.naturalWidth > 0) {
    return Promise.resolve(starSprite);
  }
  if (starSpriteLoading) return starSpriteLoading;

  starSpriteLoading = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      starSprite = img;
      resolve(img);
    };
    img.onerror = () => {
      console.warn('Star sprite failed to load — using drawn fallback');
      starSprite = null;
      resolve(null);
    };
    img.src = STAR_SRC;
  });

  return starSpriteLoading;
}

export function loadCoinSprite() {
  if (coinSprite?.complete && coinSprite.naturalWidth > 0) {
    return Promise.resolve(coinSprite);
  }
  if (coinSpriteLoading) return coinSpriteLoading;

  coinSpriteLoading = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      coinSprite = img;
      resolve(img);
    };
    img.onerror = () => {
      console.warn('Coin sprite failed to load — using drawn fallback');
      coinSprite = null;
      resolve(null);
    };
    img.src = COIN_SRC;
  });

  return coinSpriteLoading;
}

loadStarSprite();
loadCoinSprite();

/** Draw a shiny 5-point star (fallback when the sprite is missing). */
export function drawStarShape(ctx, x, y, radius, rotation = 0) {
  const spikes = 5;
  const outer = radius;
  const inner = radius * 0.45;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  // Bright yellow fill like the reference art
  ctx.fillStyle = '#ffe014';
  ctx.fill();

  // Mustard inner bevel
  ctx.strokeStyle = '#e0a800';
  ctx.lineWidth = Math.max(2, radius * 0.14);
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Thick dark brown outline
  ctx.strokeStyle = '#5c2a1a';
  ctx.lineWidth = Math.max(2.5, radius * 0.2);
  ctx.stroke();

  // Glossy white highlight dashes (upper-left / mid-left / bottom-left)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-radius * 0.18, -radius * 0.42, radius * 0.1, radius * 0.22, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-radius * 0.42, -radius * 0.05, radius * 0.08, radius * 0.14, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-radius * 0.22, radius * 0.28, radius * 0.09, radius * 0.16, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw a collectible star using the cute sprite when available.
 * @param {number} twinklePhase 0–1 animation phase
 */
export function drawStarCollectible(ctx, x, y, radius, twinklePhase = 0) {
  const bob = Math.sin(twinklePhase * Math.PI * 2) * 2;
  const spin = Math.sin(twinklePhase * Math.PI * 2) * 0.12;
  const scale = 1 + Math.sin(twinklePhase * Math.PI * 2) * 0.06;
  const size = radius * 2.4 * scale;

  if (starSprite && starSprite.complete && starSprite.naturalWidth > 0) {
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(spin);
    ctx.drawImage(starSprite, -size / 2, -size / 2, size, size);
    ctx.restore();
    return;
  }

  drawStarShape(ctx, x, y + bob, radius * 1.15 * scale, spin);
}

/** Silver dragon-coin fallback if the sprite is missing. */
export function drawCoinShape(ctx, x, y, radius) {
  ctx.save();
  ctx.translate(x, y);

  // Outer silver disc
  const metal = ctx.createRadialGradient(-radius * 0.3, -radius * 0.35, 1, 0, 0, radius);
  metal.addColorStop(0, '#f5f7fa');
  metal.addColorStop(0.55, '#c5ccd6');
  metal.addColorStop(1, '#8a93a1');
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = metal;
  ctx.fill();

  // Dark rim
  ctx.strokeStyle = '#5a6270';
  ctx.lineWidth = Math.max(2, radius * 0.14);
  ctx.stroke();

  // Inner ornate ring
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.78, 0, Math.PI * 2);
  ctx.strokeStyle = '#9aa3b0';
  ctx.lineWidth = Math.max(1.5, radius * 0.1);
  ctx.stroke();

  // Cyan dragon silhouette (simple side-facing blob)
  ctx.fillStyle = '#2ec4d6';
  ctx.strokeStyle = '#1b2a4a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(2, 2, radius * 0.28, radius * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // head
  ctx.beginPath();
  ctx.ellipse(-radius * 0.12, -radius * 0.08, radius * 0.16, radius * 0.14, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // eye
  ctx.fillStyle = '#3b2a1a';
  ctx.beginPath();
  ctx.arc(-radius * 0.16, -radius * 0.1, Math.max(1.5, radius * 0.045), 0, Math.PI * 2);
  ctx.fill();

  // Specular shine on rim
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = Math.max(1.5, radius * 0.08);
  ctx.beginPath();
  ctx.arc(-radius * 0.1, -radius * 0.1, radius * 0.72, -2.4, -1.1);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw a silver dragon-coin collectible.
 * @param {number} twinklePhase 0–1 animation phase
 */
export function drawCoinCollectible(ctx, x, y, radius, twinklePhase = 0) {
  const bob = Math.sin(twinklePhase * Math.PI * 2) * 1.5;
  const pulse = 1 + Math.sin(twinklePhase * Math.PI * 2) * 0.04;
  const size = radius * 2.35 * pulse;

  if (coinSprite && coinSprite.complete && coinSprite.naturalWidth > 0) {
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.drawImage(coinSprite, -size / 2, -size / 2, size, size);
    ctx.restore();
    return;
  }

  drawCoinShape(ctx, x, y + bob, radius * 1.15 * pulse);
}

export function getStarSprite() {
  return starSprite;
}

export function getCoinSprite() {
  return coinSprite;
}
