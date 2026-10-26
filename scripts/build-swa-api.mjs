#!/usr/bin/env node
// Bundles the shared client-log handler into the Static Web App's Azure Function.
import { build } from 'esbuild';

await build({
  entryPoints: ['swa-api-src/client-log.cjs'],
  outfile: 'swa-api/client-log/index.js',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  logLevel: 'info',
});
