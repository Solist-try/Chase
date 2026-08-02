(function setupStory() {
  const nextBtn = document.getElementById('nextBtn');
  const backBtn = document.getElementById('backBtn');

  if (nextBtn) {
    nextBtn.onclick = () => {
      if (typeof window.navigateTo === 'function') {
        window.navigateTo('game');
      }
    };
  }

  if (backBtn) {
    backBtn.onclick = () => {
      if (typeof window.navigateTo === 'function') {
        window.navigateTo('home');
      }
    };
  }
})();
