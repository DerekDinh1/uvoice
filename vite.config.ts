/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// ONNX Runtime ships ~22 MB of WASM that Rollup emits as an asset whenever
// Transformers.js is in the graph. WhisperProvider points the runtime at a
// version-pinned CDN instead (see SPEECH_CONFIG.ortWasmBaseUrl), so the emitted
// copy is never requested and would only bloat every GitHub Pages deploy.
function dropUnusedOnnxWasm(): Plugin {
  return {
    name: 'drop-unused-onnx-wasm',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (/ort-.*\.wasm$/.test(fileName)) {
          delete bundle[fileName];
        }
      }
    },
  };
}

// GitHub Pages serves this app from https://<user>.github.io/uvoice/, so the
// production build needs a matching base for asset URLs. Dev stays at '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/uvoice/' : '/',
  plugins: [react(), tailwindcss(), dropUnusedOnnxWasm()],
  // Transformers.js is large and only loaded on demand (dynamic import); keep it
  // out of the dev pre-bundle so it does not slow startup or pull Node-only deps.
  optimizeDeps: {
    exclude: ['@huggingface/transformers'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
}));
