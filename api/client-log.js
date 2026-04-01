const MAX_BODY_LENGTH = 16_000;

function truncate(value) {
  if (typeof value !== 'string') return value;
  return value.length > MAX_BODY_LENGTH ? `${value.slice(0, MAX_BODY_LENGTH)}…` : value;
}

function normalizeBody(req) {
  let rawBody;
  try {
    rawBody = req.body;
  } catch {
    return {};
  }

  if (typeof rawBody === 'string') {
    try {
      return JSON.parse(rawBody);
    } catch {
      return {};
    }
  }

  if (Buffer.isBuffer(rawBody)) {
    try {
      return JSON.parse(rawBody.toString('utf8'));
    } catch {
      return {};
    }
  }

  return typeof rawBody === 'object' && rawBody !== null ? rawBody : {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const body = normalizeBody(req);
    const userAgentHeader = req.headers['user-agent'];
    const log = {
      level: body.level === 'warn' ? 'warn' : 'error',
      source: truncate(body.source || 'client'),
      route: truncate(body.route || ''),
      message: truncate(body.message || 'Unknown client error'),
      stack: truncate(body.stack || ''),
      componentStack: truncate(body.componentStack || ''),
      metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
      timestamp: new Date().toISOString(),
      userAgent: truncate(Array.isArray(userAgentHeader) ? userAgentHeader.join(', ') : (userAgentHeader || '')),
      vercelRegion: process.env.VERCEL_REGION || '',
      vercelEnv: process.env.VERCEL_ENV || '',
    };

    const line = `[client-log] ${JSON.stringify(log)}`;
    if (log.level === 'warn') {
      console.warn(line);
    } else {
      console.error(line);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[client-log] failed to record log: ${message}`);
    return res.status(200).json({ ok: false, message });
  }
}
