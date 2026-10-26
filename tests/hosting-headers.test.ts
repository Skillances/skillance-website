import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');

type SwaConfig = {
  globalHeaders: Record<string, string>;
  navigationFallback: { rewrite: string; exclude: string[] };
  routes: { route: string; redirect?: string; rewrite?: string; methods?: string[] }[];
};

const swa = JSON.parse(readFileSync(resolve(root, 'public/staticwebapp.config.json'), 'utf8')) as SwaConfig;

function cspFromVercel(): string {
  const config = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8')) as {
    headers: { source: string; headers: { key: string; value: string }[] }[];
  };
  const all = config.headers.find((h) => h.source === '/(.*)');
  const csp = all?.headers.find((h) => h.key === 'Content-Security-Policy');
  if (!csp) throw new Error('CSP not found in vercel.json');
  return csp.value;
}

describe('Static Web App config', () => {
  it('serves the same CSP as vercel.json while both exist', () => {
    expect(swa.globalHeaders['Content-Security-Policy']).toBe(cspFromVercel());
  });

  it('CSP does not allow unsafe-eval or unsafe inline scripts', () => {
    const scriptSrc = swa.globalHeaders['Content-Security-Policy']
      .split(';')
      .map((d) => d.trim())
      .find((d) => d.startsWith('script-src'));
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it('sets the core security headers on every response', () => {
    for (const header of [
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy',
      'Permissions-Policy',
      'Cross-Origin-Opener-Policy',
    ]) {
      expect(swa.globalHeaders[header], header).toBeTruthy();
    }
  });

  it('falls back to index.html for client-side routes but not for assets or the API', () => {
    expect(swa.navigationFallback.rewrite).toBe('/index.html');
    expect(swa.navigationFallback.exclude).toEqual(expect.arrayContaining(['/api/*', '/assets/*']));
  });

  it('only exposes the client-log API route, POST only', () => {
    const apiRoutes = swa.routes.filter((r) => r.route.startsWith('/api/'));
    expect(apiRoutes).toEqual([{ route: '/api/client-log', methods: ['POST'] }]);
  });
});
