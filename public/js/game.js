(async function setupGame() {
  const pauseBtn = document.getElementById('pauseBtn');

  if (pauseBtn) {
    pauseBtn.onclick = () => navigateTo('pause');
  }

  const [{ GameEngine, canvas, ctx }, { Dragon }, { Level1 }] =
    await Promise.all([
      import('/js/GameEngine.js'),
      import('/js/Dragon.js'),
      import('/js/levels/Level1.js'),
    ]);

  const currentLevel = Level1;
  const groundY = currentLevel.groundY ?? canvas.height - 72;
  const start = currentLevel.startPosition;

  const dragon = new Dragon({
    x: start.x,
    y: start.y,
    groundY,
  });

  const platforms = currentLevel.platforms;

  function drawWorld() {
    const width = canvas.width;
    const height = canvas.height;
    const bg = currentLevel.backgroundColor || '#7ec8ff';

    // Sky from level background color
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, bg);
    sky.addColorStop(0.55, '#b8f0ff');
    sky.addColorStop(1, '#fff6b0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Hills
    ctx.fillStyle = currentLevel.hillColor || '#7adf8a';
    ctx.beginPath();
    ctx.moveTo(0, groundY - 20);
    ctx.quadraticCurveTo(width * 0.25, groundY - 90, width * 0.5, groundY - 30);
    ctx.quadraticCurveTo(width * 0.75, groundY + 20, width, groundY - 50);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Ground
    ctx.fillStyle = currentLevel.groundColor || '#5ecf6e';
    ctx.fillRect(0, groundY, width, height - groundY);
    ctx.fillStyle = currentLevel.groundTopColor || '#f4d35e';
    ctx.fillRect(0, groundY, width, 10);

    // Sun
    ctx.fillStyle = '#ffe566';
    ctx.beginPath();
    ctx.arc(width - 90, 70, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  function render() {
    drawWorld();
    for (const platform of platforms) {
      platform.draw(ctx);
    }
    dragon.draw(ctx);
  }

  const engine = new GameEngine({
    dragon,
    platforms,
    groundY,
    render,
  });
  engine.start();

  // Let the router stop the loop (and key listeners) when leaving this screen.
  window.__stopAdventure = () => engine.stop();
})();
