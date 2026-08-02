(async function setupGame() {
  const pauseBtn = document.getElementById('pauseBtn');
  const canvas = document.getElementById('gameCanvas');

  if (pauseBtn) {
    pauseBtn.onclick = () => navigateTo('pause');
  }

  if (!canvas) {
    console.error('Game canvas not found');
    return;
  }

  const { GameEngine } = await import('/js/GameEngine.js');
  const ctx = canvas.getContext('2d');

  // Simple kid-friendly scene state driven by the engine loop.
  const world = {
    width: canvas.width,
    height: canvas.height,
    groundY: canvas.height - 72,
    dragon: {
      x: 120,
      y: canvas.height - 140,
      vx: 160,
      vy: 0,
      radius: 36,
      facing: 1,
    },
    hopTimer: 0,
  };

  function update(dt) {
    const dragon = world.dragon;
    dragon.x += dragon.vx * dt;

    // Bounce off the sides of the meadow.
    if (dragon.x < 60 || dragon.x > world.width - 60) {
      dragon.vx *= -1;
      dragon.facing = Math.sign(dragon.vx) || dragon.facing;
      dragon.x = Math.max(60, Math.min(world.width - 60, dragon.x));
    }

    // Gentle hop so the dragon feels alive.
    world.hopTimer += dt;
    dragon.y = world.groundY - 68 - Math.abs(Math.sin(world.hopTimer * 3)) * 18;
  }

  function render(context) {
    if (!context) return;

    const { width, height, groundY, dragon } = world;

    // Sky
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#7ec8ff');
    sky.addColorStop(0.55, '#b8f0ff');
    sky.addColorStop(1, '#fff6b0');
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    // Hills
    context.fillStyle = '#7adf8a';
    context.beginPath();
    context.moveTo(0, groundY - 20);
    context.quadraticCurveTo(width * 0.25, groundY - 90, width * 0.5, groundY - 30);
    context.quadraticCurveTo(width * 0.75, groundY + 20, width, groundY - 50);
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.closePath();
    context.fill();

    // Ground
    context.fillStyle = '#5ecf6e';
    context.fillRect(0, groundY, width, height - groundY);
    context.fillStyle = '#f4d35e';
    context.fillRect(0, groundY, width, 10);

    // Sun
    context.fillStyle = '#ffe566';
    context.beginPath();
    context.arc(width - 90, 70, 40, 0, Math.PI * 2);
    context.fill();

    // Dragon body
    context.save();
    context.translate(dragon.x, dragon.y);
    context.scale(dragon.facing, 1);

    context.fillStyle = '#2bb673';
    context.beginPath();
    context.ellipse(0, 0, dragon.radius * 1.15, dragon.radius * 0.9, 0, 0, Math.PI * 2);
    context.fill();

    // Head
    context.beginPath();
    context.ellipse(dragon.radius * 0.85, -12, 22, 18, 0, 0, Math.PI * 2);
    context.fill();

    // Wing
    context.fillStyle = '#ff6b6b';
    context.beginPath();
    context.moveTo(-8, -8);
    context.quadraticCurveTo(-40, -50, -4, -34);
    context.closePath();
    context.fill();

    // Eye
    context.fillStyle = '#fff';
    context.beginPath();
    context.arc(dragon.radius * 0.95, -16, 5, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#1b2a4a';
    context.beginPath();
    context.arc(dragon.radius * 0.98, -16, 2.5, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }

  const engine = new GameEngine({
    canvas,
    update,
    render,
  });

  engine.start();

  // Let the router stop the loop when leaving this screen.
  window.__stopAdventure = () => engine.stop();
})();
