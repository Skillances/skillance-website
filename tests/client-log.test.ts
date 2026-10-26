import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// @ts-expect-error -- plain JS serverless function without type declarations
import handler, { MAX_BODY_BYTES, clientIp, createRateLimiter, getAllowedOrigins, isAllowedOrigin, sanitizeLog } from '../api/client-log.js';

type Req = { method: string; headers: Record<string, string>; body?: unknown; socket?: { remoteAddress: string } };

function makeRes() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    setHeader(key: string, value: string) {
      this.headers[key] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

let ipCounter = 0;
function makeReq(overrides: Partial<Req> = {}): Req {
  ipCounter += 1;
  return {
    method: 'POST',
    headers: {
      origin: 'https://skillance.co.za',
      'content-type': 'application/json',
      'x-forwarded-for': `203.0.113.${ipCounter % 250}`,
      'user-agent': 'vitest',
    },
    body: { source: 'test', message: 'boom' },
    ...overrides,
  };
}

async function call(req: Req) {
  const res = makeRes();
  await handler(req, res);
  return res;
}

describe('client-log handler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => vi.unstubAllEnvs());

  it('records a valid log and returns 200', async () => {
    const res = await call(makeReq());
    expect(res.statusCode).toBe(200);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[client-log]'));
  });

  it('rejects non-POST with 405', async () => {
    const res = await call(makeReq({ method: 'GET' }));
    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('POST');
  });

  it('rejects foreign or missing origins with 403', async () => {
    const foreign = makeReq();
    foreign.headers.origin = 'https://evil.example';
    expect((await call(foreign)).statusCode).toBe(403);

    const missing = makeReq();
    delete missing.headers.origin;
    expect((await call(missing)).statusCode).toBe(403);
  });

  it('falls back to the Referer when Origin is absent', async () => {
    const req = makeReq();
    delete req.headers.origin;
    req.headers.referer = 'https://www.skillance.co.za/some/page';
    expect((await call(req)).statusCode).toBe(200);
  });

  it('rejects non-JSON content types with 415', async () => {
    const req = makeReq();
    req.headers['content-type'] = 'text/plain';
    expect((await call(req)).statusCode).toBe(415);
  });

  it('rejects oversized bodies with 413 (declared and actual)', async () => {
    const declared = makeReq();
    declared.headers['content-length'] = String(MAX_BODY_BYTES + 1);
    expect((await call(declared)).statusCode).toBe(413);

    const actual = makeReq({ body: { message: 'x'.repeat(MAX_BODY_BYTES) } });
    expect((await call(actual)).statusCode).toBe(413);
  });

  it('rejects malformed or non-object bodies with 400 and a generic message', async () => {
    const bad = await call(makeReq({ body: '{not json' }));
    expect(bad.statusCode).toBe(400);
    expect(bad.body).toEqual({ ok: false, message: 'Invalid request' });

    expect((await call(makeReq({ body: [1, 2] }))).statusCode).toBe(400);
  });

  it('rate limits per IP with 429 and Retry-After', async () => {
    const results: number[] = [];
    let last = makeRes();
    for (let i = 0; i < 40; i += 1) {
      const req = makeReq();
      req.headers['x-forwarded-for'] = '198.51.100.7';
      last = await call(req);
      results.push(last.statusCode);
    }
    expect(results.slice(0, 30).every((s) => s === 200)).toBe(true);
    expect(results.at(-1)).toBe(429);
    expect(Number(last.headers['Retry-After'])).toBeGreaterThan(0);
  });
});

describe('sanitizeLog', () => {
  it('strips newlines and control characters (no log forging)', () => {
    const log = sanitizeLog({ message: 'ok\n[client-log] {"forged":true}\u0000\u202e', source: 'a\r\nb' }, 'ua\n');
    // eslint-disable-next-line no-control-regex -- asserting control characters are gone
    expect(log.message).not.toMatch(/[\n\r\u0000\u202e]/);
    expect(log.source).not.toMatch(/[\n\r]/);
    expect(log.userAgent).not.toMatch(/\n/);
  });

  it('caps string lengths, key counts, depth and prototype keys in metadata', () => {
    const deep = { a: { b: { c: { d: 'too deep' } } } };
    const many = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`k${i}`, i]));
    const log = sanitizeLog(
      { message: 'm'.repeat(5_000), metadata: { deep, many, long: 'z'.repeat(1_000), ['__proto__']: { polluted: true } } },
      'ua',
    );
    expect(log.message.length).toBeLessThanOrEqual(1_001);
    expect(log.metadata.long.length).toBeLessThanOrEqual(201);
    expect(log.metadata.deep.a.b).toBeUndefined();
    expect(Object.keys(log.metadata.many)).toHaveLength(20);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('defaults level to error and accepts warn', () => {
    expect(sanitizeLog({ level: 'bogus' }, '').level).toBe('error');
    expect(sanitizeLog({ level: 'warn' }, '').level).toBe('warn');
  });
});

describe('helpers', () => {
  it('isAllowedOrigin only accepts configured origins', () => {
    const allowed = new Set(['https://skillance.co.za']);
    expect(isAllowedOrigin({ origin: 'https://skillance.co.za' }, allowed)).toBe(true);
    expect(isAllowedOrigin({ origin: 'https://skillance.co.za.evil.com' }, allowed)).toBe(false);
    expect(isAllowedOrigin({ referer: 'not a url' }, allowed)).toBe(false);
  });

  it('rate limiter resets after the window and bounds memory', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1_000, maxTracked: 2 });
    expect(check('a', 0).allowed).toBe(true);
    expect(check('a', 10).allowed).toBe(false);
    expect(check('a', 2_000).allowed).toBe(true);
    check('b', 2_000);
    expect(check('c', 2_001).allowed).toBe(true);
  });
});

describe('client IP and origin trust', () => {
  it('ignores spoofable x-vercel-forwarded-for and uses the last forwarded hop', () => {
    const req = {
      headers: { 'x-vercel-forwarded-for': '9.9.9.9', 'x-forwarded-for': '1.2.3.4, 5.6.7.8:443' },
    };
    expect(clientIp(req, {})).toBe('5.6.7.8');
  });

  it('counts trusted proxy hops from the end (Azure Static Web Apps appends two)', () => {
    const req = { headers: { 'x-forwarded-for': '1.2.3.4, 102.132.172.164:57172, 40.70.146.132:32077' } };
    expect(clientIp(req, { CLIENT_LOG_PROXY_HOPS: '2' })).toBe('102.132.172.164');
    expect(clientIp(req, {})).toBe('40.70.146.132');
  });

  it('prefers the configured platform header', () => {
    const req = { headers: { 'x-azure-clientip': '10.1.1.1:5000', 'x-forwarded-for': '1.2.3.4' } };
    expect(clientIp(req, { CLIENT_LOG_IP_HEADER: 'x-azure-clientip' })).toBe('10.1.1.1');
  });

  it('only allows localhost origins when explicitly enabled', () => {
    expect(getAllowedOrigins({}).has('http://localhost:5173')).toBe(false);
    expect(getAllowedOrigins({ CLIENT_LOG_ALLOW_LOCALHOST: 'true' }).has('http://localhost:5173')).toBe(true);
  });
});
