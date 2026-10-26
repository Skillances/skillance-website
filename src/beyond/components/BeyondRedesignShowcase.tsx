import BeforeAfterCompare, { type BeforeAfterItem } from '@/beyond/components/BeforeAfterCompare';
import EnquiryLink from '@/beyond/components/EnquiryLink';

const REDESIGN_ITEMS: readonly BeforeAfterItem[] = [
  {
    id: 'example-1',
    num: '01',
    label: 'Plumber',
    caption:
      'An older page rebuilt around one job: getting an emergency call. Phone button above the fold on every screen size.',
    afterAlt: 'Concept redesign of a plumbing website (after)',
    beforeAlt: 'Illustrative generic template plumbing website mock-up (before)',
  },
  {
    id: 'example-2',
    num: '02',
    label: 'Electrical & plumbing',
    caption: 'Concept: a bold, fast single page for electrical and plumbing call-outs.',
    afterAlt: 'Concept redesign of an electrical and plumbing website (after)',
    beforeAlt: 'Illustrative generic template trades website mock-up (before)',
  },
  {
    id: 'example-3',
    num: '03',
    label: 'Plumber',
    caption:
      'From a dark hero with stacked icons to a clear service grid, a side rail with the number and a WhatsApp link.',
    afterAlt: 'Concept redesign of a plumbing website (after)',
    beforeAlt: 'Illustrative generic template plumbing website mock-up (before)',
  },
  {
    id: 'example-4',
    num: '04',
    label: 'Dental practice',
    caption:
      'Three practice locations made obvious from the first screen, each with its own call button.',
    afterAlt: 'Concept redesign of a dental practice website (after)',
    beforeAlt: 'Illustrative generic template dental practice website mock-up (before)',
  },
  {
    id: 'example-5',
    num: '05',
    label: 'Self-catering',
    caption:
      'The view does the selling. Direct-booking panel and rates in view, instead of a broken image and a block of text.',
    afterAlt: 'Concept redesign of a self-catering stay website (after)',
    beforeAlt: 'Illustrative generic template guest-house website mock-up (before)',
  },
];

export default function BeyondRedesignShowcase() {
  return (
    <section
      id="redesigns"
      className="by-section by-section-redesigns"
      aria-labelledby="beyond-redesigns-title"
    >
      <div className="by-wrap by-reveal">
        <div className="by-section-head">
          <p className="by-kicker">Website redesigns</p>
          <h2 id="beyond-redesigns-title">
            What a <em>proper</em> website could look like.
          </h2>
          <p className="by-section-lede">
            We sketched concept redesigns for a few common small-business niches — plumbers, a dental practice,
            self-catering — each built around what their customers need to do first. These are not client projects;
            names and details are anonymised. Drag the slider, or use arrow keys, to compare.
          </p>
        </div>
        <p className="by-redesigns-disclaimer">
          Concept work only: &ldquo;after&rdquo; screens are our redesign ideas; &ldquo;before&rdquo; sides are
          generic illustrative mock-ups, not real client sites.
        </p>

        <ul className="by-redesigns-list" role="list">
          {REDESIGN_ITEMS.map((item) => (
            <li key={item.id}>
              <BeforeAfterCompare item={item} />
            </li>
          ))}
        </ul>

        <div className="by-redesigns-close">
          <p className="by-redesigns-close-title">Want this for your business? We scope it with you before anything is priced.</p>
          <EnquiryLink ctaLocation="home_redesigns" variant="solid">
            Start a project
          </EnquiryLink>
        </div>
      </div>
    </section>
  );
}
