import { Link } from 'react-router-dom';
import { OWN_PLATFORM } from '@/beyond/content';

export function PageIntro({ kicker, title, lede }: { kicker: string; title: string; lede: string }) {
  return (
    <div className="by-intro">
      <p className="by-kicker">{kicker}</p>
      <h1>{title}</h1>
      <p className="by-lede">{lede}</p>
    </div>
  );
}

export function SectionHead({ kicker, title, lede, id }: { kicker: string; title: string; lede?: string; id: string }) {
  return (
    <div className="by-section-head">
      <p className="by-kicker">{kicker}</p>
      <h2 id={id}>{title}</h2>
      {lede ? <p>{lede}</p> : null}
    </div>
  );
}

/** TODO(beyond): Add names, roles, and photos only when Markus supplies them. */
export function TeamSoon({ headingId }: { headingId?: string }) {
  return (
    <aside className="by-soon" aria-label="Team profiles coming soon">
      <p className="by-flag">Coming soon</p>
      <h2 id={headingId}>Team profiles coming soon</h2>
      <p>The work is done by the Skillance team. Names, roles, and photos are not published here yet.</p>
    </aside>
  );
}

export function OwnPlatform({ showWorkLink = true }: { showWorkLink?: boolean }) {
  return (
    <div className="by-band">
      <div className="by-wrap by-band-inner">
        <p className="by-kicker">{OWN_PLATFORM.kicker}</p>
        <h2>{OWN_PLATFORM.title}</h2>
        <p>{OWN_PLATFORM.body}</p>
        <div className="by-actions">
          {showWorkLink ? (
            <Link to="/beyond/work" className="by-btn by-btn-light">
              Read about the platform
            </Link>
          ) : null}
          <Link to="/" className="by-btn by-btn-on-dark">
            Open the marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
