(async function setupGame() {
  const pauseBtn = document.getElementById('pauseBtn');

  if (pauseBtn) {
    pauseBtn.onclick = () => navigateTo('pause');
  }

  const [{ GameEngine, canvas, ctx }, { Dragon }, { Platform }] =
    await Promise.all([
      import('/js/GameEngine.js'),
      import('/js/Dragon.js'),
      import('/js/Platform.js'),
    ]);

  const groundY = canvas.height - 72;
  const dragon = new Dragon({
    x: 140,
    y: groundY - 80,
    groundY,
  });

  const platforms = [
    new Platform({ x: 220, y: 390, width: 160, height: 28 }),
    new Platform({
      x: 430,
      y: 310,
      width: 150,
      height: 28,
      color: '#00bbf9',
      topColor: '#b8f0ff',
    }),
    new Platform({
      x: 650,
      y: 250,
      width: 170,
      height: 28,
      color: '#9b5de5',
      topColor: '#e0b0ff',
    }),
    new Platform({
      x: 780,
      y: 400,
      width: 120,
      height: 28,
      color: '#ff4d6d',
      topColor: '#ffb3c1',
    }),
  ];

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
