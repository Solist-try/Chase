import { GameEngine } from './GameEngine.js';
import { Dragon } from './Dragon.js';
import { Level1 } from './levels/Level1.js';

const pauseBtn = document.getElementById('pauseBtn');
if (pauseBtn) {
  pauseBtn.onclick = () => window.navigateTo('pause');
}

const loadingScreen = document.getElementById('loadingScreen');
const gameHud = document.getElementById('gameHud');
const gameStage = document.getElementById('gameStage');
const levelName = document.getElementById('levelName');

const currentLevel = Level1;

if (levelName && currentLevel.name) {
  levelName.textContent = currentLevel.name;
}

const dragon = new Dragon({
  x: currentLevel.startPosition.x,
  y: currentLevel.startPosition.y,
  groundY: currentLevel.groundY,
});

function showGameUi() {
  // Hide the loading screen when assets are ready.
  if (loadingScreen) {
    loadingScreen.classList.add('is-hidden');
    loadingScreen.hidden = true;
  }

  // Then show the canvas and HUD.
  if (gameHud) {
    gameHud.classList.remove('is-hidden');
    gameHud.hidden = false;
  }
  if (gameStage) {
    gameStage.classList.remove('is-hidden');
    gameStage.hidden = false;
  }
}

const engine = new GameEngine();

// Safety net: if anything goes wrong, still leave the loading screen.
const readyFallback = window.setTimeout(showGameUi, 1200);

engine
  .start(dragon, currentLevel, () => {
    window.clearTimeout(readyFallback);
    showGameUi();
  })
  .catch((error) => {
    console.error('Failed to start game:', error);
    window.clearTimeout(readyFallback);
    showGameUi();
  });

// Debug/help hooks + router cleanup.
window.__dragon = dragon;
window.__engine = engine;
window.__stopAdventure = () => engine.stop();
