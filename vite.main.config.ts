import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        // Externalize electron and all Node.js built-in modules
        'electron',
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        // Externalize optional peer dependencies
        'bufferutil',
        'utf-8-validate',
      ],
    },
  },
});
