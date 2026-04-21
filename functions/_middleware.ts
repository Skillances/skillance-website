import { prefersMarkdown } from './lib/acceptNegotiation';
import {
  estimateMarkdownTokens,
  HOMEPAGE_MARKDOWN_FOR_AGENTS,
} from './lib/homepageMarkdown';

export async function onRequest(context: {
  request: Request;
  next: () => Promise<Response>;
  env?: unknown;
  params?: unknown;
  data?: unknown;
  waitUntil?: (p: Promise<unknown>) => void;
  passThroughOnException?: () => void;
}): Promise<Response> {
  const req = context.request;
  const url = new URL(req.url);
  const pathname = url.pathname === '' ? '/' : url.pathname;

  const isHomeDocument =
    pathname === '/' ||
    pathname === '/index.html' ||
    pathname === '';

  if (!isHomeDocument) {
    return context.next();
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return context.next();
  }

  if (!prefersMarkdown(req.headers.get('Accept'))) {
    return context.next();
  }

  const tokens = estimateMarkdownTokens(HOMEPAGE_MARKDOWN_FOR_AGENTS);
  const linkDiscovery =
    '</.well-known/api-catalog>; rel="api-catalog", <https://api.skillance.co.za/docs>; rel="service-doc"';
  const headers = new Headers({
    'Content-Type': 'text/markdown; charset=utf-8',
    Vary: 'Accept',
    Link: linkDiscovery,
    'x-markdown-tokens': String(tokens),
    'Cache-Control': 'public, max-age=300',
  });

  if (req.method === 'HEAD') {
    return new Response(null, { status: 200, headers });
  }

  return new Response(HOMEPAGE_MARKDOWN_FOR_AGENTS, { status: 200, headers });
}
