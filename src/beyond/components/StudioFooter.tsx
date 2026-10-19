import { Link } from 'react-router-dom';
import { NAV, SOCIAL } from '@/beyond/content';
import {
  CORPORATE_LEGAL_ADDRESS_ONE_LINE,
  CORPORATE_OWNERSHIP_SENTENCE,
} from '@/constants/corporate';
import EnquiryLink from '@/beyond/components/EnquiryLink';

export default function StudioFooter() {
  return (
    <footer className="by-footer">
      <div className="by-wrap">
        <div className="by-footer-grid">
          <div>
            <Link to="/beyond" className="by-brand" aria-label="Skillance Beyond the App, overview">
              <img src="/skillance-tiny-logo-black.png" alt="" width={120} height={24} />
              <span className="by-brand-name">Skillance</span>
              <span className="by-brand-rule" aria-hidden="true" />
              <span className="by-brand-beyond">Beyond</span>
            </Link>
            <p className="by-note">Custom software from the team behind the Skillance marketplace.</p>
          </div>
          <div>
            <h2>Section</h2>
            <ul>
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Elsewhere</h2>
            <ul>
              <li>
                <Link to="/">Skillance marketplace</Link>
              </li>
              <li>
                <EnquiryLink ctaLocation="footer" variant="text">
                  Email a project enquiry
                </EnquiryLink>
              </li>
              {SOCIAL.map((item) => (
                <li key={item.label}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Policies</h2>
            <ul>
              <li>
                <Link to="/privacy-policy">Privacy policy</Link>
              </li>
              <li>
                <Link to="/cookie-policy">Cookie policy</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="by-footer-legal">
          <p>{CORPORATE_OWNERSHIP_SENTENCE}</p>
          <p>Registered office: {CORPORATE_LEGAL_ADDRESS_ONE_LINE}</p>
          <p>
            Marketplace terms cover bookings on the platform. Custom software is agreed per project.
          </p>
        </div>
      </div>
    </footer>
  );
}
