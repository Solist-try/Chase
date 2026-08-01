import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const src = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': src,
      '@engine': `${src}/engine`,
      '@characters': `${src}/characters`,
      '@levels': `${src}/levels`,
      '@ui': `${src}/ui`,
      '@assets': `${src}/assets`,
    },
  },
});
