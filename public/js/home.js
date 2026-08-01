(function setupHome() {
  const startBtn = document.getElementById('startBtn');
  const settingsBtn = document.getElementById('settingsBtn');

  if (startBtn) {
    startBtn.onclick = () => navigateTo('story');
  }

  if (settingsBtn) {
    settingsBtn.onclick = () => navigateTo('settings');
  }
})();
