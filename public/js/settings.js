/**
 * Dragon Adventure! — settings page script
 *
 * What this file does:
 *  1. Loads saved settings from localStorage (or uses friendly defaults)
 *  2. Updates the on-screen toggles to match those values
 *  3. Saves any new choices kids make
 *  4. Handles Back → home.html
 */

/** Key used in the browser's localStorage. */
var STORAGE_KEY = 'dragon-adventure-settings';

/** Friendly defaults for first-time visitors. */
var DEFAULT_SETTINGS = {
  soundEnabled: true,
  difficulty: 'easy',
};

/**
 * Read settings from localStorage.
 * If nothing is saved (or data is broken), return the defaults.
 */
function loadSavedSettings() {
  try {
    var rawText = localStorage.getItem(STORAGE_KEY);

    // Nothing saved yet — use defaults.
    if (!rawText) {
      return {
        soundEnabled: DEFAULT_SETTINGS.soundEnabled,
        difficulty: DEFAULT_SETTINGS.difficulty,
      };
    }

    var parsed = JSON.parse(rawText);

    // Keep values safe/simple for kids' choices.
    return {
      soundEnabled: parsed.soundEnabled !== false,
      difficulty: parsed.difficulty === 'normal' ? 'normal' : 'easy',
    };
  } catch (error) {
    // localStorage can fail in private mode — fall back calmly.
    return {
      soundEnabled: DEFAULT_SETTINGS.soundEnabled,
      difficulty: DEFAULT_SETTINGS.difficulty,
    };
  }
}

/**
 * Save settings to localStorage so they stick next time.
 */
function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Mark one toggle button as selected (or not).
 * Updates both the CSS class and aria-pressed for accessibility.
 */
function setButtonSelected(button, isSelected) {
  if (!button) {
    return;
  }

  button.classList.toggle('is-selected', isSelected);
  button.setAttribute('aria-pressed', String(isSelected));
}

/**
 * Refresh the status line under the toggles.
 * Example: "Sound On · Easy mode"
 */
function updateStatusText(settings) {
  var statusElement = document.getElementById('settings-status');
  if (!statusElement) {
    return;
  }

  var soundLabel = settings.soundEnabled ? 'Sound On' : 'Sound Off';
  var difficultyLabel = settings.difficulty === 'normal' ? 'Normal mode' : 'Easy mode';
  statusElement.textContent = soundLabel + ' · ' + difficultyLabel;
}

/**
 * Update all UI controls so they match the saved settings object.
 */
function updateUiFromSettings(settings) {
  // Sound on/off pair
  setButtonSelected(document.getElementById('sound-on'), settings.soundEnabled);
  setButtonSelected(document.getElementById('sound-off'), !settings.soundEnabled);

  // Difficulty pair
  setButtonSelected(
    document.getElementById('difficulty-easy'),
    settings.difficulty === 'easy',
  );
  setButtonSelected(
    document.getElementById('difficulty-normal'),
    settings.difficulty === 'normal',
  );

  // Friendly summary text
  updateStatusText(settings);
}

/**
 * Change one setting, save it, then refresh the UI.
 */
function changeSetting(settings, key, value) {
  settings[key] = value;
  saveSettings(settings);
  updateUiFromSettings(settings);
}

/**
 * Wire up clicks for sound, difficulty, and the Back button.
 */
function setupSettingsPage() {
  // Start from whatever was saved last time.
  var settings = loadSavedSettings();
  updateUiFromSettings(settings);

  // --- Sound toggles ---
  var soundOnButton = document.getElementById('sound-on');
  var soundOffButton = document.getElementById('sound-off');

  if (soundOnButton) {
    soundOnButton.addEventListener('click', function () {
      changeSetting(settings, 'soundEnabled', true);
    });
  }

  if (soundOffButton) {
    soundOffButton.addEventListener('click', function () {
      changeSetting(settings, 'soundEnabled', false);
    });
  }

  // --- Difficulty toggles ---
  var easyButton = document.getElementById('difficulty-easy');
  var normalButton = document.getElementById('difficulty-normal');

  if (easyButton) {
    easyButton.addEventListener('click', function () {
      changeSetting(settings, 'difficulty', 'easy');
    });
  }

  if (normalButton) {
    normalButton.addEventListener('click', function () {
      changeSetting(settings, 'difficulty', 'normal');
    });
  }

  // --- Back → home.html ---
  var backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.addEventListener('click', function () {
      window.location.href = 'home.html';
    });
  }
}

// Run after the HTML buttons exist in the page.
document.addEventListener('DOMContentLoaded', setupSettingsPage);
