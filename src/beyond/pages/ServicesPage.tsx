import BeyondFigure from '@/beyond/components/BeyondFigure';
import EnquiryLink from '@/beyond/components/EnquiryLink';
import { PageIntro } from '@/beyond/components/Blocks';
import { PAGES, SERVICES } from '@/beyond/content';
import { useBeyondPage } from '@/beyond/useBeyondPage';

export default function ServicesPage() {
  useBeyondPage(PAGES.services);

  return (
    <div className="by-wrap">
      <div className="by-page-hero-grid by-page-hero-grid-services">
        <PageIntro
          kicker="Services"
          title="What we design and build."
          lede="Four kinds of software. A project can be one of them, or several. We scope each one with you before anything is priced."
        />
        <BeyondFigure
          webpSrc="/beyond/services-hero.webp"
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
