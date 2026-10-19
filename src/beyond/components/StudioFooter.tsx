import { Link } from 'react-router-dom';
import { BEYOND_EMAIL, NAV, SOCIAL } from '@/beyond/content';
import {
  CORPORATE_LEGAL_ADDRESS_ONE_LINE,
  CORPORATE_OWNERSHIP_SENTENCE,
} from '@/constants/corporate';
import EnquiryLink from '@/beyond/components/EnquiryLink';

export default function StudioFooter() {
  return (
    <footer className="by-footer">
      <div className="by-wrap">
        <div className="by-footer-shell">
          <div className="by-footer-top">
            <div className="by-footer-brand">
              <Link to="/beyond" className="by-brand by-brand-on-dark" aria-label="Skillance Beyond the App, overview">
                <img src="/skillance-tiny-logo-white.png" alt="" width={120} height={24} />
                <span className="by-brand-name">Skillance</span>
                <span className="by-brand-rule" aria-hidden="true" />
                <span className="by-brand-beyond">Beyond</span>
              </Link>
              <p className="by-footer-lede">
                SaaS, cloud systems, and custom software from the team behind the Skillance marketplace.
              </p>
              <div className="by-footer-cta">
                <EnquiryLink ctaLocation="footer" variant="light">
                  Start a project
                </EnquiryLink>
              </div>
              <p className="by-footer-email">
                <a href={`mailto:${BEYOND_EMAIL}`}>{BEYOND_EMAIL}</a>
              </p>
            </div>

            <nav className="by-footer-col" aria-label="Beyond pages">
              <h2 className="by-footer-heading">Explore</h2>
              <ul>
                {NAV.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="by-footer-col" aria-label="Skillance elsewhere">
              <h2 className="by-footer-heading">Connect</h2>
              <ul>
                <li>
                  <Link to="/">Skillance marketplace</Link>
                </li>
                {SOCIAL.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="by-footer-col" aria-label="Policies">
              <h2 className="by-footer-heading">Legal</h2>
              <ul>
                <li>
                  <Link to="/privacy-policy">Privacy policy</Link>
                </li>
                <li>
                  <Link to="/cookie-policy">Cookie policy</Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="by-footer-legal">
            <p>{CORPORATE_OWNERSHIP_SENTENCE}</p>
            <p>Registered office: {CORPORATE_LEGAL_ADDRESS_ONE_LINE}</p>
            <p className="by-footer-legal-note">
              Marketplace terms cover bookings on the platform. Custom software is agreed per project.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
