/**
 * Settings page helpers for Dragon Adventure!
 * - Sound on/off toggle
 * - Easy / Normal difficulty
 * - Back button → home.html
 */

var STORAGE_KEY = 'dragon-adventure-settings';

function loadSavedSettings() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { soundEnabled: true, difficulty: 'easy' };
    }
    var parsed = JSON.parse(raw);
    return {
      soundEnabled: parsed.soundEnabled !== false,
      difficulty: parsed.difficulty === 'normal' ? 'normal' : 'easy',
    };
  } catch (error) {
    return { soundEnabled: true, difficulty: 'easy' };
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function setPressed(button, selected) {
  if (!button) return;
  button.classList.toggle('is-selected', selected);
  button.setAttribute('aria-pressed', String(selected));
}

function updateStatusText(settings) {
  var status = document.getElementById('settings-status');
  if (!status) return;

  var soundLabel = settings.soundEnabled ? 'Sound On' : 'Sound Off';
  var difficultyLabel = settings.difficulty === 'normal' ? 'Normal mode' : 'Easy mode';
  status.textContent = soundLabel + ' · ' + difficultyLabel;
}

function applySettingsToButtons(settings) {
  setPressed(document.getElementById('sound-on'), settings.soundEnabled);
  setPressed(document.getElementById('sound-off'), !settings.soundEnabled);
  setPressed(document.getElementById('difficulty-easy'), settings.difficulty === 'easy');
  setPressed(document.getElementById('difficulty-normal'), settings.difficulty === 'normal');
  updateStatusText(settings);
}

function setupSettingsPage() {
  var settings = loadSavedSettings();
  applySettingsToButtons(settings);

  var soundOn = document.getElementById('sound-on');
  var soundOff = document.getElementById('sound-off');
  var easyButton = document.getElementById('difficulty-easy');
  var normalButton = document.getElementById('difficulty-normal');
  var backButton = document.getElementById('back-button');

  if (soundOn) {
    soundOn.addEventListener('click', function () {
      settings.soundEnabled = true;
      saveSettings(settings);
      applySettingsToButtons(settings);
    });
  }

  if (soundOff) {
    soundOff.addEventListener('click', function () {
      settings.soundEnabled = false;
      saveSettings(settings);
      applySettingsToButtons(settings);
    });
  }

  if (easyButton) {
    easyButton.addEventListener('click', function () {
      settings.difficulty = 'easy';
      saveSettings(settings);
      applySettingsToButtons(settings);
    });
  }

  if (normalButton) {
    normalButton.addEventListener('click', function () {
      settings.difficulty = 'normal';
      saveSettings(settings);
      applySettingsToButtons(settings);
    });
  }

  if (backButton) {
    backButton.addEventListener('click', function () {
      window.location.href = 'home.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', setupSettingsPage);
