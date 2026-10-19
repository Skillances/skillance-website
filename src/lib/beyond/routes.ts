/** Marketing route for Skillance's custom-software practice. Not a marketplace path. */
export const BEYOND_BASENAME = '/beyond';

export function isBeyondPath(pathname: string): boolean {
  return pathname === BEYOND_BASENAME || pathname.startsWith(`${BEYOND_BASENAME}/`);
}
