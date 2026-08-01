/**
 * Simple game screen helpers for Dragon Adventure!
 * Draws a cheerful placeholder scene and wires Pause.
 */

var canvas = document.getElementById('game-canvas');
var pauseButton = document.getElementById('pause-button');
var resumeButton = document.getElementById('resume-button');
var pauseMenu = document.getElementById('pause-menu');
var starCount = document.getElementById('star-count');
var coinCount = document.getElementById('coin-count');

var isPaused = false;
var stars = 0;
var coins = 0;
var animTime = 0;

function setPaused(paused) {
  isPaused = paused;
  if (pauseMenu) {
    pauseMenu.hidden = !paused;
  }
  if (pauseButton) {
    pauseButton.setAttribute('aria-expanded', String(paused));
  }
}

function drawScene(ctx, width, height, time) {
  // Sky
  var sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#7ec8e3');
  sky.addColorStop(0.55, '#b8f2c8');
  sky.addColorStop(1, '#ffe566');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Soft hills
  ctx.fillStyle = '#57cc99';
  ctx.beginPath();
  ctx.ellipse(width * 0.25, height * 0.95, width * 0.4, height * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#80ed99';
  ctx.beginPath();
  ctx.ellipse(width * 0.75, height * 0.98, width * 0.45, height * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ground strip
  ctx.fillStyle = '#2ec4b6';
  ctx.fillRect(0, height - 48, width, 48);

  // Bobbing dragon placeholder
  var bob = Math.sin(time * 3) * 8;
  var x = width * 0.35;
  var y = height - 120 + bob;

  ctx.fillStyle = 'rgba(27, 42, 74, 0.15)';
  ctx.beginPath();
  ctx.ellipse(x + 18, height - 52, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#00bbf9';
  ctx.beginPath();
  ctx.ellipse(x - 10, y + 10, 22, 14, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2ec4b6';
  ctx.beginPath();
  ctx.ellipse(x + 18, y + 18, 34, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#cbf3f0';
  ctx.beginPath();
  ctx.ellipse(x + 22, y + 24, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2ec4b6';
  ctx.beginPath();
  ctx.ellipse(x + 48, y, 22, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1b2a4a';
  ctx.beginPath();
  ctx.arc(x + 44, y - 2, 3, 0, Math.PI * 2);
  ctx.arc(x + 54, y - 2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Sparkles
  ctx.fillStyle = '#ffff66';
  for (var i = 0; i < 4; i++) {
    var sx = width * 0.55 + Math.cos(time * 2 + i) * 40;
    var sy = height * 0.35 + Math.sin(time * 2.4 + i) * 24;
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateHud() {
  if (starCount) {
    starCount.textContent = String(stars);
  }
  if (coinCount) {
    coinCount.textContent = String(coins);
  }
}

function loop(timestamp) {
  if (!canvas) {
    return;
  }

  var ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  if (!isPaused) {
    animTime = timestamp / 1000;
    // Gentle demo counters so the HUD feels alive
    stars = Math.min(3, Math.floor(animTime / 4));
    coins = Math.min(5, Math.floor(animTime / 3));
    updateHud();
  }

  drawScene(ctx, canvas.width, canvas.height, animTime);
  requestAnimationFrame(loop);
}

function setupButtons() {
  if (pauseButton) {
    pauseButton.addEventListener('click', function () {
      setPaused(true);
    });
  }

  if (resumeButton) {
    resumeButton.addEventListener('click', function () {
      setPaused(false);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.code === 'Escape') {
      setPaused(!isPaused);
    }
  });
}

function startGameScreen() {
  setupButtons();
  updateHud();
  requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', startGameScreen);
