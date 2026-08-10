(function setupHome() {
  /**
   * Real start — opens the story, then the game screen.
   * (Replaces any stub like alert('Game starting...') that never boots the engine.)
   */
  window.startGame = function startGame() {
    if (typeof window.navigateTo === 'function') {
      window.navigateTo('story');
      return;
    }
    console.error('Router not ready — navigateTo is missing');
  };

  const startBtn = document.getElementById('startBtn');
  const level2Btn = document.getElementById('level2Btn');
  const settingsBtn = document.getElementById('settingsBtn');

  if (startBtn) {
    startBtn.onclick = () => window.startGame();
  }

  if (level2Btn) {
    level2Btn.onclick = () => {
      if (typeof window.navigateTo === 'function') {
        window.navigateTo('level2');
      }
    };
  }

  if (settingsBtn) {
    settingsBtn.onclick = () => {
      if (typeof window.navigateTo === 'function') {
        window.navigateTo('settings');
      }
    };
  }
})();
