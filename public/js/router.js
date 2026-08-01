/**
 * Tiny client-side router for Dragon Adventure!
 * Loads screen HTML into #app, then runs that screen's JS file.
 */

const routes = {
  home: 'screens/home.html',
  story: 'screens/story.html',
  game: 'screens/game.html',
  pause: 'screens/pause.html',
  settings: 'screens/settings.html',
};

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

  const html = await fetch(path).then((res) => res.text());
  document.getElementById('app').innerHTML = html;

  // After loading HTML, load its JS file
  const script = document.createElement('script');
  script.src = `js/${routeName}.js`;
  // Bust cache so re-visiting a screen re-runs setup code.
  script.src += `?t=${Date.now()}`;
  document.body.appendChild(script);
}

// Allow navigation from anywhere
window.navigateTo = loadRoute;

// Load home screen by default
window.addEventListener('DOMContentLoaded', () => loadRoute('home'));
