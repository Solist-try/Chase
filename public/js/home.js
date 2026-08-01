/**
 * Home page buttons for Dragon Adventure!
 * Start Game → game.html
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
      goToPage('game.html');
    });
  }

  if (settingsButton) {
    settingsButton.addEventListener('click', function () {
      goToPage('settings.html');
    });
  }
}

document.addEventListener('DOMContentLoaded', setupHomeButtons);
