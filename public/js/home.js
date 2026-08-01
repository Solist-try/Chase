/**
 * Home page buttons for Dragon Adventure!
 * Start Game → story.html (then Level 1)
 * Settings → settings.html
 */

function goToPage(path) {
  window.location.href = path;
}

function setupHomeButtons() {
  var startButton = document.getElementById('start-game');
  var settingsButton = document.getElementById('open-settings');

  if (startButton) {
    startButton.addEventListener('click', function () {
      goToPage('story.html');
    });
  }

  if (settingsButton) {
    settingsButton.addEventListener('click', function () {
      goToPage('settings.html');
    });
  }
}

document.addEventListener('DOMContentLoaded', setupHomeButtons);
