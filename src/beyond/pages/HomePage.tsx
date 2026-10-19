import { Link } from 'react-router-dom';
import EnquiryLink from '@/beyond/components/EnquiryLink';
import { OwnPlatform, SectionHead } from '@/beyond/components/Blocks';
import WorkCatalog from '@/beyond/components/WorkCatalog';
import { FAQS, PAGES, SERVICES, STEPS } from '@/beyond/content';
import { useBeyondPage } from '@/beyond/useBeyondPage';

export default function HomePage() {
  useBeyondPage({ ...PAGES.home, faqs: FAQS });

  return (
    <>
      <section aria-labelledby="beyond-hero-title">
        <div className="by-wrap by-hero">
            <div>
              <p className="by-kicker">Beyond the App</p>
              <h1 id="beyond-hero-title">Custom software, built in South Africa.</h1>
              <p className="by-lede">
                Web apps, mobile apps, business systems, and integrations, designed and built by Skillance. Customers
                book a local provider on the marketplace. This studio is where the same team builds a product for a
                client.
              </p>
              <div className="by-actions">
                <EnquiryLink ctaLocation="home_hero">Email a project enquiry</EnquiryLink>
                <Link to="/beyond/approach" className="by-btn by-btn-ghost">
                  How we work
                </Link>
              </div>
            </div>
            <ol className="by-index">
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
        <div className="by-wrap">
          <SectionHead
            id="beyond-services-title"
            kicker="Services"
            title="Four kinds of software."
            lede="Every engagement is scoped for that client. There is no public rate card."
          />
          <div>
            {SERVICES.map((service) => (
              <article key={service.id} className="by-service">
                <p className="by-num">{service.num}</p>
                <h3>{service.title}</h3>
                <p className="by-muted">{service.summary}</p>
              </article>
            ))}
          </div>
          <div className="by-actions">
            <Link to="/beyond/services" className="by-textlink">
              Service details
            </Link>
          </div>
        </div>
      </section>

      <section className="by-section" aria-labelledby="beyond-approach-title">
        <div className="by-wrap">
          <SectionHead
            id="beyond-approach-title"
            kicker="Approach"
            title="Discovery through support."
            lede="Five stages. Timing and cost are agreed for the work, not copied from a menu."
          />
          <div className="by-steps">
            {STEPS.map((step) => (
              <article key={step.num} className="by-step">
                <p className="by-num">{step.num}</p>
                <h3>{step.title}</h3>
                <p className="by-muted">{step.summary}</p>
              </article>
            ))}
          </div>
          <div className="by-actions">
            <Link to="/beyond/approach" className="by-textlink">
              The full approach
            </Link>
          </div>
        </div>
      </section>

      <OwnPlatform />

      <section className="by-section" aria-labelledby="beyond-work-title">
        <div className="by-wrap">
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
        <div className="by-wrap">
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

      <section className="by-section" aria-labelledby="beyond-start-title">
        <div className="by-wrap">
          <SectionHead
            id="beyond-start-title"
            kicker="Start"
            title="Tell us what you want to build."
            lede="The button opens an email to services@skillance.co.za. The website does not store the message."
          />
          <EnquiryLink ctaLocation="home_close">Email a project enquiry</EnquiryLink>
        </div>
      </section>
    </>
  );
}
