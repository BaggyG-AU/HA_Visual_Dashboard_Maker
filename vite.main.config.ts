import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        // Externalize ws and its optional peer dependencies
        'ws',
        'bufferutil',
        'utf-8-validate',
      ],
    },
  },
});
