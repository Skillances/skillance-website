/** First path segments served by the marketplace app shell. */
const SHELL_PREFIXES = [
  '/home',
  '/search',
  '/browse',
  '/freelancers',
  '/bookings',
  '/chats',
  '/favorites',
  '/documents',
  '/recurring',
  '/account',
  '/work',
] as const;

/** Standalone auth pages that use the marketplace look but not the app shell. */
const AUTH_PATHS = ['/login', '/register', '/forgot-password'] as const;

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isMarketplaceShellPath(pathname: string): boolean {
  return SHELL_PREFIXES.some((p) => matches(pathname, p));
}

export function isMarketplaceAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => matches(pathname, p));
}

/** Any route that hides marketing chrome (nav, footer, FAQ bot, countdown) and skips Lenis. */
export function isMarketplacePath(pathname: string): boolean {
  return isMarketplaceShellPath(pathname) || isMarketplaceAuthPath(pathname);
}
