import { useEffect, useMemo, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';
import { marketplaceCssVars, mkColors, mkFonts } from '@/lib/marketplace/theme';

const FONT_LINK_ID = 'mk-fonts';

/** Loads Manrope and Source Sans 3 once, only when a marketplace screen mounts. */
function useMarketplaceFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    link.href = mkFonts.href;
    document.head.appendChild(link);
  }, []);
}

/**
 * Root of every marketplace screen: writes the theme tokens as CSS variables, loads the app fonts,
 * and mounts the light toast host. Marketing and admin pages never render this.
 */
export default function MarketplaceThemeScope({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  useMarketplaceFonts();
  const style = useMemo(() => marketplaceCssVars(), []);

  // Portaled dialogs render under <body>, outside this element; expose the same variables on <html>.
  useEffect(() => {
    const root = document.documentElement;
    const entries = Object.entries(style as Record<string, string>);
    for (const [k, v] of entries) root.style.setProperty(k, v);
    return () => {
      for (const [k] of entries) root.style.removeProperty(k);
    };
  }, [style]);
  return (
    <div className={cn('mk-scope min-h-[100dvh]', className)} style={style}>
      {children}
      <Toaster
        theme="light"
        position="top-center"
        toastOptions={{
          style: {
            background: mkColors.surface,
            color: mkColors.textPrimary,
            border: `1px solid ${mkColors.border}`,
            fontFamily: mkFonts.body,
          },
        }}
      />
    </div>
  );
}
