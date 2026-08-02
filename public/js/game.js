import { GameEngine } from './GameEngine.js';
import { Dragon } from './Dragon.js';
import { Level1 } from './Level1.js';
import { Controls } from './controls.js';

const pauseBtn = document.getElementById('pauseBtn');
if (pauseBtn) {
  pauseBtn.onclick = () => window.navigateTo('pause');
}

const loadingScreen = document.getElementById('loadingScreen');
const gameHud = document.getElementById('gameHud');
const gameStage = document.getElementById('gameStage');
const levelName = document.getElementById('levelName');
const canvas = document.getElementById('gameCanvas');

function showGameUi() {
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
}

// Make sure the canvas exists, then boot the game.
if (!(canvas instanceof HTMLCanvasElement)) {
  console.error('Game canvas (#gameCanvas) not found');
} else {
  canvas.width = 960;
  canvas.height = 540;

  const level = new Level1(canvas);
  const dragon = new Dragon(level.startX, level.startY);
  const controls = new Controls();
  const engine = new GameEngine(canvas, level, dragon, controls);

  if (levelName && level.name) {
    levelName.textContent = level.name;
  }

  showGameUi();
  engine.start();

  // Router cleanup when leaving this screen.
  window.__stopAdventure = () => {
    engine.pause();
    controls.dispose();
  };
}
