/**
 * Small Node process that runs beside nginx in the container. It replaces the two
 * Vercel-only pieces of the site:
 *  - POST /api/client-log   (was api/client-log.js, a Vercel serverless function)
 *  - Accept: text/markdown  (was functions/_middleware.ts, an edge middleware)
 *
 * nginx only forwards those requests here. For a document request whose Accept header
 * does not really prefer markdown, this process answers with X-Accel-Redirect so nginx
 * serves the normal index.html. It listens on loopback only.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { prefersMarkdown } from '../functions/lib/acceptNegotiation';
import { beyondMarkdownForPath, isBeyondDocumentPath } from '../functions/lib/beyondMarkdown';
import { estimateMarkdownTokens, HOMEPAGE_MARKDOWN_FOR_AGENTS } from '../functions/lib/homepageMarkdown';
import clientLogHandler from '../api/client-log.js';

const PORT = Number(process.env.SIDECAR_PORT ?? 3001);
const HOST = '127.0.0.1';
const HTML_FALLBACK = '/__html';
const LINK_DISCOVERY =
  '</.well-known/api-catalog>; rel="api-catalog", <https://api.skillance.co.za/docs>; rel="service-doc"';

type Req = IncomingMessage & { body?: unknown };

/** Express-like response helpers that api/client-log.js expects. */
function withExpressHelpers(res: ServerResponse): ServerResponse & {
  status: (code: number) => unknown;
  json: (payload: unknown) => unknown;
} {
  const r = res as ServerResponse & { status: (code: number) => unknown; json: (payload: unknown) => unknown };
  r.status = (code: number) => {
    res.statusCode = code;
    return r;
  };
  r.json = (payload: unknown) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
    return r;
  };
  return r;
}

function readBody(req: Req, maxBytes: number): Promise<string | null> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) {
        resolve(null);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => resolve(null));
  });
}

async function handleClientLog(req: Req, res: ServerResponse): Promise<void> {
  const out = withExpressHelpers(res);
  if (req.method === 'POST') {
    const raw = await readBody(req, 32 * 1024);
    if (raw === null) {
      out.status(413);
      out.json({ ok: false, message: 'Payload too large' });
      return;
    }
    try {
      req.body = JSON.parse(raw);
    } catch {
      req.body = undefined;
    }
  }
  await clientLogHandler(req, out);
}

function handleDocument(req: Req, res: ServerResponse, pathname: string): void {
  const method = req.method ?? 'GET';
  const accept = typeof req.headers.accept === 'string' ? req.headers.accept : null;
  const isHome = pathname === '/' || pathname === '/index.html' || pathname === '';

  let body: string | null = null;
  if (method === 'GET' || method === 'HEAD') {
    if (prefersMarkdown(accept)) {
      if (isHome) body = HOMEPAGE_MARKDOWN_FOR_AGENTS;
      else if (isBeyondDocumentPath(pathname)) body = beyondMarkdownForPath(pathname);
    }
  }

  if (!body) {
    res.statusCode = 200;
    res.setHeader('X-Accel-Redirect', HTML_FALLBACK);
    res.end();
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Vary', 'Accept');
  res.setHeader('Link', LINK_DISCOVERY);
  res.setHeader('x-markdown-tokens', String(estimateMarkdownTokens(body)));
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.end(method === 'HEAD' ? undefined : body);
}

const server = createServer((req: Req, res) => {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  const run =
    pathname === '/api/client-log'
      ? handleClientLog(req, res)
      : Promise.resolve(handleDocument(req, res, pathname));

  run.catch(() => {
    if (!res.headersSent) res.statusCode = 500;
    res.end();
  });
});

server.requestTimeout = 10_000;
server.headersTimeout = 5_000;
server.listen(PORT, HOST, () => {
  console.log(`[sidecar] listening on ${HOST}:${PORT}`);
});
