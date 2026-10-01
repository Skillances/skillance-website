/**
 * Path to return to after sign in, from `location.state.from` set by `RequireAuth`
 * (a Location object) or by a link (a string). Only same-site absolute paths are accepted.
 */
export function returnPathFrom(state: unknown): string | null {
  const from = (state as { from?: unknown } | null)?.from;
  let path: string | null = null;
  if (typeof from === 'string') {
    path = from;
  } else if (from && typeof from === 'object' && typeof (from as { pathname?: unknown }).pathname === 'string') {
    const loc = from as { pathname: string; search?: string; hash?: string };
    path = `${loc.pathname}${loc.search ?? ''}${loc.hash ?? ''}`;
  }
  if (!path || !path.startsWith('/') || path.startsWith('//')) return null;
  if (path === '/login' || path === '/admin' || path.startsWith('/admin/')) return null;
  return path;
}
