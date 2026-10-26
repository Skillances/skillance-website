import { Link } from 'react-router-dom';
import { BEYOND_EMAIL, BEYOND_FOOTER_TAGLINE, NAV, SOCIAL } from '@/beyond/content';
import { beyondFooterDisclosureBlock } from '@/constants/beyondLegal';
import EnquiryLink from '@/beyond/components/EnquiryLink';

export default function StudioFooter() {
  return (
    <footer className="by-footer">
      <div className="by-wrap">
        <div className="by-footer-shell">
          <div className="by-footer-top">
            <div className="by-footer-brand">
              <Link to="/beyond" className="by-brand by-brand-on-dark" aria-label="Skillance Beyond the App, overview">
                <img src="/skillance-tiny-logo-white.webp" alt="" width={120} height={24} decoding="async" loading="lazy" />
                <span className="by-brand-name">Skillance</span>
                <span className="by-brand-rule" aria-hidden="true" />
                <span className="by-brand-beyond">Beyond</span>
              </Link>
              <p className="by-footer-lede">{BEYOND_FOOTER_TAGLINE}</p>
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
                <li>
                  <Link to="/beyond/terms">Beyond service terms</Link>
                </li>
                <li>
                  <Link to="/paia-manual">PAIA manual</Link>
                </li>
                <li>
                  <Link to="/beyond/data-processing">Client data processing</Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="by-footer-legal">
            <p className="by-footer-legal-ect">{beyondFooterDisclosureBlock()}</p>
            <p className="by-footer-legal-note">
              Marketplace terms cover bookings on the platform. Custom software and websites are agreed per project under
              Beyond service terms.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
