/**
 * Minimal Accept header parsing for content negotiation (RFC 7231).
 * Returns true when text/markdown should win over text/html for the same resource.
 */
export function prefersMarkdown(acceptHeader: string | null): boolean {
  if (!acceptHeader || !acceptHeader.trim()) return false;

  let bestHtml = 0;
  let bestMarkdown = 0;

  for (const raw of acceptHeader.split(',')) {
    const segment = raw.trim();
    if (!segment) continue;
    const parts = segment.split(';').map((p) => p.trim());
    const mediaType = (parts[0] ?? '').toLowerCase();
    let q = 1;
    for (let i = 1; i < parts.length; i++) {
      const [key, val] = parts[i]!.split('=').map((s) => s.trim());
      if (key?.toLowerCase() === 'q') {
        const parsed = parseFloat(val ?? '');
        q = Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0;
      }
    }

    if (mediaType === 'text/html' || mediaType === 'application/xhtml+xml') {
      bestHtml = Math.max(bestHtml, q);
    }
    if (mediaType === 'text/markdown') {
      bestMarkdown = Math.max(bestMarkdown, q);
    }
  }

  if (bestMarkdown <= 0) return false;
  return bestMarkdown >= bestHtml;
}
