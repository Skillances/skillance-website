import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');

function cspFromNginx(): string {
  const conf = readFileSync(resolve(root, 'nginx/security-headers.conf'), 'utf8');
  const match = conf.match(/add_header Content-Security-Policy "([^"]+)" always;/);
  if (!match) throw new Error('CSP not found in nginx/security-headers.conf');
  return match[1];
}

function cspFromVercel(): string {
  const config = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8')) as {
    headers: { source: string; headers: { key: string; value: string }[] }[];
  };
  const all = config.headers.find((h) => h.source === '/(.*)');
  const csp = all?.headers.find((h) => h.key === 'Content-Security-Policy');
  if (!csp) throw new Error('CSP not found in vercel.json');
  return csp.value;
}

describe('hosting security headers', () => {
  it('nginx CSP matches vercel.json CSP', () => {
    expect(cspFromNginx()).toBe(cspFromVercel());
  });

  it('CSP does not allow unsafe-eval or unsafe inline scripts', () => {
    const scriptSrc = cspFromNginx()
      .split(';')
      .map((d) => d.trim())
      .find((d) => d.startsWith('script-src'));
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it('every nginx location that sets headers includes the security snippet', () => {
    const conf = readFileSync(resolve(root, 'nginx/default.conf'), 'utf8');
    const blocks = conf.split(/\n\s*location /).slice(1);
    for (const block of blocks) {
      if (block.includes('add_header')) {
        expect(block, block.split('{')[0]).toContain('security-headers.conf');
      }
    }
  });
});
