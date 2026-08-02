(async function setupGame() {
  const pauseBtn = document.getElementById('pauseBtn');

  if (pauseBtn) {
    pauseBtn.onclick = () => navigateTo('pause');
  }

  const [{ GameEngine, canvas, ctx }, { Dragon }] = await Promise.all([
    import('/js/GameEngine.js'),
    import('/js/Dragon.js'),
  ]);

  const groundY = canvas.height - 72;
  const dragon = new Dragon({
    x: 140,
    y: groundY - 80,
    groundY,
  });

  const keys = {
    left: false,
    right: false,
    jump: false,
  };

  function onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (key === 'arrowleft' || key === 'a') keys.left = true;
    if (key === 'arrowright' || key === 'd') keys.right = true;
    if (key === ' ' || key === 'arrowup' || key === 'w') {
      keys.jump = true;
      event.preventDefault();
    }
  }

  function onKeyUp(event) {
    const key = event.key.toLowerCase();
    if (key === 'arrowleft' || key === 'a') keys.left = false;
    if (key === 'arrowright' || key === 'd') keys.right = false;
    if (key === ' ' || key === 'arrowup' || key === 'w') keys.jump = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  function drawWorld() {
    const width = canvas.width;
    const height = canvas.height;

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
  }

  function update(dt) {
    dragon.handleInput(keys);
    dragon.update(dt, { width: canvas.width, groundY });
    // Jump is edge-triggered so holding Space doesn't multi-jump.
    keys.jump = false;
  }

  function render() {
    drawWorld();
    dragon.draw(ctx);
  }

  const engine = new GameEngine({ update, render });
  engine.start();

  // Let the router stop the loop when leaving this screen.
  window.__stopAdventure = () => {
    engine.stop();
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  };
})();
