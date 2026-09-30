import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    root: './',
    alias: {
      '@common': './src/common',
      '@modules': './src/modules',
      '@config': './src/config',
    },
    setupFiles: ['reflect-metadata']
  },
  plugins: [swc.vite()],
});