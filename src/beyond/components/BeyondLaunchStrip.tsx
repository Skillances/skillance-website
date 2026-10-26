import { Link } from 'react-router-dom';
import { useBeyondWork } from '@/beyond/useBeyondWork';

/** Top launch strip (matches marketing) with live published Beyond client count. */
export default function BeyondLaunchStrip() {
  const { ready, items } = useBeyondWork();
  const count = items.length;

  return (
    <div
      id="beyond-launch-strip"
      className="by-launch-strip"
      role="region"
      aria-label="Skillance launch and Beyond client count"
    >
      <Link to="/beyond/work" className="by-launch-strip-inner">
        <span className="by-launch-strip-kicker">Launch:</span>
        <span className="by-launch-strip-main">To be announced</span>
        <span className="by-launch-strip-divider" aria-hidden="true" />
        <span className="by-launch-strip-count">
          {ready
            ? count > 0
              ? `${count} published client${count === 1 ? '' : 's'} on Beyond`
              : 'Beyond portfolio growing'
            : 'Loading studio portfolio'}
        </span>
      </Link>
    </div>
  );
}
