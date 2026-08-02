/**
 * Tiny client-side router for Dragon Adventure!
 * Injects screen HTML into #app, THEN loads that screen's JS file.
 */

const routes = {
  home: 'screens/home.html',
  story: 'screens/story.html',
  game: 'screens/game.html',
  pause: 'screens/pause.html',
  settings: 'screens/settings.html',
};

/** Screen scripts that use ES module imports. */
const moduleRoutes = new Set(['game']);

async function loadRoute(routeName) {
  const path = routes[routeName];
  if (!path) {
    console.error('Route not found:', routeName);
    return;
  }

  // Stop the game loop if we are leaving the game screen.
  if (typeof window.__stopAdventure === 'function') {
    window.__stopAdventure();
    window.__stopAdventure = null;
  }

  // 1) Fetch + inject HTML first so #gameCanvas (etc.) exist in the DOM.
  const html = await fetch(path).then((res) => res.text());
  const app = document.getElementById('app');
  if (!app) {
    console.error('#app not found');
    return;
  }
  app.innerHTML = html;

  // 2) AFTER HTML is in the page, load the screen's JS.
  const script = document.createElement('script');
  if (moduleRoutes.has(routeName)) {
    script.type = 'module';
  }
  // Cache-bust so re-visiting a screen re-runs setup code.
  script.src = `js/${routeName}.js?t=${Date.now()}`;
  document.body.appendChild(script);
}

// Allow navigation from anywhere
window.navigateTo = loadRoute;

// Load home screen by default
window.addEventListener('DOMContentLoaded', () => loadRoute('home'));
