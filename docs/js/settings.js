(function setupSettings() {
  const STORAGE_KEY = 'dragonAdventureSettings';

  const defaults = {
    music: true,
    sfx: true,
    dragonColor: 'emerald',
  };

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaults };
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return { ...defaults };
    }
  }

  function saveSettings(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const musicToggle = document.getElementById('musicToggle');
  const sfxToggle = document.getElementById('sfxToggle');
  const form = document.getElementById('settingsForm');
  const backBtn = document.getElementById('backBtn');
  const colorInputs = document.querySelectorAll('input[name="dragonColor"]');

  const current = loadSettings();

  if (musicToggle) musicToggle.checked = current.music;
  if (sfxToggle) sfxToggle.checked = current.sfx;

  colorInputs.forEach((input) => {
    input.checked = input.value === current.dragonColor;
  });

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const selectedColor =
        document.querySelector('input[name="dragonColor"]:checked')?.value ||
        defaults.dragonColor;

      saveSettings({
        music: Boolean(musicToggle?.checked),
        sfx: Boolean(sfxToggle?.checked),
        dragonColor: selectedColor,
      });

      navigateTo('home');
    });
  }

  if (backBtn) {
    backBtn.onclick = () => navigateTo('home');
  }
})();
