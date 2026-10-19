/** Sign-in flows that use marketing navigation but stay focused (no footer widgets). */
export const MARKETING_AUTH_PATHS = ['/login', '/register', '/forgot-password'] as const;

export function isMarketingAuthPath(pathname: string): boolean {
  return (MARKETING_AUTH_PATHS as readonly string[]).includes(pathname);
}
