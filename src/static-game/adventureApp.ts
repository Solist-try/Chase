/**
 * Static HTML game page — wires the real engine from src/engine
 * into public/game.html (canvas + HUD + pause menu).
 */
import { Camera } from '@engine/Camera';
import {
  applyCanvasScale,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from '@engine/display';
import { GameEngine } from '@engine/GameEngine';
import { Renderer } from '@engine/Renderer';
import { soundEngine } from '@engine/SoundEngine';
import { DEFAULT_DRAGON_LOOK } from '@characters/dragonLooks';
import { Dragon } from '@characters/Dragon';
import { Level1 } from '@levels/Level1';
import { loadLevel } from '@levels/LevelLoader';
import { getTheme } from '@levels/themes';

/** DOM nodes the static page uses for HUD + pause. */
export interface AdventureHudElements {
  canvas: HTMLCanvasElement;
  levelName: HTMLElement | null;
  levelGoal: HTMLElement | null;
  starCount: HTMLElement | null;
  starTotal: HTMLElement | null;
  coinCount: HTMLElement | null;
  coinTotal: HTMLElement | null;
  pauseButton: HTMLButtonElement | null;
  resumeButton: HTMLButtonElement | null;
  pauseMenu: HTMLElement | null;
}

/**
 * Start Level 1 on the static game page.
 * Returns a cleanup function that stops the engine.
 */
export function startStaticAdventure(hud: AdventureHudElements): () => void {
  const { canvas } = hud;

  // Keep the canvas crisp on retina screens.
  applyCanvasScale(canvas, VIEW_WIDTH, VIEW_HEIGHT);

  const level = loadLevel(Level1.id);
  const theme = getTheme(level.config.theme);
  const dragon = new Dragon({
    x: level.config.spawn.x,
    y: level.config.spawn.y,
    look: DEFAULT_DRAGON_LOOK,
  });
  const camera = new Camera(
    { width: VIEW_WIDTH, height: VIEW_HEIGHT },
    { width: level.config.width, height: level.config.height },
  );

  let renderer: Renderer | null = null;

  // Fill level name / goal / totals once at start.
  updateLevelLabels(hud, level.config.name, level.config.goal.description);
  updateHudCounters(hud, level.getState());

  soundEngine.unlock();
  soundEngine.playMusic('cheerful');

  const gameEngine = new GameEngine({
    canvas,
    clearColor: theme.background,
    logicalWidth: VIEW_WIDTH,
    logicalHeight: VIEW_HEIGHT,
    targetFps: 60,
    onPauseChange: (paused) => {
      showPauseMenu(hud, paused);
      if (paused) {
        soundEngine.stopMusic();
      } else {
        soundEngine.playMusic('cheerful');
      }
    },
    onUpdate: (dt, input, engine) => {
      engine.applyPlayerPhysics(dragon.body, input, level.solids, dt);
      dragon.syncFromPhysics(
        dt,
        input,
        engine.lastPlatformCollision?.landed ?? false,
      );
      level.update(dt, dragon);
      camera.follow(dragon.center);

      // Keep the HTML HUD in sync with collectibles.
      updateHudCounters(hud, level.getState());
    },
    onRender: (ctx) => {
      renderer ??= new Renderer(canvas, VIEW_WIDTH, VIEW_HEIGHT);
      renderer.syncDpr(canvas);
      renderer.clear(theme.background);
      ctx.save();
      camera.apply(ctx);
      level.draw(renderer);
      dragon.draw(renderer);
      ctx.restore();
    },
  });

  // Pause button → show the pause menu (and freeze the engine).
  hud.pauseButton?.addEventListener('click', () => {
    gameEngine.setPaused(true);
  });

  // Resume button → hide the pause menu and continue playing.
  hud.resumeButton?.addEventListener('click', () => {
    gameEngine.setPaused(false);
  });

  // Re-scale when the window size changes.
  const onResize = () => {
    applyCanvasScale(canvas, VIEW_WIDTH, VIEW_HEIGHT);
    gameEngine.syncCanvasScale();
  };
  window.addEventListener('resize', onResize);

  gameEngine.start();

  return () => {
    gameEngine.stop();
    soundEngine.stopMusic();
    window.removeEventListener('resize', onResize);
  };
}

function updateLevelLabels(
  hud: AdventureHudElements,
  name: string,
  goal: string,
): void {
  if (hud.levelName) hud.levelName.textContent = name;
  if (hud.levelGoal) hud.levelGoal.textContent = goal;
}

function updateHudCounters(
  hud: AdventureHudElements,
  state: {
    starsCollected: number;
    starsTotal: number;
    coinsCollected: number;
    coinsTotal: number;
  },
): void {
  if (hud.starCount) hud.starCount.textContent = String(state.starsCollected);
  if (hud.starTotal) hud.starTotal.textContent = `/${state.starsTotal}`;
  if (hud.coinCount) hud.coinCount.textContent = String(state.coinsCollected);
  if (hud.coinTotal) hud.coinTotal.textContent = `/${state.coinsTotal}`;
}

function showPauseMenu(hud: AdventureHudElements, paused: boolean): void {
  if (hud.pauseMenu) {
    hud.pauseMenu.hidden = !paused;
  }
  if (hud.pauseButton) {
    hud.pauseButton.setAttribute('aria-expanded', String(paused));
  }
}
