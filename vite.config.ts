import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const src = fileURLToPath(new URL('./src', import.meta.url));

const aliases = {
  '@': src,
  '@engine': `${src}/engine`,
  '@characters': `${src}/characters`,
  '@levels': `${src}/levels`,
  '@ui': `${src}/ui`,
  '@assets': `${src}/assets`,
};

/**
 * After the main build copies public/js/game.js (dev loader),
 * replace it with a bundled entry that includes src/engine.
 */
function bundleStaticGamePage(): Plugin {
  return {
    name: 'bundle-static-game-page',
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
          rollupOptions: {
            input: `${src}/static-game/build-entry.ts`,
            output: {
              format: 'es',
              entryFileNames: 'js/game.js',
              chunkFileNames: 'js/chunks/[name]-[hash].js',
              assetFileNames: 'assets/[name]-[hash][extname]',
            },
          },
        },
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), bundleStaticGamePage()],
  resolve: {
    alias: aliases,
  },
});
