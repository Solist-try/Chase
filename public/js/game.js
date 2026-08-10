// ---------------------------------------------------------
// Dragon Adventure – Game Initialization
// This file connects the engine, dragon, controls, and level
// ---------------------------------------------------------

import { GameEngine } from './GameEngine.js';
import { Dragon } from './Dragon.js';
import { Controls } from './controls.js';
import { Level1 } from './Level1.js';
import { Level2 } from './Level2.js';

let engine = null;
let controls = null;

// Remember which level is running (so Restart keeps the same one)
let currentLevelClass = Level1;

function showGameUi(level) {
  const loadingScreen = document.getElementById('loadingScreen');
  const gameHud = document.getElementById('gameHud');
  const gameStage = document.getElementById('gameStage');
  const levelName = document.getElementById('levelName');

  if (loadingScreen) {
    loadingScreen.classList.add('is-hidden');
    loadingScreen.hidden = true;
  }
  if (gameHud) {
    gameHud.classList.remove('is-hidden');
    gameHud.hidden = false;
  }
  if (gameStage) {
    gameStage.classList.remove('is-hidden');
    gameStage.hidden = false;
  }
  if (levelName) {
    levelName.textContent = level?.name || 'Level 1';
  }
}

function setPauseOverlay(visible) {
  const overlay = document.getElementById('pauseOverlay');
  if (!overlay) return;
  overlay.hidden = !visible;
}

function setWinOverlay(visible) {
  const overlay = document.getElementById('winOverlay');
  if (!overlay) return;
  overlay.hidden = !visible;
}

function setLoseOverlay(visible) {
  const overlay = document.getElementById('loseOverlay');
  if (!overlay) return;
  overlay.hidden = !visible;
}

function wirePauseUi() {
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const restartBtn = document.getElementById('restartBtn');
  const homeBtn = document.getElementById('homeBtn');
  const winAgainBtn = document.getElementById('winAgainBtn');
  const winHomeBtn = document.getElementById('winHomeBtn');
  const winNextBtn = document.getElementById('winNextBtn');
  const loseAgainBtn = document.getElementById('loseAgainBtn');
  const loseHomeBtn = document.getElementById('loseHomeBtn');

  if (pauseBtn) {
    pauseBtn.onclick = () => {
      if (!engine) return;
      engine.pause();
      setPauseOverlay(true);
    };
  }

  if (resumeBtn) {
    resumeBtn.onclick = () => {
      setPauseOverlay(false);
      engine?.resume();
    };
  }

  if (restartBtn) {
    restartBtn.onclick = () => {
      setPauseOverlay(false);
      setWinOverlay(false);
      setLoseOverlay(false);
      // Restart the same level
      window.startDragonGame(currentLevelClass);
    };
  }

  if (homeBtn) {
    homeBtn.onclick = () => {
      window.navigateTo('home');
    };
  }

  if (winAgainBtn) {
    winAgainBtn.onclick = () => {
      setWinOverlay(false);
      window.startDragonGame(currentLevelClass);
    };
  }

  if (winHomeBtn) {
    winHomeBtn.onclick = () => {
      window.navigateTo('home');
    };
  }

  // Optional “Level 2” button on the win screen
  if (winNextBtn) {
    winNextBtn.onclick = () => {
      window.navigateTo('level2');
    };
  }

  if (loseAgainBtn) {
    loseAgainBtn.onclick = () => {
      setLoseOverlay(false);
      window.startDragonGame(currentLevelClass);
    };
  }

  if (loseHomeBtn) {
    loseHomeBtn.onclick = () => {
      window.navigateTo('home');
    };
  }
}

/**
 * Start (or restart) a level.
 * Pass a level class, e.g. startDragonGame(Level2).
 * Defaults to Level1.
 */
window.startDragonGame = function (LevelClass = Level1) {
  // Allow old restart calls like startDragonGame(true)
  if (LevelClass === true || LevelClass === false) {
    LevelClass = currentLevelClass || Level1;
  }
  if (typeof LevelClass !== 'function') {
    LevelClass = Level1;
  }

  currentLevelClass = LevelClass;

  const canvas = document.getElementById('gameCanvas');

  if (!canvas) {
    console.error(
      "Canvas not found. Make sure the screen has <canvas id='gameCanvas'>",
    );
    return;
  }

  // Stop a previous run before starting a new one (restart / remount).
  if (engine) {
    engine.pause();
    engine = null;
  }
  if (controls) {
    controls.dispose();
    controls = null;
  }

  canvas.width = 640;
  canvas.height = 360;

  // Create game objects for the chosen level
  const dragon = new Dragon(50, canvas.height - 100);
  controls = new Controls();
  const level = new LevelClass(canvas);

  // Prefer the level’s own start position when it has one
  if (typeof level.startX === 'number') dragon.x = level.startX;
  if (typeof level.startY === 'number') dragon.y = level.startY;

  engine = new GameEngine(canvas, level, dragon, controls);

  // Hide loading screen, show HUD + canvas
  showGameUi(level);
  setPauseOverlay(false);
  setWinOverlay(false);
  setLoseOverlay(false);
  wirePauseUi();

  // When the level is cleared, show Play again / Home
  engine.onWin = () => {
    setWinOverlay(true);
  };

  // Special foe touched the dragon twice
  engine.onLose = () => {
    setLoseOverlay(true);
  };

  engine.start();

  // Router cleanup when leaving this screen
  window.__stopAdventure = () => {
    engine?.pause();
    controls?.dispose();
    engine = null;
    controls = null;
  };
};

// Handy for other screens / the console
window.Level1 = Level1;
window.Level2 = Level2;

// Auto-start Level 1 only on the main game screen
// (Level 2 screen loads js/level2.js, which calls startDragonGame(Level2))
const isLevel1Screen = document.querySelector('.game-page[aria-label="Game"]');
if (isLevel1Screen && document.getElementById('gameCanvas')) {
  window.startDragonGame(Level1);
}
