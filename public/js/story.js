/**
 * Story page script
 * Next → load game.html (Level 1)
 */

function goToGame() {
  window.location.href = 'game.html';
}

function setupNextButton() {
  var nextButton = document.getElementById('next-button');

  if (!nextButton) {
    return;
  }

  nextButton.addEventListener('click', goToGame);
}

document.addEventListener('DOMContentLoaded', setupNextButton);
