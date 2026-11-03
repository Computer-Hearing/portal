import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // three.js lives in the lazily loaded CarViewer chunk (~650 kB)
    chunkSizeWarningLimit: 800,
  },
  test: {
    environment: 'jsdom',
    css: true,
    setupFiles: './src/test/setup.ts',
  },
});
