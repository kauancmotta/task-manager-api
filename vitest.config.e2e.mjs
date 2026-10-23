import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    sequence: {
      concurrent: false,
    },
    fileParallelism: false,
    alias: {
      '@common': './src/common',
      '@modules': './src/modules',
      '@config': './src/config',
    },
    setupFiles: ['reflect-metadata'],
  },
  plugins: [swc.vite()],
});