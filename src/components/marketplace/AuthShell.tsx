import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MarketplaceThemeScope from '@/components/marketplace/MarketplaceThemeScope';
import { mkMotion } from '@/lib/marketplace/theme';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import './auth-shell.css';

type AuthShellProps = {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Wider column for multi-section flows (registration). */
  wide?: boolean;
  /** Single card surface (sign in, password reset, compact register). */
  panel?: boolean;
};

/**
 * Marketing-aligned auth layout: site-primary-nav above, studio paper + pine accents, Skillance brand mark.
 */
export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  wide,
  panel,
}: AuthShellProps) {
  const reduced = usePrefersReducedMotion();
  const columnClass = wide ? 'auth-shell-column auth-shell-column-wide' : 'auth-shell-column';

  return (
    <MarketplaceThemeScope className="auth-shell relative flex min-h-[100dvh] flex-col">
      <div className="auth-shell-atmosphere" aria-hidden="true" />

      <main
        className="auth-shell-main relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:px-6 sm:pb-16 sm:pt-28 lg:px-8 lg:pt-32"
      >
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: mkMotion.pageTravel }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: mkMotion.page, ease: mkMotion.ease }}
          className={`mx-auto ${columnClass}`}
        >
          {panel ? (
            <div className="auth-shell-panel">
              <Link to="/" className="auth-shell-brand" aria-label="Skillance home">
                <img src="/skillance-tiny-logo-black.png" alt="" width={120} height={24} decoding="async" />
                <span>Skillance</span>
              </Link>

              <header className="auth-shell-intro">
                {eyebrow ? <p className="auth-shell-eyebrow">{eyebrow}</p> : null}
                <h1 className="auth-shell-title">{title}</h1>
                {subtitle ? <p className="auth-shell-subtitle">{subtitle}</p> : null}
              </header>

              <div className="auth-shell-panel-content">{children}</div>

              {footer ? <footer className="auth-shell-footer">{footer}</footer> : null}
            </div>
          ) : (
            <>
              <Link to="/" className="auth-shell-brand" aria-label="Skillance home">
                <img src="/skillance-tiny-logo-black.png" alt="" width={120} height={24} decoding="async" />
                <span>Skillance</span>
              </Link>

              <header className="auth-shell-intro">
                {eyebrow ? <p className="auth-shell-eyebrow">{eyebrow}</p> : null}
                <h1 className="auth-shell-title">{title}</h1>
                {subtitle ? <p className="auth-shell-subtitle">{subtitle}</p> : null}
              </header>

              {children}

              {footer ? <footer className="auth-shell-footer">{footer}</footer> : null}
            </>
          )}
        </motion.div>
      </main>
    </MarketplaceThemeScope>
  );
}
