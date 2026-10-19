import EnquiryLink from '@/beyond/components/EnquiryLink';
import { PageIntro } from '@/beyond/components/Blocks';
import { PAGES, SERVICES } from '@/beyond/content';
import { useBeyondPage } from '@/beyond/useBeyondPage';

export default function ServicesPage() {
  useBeyondPage(PAGES.services);

  return (
    <div className="by-wrap">
      <PageIntro
        kicker="Services"
        title="What we design and build."
        lede="Four kinds of software. A project can be one of them, or several. Scope, cost, and timing are agreed for that work."
      />
      {SERVICES.map((service) => (
        <article key={service.id} id={service.id} className="by-service">
          <p className="by-num">{service.num}</p>
          <h2>{service.title}</h2>
          <p>{service.body}</p>
          <ul className="by-points">
            {service.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      ))}
      <section className="by-section" aria-labelledby="services-enquiry">
        <h2 id="services-enquiry">If this is the work</h2>
        <p className="by-lede">Send a short note about the problem. We will say whether we are the right team.</p>
        <div className="by-actions">
          <EnquiryLink ctaLocation="services">Email a project enquiry</EnquiryLink>
        </div>
      </section>
    </div>
  );
}
