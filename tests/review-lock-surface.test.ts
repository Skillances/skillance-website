import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

function walk(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (entry === 'node_modules' || entry === 'dist') continue;
    const info = statSync(full);
    if (info.isDirectory()) walk(full, found);
    else if (/\.(ts|tsx)$/.test(entry)) found.push(full);
  }
  return found;
}

describe('review lock surfaces', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

  it('does not keep a localStorage review fallback', () => {
    expect(existsSync(path.join(root, 'src/lib/reviews-db.ts'))).toBe(false);
    const hits = walk(path.join(root, 'src')).filter((file) =>
      /from\s+['"][^'"]*reviews-db['"]/.test(readFileSync(file, 'utf8')),
    );
    expect(hits).toEqual([]);
  });

  it('removes the homepage write-a-review form and its public POST', () => {
    const reviews = readFileSync(path.join(root, 'src/components/sections/Reviews.tsx'), 'utf8');
    expect(reviews).not.toMatch(/from '@\/lib\/api'/);
    expect(reviews).not.toMatch(/<form/);
    expect(reviews).not.toMatch(/ApiPaths\.public\.reviews/);
    const testimonials = readFileSync(path.join(root, 'src/components/sections/Testimonials.tsx'), 'utf8');
    expect(testimonials).not.toMatch(/from '@\/lib\/api'/);
    expect(testimonials).not.toMatch(/ApiPaths\.public\.testimonials/);
  });

  it('does not hard-code 1K+, 4.8, or the 100% verified sentence in Stats', () => {
    const stats = readFileSync(path.join(root, 'src/components/sections/Stats.tsx'), 'utf8');
    expect(stats).not.toMatch(/defaultStats/);
    expect(stats).not.toMatch(/1K\+/);
    expect(stats).not.toMatch(/4\.8/);
    expect(stats).not.toMatch(/100% of professionals/);
    expect(stats).not.toMatch(/satisfied customers/);
  });
});
