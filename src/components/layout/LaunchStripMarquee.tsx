import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import './launchStripMarquee.css';

export const LAUNCH_STRIP_MOBILE_MARQUEE_QUERY = '(max-width: 767px)';

export function useLaunchStripMobileMarquee(): boolean {
  const [mobileMarquee, setMobileMarquee] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(LAUNCH_STRIP_MOBILE_MARQUEE_QUERY);
    const update = () => setMobileMarquee(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return mobileMarquee;
}

type LaunchStripMarqueeProps = {
  text: string;
  className?: string;
};

/** Horizontal ticker for narrow viewports (right-to-left scroll). */
export default function LaunchStripMarquee({ text, className = '' }: LaunchStripMarqueeProps) {
  const reducedMotion = usePrefersReducedMotion();
  const mobileMarquee = useLaunchStripMobileMarquee();

  if (!mobileMarquee || reducedMotion) {
    return (
      <span className={`block w-full truncate text-center ${className}`.trim()}>{text}</span>
    );
  }

  return (
    <span className={`launch-strip-marquee ${className}`.trim()}>
      <span className="launch-strip-marquee-track">
        <span>{text}</span>
        <span aria-hidden="true">{text}</span>
      </span>
    </span>
  );
}
