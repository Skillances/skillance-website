import EnquiryLink from '@/beyond/components/EnquiryLink';
import CopyEmailButton from '@/beyond/components/CopyEmailButton';
import { PageIntro } from '@/beyond/components/Blocks';
import SkillanceCaseStudy from '@/beyond/components/SkillanceCaseStudy';
import WorkCatalog from '@/beyond/components/WorkCatalog';
import { PAGES } from '@/beyond/content';
import { useBeyondPage } from '@/beyond/useBeyondPage';

export default function WorkPage() {
  useBeyondPage(PAGES.work);

  return (
    <>
      <div className="by-wrap">
        <PageIntro
          kicker="Work"
          title="Our work"
          lede="We are a young studio, so we start with the product we know best: the Skillance marketplace we designed, built, and still run."
        />
        <SkillanceCaseStudy />
      </div>

      <section className="by-section by-section-cool" aria-labelledby="work-clients">
        <div className="by-wrap by-reveal">
          <p className="by-kicker">Clients</p>
          <h2 id="work-clients" className="by-section-title">Published client work</h2>
          <p className="by-section-lede">
            When a client engagement is ready to share publicly, it appears here.
          </p>
          <WorkCatalog />
        </div>
      </section>

      <section className="by-section" aria-labelledby="work-start">
        <div className="by-wrap">
          <h2 id="work-start" className="by-section-title">Sounds like your project?</h2>
          <p className="by-lede">
            Send us a short note about the problem. We will tell you honestly whether we are the right team.
          </p>
          <div className="by-actions">
            <EnquiryLink ctaLocation="work">Start a project</EnquiryLink>
            <CopyEmailButton ctaLocation="work" />
          </div>
        </div>
      </section>
    </>
  );
}
