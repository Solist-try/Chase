(function setupPause() {
  const resumeBtn = document.getElementById('resumeBtn');
  const restartBtn = document.getElementById('restartBtn');
  const homeBtn = document.getElementById('homeBtn');

  if (resumeBtn) {
    resumeBtn.onclick = () => navigateTo('game');
  }

  if (restartBtn) {
    restartBtn.onclick = () => {
      try {
        sessionStorage.setItem('dragonAdventureRestart', '1');
      } catch {
        // ignore storage failures
      }
      navigateTo('game');
    };
  }

  if (homeBtn) {
    homeBtn.onclick = () => navigateTo('home');
  }
})();
