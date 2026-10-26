/** Primary nav for site-primary-nav when the visitor is on /beyond routes. */
export const BEYOND_PRIMARY_NAV = [
  { name: 'Overview', href: '/beyond', end: true },
  { name: 'What we build', href: '/beyond/services', end: false },
  { name: 'Approach', href: '/beyond/approach', end: false },
  { name: 'Work', href: '/beyond/work', end: false },
  { name: 'Contact', href: '/beyond/contact', end: false },
] as const;

export function isBeyondNavCurrent(pathname: string, href: string, end?: boolean): boolean {
  const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  if (end) return normalized === href;
  return normalized === href || normalized.startsWith(`${href}/`);
}
