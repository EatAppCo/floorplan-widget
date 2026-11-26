import { defineConfig } from 'tsup';

// Test build only (the dist build passes its options on the command line and
// never reads this file). Keeps `node:` imports such as `node:test` intact.
export default defineConfig({
  entry: ['test/*.test.ts'],
  format: ['cjs'],
  platform: 'node',
  target: 'node20',
  outDir: '.test-dist',
  clean: true,
  removeNodeProtocol: false,
});
