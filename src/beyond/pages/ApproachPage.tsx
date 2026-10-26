import BeyondFigure from '@/beyond/components/BeyondFigure';
import EnquiryLink from '@/beyond/components/EnquiryLink';
import { FounderSection, PageIntro, StepRows } from '@/beyond/components/Blocks';
import { BEYOND_CUSTOM_SOFTWARE_NOTE, BEYOND_PROCESS_HOME, PAGES, STEPS, TECH } from '@/beyond/content';
import { useBeyondPage } from '@/beyond/useBeyondPage';

export default function ApproachPage() {
  useBeyondPage(PAGES.approach);

  return (
    <>
      <section className="by-page-hero" aria-labelledby="approach-title">
        <div className="by-wrap by-page-hero-grid">
          <PageIntro
            kicker="Approach"
            title={BEYOND_PROCESS_HOME.title}
            lede={BEYOND_PROCESS_HOME.lede}
          />
          <BeyondFigure
            webpSrc="/beyond/new/approach-workshop.webp"
            alt="Collaborative website and software planning session"
            className="by-figure-page-hero by-reveal"
            loading="eager"
          />
        </div>
      </section>

      <section className="by-section" aria-labelledby="approach-steps">
        <div className="by-wrap">
          <p className="by-kicker">{BEYOND_PROCESS_HOME.kicker}</p>
          <h2 id="approach-steps" className="by-section-title">
            Demo, quote, build, launch, and care.
          </h2>
          <p className="by-section-lede by-lede">
            Five steps for a done-for-you website. Custom software projects add discovery where needed, but still
            end in a written quote before build work starts.
          </p>
          <StepRows steps={STEPS} />
          <p className="by-note">{BEYOND_CUSTOM_SOFTWARE_NOTE}</p>
        </div>
      </section>

      <section className="by-section by-section-panel" aria-labelledby="approach-tech">
        <div className="by-wrap by-section-panel-inner by-split by-split-media">
          <div className="by-reveal">
            <p className="by-kicker">Stack</p>
            <h2 id="approach-tech" className="by-section-title">
              What we build with
            </h2>
            <p className="by-lede">
              Client marketing sites standardise on Cloudflare Pages. Products that need accounts, payments, or mobile
              apps use the stack named in your proposal.
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
              We follow your professional body&apos;s advertising rules on sector sites (for example HPCSA for dental
              practices). We do not add patient testimonial widgets where rules forbid them.
            </p>
          </div>
          <BeyondFigure
            webpSrc="/beyond/new/studio-accent.webp"
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
          <h2 id="approach-start" className="by-section-title">
            Request your free demo.
          </h2>
          <p className="by-lede by-lede-on-dark">
            Send your website URL or a short brief to services@skillance.co.za.
          </p>
          <div className="by-actions">
            <EnquiryLink ctaLocation="approach" variant="light">
              Start a project
            </EnquiryLink>
          </div>
        </div>
      </section>
    </>
  );
}
