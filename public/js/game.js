import { GameEngine } from './GameEngine.js';
import { Dragon } from './Dragon.js';
import { Level1 } from './levels/Level1.js';

const pauseBtn = document.getElementById('pauseBtn');
if (pauseBtn) {
  pauseBtn.onclick = () => window.navigateTo('pause');
}

const currentLevel = Level1;

const dragon = new Dragon({
  x: currentLevel.startPosition.x,
  y: currentLevel.startPosition.y,
  groundY: currentLevel.groundY,
});

const engine = new GameEngine();
engine.start(dragon, currentLevel);

// Let the router stop the loop (and key listeners) when leaving this screen.
window.__stopAdventure = () => engine.stop();
