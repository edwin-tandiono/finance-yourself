import path from 'path';

import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: '/finance-yourself/',
  plugins: [reactRouter(), tsconfigPaths()],
  server: {
    port: 3000,
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(__dirname)],
      },
    },
  },
});
