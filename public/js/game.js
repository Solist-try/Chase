// ---------------------------------------------------------
// Dragon Adventure – Game Initialization
// This file connects the engine, dragon, controls, and level
// ---------------------------------------------------------

import { GameEngine } from './GameEngine.js';
import { Dragon } from './Dragon.js';
import { Controls } from './controls.js';
import { Level1 } from './Level1.js';

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

window.startDragonGame = function () {
  // Get canvas from game screen
  const canvas = document.getElementById('gameCanvas');

  if (!canvas) {
    console.error(
      "Canvas not found. Make sure game.html has <canvas id='gameCanvas'>",
    );
    return;
  }

  canvas.width = 640;
  canvas.height = 360;

  // Create game objects
  const dragon = new Dragon(50, canvas.height - 100);
  const controls = new Controls();
  const level = new Level1(canvas);

  // Create engine
  const engine = new GameEngine(canvas, level, dragon, controls);

  // Hide loading screen, show HUD + canvas
  showGameUi();

  // Start game loop
  engine.start();

  // Pause button (router-friendly)
  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) {
    pauseBtn.onclick = () => {
      engine.pause();
      window.navigateTo('pause');
    };
  }

  // Router cleanup when leaving this screen
  window.__stopAdventure = () => {
    engine.pause();
    controls.dispose();
  };
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
