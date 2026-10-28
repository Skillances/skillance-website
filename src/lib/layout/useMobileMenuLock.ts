import { useEffect } from 'react';

/**
 * Freezes the page behind an open mobile menu. Lenis is deliberately left running: stopping
 * and restarting it cancels the section scroll that a menu tap starts as the menu closes.
 */
export function useMobileMenuLock(open: boolean) {
  useEffect(() => {
    if (!open) return;

    const { documentElement: html, body } = document;
    const previous = { html: html.style.overflow, body: body.style.overflow };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    return () => {
      html.style.overflow = previous.html;
      body.style.overflow = previous.body;
    };
  }, [open]);
}
