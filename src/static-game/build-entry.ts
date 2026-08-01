/**
 * Production bundle entry for public/js/game.js.
 * Vite builds this file into dist/js/game.js after the main app build.
 */
import { startStaticAdventure } from './adventureApp';

document.getElementById('pauseBtn')!.onclick = () => {
  window.location.href = 'pause.html';
};

function getElement(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function findPageElements() {
  const canvas = getElement('game-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Missing #game-canvas — cannot start the game.');
  }

  return {
    canvas,
    levelName: getElement('level-name'),
    levelGoal: getElement('level-goal'),
    starCount: getElement('star-count'),
    starTotal: getElement('star-total'),
    coinCount: getElement('coin-count'),
    coinTotal: getElement('coin-total'),
    pauseButton: null,
    resumeButton: null,
    restartButton: null,
    pauseMenu: null,
  };
}

function bootStaticGame(): void {
  const stopAdventure = startStaticAdventure(findPageElements());
  window.addEventListener('pagehide', stopAdventure, { once: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootStaticGame);
} else {
  bootStaticGame();
}
