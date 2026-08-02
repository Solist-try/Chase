// ---------------------------------------------------------
// Dragon Adventure – Game Initialization
// This file connects the engine, dragon, controls, and level
// ---------------------------------------------------------

import { GameEngine } from './GameEngine.js';
import { Dragon } from './Dragon.js';
import { Controls } from './controls.js';
import { Level1 } from './Level1.js';

let engine = null;
let controls = null;

function showGameUi() {
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
    levelName.textContent = 'Level 1';
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

function wirePauseUi() {
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const restartBtn = document.getElementById('restartBtn');
  const homeBtn = document.getElementById('homeBtn');
  const winAgainBtn = document.getElementById('winAgainBtn');
  const winHomeBtn = document.getElementById('winHomeBtn');

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
      window.startDragonGame(true);
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
      window.startDragonGame(true);
    };
  }

  if (winHomeBtn) {
    winHomeBtn.onclick = () => {
      window.navigateTo('home');
    };
  }
}

window.startDragonGame = function (forceRestart = false) {
  // Get canvas from game screen
  const canvas = document.getElementById('gameCanvas');

  if (!canvas) {
    console.error(
      "Canvas not found. Make sure game.html has <canvas id='gameCanvas'>",
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

  // Create game objects
  const dragon = new Dragon(50, canvas.height - 100);
  controls = new Controls();
  const level = new Level1(canvas);

  // Create engine
  engine = new GameEngine(canvas, level, dragon, controls);

  // Hide loading screen, show HUD + canvas
  showGameUi();
  setPauseOverlay(false);
  setWinOverlay(false);
  wirePauseUi();

  // When the level is cleared, show Play again / Home (not just a canvas banner).
  engine.onWin = () => {
    setWinOverlay(true);
  };

  // Start game loop
  engine.start();

  // Router cleanup when leaving this screen
  window.__stopAdventure = () => {
    engine?.pause();
    controls?.dispose();
    engine = null;
    controls = null;
  };

  // forceRestart is accepted for restart button clarity
  void forceRestart;
};

function tryStartDragonGame() {
  // Only start if we are on the game screen
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    window.startDragonGame();
  }
}

// Auto-start when the screen loads (full page load)
window.addEventListener('DOMContentLoaded', tryStartDragonGame);

// Router injects HTML first, then loads this module — DOMContentLoaded
// has usually already fired, so start immediately when the canvas exists.
tryStartDragonGame();
