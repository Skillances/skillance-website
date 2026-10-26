import { Link } from 'react-router-dom';
import BeyondFigure from '@/beyond/components/BeyondFigure';
import { FOUNDER, OWN_PLATFORM } from '@/beyond/content';

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
      {lede ? <p className="by-section-lede">{lede}</p> : null}
    </div>
  );
}

export function StepRows({
  steps,
}: {
  steps: readonly { num: string; title: string; body: string; iconSrc?: string }[];
}) {
  return (
    <div className="by-step-rows">
      {steps.map((step) => (
        <article key={step.num} className="by-step-row by-reveal">
          {step.iconSrc ? (
            <img
              src={step.iconSrc}
              alt=""
              width={56}
              height={56}
              className="by-step-row-icon"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <p className="by-step-row-num">{step.num}</p>
          )}
          <h3 className="by-step-row-title">{step.title}</h3>
          <p className="by-muted by-step-row-body">{step.body}</p>
        </article>
      ))}
    </div>
  );
}

export function FounderSection({ headingId }: { headingId?: string }) {
  return (
    <aside className="by-founder by-reveal" aria-labelledby={headingId}>
      <p className="by-kicker">{FOUNDER.kicker}</p>
      <h2 id={headingId}>{FOUNDER.title}</h2>
      <p>{FOUNDER.body}</p>
    </aside>
  );
}

export function OwnPlatform({ showWorkLink = true }: { showWorkLink?: boolean }) {
  return (
    <section className="by-section by-section-invert" aria-labelledby="beyond-own-platform-title">
      <div className="by-wrap by-split by-split-band">
        <div className="by-band-copy by-reveal">
          <p className="by-kicker">{OWN_PLATFORM.kicker}</p>
          <h2 id="beyond-own-platform-title">{OWN_PLATFORM.title}</h2>
          <p>{OWN_PLATFORM.body}</p>
          <div className="by-actions">
            {showWorkLink ? (
              <Link to="/beyond/work" className="by-btn by-btn-light">
                How we built Skillance
              </Link>
            ) : null}
            <Link to="/" className="by-btn by-btn-on-dark">
              Open the marketplace
            </Link>
          </div>
        </div>
        <BeyondFigure
          jpgSrc="/beyond/platform-devices.jpg"
          alt="Skillance marketplace on web and mobile"
          className="by-figure-band by-figure-on-dark by-reveal"
        />
      </div>
    </section>
  );
}
