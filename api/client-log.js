/**
 * Receives client-side error reports and writes them to the Vercel function log.
 *
 * Hardening (this endpoint is unauthenticated and public, so treat every byte as hostile):
 *  - POST + application/json only
 *  - same-site Origin/Referer required
 *  - body size cap (Content-Length and again after parse)
 *  - per-IP rate limit (in-memory, see note on RateLimiter)
 *  - every logged string is length-capped and stripped of control characters (no log forging)
 *  - metadata is limited in depth, key count and value size
 *  - failures return a proper non-2xx status with a generic message (no error echo)
 */

export const MAX_BODY_BYTES = 16 * 1024;

const FIELD_LIMITS = {
  source: 100,
  route: 300,
  message: 1_000,
  stack: 4_000,
  componentStack: 4_000,
  userAgent: 300,
};

const META_MAX_DEPTH = 3;
const META_MAX_KEYS = 20;
const META_MAX_ARRAY_ITEMS = 10;
const META_MAX_KEY_LENGTH = 50;
const META_MAX_STRING_LENGTH = 200;

const RATE_LIMIT_MAX_REQUESTS = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_TRACKED_IPS = 5_000;

const PRODUCTION_ORIGINS = ['https://skillance.co.za', 'https://www.skillance.co.za'];
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const LINE_BREAKS = /\r\n|[\n\r\u2028\u2029\u0085]/g;
// eslint-disable-next-line no-control-regex -- intentionally matching control characters to strip them
const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g;

/** Caps length and removes characters that could forge or hide log lines. */
export function cleanString(value, maxLength) {
  if (typeof value !== 'string') return '';
  const cleaned = value.slice(0, maxLength * 2).replace(LINE_BREAKS, ' | ').replace(CONTROL_CHARS, '');
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength)}…` : cleaned;
}

function sanitizeMetadata(value, depth = 0) {
  if (typeof value === 'string') return cleanString(value, META_MAX_STRING_LENGTH);
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean' || value === null) return value;
  if (depth >= META_MAX_DEPTH) return undefined;

  if (Array.isArray(value)) {
    return value
      .slice(0, META_MAX_ARRAY_ITEMS)
      .map((item) => sanitizeMetadata(item, depth + 1))
      .filter((item) => item !== undefined);
  }

  if (typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).slice(0, META_MAX_KEYS)) {
      if (FORBIDDEN_KEYS.has(key)) continue;
      const cleaned = sanitizeMetadata(value[key], depth + 1);
      if (cleaned !== undefined) out[cleanString(key, META_MAX_KEY_LENGTH)] = cleaned;
    }
    return out;
  }

  return undefined;
}

/** Builds the sanitized log record from an untrusted request body, or null when it is not an object. */
export function sanitizeLog(body, userAgentHeader) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;

  const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader.join(', ') : userAgentHeader;
  const metadata = sanitizeMetadata(body.metadata);

  return {
    level: body.level === 'warn' ? 'warn' : 'error',
    source: cleanString(body.source, FIELD_LIMITS.source) || 'client',
    route: cleanString(body.route, FIELD_LIMITS.route),
    message: cleanString(body.message, FIELD_LIMITS.message) || 'Unknown client error',
    stack: cleanString(body.stack, FIELD_LIMITS.stack),
    componentStack: cleanString(body.componentStack, FIELD_LIMITS.componentStack),
    metadata: metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {},
    timestamp: new Date().toISOString(),
    userAgent: cleanString(userAgent, FIELD_LIMITS.userAgent),
    vercelRegion: cleanString(process.env.VERCEL_REGION, 20),
    vercelEnv: cleanString(process.env.VERCEL_ENV, 20),
  };
}

/** The site's own origins. Extra origins (staging) can be added via CLIENT_LOG_ALLOWED_ORIGINS (comma separated). */
export function getAllowedOrigins(env = process.env) {
  const origins = new Set(PRODUCTION_ORIGINS);
  for (const host of [env.VERCEL_URL, env.VERCEL_BRANCH_URL]) {
    if (host) origins.add(`https://${host}`);
  }
  for (const origin of (env.CLIENT_LOG_ALLOWED_ORIGINS || '').split(',')) {
    if (origin.trim()) origins.add(origin.trim().replace(/\/+$/, ''));
  }
  if (env.VERCEL_ENV !== 'production') {
    origins.add('http://localhost:5173');
    origins.add('http://localhost:3000');
  }
  return origins;
}

/** Accepts the request only when Origin (or, failing that, Referer) is one of the site's own origins. */
export function isAllowedOrigin(headers, allowed = getAllowedOrigins()) {
  const origin = headers.origin;
  if (typeof origin === 'string' && origin) return allowed.has(origin);

  const referer = headers.referer;
  if (typeof referer === 'string' && referer) {
    try {
      return allowed.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Fixed-window per-IP limiter held in module memory.
 * Best effort only: each serverless instance keeps its own counters, so the effective ceiling is
 * (limit x warm instances). For a hard global limit, back this with Upstash/Vercel KV or use a
 * Vercel WAF rate-limit rule on /api/client-log.
 */
export function createRateLimiter({
  limit = RATE_LIMIT_MAX_REQUESTS,
  windowMs = RATE_LIMIT_WINDOW_MS,
  maxTracked = RATE_LIMIT_MAX_TRACKED_IPS,
} = {}) {
  const hits = new Map();

  return function check(key, now = Date.now()) {
    if (hits.size >= maxTracked) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      if (hits.size >= maxTracked) hits.clear();
    }
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }
    entry.count += 1;
    if (entry.count > limit) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  };
}

const checkRateLimit = createRateLimiter();

function clientIp(req) {
  // Vercel overwrites these headers at the edge, so the client cannot spoof them.
  const forwarded = req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'];
  const first = String(Array.isArray(forwarded) ? forwarded[0] : forwarded || '')
    .split(',')[0]
    .trim();
  return first || req.socket?.remoteAddress || 'unknown';
}

function fail(res, status, message) {
  return res.status(status).json({ ok: false, message });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return fail(res, 405, 'Method not allowed');
  }

  if (!isAllowedOrigin(req.headers)) {
    return fail(res, 403, 'Forbidden');
  }

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (!contentType.startsWith('application/json')) {
    return fail(res, 415, 'Unsupported media type');
  }

  const declaredLength = Number(req.headers['content-length']);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return fail(res, 413, 'Payload too large');
  }

  const limit = checkRateLimit(clientIp(req));
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSeconds));
    return fail(res, 429, 'Too many requests');
  }

  try {
    let body = req.body;
    if (typeof body === 'string' || Buffer.isBuffer(body)) {
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) return fail(res, 413, 'Payload too large');
      try {
        body = JSON.parse(body.toString('utf8'));
      } catch {
        return fail(res, 400, 'Invalid request');
      }
    } else if (Buffer.byteLength(JSON.stringify(body ?? null)) > MAX_BODY_BYTES) {
      // Covers chunked requests that had no Content-Length.
      return fail(res, 413, 'Payload too large');
    }

    const log = sanitizeLog(body, req.headers['user-agent']);
    if (!log) return fail(res, 400, 'Invalid request');

    const line = `[client-log] ${JSON.stringify(log)}`;
    if (log.level === 'warn') {
      console.warn(line);
    } else {
      console.error(line);
    }

    return res.status(200).json({ ok: true });
  } catch {
    console.error('[client-log] failed to record log');
    return fail(res, 500, 'Internal error');
  }
}
