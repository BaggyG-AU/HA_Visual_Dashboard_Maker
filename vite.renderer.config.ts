import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    // Renderer runs on Chromium 127+ (Electron 39). Keep bundles lean and avoid prod sourcemaps.
    target: 'chrome127',
    sourcemap: false,
  },
});
