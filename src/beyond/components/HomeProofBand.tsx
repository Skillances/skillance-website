import { Link } from 'react-router-dom';
import {
  BEYOND_PROOF_IMAGES,
  HOME_STORY,
  MARKETPLACE_ENTRY,
  SKILLANCE_CASE_STUDY,
} from '@/beyond/content';

export function HomeProofStory() {
  const { kicker, title, lead, body } = HOME_STORY;
  const base = BEYOND_PROOF_IMAGES.homeStory;
  const float = BEYOND_PROOF_IMAGES.homeStoryAccent;

  return (
    <section className="by-section by-section-proof-story" aria-labelledby="beyond-story-title">
      <div className="by-wrap by-story-editorial by-reveal">
        <div className="by-story-editorial-grid">
          <div className="by-story-editorial-heading">
            <p className="by-story-eyebrow">{kicker}</p>
            <h2 id="beyond-story-title" className="by-story-editorial-title">
              {title}
            </h2>
          </div>

          <div className="by-story-layered-media">
            <figure className="by-story-layer by-story-layer-base">
              <img
                src={base.jpgSrc}
                alt=""
                loading="lazy"
                decoding="async"
                width={1600}
                height={1067}
                className="by-story-layer-img"
              />
            </figure>
            <figure className="by-story-layer by-story-layer-float">
              <img
                src={float.jpgSrc}
                alt={float.alt}
                loading="lazy"
                decoding="async"
                width={1600}
                height={1067}
                className="by-story-layer-img by-story-layer-img-float"
              />
            </figure>
          </div>

          <div className="by-story-editorial-prose">
            <p className="by-story-lead">{lead}</p>
            {body ? <p className="by-story-body">{body}</p> : null}
          </div>

          <p className="by-story-cta-wrap">
            <Link to={MARKETPLACE_ENTRY.href} className="by-link-bronze">
              {MARKETPLACE_ENTRY.label}
              <span className="by-link-bronze-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

const MARKET_LIST = [
  { num: '01', title: 'Customers', key: 'customers' as const },
  { num: '02', title: 'Freelancers', key: 'freelancers' as const },
  { num: '03', title: 'Same team', key: 'team' as const },
] as const;

export function HomeProofMarketplace() {
  const { title, lede, points, stackLine, marketplaceCta } = SKILLANCE_CASE_STUDY;
  const visual = BEYOND_PROOF_IMAGES.marketplaceCaseStudy;
  const descriptions = points;

  return (
    <section
      className="by-section by-section-proof-market"
      aria-labelledby="beyond-case-title"
    >
      <div className="by-wrap">
        <div className="by-market-editorial">
          <div className="by-market-editorial-intro">
            <p className="by-kicker by-kicker-on-dark by-market-eyebrow">Built by us</p>
            <h2 id="beyond-case-title" className="by-market-title">
              {title}
            </h2>
            <p className="by-market-subhead">{lede}</p>
          </div>

          <figure className="by-market-editorial-visual">
            <picture>
              <source type="image/webp" srcSet={visual.webpSrc} />
              <img
                src={visual.jpgSrc}
                alt={visual.alt}
                loading="lazy"
                decoding="async"
                width={visual.width}
                height={visual.height}
                className="by-market-editorial-img"
                sizes="(min-width: 720px) 58vw, 100vw"
              />
            </picture>
          </figure>

          <div className="by-market-editorial-body">
            <ol className="by-market-list" aria-label="How the marketplace works">
              {MARKET_LIST.map((item, index) => (
                <li key={item.key} className="by-market-list-item">
                  <span className="by-market-list-num" aria-hidden="true">
                    {item.num}
                  </span>
                  <div className="by-market-list-body">
                    <h3 className="by-market-list-title">{item.title}</h3>
                    <p className="by-market-list-desc">{descriptions[index]}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="by-market-stack-line">{stackLine}</p>

            <div className="by-market-actions">
              <Link to={marketplaceCta.href} className="by-btn by-btn-cream">
                {marketplaceCta.label}
              </Link>
              <Link to="/beyond/work" className="by-link-on-dark by-market-secondary-link">
                How we built it
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
