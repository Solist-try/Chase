export type UpdateFn = (dt: number) => void;
export type RenderFn = (alpha: number) => void;

const MAX_DT = 1 / 20;
const DEFAULT_FPS = 60;

/** Fixed-ish requestAnimationFrame loop with an FPS limiter. */
export class GameLoop {
  private running = false;
  private lastTime = 0;
  private rafId = 0;
  private readonly frameBudgetMs: number;
  private readonly update: UpdateFn;
  private readonly render: RenderFn;

  constructor(update: UpdateFn, render: RenderFn, targetFps = DEFAULT_FPS) {
    this.update = update;
    this.render = render;
    this.frameBudgetMs = 1000 / Math.max(30, Math.min(60, targetFps));
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
    this.rafId = requestAnimationFrame(this.tick);

    const elapsedMs = now - this.lastTime;
    if (elapsedMs < this.frameBudgetMs - 0.5) return;

    this.lastTime = now - (elapsedMs % this.frameBudgetMs);
    const dt = Math.min(elapsedMs / 1000, MAX_DT);
    this.update(dt);
    this.render(1);
  };
}
