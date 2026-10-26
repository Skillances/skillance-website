import { useCallback, useState } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipKey, setFlipKey] = useState(0);

  const selectIndex = useCallback((index: number) => {
    setActiveIndex((current) => {
      if (current === index) return current;
      setFlipKey((k) => k + 1);
      return index;
    });
  }, []);

  const step = (delta: -1 | 1) => {
    const next = (activeIndex + delta + REDESIGN_ITEMS.length) % REDESIGN_ITEMS.length;
    selectIndex(next);
  };

  const active = REDESIGN_ITEMS[activeIndex];

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
            Before / after <em>concepts</em>.
          </h2>
          <p className="by-section-lede by-redesigns-lede">
            Pick a niche, drag the slider. Illustrative mock-ups — not real client sites.
          </p>
        </div>

        <div className="by-redesigns-deck" aria-live="polite">
          <div className="by-redesigns-picker" role="tablist" aria-label="Redesign examples">
            {REDESIGN_ITEMS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                className={index === activeIndex ? 'by-redesigns-tab is-active' : 'by-redesigns-tab'}
                onClick={() => selectIndex(index)}
              >
                <span className="by-redesigns-tab-num">{item.num}</span>
                <span className="by-redesigns-tab-label">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="by-redesigns-stage">
            <button type="button" className="by-redesigns-nav by-redesigns-nav-prev" onClick={() => step(-1)}>
              Previous example
            </button>
            <div key={flipKey} className="by-redesigns-flip">
              <BeforeAfterCompare item={active} />
            </div>
            <button type="button" className="by-redesigns-nav by-redesigns-nav-next" onClick={() => step(1)}>
              Next example
            </button>
          </div>
        </div>

        <div className="by-redesigns-close">
          <p className="by-redesigns-close-title">
            Want this for your business? Start with a free demo of your own site, then a fixed quote in writing.
          </p>
          <EnquiryLink ctaLocation="home_redesigns" variant="solid">
            Start a project
          </EnquiryLink>
        </div>
      </div>
    </section>
  );
}
