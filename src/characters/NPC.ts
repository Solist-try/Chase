import { KIDS_DIFFICULTY } from '@engine/GameEngine';
import type { InputState, Rect } from '@engine/types';
import type { Renderer } from '@engine/Renderer';
import { Character, type CharacterOptions } from './Character';

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface NPCOptions extends CharacterOptions {
  role: string;
  dialogue: DialogueLine[];
  patrol?: { minX: number; maxX: number; speed?: number };
}

/** Friendly non-player character with simple patrol + dialogue. */
export class NPC extends Character {
  readonly role: string;
  readonly dialogue: DialogueLine[];
  private patrol?: { minX: number; maxX: number; speed: number };
  private patrolDir: 1 | -1 = 1;
  private talking = false;

  constructor(options: NPCOptions) {
    super(options);
    this.role = options.role;
    this.dialogue = options.dialogue;
    if (options.patrol) {
      this.patrol = {
        minX: options.patrol.minX,
        maxX: options.patrol.maxX,
        speed: options.patrol.speed ?? KIDS_DIFFICULTY.enemySpeed,
      };
    }
  }

  setTalking(value: boolean): void {
    this.talking = value;
  }

  override update(dt: number, _input?: InputState, _solids: Rect[] = []): void {
    this.animTime += dt;
    if (this.talking || !this.patrol) {
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      return;
    }

    this.body.velocity.x = this.patrol.speed * this.patrolDir;
    this.body.velocity.y = 0;
    this.body.position.x += this.body.velocity.x * dt;

    if (this.body.position.x <= this.patrol.minX) {
      this.body.position.x = this.patrol.minX;
      this.patrolDir = 1;
      this.facing = 'right';
    } else if (this.body.position.x >= this.patrol.maxX) {
      this.body.position.x = this.patrol.maxX;
      this.patrolDir = -1;
      this.facing = 'left';
    } else {
      this.facing = this.patrolDir > 0 ? 'right' : 'left';
    }
  }

  draw(renderer: Renderer): void {
    const { x, y } = this.body.position;
    const { width, height } = this.body.size;
    const bob = Math.sin(this.animTime * 4) * 1.5;

    renderer.drawRoundedRect(
      { x, y: y + bob, width, height },
      14,
      this.color,
    );

    // Face
    renderer.drawCircle(
      { x: x + width * 0.35, y: y + height * 0.35 + bob },
      3,
      '#1b2a4a',
    );
    renderer.drawCircle(
      { x: x + width * 0.65, y: y + height * 0.35 + bob },
      3,
      '#1b2a4a',
    );
    renderer.ctx.strokeStyle = '#1b2a4a';
    renderer.ctx.lineWidth = 2;
    renderer.ctx.beginPath();
    renderer.ctx.arc(
      x + width / 2,
      y + height * 0.55 + bob,
      6,
      0.15 * Math.PI,
      0.85 * Math.PI,
    );
    renderer.ctx.stroke();

    // Name tag
    renderer.drawText(this.name, x + width / 2, y - 10 + bob, {
      size: 12,
      align: 'center',
      color: '#1b2a4a',
    });
  }
}
