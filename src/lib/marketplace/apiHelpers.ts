/**
 * Helpers for the `{ success, data, message, errors }` envelopes the Skillance API returns.
 * The `@/lib/api` client throws the parsed error body (not an Error) on non-2xx responses.
 */

type ApiErrorBody = {
  message?: unknown;
  error?: unknown;
  code?: unknown;
  errors?: { field?: unknown; message?: unknown }[];
  data?: unknown;
};

function asBody(err: unknown): ApiErrorBody | null {
  return err && typeof err === 'object' ? (err as ApiErrorBody) : null;
}

/** The user-facing message from an API error, falling back to [fallback]. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const body = asBody(err);
  if (body) {
    const first = Array.isArray(body.errors) ? body.errors[0] : undefined;
    if (first && typeof first.message === 'string' && first.message.trim()) return first.message;
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message.replace(/^Network error:\s*/i, 'Network error: ');
    }
    if (typeof body.error === 'string' && body.error.trim()) return body.error;
  }
  return fallback;
}

/** The API `code` on an error body, when present. */
export function apiErrorCode(err: unknown): string | undefined {
  const body = asBody(err);
  return body && typeof body.code === 'string' ? body.code : undefined;
}

/** Per-field messages from a Zod-style `errors: [{ field, message }]` body. First message per field wins. */
export function apiFieldErrors(err: unknown): Record<string, string> {
  const body = asBody(err);
  const out: Record<string, string> = {};
  if (!body || !Array.isArray(body.errors)) return out;
  for (const e of body.errors) {
    if (typeof e?.field === 'string' && typeof e.message === 'string' && !(e.field in out)) {
      out[e.field] = e.message;
    }
  }
  return out;
}

/** `response.data` from a success envelope, or the response itself when there is no envelope. */
export function unwrap<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

/** Reads a browser File as a `data:<mime>;base64,...` URL, the shape the API's base64 fields accept. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });
}

/** Saves a Blob as a file download. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Array from common list envelope shapes: `data`, `data.items`, `data.<key>`. */
export function listFrom<T>(response: unknown, ...keys: string[]): T[] {
  const data = unwrap<unknown>(response);
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const k of [...keys, 'items', 'results', 'data']) {
      if (Array.isArray(obj[k])) return obj[k] as T[];
    }
  }
  return [];
}
