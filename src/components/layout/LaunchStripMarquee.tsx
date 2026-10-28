import { useLaunchStripMobileMarquee } from './useLaunchStripMobileMarquee';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import './launchStripMarquee.css';

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
