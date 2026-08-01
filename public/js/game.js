(function setupGame() {
  const pauseBtn = document.getElementById('pauseBtn');
  const canvas = document.getElementById('gameCanvas');

  if (pauseBtn) {
    pauseBtn.onclick = () => navigateTo('pause');
  }

  if (!canvas) {
    console.error('Game canvas not found');
    return;
  }

  let shouldRestart = false;
  try {
    shouldRestart = sessionStorage.getItem('dragonAdventureRestart') === '1';
    if (shouldRestart) {
      sessionStorage.removeItem('dragonAdventureRestart');
    }
  } catch {
    // ignore storage failures
  }

  async function bootAdventure() {
    try {
      let startStaticAdventure;

      // Dev: load TypeScript source through Vite.
      // Prod: load the prebuilt adventure bundle.
      try {
        ({ startStaticAdventure } = await import(
          '/src/static-game/adventureApp.ts'
        ));
      } catch {
        const module = await import('/assets/static-adventure.js');
        startStaticAdventure =
          module.startStaticAdventure || module.default?.startStaticAdventure;
      }

      if (typeof startStaticAdventure !== 'function') {
        throw new Error('startStaticAdventure is not available');
      }

      const stop = startStaticAdventure(canvas, { restart: shouldRestart });
      window.__stopAdventure = typeof stop === 'function' ? stop : null;
    } catch (error) {
      console.error('Failed to start Dragon Adventure:', error);
      const hint = document.querySelector('.game-hint');
      if (hint) {
        hint.textContent = 'Could not start the game. Try refreshing the page.';
      }
    }
  }

  bootAdventure();
})();
