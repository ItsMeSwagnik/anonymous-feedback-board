import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 60_000,
    include: ['src/test/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
  resolve: {
    alias: {
      '@midnight-ntwrk/onchain-runtime': '@midnight-ntwrk/onchain-runtime-cjs',
    },
  },
});
