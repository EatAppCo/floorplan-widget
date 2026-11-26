import path from 'node:path';

import { defineConfig } from 'tsup';

// Builds golden/harness.ts against one renderer tree. RENDERER_ROOT points at
// either a worktree of the baseline SHA or the candidate checkout; fabric then
// resolves from that tree's own node_modules.
const root = path.resolve(process.env.RENDERER_ROOT || process.cwd());
const outDir = process.env.GOLDEN_OUT || '.golden/candidate';

export default defineConfig({
  entry: { harness: 'golden/harness.ts' },
  format: ['iife'],
  platform: 'browser',
  target: 'es2019',
  outDir,
  clean: true,
  minify: false,
  metafile: true,
  noExternal: [/.*/],
  removeNodeProtocol: false,
  esbuildOptions(options) {
    options.alias = { '@renderer': path.join(root, 'src/index.ts') };
    options.nodePaths = [path.join(root, 'node_modules')];
  },
});
