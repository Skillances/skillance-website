import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  categorySlugToSkIcon,
  injectSkillanceIconSvg,
  playSkillanceIcon,
} from '@/lib/skillanceIconsScript';

type SkillanceIconProps = {
  categorySlug: string;
  label: string;
  /** Use inside an existing button (home service cards). */
  decorative?: boolean;
  /** White backing plate for dark/image backgrounds (home service cards). */
  onDark?: boolean;
  className?: string;
  sizeClassName?: string;
};

export function SkillanceIcon({
  categorySlug,
  label,
  decorative = false,
  onDark = false,
  className = '',
  sizeClassName = '!w-14 !h-14',
}: SkillanceIconProps) {
  const reducedMotion = usePrefersReducedMotion();
  const iconHostRef = useRef<HTMLSpanElement>(null);
  const iconId = categorySlugToSkIcon(categorySlug);

  useEffect(() => {
    const host = iconHostRef.current;
    if (!host) return;
    let cancelled = false;
    void injectSkillanceIconSvg(host, iconId).then((ok) => {
      if (!ok || cancelled) return;
      host.removeAttribute('role');
      host.removeAttribute('tabindex');
    });
    return () => {
      cancelled = true;
    };
  }, [iconId]);

  const play = useCallback(() => {
    if (reducedMotion) return;
    playSkillanceIcon(iconHostRef.current);
  }, [reducedMotion]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      play();
    }
  };

  const iconMarkup = (
    <span
      ref={iconHostRef}
      className={`sk-icon !inline-block !max-w-none ${sizeClassName} ${decorative ? 'sk-icon-decorative pointer-events-none' : ''}`}
      aria-hidden={decorative ? true : undefined}
    />
  );

  if (decorative) {
    const plateClass = onDark
      ? 'rounded-2xl bg-white p-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.28)] ring-1 ring-white/50'
      : '';
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center ${plateClass} ${className}`}
        onMouseEnter={play}
        aria-hidden
      >
        {iconMarkup}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={`inline-flex shrink-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2BADEE] ${className}`}
      aria-label={label}
      onClick={play}
      onKeyDown={onKeyDown}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') play();
      }}
    >
      {iconMarkup}
    </button>
  );
}
