import { Link } from 'react-router-dom';
import { BEYOND_ATTENTION_BANNER } from '@/beyond/content';

export default function BeyondAttentionBanner() {
  const { message, href, linkLabel } = BEYOND_ATTENTION_BANNER;

  return (
    <div id="beyond-attention-banner" className="by-attention-banner" role="region" aria-label="Beyond the App notice">
      <div className="by-attention-banner-inner">
        <p className="by-attention-banner-text">
          <span className="by-attention-banner-message">{message}</span>
        </p>
        <Link to={href} className="by-attention-banner-link">
          {linkLabel}
        </Link>
      </div>
    </div>
  );
}
