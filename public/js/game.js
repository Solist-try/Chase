/**
 * Dragon Adventure! — static game page script
 *
 * 1. Pause button → open pause.html
 * 2. Load the game engine from /src/engine (via Vite)
 * 3. Start Level 1 and keep the HUD counters up to date
 */

document.getElementById('pauseBtn').onclick = () => {
  window.location.href = 'pause.html';
};

/** Grab a page element by id (or null if missing). */
function getElement(id) {
  return document.getElementById(id);
}

/**
 * Collect every DOM node the adventure needs.
 */
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

/**
 * Load the game engine wiring from src/, then start playing.
 */
async function loadGameEngineAndStart() {
  const pageElements = findPageElements();
  const adventureModule = await import('/src/static-game/adventureApp.ts');
  const stopAdventure = adventureModule.startStaticAdventure(pageElements);
  window.addEventListener('pagehide', stopAdventure, { once: true });
}

loadGameEngineAndStart().catch((error) => {
  console.error('Could not start Dragon Adventure:', error);
});
