#!/usr/bin/env node
/**
 * Fails the build if unfilled legal placeholders remain in beyondLegal.ts.
 * Fill src/constants/beyondLegal.ts before production deploy.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = resolve(__dirname, '../src/constants/beyondLegal.ts');
const source = readFileSync(target, 'utf8');
const pattern = /\[[A-Z0-9][^\]]*\]/g;
const matches = source.match(pattern) ?? [];

if (matches.length > 0) {
  console.error('beyondLegal.ts still contains unfilled placeholders:');
  for (const m of [...new Set(matches)]) {
    console.error(`  ${m}`);
  }
  console.error('Update src/constants/beyondLegal.ts before production deploy.');
  process.exit(1);
}

console.log('beyondLegal.ts: no bracket placeholders.');
