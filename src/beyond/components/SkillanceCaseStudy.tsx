import { Link } from 'react-router-dom';
import BeyondFigure from '@/beyond/components/BeyondFigure';
import { SKILLANCE_CASE_STUDY } from '@/beyond/content';

type SkillanceCaseStudyProps = {
  /** Shorter block for the home page. */
  compact?: boolean;
};

export default function SkillanceCaseStudy({ compact }: SkillanceCaseStudyProps) {
  const { title, lede, points } = SKILLANCE_CASE_STUDY;

  return (
    <article className={compact ? 'by-case-study by-case-study-compact by-reveal' : 'by-case-study by-reveal'}>
      <div className="by-case-study-copy">
        <p className="by-kicker">Built by us</p>
        <h2 className="by-case-study-title">{title}</h2>
        <p className="by-lede">{lede}</p>
        {!compact ? (
          <ul className="by-case-study-points">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        ) : null}
        <div className="by-actions">
          {compact ? (
            <Link to="/beyond/work" className="by-textlink">
              See how we built Skillance
            </Link>
          ) : (
            <Link to="/" className="by-btn by-btn-light">
              Open the marketplace
            </Link>
          )}
        </div>
      </div>
      <BeyondFigure
        jpgSrc="/beyond/platform-devices.jpg"
        alt="Skillance marketplace on web and mobile"
        className="by-figure-section"
        loading={compact ? 'lazy' : 'eager'}
      />
    </article>
  );
}
