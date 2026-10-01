/**
 * Marketplace design tokens. Single source for every marketplace screen.
 *
 * Sourced from the Flutter app (light mode only):
 * - skillance-app/lib/core/theme/theme_config.dart
 * - skillance-app/lib/core/theme/app_colors.dart
 * - skillance-app/lib/core/theme/app_text_styles.dart
 * - skillance-app/lib/core/theme/app_spacing.dart
 * - skillance-app/lib/core/theme/app_elevations.dart
 *
 * Tailwind reads these through CSS variables (`--mk-*`) that `MarketplaceThemeScope` writes
 * from {@link marketplaceCssVars}; use the `mk-*` Tailwind colors, never raw hex, on marketplace pages.
 */
import type { CSSProperties } from 'react';
import { EASE_OUT } from '@/lib/motion';

export const mkColors = {
  /** ThemeConfig.lightPrimary: text, icons, filled buttons. */
  primary: '#000000',
  /** ThemeConfig.lightSecondary. */
  secondary: '#545454',
  /** ThemeConfig.lightBackground. */
  background: '#FFFFFF',
  /** ThemeConfig.lightSurface: cards. */
  surface: '#FFFFFF',
  /** ThemeConfig.lightSurfaceVariant: search bars, inputs. */
  muted: '#F3F3F3',
  textPrimary: '#000000',
  textSecondary: '#5E5E5E',
  textTertiary: '#757575',
  border: '#E5E5E5',
  divider: '#EEEEEE',
  /** ThemeConfig.lightAccent: switches and selected states only. */
  accent: '#34C759',
  onPrimary: '#FFFFFF',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  rating: '#EAB308',

  /** AppColors.bookingTabUpcoming. */
  bookingUpcoming: '#0D9488',
  /** AppColors.bookingTabInProgress. */
  bookingInProgress: '#2563EB',
  /** AppColors.bookingTabNeutral: pending, past, completed tab counts. */
  bookingNeutral: '#64748B',
} as const;

export type MkColor = keyof typeof mkColors;

/** AppSpacing. */
export const mkSpacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

/** AppTextStyles: Manrope for display, headlines, titles, labels; Source Sans 3 for body. */
export const mkFonts = {
  display: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  body: "'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  /** Google Fonts stylesheet for both families (CSP allows fonts.googleapis.com). */
  href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Source+Sans+3:wght@400;600&display=swap',
} as const;

/** AppElevations as CSS box-shadow strings. */
export const mkShadows = {
  card: '0 9px 22px -0.5px rgba(0,0,0,0.068), 0 3px 10px -1px rgba(0,0,0,0.032)',
  hero: '0 12px 26px -1px rgba(0,0,0,0.078), 0 4px 11px -0.5px rgba(0,0,0,0.036)',
  avatar: '0 5px 11px -0.5px rgba(0,0,0,0.055)',
  nested: '0 4px 12px -0.5px rgba(0,0,0,0.048)',
} as const;

/** Motion: short, ease-out, no bounce. Seconds for framer-motion. */
export const mkMotion = {
  ease: EASE_OUT,
  control: 0.18,
  sheet: 0.24,
  page: 0.3,
  /** Page enter travel in px; skipped when reduced motion is on. */
  pageTravel: 12,
} as const;

/** Minimum touch target (px). */
export const MK_TOUCH = 44;

/** CSS variables consumed by the `mk-*` Tailwind colors and fonts. */
export function marketplaceCssVars(): CSSProperties {
  const vars: Record<string, string> = {
    '--mk-font-display': mkFonts.display,
    '--mk-font-body': mkFonts.body,
    '--mk-shadow-card': mkShadows.card,
    '--mk-shadow-hero': mkShadows.hero,
    '--mk-shadow-avatar': mkShadows.avatar,
    '--mk-shadow-nested': mkShadows.nested,
  };
  for (const [key, value] of Object.entries(mkColors)) {
    vars[`--mk-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = value;
  }
  return vars as CSSProperties;
}

/** ZAR money label, e.g. `R 1 250.00`. Formats an amount the API already computed. */
export function formatZar(amount: number | string | null | undefined): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (n == null || !Number.isFinite(n)) return 'R -';
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);
}
