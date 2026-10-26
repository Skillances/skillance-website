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
  className?: string;
  sizeClassName?: string;
};

export function SkillanceIcon({
  categorySlug,
  label,
  decorative = false,
  className = '',
  sizeClassName = 'w-14 h-14',
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
      className={`sk-icon block ${sizeClassName} ${decorative ? 'pointer-events-none' : ''}`}
      aria-hidden={decorative ? true : undefined}
    />
  );

  if (decorative) {
    return (
      <span
        className={`inline-flex shrink-0 ${className}`}
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
