import { CollisionEngine } from '@engine/CollisionEngine';
import { applyMovement } from '@engine/movement';
import { integrate } from '@engine/physics';
import type { InputState, Rect } from '@engine/types';
import type { Renderer } from '@engine/Renderer';
import { Character, type CharacterOptions } from './Character';
import {
  DEFAULT_DRAGON_LOOK,
  getColorPreset,
  type DragonAccessoryId,
  type DragonLook,
} from './dragonLooks';

export type DragonAnimation = 'idle' | 'walk' | 'jump' | 'happy' | 'bounce';

export interface DragonStats {
  stars: number;
  coins: number;
  health: number;
  maxHealth: number;
}

export interface DragonPalette {
  body: string;
  belly: string;
  snout: string;
  horn: string;
  wing: string;
  wingTip: string;
  spine: string;
  eyeWhite: string;
  eyePupil: string;
  cheek: string;
  outline: string;
  sparkle: string;
  shadow: string;
}

/**
 * Rainbow-bright palette — saturated candy colors for age 8 readability.
 */
export const DRAGON_PALETTE: DragonPalette = {
  body: '#FF4D6D',
  belly: '#FFE566',
  snout: '#FF9F1C',
  horn: '#B5179E',
  wing: '#00BBF9',
  wingTip: '#80ED99',
  spine: '#F72585',
  eyeWhite: '#FFFAF0',
  eyePupil: '#1B2A4A',
  cheek: '#FF85A1',
  outline: '#3A0CA3',
  sparkle: '#FFFF66',
  shadow: 'rgba(58, 12, 163, 0.22)',
};

function paletteFromLook(look: DragonLook): DragonPalette {
  const preset = getColorPreset(look.colorId);
  return {
    body: preset.body,
    belly: preset.belly,
    snout: preset.crest,
    horn: preset.accent,
    wing: preset.wing,
    wingTip: preset.crest,
    spine: preset.accent,
    eyeWhite: '#FFFAF0',
    eyePupil: '#1B2A4A',
    cheek: '#FF85A1',
    outline: '#1B2A4A',
    sparkle: '#FFFF66',
    shadow: 'rgba(27, 42, 74, 0.22)',
  };
}

/**
 * Child-friendly platformer hitbox:
 * wider feet for easy landings, tall enough to read clearly on screen.
 * (Classic Mario is roughly 16×32 NES px — this is intentionally chunkier.)
 */
export const DRAGON_HITBOX = {
  width: 36,
  height: 50,
} as const;

/**
 * Horizontal move speed (px/s).
 * Modern 2D Mario-likes often sit ~220; Ember is a touch slower for control.
 */
export const DRAGON_MOVE_SPEED = 190;

/** Jump impulse matched to kid-tuned soft gravity. */
export const DRAGON_JUMP_FORCE = 560;

const HAPPY_DURATION = 0.75;
const WALK_SPEED_THRESHOLD = 28;

/** Playable dragon with idle / walk / jump / happy canvas animations. */
export class Dragon extends Character {
  stats: DragonStats = {
    stars: 0,
    coins: 0,
    health: 3,
    maxHealth: 3,
  };

  animation: DragonAnimation = 'idle';
  look: DragonLook;
  private palette: DragonPalette;
  private happyTimer = 0;
  private bounceTimer = 0;
  private walkPhase = 0;
  private facingX: 1 | -1 = 1;
  private readonly collisions = new CollisionEngine();
  /** True on the frame a jump lands on a platform. */
  justLanded = false;

  constructor(
    options: Omit<
      CharacterOptions,
      'id' | 'name' | 'color' | 'width' | 'height'
    > & {
      name?: string;
      width?: number;
      height?: number;
      look?: DragonLook;
    },
  ) {
    const look = options.look ?? {
      ...DEFAULT_DRAGON_LOOK,
      name: options.name ?? DEFAULT_DRAGON_LOOK.name,
    };
    const palette = paletteFromLook(look);
    super({
      id: 'player-dragon',
      name: look.name,
      color: palette.body,
      width: options.width ?? DRAGON_HITBOX.width,
      height: options.height ?? DRAGON_HITBOX.height,
      x: options.x,
      y: options.y,
      move: {
        speed: DRAGON_MOVE_SPEED,
        jumpForce: DRAGON_JUMP_FORCE,
        topDown: false,
        ...options.move,
      },
    });
    this.look = look;
    this.palette = palette;
  }

  /** Full self-contained update (platformer movement + animations). */
  override update(dt: number, input?: InputState, solids: Rect[] = []): void {
    this.animTime += dt;
    this.tickHappy(dt);
    this.tickBounce(dt);

    if (input) {
      applyMovement(this.body, input, this.moveConfig);
      if (input.left) this.facingX = -1;
      if (input.right) this.facingX = 1;
      this.facing = this.facingX < 0 ? 'left' : 'right';
    }

    integrate(this.body, dt);
    this.afterIntegrate(solids);
    this.resolveAnimation(input);
  }

  /**
   * Call after external physics (e.g. GameEngine.applyPlayerPhysics)
   * to advance timers and pick the current animation.
   */
  syncFromPhysics(dt: number, input?: InputState, landed = false): void {
    this.animTime += dt;
    this.tickHappy(dt);
    this.tickBounce(dt);
    this.justLanded = landed;

    if (input?.left) this.facingX = -1;
    if (input?.right) this.facingX = 1;
    if (Math.abs(this.body.velocity.x) > WALK_SPEED_THRESHOLD) {
      this.facingX = this.body.velocity.x >= 0 ? 1 : -1;
    }
    this.facing = this.facingX < 0 ? 'left' : 'right';

    this.resolveAnimation(input);
  }

  protected override afterIntegrate(solids: Rect[]): void {
    const result = this.collisions.resolvePlatforms(this.body, solids);
    this.justLanded = result.landed;
  }

  collectStar(): void {
    this.stats.stars += 1;
    this.playHappy();
  }

  collectCoin(): void {
    this.collectGem();
  }

  collectGem(): void {
    this.stats.coins += 1;
    this.playHappy(0.4);
  }

  heal(_amount = 1): void {
    // Kids mode: health stays full — hearts are celebration, not a worry meter.
    this.stats.health = this.stats.maxHealth;
    this.playHappy(0.45);
  }

  playHappy(duration = HAPPY_DURATION): void {
    this.happyTimer = duration;
    this.animation = 'happy';
  }

  /** Soft “boing!” after bumping a cute enemy — no damage. */
  playBounce(duration = 0.45): void {
    this.bounceTimer = duration;
    this.animation = 'bounce';
  }

  private tickHappy(dt: number): void {
    if (this.happyTimer <= 0) return;
    this.happyTimer = Math.max(0, this.happyTimer - dt);
  }

  private tickBounce(dt: number): void {
    if (this.bounceTimer <= 0) return;
    this.bounceTimer = Math.max(0, this.bounceTimer - dt);
  }

  private resolveAnimation(_input?: InputState): void {
    if (this.bounceTimer > 0) {
      this.animation = 'bounce';
      return;
    }

    if (this.happyTimer > 0) {
      this.animation = 'happy';
      return;
    }

    const airborne = !this.body.grounded;
    const moving = Math.abs(this.body.velocity.x) > WALK_SPEED_THRESHOLD;

    if (airborne) {
      this.animation = 'jump';
      return;
    }

    if (moving) {
      this.animation = 'walk';
      this.walkPhase += Math.abs(this.body.velocity.x) * 0.02;
      return;
    }

    this.animation = 'idle';
  }

  draw(renderer: Renderer): void {
    const ctx = renderer.ctx;
    const { x, y } = this.body.position;
    const { width, height } = this.body.size;
    const cx = x + width / 2;
    const pose = this.poseOffsets();

    ctx.save();
    ctx.translate(cx, y + height);
    ctx.scale(this.facingX, 1);
    ctx.translate(-width / 2, -height);

    const palette = this.palette;

    // Soft ground shadow
    ctx.fillStyle = palette.shadow;
    ctx.beginPath();
    ctx.ellipse(
      width / 2,
      height - 2 + pose.shadow,
      width * 0.42,
      5,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    this.drawWing(ctx, width, height, pose, -1);
    this.drawBody(ctx, width, height, pose);
    this.drawWing(ctx, width, height, pose, 1);
    this.drawHead(ctx, width, height, pose);
    this.drawAccessory(ctx, width, height, pose);
    this.drawLegs(ctx, width, height, pose);

    if (this.animation === 'happy') {
      this.drawSparkles(ctx, width, height, pose);
    }
    if (this.animation === 'bounce') {
      this.drawBounceRings(ctx, width, height, pose);
    }

    ctx.restore();
  }

  private poseOffsets(): {
    bob: number;
    stretch: number;
    wing: number;
    legL: number;
    legR: number;
    smile: number;
    shadow: number;
  } {
    switch (this.animation) {
      case 'walk': {
        const swing = Math.sin(this.walkPhase);
        return {
          bob: Math.abs(Math.sin(this.walkPhase)) * 2,
          stretch: 1,
          wing: swing * 10,
          legL: swing * 7,
          legR: -swing * 7,
          smile: 0,
          shadow: Math.abs(swing) * 1.5,
        };
      }
      case 'jump': {
        const rising = this.body.velocity.y < 0;
        return {
          bob: rising ? -4 : 2,
          stretch: rising ? 1.08 : 0.92,
          wing: rising ? 22 : 8,
          legL: rising ? -6 : 4,
          legR: rising ? -6 : 4,
          smile: 1,
          shadow: rising ? 3 : 1,
        };
      }
      case 'happy': {
        const bounce = Math.abs(Math.sin(this.animTime * 14)) * 6;
        return {
          bob: -bounce,
          stretch: 1.05,
          wing: 18 + Math.sin(this.animTime * 16) * 8,
          legL: 2,
          legR: -2,
          smile: 2,
          shadow: bounce * 0.3,
        };
      }
      case 'bounce': {
        const t = this.bounceTimer;
        const squash = Math.sin(t * 22);
        return {
          bob: -Math.abs(squash) * 8,
          stretch: 1 + squash * 0.12,
          wing: 26,
          legL: 8,
          legR: 8,
          smile: 2,
          shadow: 4,
        };
      }
      case 'idle':
      default: {
        const breathe = Math.sin(this.animTime * 3) * 1.5;
        return {
          bob: breathe,
          stretch: 1 + Math.sin(this.animTime * 3) * 0.02,
          wing: Math.sin(this.animTime * 2.2) * 4,
          legL: 0,
          legR: 0,
          smile: 0,
          shadow: 0,
        };
      }
    }
  }

  private drawBody(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pose: { bob: number; stretch: number },
  ): void {
    const top = pose.bob + 8;
    const bodyH = (height - 16) * pose.stretch;
    const palette = this.palette;

    // Spines
    ctx.fillStyle = palette.spine;
    for (let i = 0; i < 3; i++) {
      const sx = width * 0.38 + i * 6;
      const sy = top + 6 + i * 5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 4, sy - 10);
      ctx.lineTo(sx + 8, sy);
      ctx.fill();
    }

    // Body
    roundRect(ctx, 4, top, width - 8, bodyH, 16, palette.body);
    // Belly
    roundRect(
      ctx,
      width * 0.22,
      top + bodyH * 0.28,
      width * 0.56,
      bodyH * 0.45,
      12,
      palette.belly,
    );
  }

  private drawHead(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pose: { bob: number; smile: number },
  ): void {
    const hx = width * 0.55;
    const hy = pose.bob + height * 0.12;
    const palette = this.palette;

    // Horn
    ctx.fillStyle = palette.horn;
    ctx.beginPath();
    ctx.moveTo(hx + 2, hy + 4);
    ctx.lineTo(hx + 8, hy - 12);
    ctx.lineTo(hx + 14, hy + 4);
    ctx.fill();

    // Head
    roundRect(ctx, hx - 4, hy, 26, 22, 10, palette.body);
    // Snout
    roundRect(ctx, hx + 10, hy + 8, 16, 12, 6, palette.snout);

    // Eyes
    ctx.fillStyle = palette.eyeWhite;
    ctx.beginPath();
    ctx.arc(hx + 6, hy + 8, 4.5, 0, Math.PI * 2);
    ctx.arc(hx + 16, hy + 8, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.eyePupil;
    ctx.beginPath();
    ctx.arc(hx + 7, hy + 8, 2.2, 0, Math.PI * 2);
    ctx.arc(hx + 17, hy + 8, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = palette.cheek;
    ctx.beginPath();
    ctx.arc(hx + 2, hy + 14, 3, 0, Math.PI * 2);
    ctx.arc(hx + 20, hy + 14, 3, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = palette.outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hx + 14, hy + 14, 5 + pose.smile, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  private drawAccessory(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pose: { bob: number },
  ): void {
    const id = this.look.accessoryId;
    if (id === 'none') return;

    const hx = width * 0.55;
    const hy = pose.bob + height * 0.12;
    const palette = this.palette;

    switch (id as DragonAccessoryId) {
      case 'party_hat': {
        ctx.fillStyle = '#FF4D6D';
        ctx.beginPath();
        ctx.moveTo(hx + 4, hy + 2);
        ctx.lineTo(hx + 10, hy - 16);
        ctx.lineTo(hx + 16, hy + 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFE566';
        ctx.beginPath();
        ctx.arc(hx + 10, hy - 16, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'wizard_hat': {
        ctx.fillStyle = '#5A189A';
        ctx.beginPath();
        ctx.moveTo(hx + 2, hy + 2);
        ctx.lineTo(hx + 12, hy - 18);
        ctx.lineTo(hx + 20, hy + 2);
        ctx.closePath();
        ctx.fill();
        roundRect(ctx, hx, hy, 22, 5, 2, '#9B5DE5');
        ctx.fillStyle = '#FEE440';
        ctx.beginPath();
        ctx.arc(hx + 12, hy - 8, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'crown': {
        ctx.fillStyle = '#FFD166';
        ctx.beginPath();
        ctx.moveTo(hx + 2, hy + 2);
        ctx.lineTo(hx + 2, hy - 8);
        ctx.lineTo(hx + 7, hy - 2);
        ctx.lineTo(hx + 11, hy - 10);
        ctx.lineTo(hx + 15, hy - 2);
        ctx.lineTo(hx + 20, hy - 8);
        ctx.lineTo(hx + 20, hy + 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FF4D6D';
        ctx.beginPath();
        ctx.arc(hx + 11, hy - 4, 1.8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'bow': {
        ctx.fillStyle = '#F15BB5';
        ctx.beginPath();
        ctx.moveTo(hx + 20, hy + 4);
        ctx.lineTo(hx + 28, hy);
        ctx.lineTo(hx + 28, hy + 10);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(hx + 20, hy + 4);
        ctx.lineTo(hx + 12, hy);
        ctx.lineTo(hx + 12, hy + 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FF85A1';
        ctx.beginPath();
        ctx.arc(hx + 20, hy + 5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'scarf': {
        ctx.fillStyle = palette.snout;
        roundRect(ctx, hx - 2, hy + 18, 24, 6, 3, palette.snout);
        ctx.beginPath();
        ctx.moveTo(hx + 16, hy + 22);
        ctx.lineTo(hx + 22, hy + 34);
        ctx.lineTo(hx + 12, hy + 24);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'glasses': {
        ctx.strokeStyle = palette.outline;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hx + 6, hy + 8, 4.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(hx + 17, hy + 8, 4.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(hx + 10.5, hy + 8);
        ctx.lineTo(hx + 12.5, hy + 8);
        ctx.stroke();
        break;
      }
      case 'flower': {
        const fx = hx + 4;
        const fy = hy - 2;
        ctx.fillStyle = '#FF99C8';
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(
            fx + Math.cos(angle) * 4,
            fy + Math.sin(angle) * 4,
            3,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.fillStyle = '#FEE440';
        ctx.beginPath();
        ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      default:
        break;
    }
  }

  private drawWing(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pose: { bob: number; wing: number },
    side: 1 | -1,
  ): void {
    const rootX = width / 2 + side * 6;
    const rootY = pose.bob + height * 0.38;
    const flap = pose.wing * side;
    const palette = this.palette;

    ctx.fillStyle = side < 0 ? palette.wing : palette.wingTip;
    ctx.beginPath();
    ctx.moveTo(rootX, rootY);
    ctx.quadraticCurveTo(
      rootX + side * 22,
      rootY - 18 - flap,
      rootX + side * 8,
      rootY - 28 - flap * 0.4,
    );
    ctx.quadraticCurveTo(
      rootX + side * 4,
      rootY - 10,
      rootX,
      rootY,
    );
    ctx.fill();
  }

  private drawLegs(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pose: { bob: number; legL: number; legR: number },
  ): void {
    const footY = height - 8 + pose.bob * 0.2;
    const palette = this.palette;
    roundRect(ctx, 8, footY + pose.legL, 10, 10, 4, palette.snout);
    roundRect(ctx, width - 18, footY + pose.legR, 10, 10, 4, palette.snout);
  }

  private drawSparkles(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pose: { bob: number },
  ): void {
    const t = this.animTime * 10;
    ctx.fillStyle = this.palette.sparkle;
    for (let i = 0; i < 5; i++) {
      const angle = t + i * 1.2;
      const px = width / 2 + Math.cos(angle) * (18 + i * 2);
      const py = pose.bob + height * 0.3 + Math.sin(angle * 1.3) * 12;
      const r = 2 + (i % 2);
      ctx.beginPath();
      ctx.moveTo(px, py - r);
      ctx.lineTo(px + r * 0.6, py);
      ctx.lineTo(px, py + r);
      ctx.lineTo(px - r * 0.6, py);
      ctx.fill();
    }
  }

  private drawBounceRings(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pose: { bob: number },
  ): void {
    const progress = 1 - this.bounceTimer / 0.45;
    ctx.strokeStyle = `rgba(255, 209, 102, ${1 - progress})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 2; i++) {
      const radius = 12 + progress * 22 + i * 8;
      ctx.beginPath();
      ctx.ellipse(
        width / 2,
        height - 6 + pose.bob,
        radius,
        radius * 0.35,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
