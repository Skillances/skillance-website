import { Link } from 'react-router-dom';
import PageTemplate from '../../components/layout/PageTemplate';
import { BEYOND_EMAIL } from '@/beyond/content';
import { PAIA_MANUAL_PDF_URL, PAIA_MANUAL_PUBLISHED } from '@/constants/beyondLegal';
import { CorporateLegalAddressInline } from '../../components/corporate/CorporateLegalAddress';

const PaiaManual = () => {
  return (
    <PageTemplate title="PAIA manual" animateSections>
      <div className="space-y-8 text-neutral-600 max-w-3xl">
        <p className="text-xl leading-relaxed italic text-black/80">Last updated: 26 October 2026</p>

        {PAIA_MANUAL_PUBLISHED && PAIA_MANUAL_PDF_URL ? (
          <>
            <p className="leading-relaxed">
              RIMITSO MANAGEMENT SERVICES (PTY) LTD (trading as Skillance and Skillance Beyond the App) publishes this
              manual under the Promotion of Access to Information Act, 2000 (PAIA).
            </p>
            <p>
              <a
                href={PAIA_MANUAL_PDF_URL}
                className="inline-flex items-center rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-transform active:scale-[0.98]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download PAIA manual (PDF)
              </a>
            </p>
          </>
        ) : (
          <>
            <p className="leading-relaxed">
              RIMITSO MANAGEMENT SERVICES (PTY) LTD (trading as Skillance and Skillance Beyond the App) is preparing its
              Promotion of Access to Information Act, 2000 (PAIA) manual for publication on this page.
            </p>
            <p className="leading-relaxed">
              Until the manual is published here, you may request access to information or a copy of the manual in
              progress by emailing{' '}
              <a href={`mailto:${BEYOND_EMAIL}`} className="text-black underline underline-offset-4 hover:no-underline">
                {BEYOND_EMAIL}
              </a>
              . We respond in line with PAIA timeframes.
            </p>
            <p className="leading-relaxed text-sm text-neutral-500">
              Regulator guidance and templates:{' '}
              <a
                href="https://inforegulator.org.za/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline underline-offset-4 hover:no-underline"
              >
                Information Regulator (South Africa)
              </a>
              .
            </p>
          </>
        )}

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">Registered office</h2>
          <p className="leading-relaxed">
            <CorporateLegalAddressInline className="text-black" />.
          </p>
        </section>

        <p className="text-sm text-neutral-500">
          Related:{' '}
          <Link to="/privacy-policy" className="text-black underline underline-offset-4 hover:no-underline">
            Privacy Policy
          </Link>{' '}
          ·{' '}
          <Link to="/beyond/terms" className="text-black underline underline-offset-4 hover:no-underline">
            Beyond service terms
          </Link>
        </p>
      </div>
    </PageTemplate>
  );
};

export default PaiaManual;
