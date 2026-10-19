import EnquiryLink from '@/beyond/components/EnquiryLink';
import { OwnPlatform, PageIntro } from '@/beyond/components/Blocks';
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
          title="Clients and portfolio."
          lede="These pieces come from the Skillance admin. A name, image, short description, link, and tags appear here only after the item is published."
        />
        <WorkCatalog />
      </div>
      <div className="by-band-offset">
        <OwnPlatform showWorkLink={false} />
      </div>
      <section className="by-section" aria-labelledby="work-start">
        <div className="by-wrap">
          <h2 id="work-start">Have something of your own to build?</h2>
          <p className="by-lede">Write to us. We will tell you if it is work we should take.</p>
          <div className="by-actions">
            <EnquiryLink ctaLocation="work">Email a project enquiry</EnquiryLink>
          </div>
        </div>
      </section>
    </>
  );
}
