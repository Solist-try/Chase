(async function setupGame() {
  const pauseBtn = document.getElementById('pauseBtn');

  if (pauseBtn) {
    pauseBtn.onclick = () => navigateTo('pause');
  }

  const { GameEngine, canvas, ctx } = await import('/js/GameEngine.js');

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

  function render() {
    const { width, height, groundY, dragon } = world;

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#7ec8ff');
    sky.addColorStop(0.55, '#b8f0ff');
    sky.addColorStop(1, '#fff6b0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Hills
    ctx.fillStyle = '#7adf8a';
    ctx.beginPath();
    ctx.moveTo(0, groundY - 20);
    ctx.quadraticCurveTo(width * 0.25, groundY - 90, width * 0.5, groundY - 30);
    ctx.quadraticCurveTo(width * 0.75, groundY + 20, width, groundY - 50);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Ground
    ctx.fillStyle = '#5ecf6e';
    ctx.fillRect(0, groundY, width, height - groundY);
    ctx.fillStyle = '#f4d35e';
    ctx.fillRect(0, groundY, width, 10);

    // Sun
    ctx.fillStyle = '#ffe566';
    ctx.beginPath();
    ctx.arc(width - 90, 70, 40, 0, Math.PI * 2);
    ctx.fill();

    // Dragon body
    ctx.save();
    ctx.translate(dragon.x, dragon.y);
    ctx.scale(dragon.facing, 1);

    ctx.fillStyle = '#2bb673';
    ctx.beginPath();
    ctx.ellipse(0, 0, dragon.radius * 1.15, dragon.radius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(dragon.radius * 0.85, -12, 22, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.quadraticCurveTo(-40, -50, -4, -34);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(dragon.radius * 0.95, -16, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b2a4a';
    ctx.beginPath();
    ctx.arc(dragon.radius * 0.98, -16, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  const engine = new GameEngine({ update, render });
  engine.start();

  // Let the router stop the loop when leaving this screen.
  window.__stopAdventure = () => engine.stop();
})();
