import { useEffect } from 'react';
import { getLenisFromWindow } from '@/lib/sectionScroll';

/**
 * Freezes the page behind an open mobile menu. `body { overflow: hidden }` alone is not
 * enough on iOS Safari (the page still scrolls and jumps on close) and Lenis keeps
 * animating its own scroll position, so both the document and Lenis are locked.
 */
export function useMobileMenuLock(open: boolean) {
  useEffect(() => {
    if (!open) return;

    const lenis = getLenisFromWindow() as
      | (NonNullable<ReturnType<typeof getLenisFromWindow>> & { stop?: () => void; start?: () => void })
      | undefined;
    const { documentElement: html, body } = document;
    const previous = { html: html.style.overflow, body: body.style.overflow };

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    lenis?.stop?.();

    return () => {
      html.style.overflow = previous.html;
      body.style.overflow = previous.body;
      lenis?.start?.();
    };
  }, [open]);
}
