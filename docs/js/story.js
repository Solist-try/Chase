(function setupStory() {
  const nextBtn = document.getElementById('nextBtn');
  const backBtn = document.getElementById('backBtn');

  if (nextBtn) {
    nextBtn.onclick = () => navigateTo('game');
  }

  if (backBtn) {
    backBtn.onclick = () => navigateTo('home');
  }
})();
