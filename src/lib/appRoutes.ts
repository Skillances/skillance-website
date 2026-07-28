/** Public `/app` routes — guests allowed (mirrors Flutter app_router). */
export const APP_PUBLIC_PATHS = [
  '/app',
  '/app/search',
  '/app/login',
  '/app/register',
  '/app/forgot-password',
] as const;

export function isAppPublicPath(pathname: string): boolean {
  if (APP_PUBLIC_PATHS.includes(pathname as (typeof APP_PUBLIC_PATHS)[number])) {
    return true;
  }
  return (
    pathname.startsWith('/app/category') ||
    pathname.startsWith('/app/browse/category') ||
    pathname.startsWith('/app/freelancer')
  );
}

export function isAppRoute(pathname: string): boolean {
  return pathname.startsWith('/app');
}

export function isAppAuthPath(pathname: string): boolean {
  return (
    pathname === '/app/login' ||
    pathname === '/app/register' ||
    pathname === '/app/forgot-password'
  );
}
