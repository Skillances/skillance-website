import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MarketplaceThemeScope from '@/components/marketplace/MarketplaceThemeScope';
import { mkMotion } from '@/lib/marketplace/theme';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** Centered single-column shell for sign in, registration, and password reset. */
export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  wide,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <MarketplaceThemeScope className="flex flex-col bg-mk-background">
      <header className="flex h-16 items-center px-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center font-mk-display text-[19px] font-bold tracking-tight text-mk-text-primary"
        >
          Skillance
        </Link>
      </header>
      <main className="flex flex-1 justify-center px-4 pb-12 pt-4 sm:pt-10">
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: mkMotion.pageTravel }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: mkMotion.page, ease: mkMotion.ease }}
          className={wide ? 'w-full max-w-[560px]' : 'w-full max-w-[420px]'}
        >
          <div className="mb-7">
            {eyebrow && (
              <p className="mb-2 font-mk-display text-[12px] font-semibold uppercase tracking-[0.14em] text-mk-text-tertiary">
                {eyebrow}
              </p>
            )}
            <h1 className="text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
            {subtitle && <p className="mt-2 text-[15px] text-mk-text-secondary">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="mt-8 text-center text-[14px] text-mk-text-secondary">{footer}</div>}
        </motion.div>
      </main>
    </MarketplaceThemeScope>
  );
}
