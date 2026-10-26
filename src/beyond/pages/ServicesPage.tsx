import BeyondFigure from '@/beyond/components/BeyondFigure';
import EnquiryLink from '@/beyond/components/EnquiryLink';
import { PageIntro } from '@/beyond/components/Blocks';
import { PAGES, SERVICES, WEBSITE_SECTOR_COMPLIANCE } from '@/beyond/content';
import { useBeyondPage } from '@/beyond/useBeyondPage';

export default function ServicesPage() {
  useBeyondPage(PAGES.services);

  return (
    <div className="by-wrap">
      <div className="by-page-hero-grid by-page-hero-grid-services">
        <PageIntro
          kicker="What we build"
          title="Websites first — custom software when you need it."
          lede="Small-business website rebuilds start with a free demo and a fixed quote. SaaS, mobile apps, and systems get a written proposal after discovery."
        />
        <BeyondFigure
          webpSrc="/beyond/new/services-hero.webp"
          alt="Planning custom software services"
          className="by-figure-page-hero by-reveal"
          loading="eager"
        />
      </div>

      <nav className="by-service-jump by-reveal" aria-label="Jump to a service">
        {SERVICES.map((service) => (
          <a key={service.id} href={`#${service.id}`} className="by-service-jump-link">
            {service.title}
          </a>
        ))}
      </nav>

      {SERVICES.map((service) => (
        <article key={service.id} id={service.id} className="by-service by-reveal">
          {service.imageWebp ? (
            <BeyondFigure
              webpSrc={service.imageWebp}
              alt={`${service.title} illustration`}
              className="by-figure-service-card"
              loading="lazy"
            />
          ) : null}
          <p className="by-num">{service.num}</p>
          <h2 className="by-section-title by-section-title-sm">{service.title}</h2>
          <p>{service.body}</p>
          <p className="by-service-questions-label">Questions we will ask you</p>
          <ul className="by-detail-list">
            {service.points.map((point, index) => (
              <li key={point}>
                <span className="by-detail-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          {service.id === 'websites' ? (
            <aside className="by-sector-compliance" aria-labelledby={`${service.id}-compliance`}>
              <h3 id={`${service.id}-compliance`} className="by-sector-compliance-title">
                {WEBSITE_SECTOR_COMPLIANCE.title}
              </h3>
              <p>{WEBSITE_SECTOR_COMPLIANCE.body}</p>
            </aside>
          ) : null}
        </article>
      ))}
      <section className="by-section" aria-labelledby="services-enquiry">
        <h2 id="services-enquiry" className="by-section-title">Sounds like your project?</h2>
        <p className="by-lede">Send us a short note about the problem. We will tell you honestly whether we are the right team.</p>
        <div className="by-actions">
          <EnquiryLink ctaLocation="services">Start a project</EnquiryLink>
        </div>
      </section>
    </div>
  );
}
