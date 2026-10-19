import BeyondFigure from '@/beyond/components/BeyondFigure';
import EnquiryLink from '@/beyond/components/EnquiryLink';
import { FounderSection, PageIntro, StepRows } from '@/beyond/components/Blocks';
import { PAGES, STEPS, TECH } from '@/beyond/content';
import { useBeyondPage } from '@/beyond/useBeyondPage';

export default function ApproachPage() {
  useBeyondPage(PAGES.approach);

  return (
    <>
      <section className="by-page-hero" aria-labelledby="approach-title">
        <div className="by-wrap by-page-hero-grid">
          <PageIntro
            kicker="Approach"
            title="How a project actually runs."
            lede="Discovery, design, build, launch, and support. Timing and cost are agreed for your project."
          />
          <BeyondFigure
            webpSrc="/beyond/approach-workshop.webp"
            alt="Collaborative software discovery session"
            className="by-figure-page-hero by-reveal"
            loading="eager"
          />
        </div>
      </section>

      <section className="by-section" aria-labelledby="approach-steps">
        <div className="by-wrap">
          <p className="by-kicker">Stages</p>
          <h2 id="approach-steps" className="by-section-title">From first conversation to launch.</h2>
          <p className="by-section-lede by-lede">
            Five stages, agreed for your project. You always know what we are doing now and what comes next.
          </p>
          <StepRows steps={STEPS} />
        </div>
      </section>

      <section className="by-section by-section-panel" aria-labelledby="approach-tech">
        <div className="by-wrap by-section-panel-inner by-split by-split-media">
          <div className="by-reveal">
            <p className="by-kicker">Stack</p>
            <h2 id="approach-tech" className="by-section-title">What we build with</h2>
            <p className="by-lede">
              These are the tools already public in the Skillance platform, which we built. A new project uses the stack
              that fits that problem.
            </p>
            <div className="by-tech-grid">
              {TECH.map((item) => (
                <article key={item.name}>
                  <h3>{item.name}</h3>
                  <p className="by-muted">{item.note}</p>
                </article>
              ))}
            </div>
            <p className="by-note by-note-panel">
              Hosting, payments, messaging, and partner integrations are scoped per project and named in the proposal
              when they are part of the work.
            </p>
          </div>
          <BeyondFigure
            webpSrc="/beyond/studio-accent.webp"
            alt="Software engineering workspace"
            className="by-figure-section by-reveal"
          />
        </div>
      </section>

      <section className="by-section" aria-labelledby="approach-team">
        <div className="by-wrap">
          <FounderSection headingId="approach-team" />
        </div>
      </section>

      <section className="by-section by-section-close" aria-labelledby="approach-start">
        <div className="by-wrap by-section-close-inner by-reveal">
          <p className="by-kicker">Start</p>
          <h2 id="approach-start" className="by-section-title">Bring the problem, not a specification.</h2>
          <p className="by-lede by-lede-on-dark">
            The first email only needs what you want to build and who it is for.
          </p>
          <div className="by-actions">
            <EnquiryLink ctaLocation="approach" variant="light">Start a project</EnquiryLink>
          </div>
        </div>
      </section>
    </>
  );
}
