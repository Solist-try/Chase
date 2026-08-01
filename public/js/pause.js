/**
 * Pause menu button handlers for Dragon Adventure!
 *
 * Resume  → return to game.html
 * Restart → reload game.html (fresh level)
 * Home    → load home.html
 */

function goToPage(path) {
  window.location.href = path;
}

function setupPauseButtons() {
  var resumeButton = document.getElementById('resume-button');
  var restartButton = document.getElementById('restart-button');
  var homeButton = document.getElementById('home-button');

  if (resumeButton) {
    resumeButton.addEventListener('click', function () {
      // Return to the game screen.
      goToPage('game.html');
    });
  }

  if (restartButton) {
    restartButton.addEventListener('click', function () {
      // Reload the level from the start.
      goToPage('game.html?restart=1');
    });
  }

  if (homeButton) {
    homeButton.addEventListener('click', function () {
      // Go back to the home screen.
      goToPage('home.html');
    });
  }
}

document.addEventListener('DOMContentLoaded', setupPauseButtons);
