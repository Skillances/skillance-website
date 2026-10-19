import BeyondFigure from '@/beyond/components/BeyondFigure';
import EnquiryLink from '@/beyond/components/EnquiryLink';
import { PageIntro, TeamSoon } from '@/beyond/components/Blocks';
import { PAGES, STEPS, TECH } from '@/beyond/content';
import { useBeyondPage } from '@/beyond/useBeyondPage';

export default function ApproachPage() {
  useBeyondPage(PAGES.approach);

  return (
    <div className="by-wrap">
      <PageIntro
        kicker="Approach"
        title="How a project actually runs."
        lede="Discovery, design, build, launch, and support. We do not publish a standard timeline or a price list."
      />
      <div className="by-wrap by-band-offset">
        <BeyondFigure
          webpSrc="/beyond/approach.webp"
          alt="Team collaborating on a software project"
          className="by-figure-inline by-reveal"
        />
      </div>

      <section className="by-section" aria-labelledby="approach-steps">
        <h2 id="approach-steps" className="by-sr">
          Stages
        </h2>
        {STEPS.map((step) => (
          <article key={step.num} className="by-step">
            <p className="by-num">{step.num}</p>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </section>

      <section className="by-section" aria-labelledby="approach-tech">
        <p className="by-kicker">Stack</p>
        <h2 id="approach-tech">What we can name today.</h2>
        <p className="by-lede">
          These are the tools already public in the Skillance platform, which we built. A new project uses the stack
          that fits that problem.
        </p>
        <div className="by-tech">
          {TECH.map((item) => (
            <article key={item.name}>
              <h3>{item.name}</h3>
              <p className="by-muted">{item.note}</p>
            </article>
          ))}
        </div>
        {/* TODO(beyond): Publish a fuller tool list only after Markus confirms what should be named. */}
        <div className="by-placeholder-block">
          <p className="by-flag">Placeholder</p>
          <p className="by-placeholder">
            Hosting, backend, payments, and partner tools are not listed yet. They will be added here when they are
            confirmed for publication.
          </p>
        </div>
      </section>

      <section className="by-section" aria-labelledby="approach-team">
        <p className="by-kicker">Team</p>
        <TeamSoon headingId="approach-team" />
      </section>

      <section className="by-section" aria-labelledby="approach-start">
        <h2 id="approach-start">Bring the problem, not a specification.</h2>
        <p className="by-lede">
          The first email only needs what you want to build and who it is for. A form on this site would need a backend
          and a POPIA notice before it could collect that.
        </p>
        <div className="by-actions">
          <EnquiryLink ctaLocation="approach">Email a project enquiry</EnquiryLink>
        </div>
      </section>
    </div>
  );
}
