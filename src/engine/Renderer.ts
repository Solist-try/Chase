import { VIEW_HEIGHT, VIEW_WIDTH } from './display';
import type { Rect, Vector2 } from './types';

/** Canvas drawing helpers used by characters and levels. */
export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  private dpr = 1;

  constructor(
    canvas: HTMLCanvasElement,
    logicalWidth = VIEW_WIDTH,
    logicalHeight = VIEW_HEIGHT,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context is not available');
    }
    this.ctx = ctx;
    this.width = logicalWidth;
    this.height = logicalHeight;
    this.syncDpr(canvas);
    this.ctx.imageSmoothingEnabled = false;
  }

  /** Keep drawing in logical pixels after the backing store changes. */
  syncDpr(canvas: HTMLCanvasElement): void {
    this.dpr =
      canvas.width > 0 ? canvas.width / this.width : Math.min(window.devicePixelRatio || 1, 2);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  clear(color = '#7ec8e3'): void {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  fillRect(rect: Rect, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  strokeRect(rect: Rect, color: string, lineWidth = 2): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }

  drawCircle(center: Vector2, radius: number, color: string): void {
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawRoundedRect(rect: Rect, radius: number, color: string): void {
    const { x, y, width, height } = rect;
    const r = Math.min(radius, width / 2, height / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + width, y, x + width, y + height, r);
    this.ctx.arcTo(x + width, y + height, x, y + height, r);
    this.ctx.arcTo(x, y + height, x, y, r);
    this.ctx.arcTo(x, y, x + width, y, r);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  drawText(
    text: string,
    x: number,
    y: number,
    options: { color?: string; size?: number; align?: CanvasTextAlign } = {},
  ): void {
    const { color = '#1b2a4a', size = 16, align = 'left' } = options;
    this.ctx.fillStyle = color;
    this.ctx.font = `700 ${size}px Fredoka, Nunito, sans-serif`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);
  }
}
