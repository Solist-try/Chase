/**
 * Story intro page — Next starts Level 1 (game.html).
 */

function setupStoryPage() {
  var nextButton = document.getElementById('next-button');

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      // Level 1 lives on the static game page.
      window.location.href = 'game.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', setupStoryPage);
