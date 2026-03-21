import { apiRequest } from '@/lib/api';

/**
 * Reads admin verification SSE (Bearer auth). Parses `data:` JSON lines; ignores comments and `connected` heartbeats.
 */
export async function consumeAdminVerificationSse(
  onPayload: (data: Record<string, unknown>) => void,
  signal: AbortSignal,
): Promise<void> {
  const response = await apiRequest(
    '/admin/events/verification-stream',
    { method: 'GET', signal },
    true,
  );
  if (!response.ok) {
    throw new Error(`Verification stream failed (${response.status})`);
  }
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Verification stream has no body');
  }
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    for (const block of parts) {
      for (const line of block.split('\n')) {
        if (line.startsWith('data: ')) {
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const data = JSON.parse(raw) as Record<string, unknown>;
            onPayload(data);
          } catch {
            /* ignore malformed chunk */
          }
        }
      }
    }
  }
}
