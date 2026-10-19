import { Link } from 'react-router-dom';
import BeyondFigure from '@/beyond/components/BeyondFigure';
import BeyondHero from '@/beyond/components/BeyondHero';
import EnquiryLink from '@/beyond/components/EnquiryLink';
import { OwnPlatform, SectionHead, StepRows } from '@/beyond/components/Blocks';
import WorkCatalog from '@/beyond/components/WorkCatalog';
import { FAQS, PAGES, SERVICES, STEPS } from '@/beyond/content';
import { useBeyondPage } from '@/beyond/useBeyondPage';

export default function HomePage() {
  useBeyondPage({ ...PAGES.home, faqs: FAQS });

  const stepRows = STEPS.map((step) => ({
    num: step.num,
    title: step.title,
    body: step.summary,
  }));

  return (
    <>
      <BeyondHero titleId="beyond-hero-title" />

      <section className="by-section by-section-cool by-section-services-index" aria-label="What we build">
        <div className="by-wrap">
          <ol className="by-index by-index-columns by-reveal">
            {SERVICES.map((service) => (
              <li key={service.id}>
                <Link to={`/beyond/services#${service.id}`}>
                  <span className="by-num">{service.num}</span>
                  <span>
                    <span className="by-index-title">{service.title}</span>
                    <span className="by-index-sum">{service.hero}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="by-section" aria-labelledby="beyond-services-title">
        <div className="by-wrap by-split by-split-media">
          <div className="by-reveal">
            <SectionHead
              id="beyond-services-title"
              kicker="Services"
              title="Four kinds of software."
              lede="SaaS, mobile, internal systems, and cloud integrations. Every engagement is scoped for that client; there is no public rate card."
            />
            <ul className="by-detail-list">
              {SERVICES.map((service) => (
                <li key={service.id}>
                  <span className="by-detail-num">{service.num}</span>
                  <span>
                    <strong className="by-detail-title">{service.title}</strong>
                    <span className="by-muted">{service.summary}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="by-actions">
              <Link to="/beyond/services" className="by-textlink">
                Service details
              </Link>
            </div>
          </div>
          <BeyondFigure
            webpSrc="/beyond/services.webp"
            alt="Professional services and custom software planning"
            className="by-figure-section by-reveal"
          />
        </div>
      </section>

      <section className="by-section by-section-cool" aria-labelledby="beyond-approach-title">
        <div className="by-wrap by-split by-split-media by-split-media-reverse">
          <BeyondFigure
            jpgSrc="/beyond/platform-devices.jpg"
            alt="Abstract product screens on laptop and phone"
            className="by-figure-section by-reveal"
          />
          <div className="by-reveal">
            <SectionHead
              id="beyond-approach-title"
              kicker="Approach"
              title="Discovery through support."
              lede="Five stages. Timing and cost are agreed for the work, not copied from a menu."
            />
            <StepRows steps={stepRows} />
            <div className="by-actions">
              <Link to="/beyond/approach" className="by-textlink">
                The full approach
              </Link>
            </div>
          </div>
        </div>
      </section>

      <OwnPlatform />

      <section className="by-section" aria-labelledby="beyond-work-title">
        <div className="by-wrap by-reveal">
          <SectionHead
            id="beyond-work-title"
            kicker="Work"
            title="What we can show."
            lede="Published clients and portfolio pieces. The list stays empty until an admin publishes one."
          />
          <WorkCatalog limit={3} />
          <div className="by-actions">
            <Link to="/beyond/work" className="by-textlink">
              Work page
            </Link>
          </div>
        </div>
      </section>

      <section className="by-section" aria-labelledby="beyond-faq-title">
        <div className="by-wrap by-reveal">
          <SectionHead id="beyond-faq-title" kicker="Questions" title="Before you write." />
          <div className="by-faq">
            {FAQS.map((faq) => (
              <details key={faq.question} name="beyond-faq">
                <summary>
                  <h3>{faq.question}</h3>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="by-section by-section-cta" aria-labelledby="beyond-start-title">
        <div className="by-wrap by-section-cta-inner by-reveal">
          <SectionHead
            id="beyond-start-title"
            kicker="Start"
            title="Tell us what you want to build."
            lede="The button opens an email to services@skillance.co.za. The website does not store the message."
          />
          <EnquiryLink ctaLocation="home_close" variant="solid">
            Email a project enquiry
          </EnquiryLink>
        </div>
      </section>
    </>
  );
}
