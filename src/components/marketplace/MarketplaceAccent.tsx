import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ColorOrb } from '@/components/ui/ai-input';
import { cn } from '@/lib/utils';

export const MARKETPLACE_ACCENT_GRADIENT =
  'linear-gradient(90deg, oklch(75% 0.18 25), oklch(80% 0.12 200), oklch(78% 0.14 280))';

export const MARKETPLACE_ORB_TONES = {
  base: 'oklch(22.64% 0 0)',
  accent1: 'oklch(75% 0.18 25)',
  accent2: 'oklch(80% 0.12 200)',
  accent3: 'oklch(78% 0.14 280)',
} as const;

const gradientTextStyle = { backgroundImage: MARKETPLACE_ACCENT_GRADIENT };

type GradientTextProps = {
  children: ReactNode;
  className?: string;
};

export function MarketplaceGradientText({ children, className }: GradientTextProps) {
  return (
    <span
      className={cn('bg-clip-text text-transparent', className)}
      style={gradientTextStyle}
    >
      {children}
    </span>
  );
}

export type MarketplaceNavTheme = {
  surface: 'light' | 'dark';
  mutedClass: string;
  hoverClass: string;
  underlineClass: string;
};

type MarketplaceNewMarkProps = {
  variant: 'nav' | 'badge';
  /** Matches primary nav link colours while scrolling. */
  navTheme?: MarketplaceNavTheme;
  className?: string;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type' | 'aria-label'>;

/** Accent “New” mark — gradient frame + orb, not a generic pill. */
export function MarketplaceNewMark({
  variant,
  navTheme,
  className,
  onClick,
  type = 'button',
  'aria-label': ariaLabel = 'Skillance Marketplace — new',
}: MarketplaceNewMarkProps) {
  if (variant === 'nav') {
    const surface = navTheme?.surface ?? 'light';
    const marketplaceLabel = navTheme?.mutedClass ?? 'text-neutral-600';
    const marketplaceHover = navTheme?.hoverClass ?? 'hover:text-black';
    const underline = navTheme?.underlineClass ?? 'bg-black';
    const separatorMuted =
      surface === 'dark' ? 'text-white/45 group-hover:text-white/65' : 'text-neutral-400 group-hover:text-neutral-600';

    return (
      <button
        type={type}
        onClick={onClick}
        aria-label={ariaLabel}
        className={cn(
          'group relative inline-flex items-baseline gap-1.5 text-sm font-medium',
          'transition-colors duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          surface === 'dark'
            ? 'focus-visible:ring-white/30 focus-visible:ring-offset-transparent'
            : 'focus-visible:ring-black/20 focus-visible:ring-offset-white',
          className
        )}
      >
        <MarketplaceGradientText className="text-[10px] font-semibold uppercase tracking-[0.22em]">
          New
        </MarketplaceGradientText>
        <span
          className={cn('text-[10px] font-medium select-none transition-colors duration-300', separatorMuted)}
          aria-hidden
        >
          -
        </span>
        <span className={cn('transition-colors duration-300', marketplaceLabel, marketplaceHover)}>
          Marketplace
        </span>
        <span
          className={cn(
            'absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full',
            underline
          )}
        />
      </button>
    );
  }

  return (
    <span
      className={cn('inline-flex shrink-0 rounded-md p-px', className)}
      style={gradientTextStyle}
      aria-hidden
    >
      <span className="inline-flex items-center gap-2 rounded-[5px] bg-neutral-950 px-2.5 py-1.5">
        <ColorOrb dimension="15px" tones={MARKETPLACE_ORB_TONES} spinDuration={14} />
        <MarketplaceGradientText className="text-[10px] font-semibold uppercase tracking-[0.3em]">
          New
        </MarketplaceGradientText>
      </span>
    </span>
  );
}
