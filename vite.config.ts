import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const src = fileURLToPath(new URL('./src', import.meta.url));
const appHtml = fileURLToPath(new URL('./app.html', import.meta.url));

const aliases = {
  '@': src,
  '@engine': `${src}/engine`,
  '@characters': `${src}/characters`,
  '@levels': `${src}/levels`,
  '@ui': `${src}/ui`,
  '@assets': `${src}/assets`,
};

/**
 * After the main build, bundle the static adventure engine for
 * public/js/game.js to import in production (router game screen).
 */
function bundleStaticAdventure(): Plugin {
  return {
    name: 'bundle-static-adventure',
    apply: 'build',
    async closeBundle() {
      const { build } = await import('vite');
      await build({
        configFile: false,
        root,
        plugins: [react()],
        resolve: { alias: aliases },
        build: {
          emptyOutDir: false,
          outDir: 'dist',
          lib: {
            entry: `${src}/static-game/build-entry.ts`,
            formats: ['es'],
            fileName: () => 'assets/static-adventure.js',
          },
          rollupOptions: {
            output: {
              chunkFileNames: 'assets/chunks/[name]-[hash].js',
              assetFileNames: 'assets/[name]-[hash][extname]',
            },
          },
        },
      });
    },
  };
}

export default defineConfig({
  // Serve files from public/ at the site root (/screens/…, /js/…, /css/…).
  publicDir: 'public',
  plugins: [react(), bundleStaticAdventure()],
  resolve: {
    alias: aliases,
  },
  build: {
    rollupOptions: {
      // React app lives at /app.html; router shell is copied from public/index.html.
      input: {
        app: appHtml,
      },
    },
  },
});
