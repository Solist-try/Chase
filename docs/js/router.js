/**
 * Tiny client-side router for Dragon Adventure!
 * Loads screen HTML from public/screens/ into #app.
 */

const routes = {
  home: 'screens/home.html',
  story: 'screens/story.html',
  game: 'screens/game.html',
  pause: 'screens/pause.html',
  settings: 'screens/settings.html',
};

/**
 * Scripts inserted with innerHTML do not run.
 * Recreate each <script> so the browser executes it.
 */
async function runScriptsIn(container) {
  const scripts = [...container.querySelectorAll('script')];

  for (const oldScript of scripts) {
    const script = document.createElement('script');

    for (const attr of oldScript.attributes) {
      script.setAttribute(attr.name, attr.value);
    }

    if (oldScript.src) {
      // Cache-bust so re-visiting a screen re-runs module setup.
      const url = new URL(oldScript.src, window.location.href);
      url.searchParams.set('t', String(Date.now()));
      script.src = url.pathname + url.search;
    } else {
      script.textContent = oldScript.textContent;
    }

    const done = oldScript.src
      ? new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () =>
            reject(new Error(`Failed to load script: ${script.src}`));
        })
      : Promise.resolve();

    oldScript.replaceWith(script);
    await done;
  }

  return scripts.length > 0;
}

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

  // 1) Load screen HTML into #app
  const html = await fetch(path).then((res) => res.text());
  const app = document.getElementById('app');
  if (!app) {
    console.error('#app not found');
    return;
  }
  app.innerHTML = html;

  // 2) Run scripts declared in the screen HTML (e.g. game.js module).
  const ranScreenScripts = await runScriptsIn(app);

  // 3) Fallback for screens that still use separate js/<route>.js files.
  // Await load so buttons are wired before the player can tap them.
  if (!ranScreenScripts) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `js/${routeName}.js?t=${Date.now()}`;
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error(`Failed to load route script: ${script.src}`));
      document.body.appendChild(script);
    }).catch((err) => {
      console.error(err);
    });
  }
}

// Allow navigation from anywhere
window.navigateTo = loadRoute;

// Load home screen by default
window.addEventListener('DOMContentLoaded', () => loadRoute('home'));
