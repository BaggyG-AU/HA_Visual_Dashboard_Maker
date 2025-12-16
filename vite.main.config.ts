import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        // Externalize optional peer dependencies only
        'bufferutil',
        'utf-8-validate',
      ],
    },
  },
});
