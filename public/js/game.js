import { GameEngine } from './GameEngine.js';
import { Dragon } from './Dragon.js';
import { Level1 } from './levels/Level1.js';
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

const currentLevel = Level1;

if (levelName && currentLevel.name) {
  levelName.textContent = currentLevel.name;
}

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

function startGame() {
  if (!(canvas instanceof HTMLCanvasElement)) {
    console.error('Game canvas (#gameCanvas) not found');
    showGameUi();
    return;
  }

  canvas.width = 960;
  canvas.height = 540;

  const dragon = new Dragon(
    currentLevel.startPosition.x,
    currentLevel.startPosition.y,
  );

  const controls = new Controls();
  const engine = new GameEngine(canvas, currentLevel, dragon, controls);

  // Hide loading, show canvas + HUD, then run the loop.
  showGameUi();
  engine.start();

  window.__dragon = dragon;
  window.__engine = engine;
  window.__stopAdventure = () => {
    engine.pause();
    controls.dispose();
  };
}

// Brief loading moment, then start (never hang forever).
window.setTimeout(startGame, 250);
