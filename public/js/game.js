/**
 * Dragon Adventure! — static game page script
 *
 * What this file does (step by step):
 *  1. Finds the <canvas> and HUD elements in game.html
 *  2. Loads the real game engine from /src/engine (via Vite)
 *  3. Starts Level 1 and keeps the HUD counters up to date
 *  4. Pause button → shows the pause menu (Resume hides it)
 *
 * Tip for humans reading this:
 *  The heavy lifting lives in src/static-game/adventureApp.ts.
 *  That module imports GameEngine, Camera, Dragon, levels, etc.
 */

/** Grab a page element by id (or null if missing). */
function getElement(id) {
  return document.getElementById(id);
}

/**
 * Collect every DOM node the adventure needs.
 * Clear names make the HTML ↔ JS connection easy to follow.
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
    pauseButton: getElement('pause-button'),
    resumeButton: getElement('resume-button'),
    pauseMenu: getElement('pause-menu'),
  };
}

/**
 * Load the game engine wiring from src/, then start playing.
 * Vite serves and transforms the TypeScript under /src during `npm run dev`.
 */
async function loadGameEngineAndStart() {
  // Initialize: read canvas + HUD from the page.
  const pageElements = findPageElements();

  // Load adventure bootstrap (uses src/engine GameEngine, display helpers, etc.).
  const adventureModule = await import('/src/static-game/adventureApp.ts');

  // Start Level 1 — this updates the HUD and wires the Pause button.
  const stopAdventure = adventureModule.startStaticAdventure(pageElements);

  // Optional cleanup if the page is ever torn down.
  window.addEventListener('pagehide', stopAdventure, { once: true });
}

// Run after the HTML is ready.
document.addEventListener('DOMContentLoaded', () => {
  loadGameEngineAndStart().catch((error) => {
    console.error('Could not start Dragon Adventure:', error);

    const pauseMenu = getElement('pause-menu');
    if (pauseMenu) {
      pauseMenu.hidden = false;
      const title = pauseMenu.querySelector('h2');
      const message = pauseMenu.querySelector('p');
      if (title) title.textContent = 'Oops!';
      if (message) {
        message.textContent =
          'The game engine could not load. Try opening this page with npm run dev.';
      }
    }
  });
});
