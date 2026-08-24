/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves this app from https://<user>.github.io/uvoice/, so the
// production build needs a matching base for asset URLs. Dev stays at '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/uvoice/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
}));
