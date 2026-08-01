export type UpdateFn = (dt: number) => void;
export type RenderFn = (alpha: number) => void;

const MAX_DT = 1 / 20;

/** Fixed-ish requestAnimationFrame loop for update + render. */
export class GameLoop {
  private running = false;
  private lastTime = 0;
  private rafId = 0;
  private readonly update: UpdateFn;
  private readonly render: RenderFn;

  constructor(update: UpdateFn, render: RenderFn) {
    this.update = update;
    this.render = render;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(rawDt, MAX_DT);
    this.update(dt);
    this.render(1);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
