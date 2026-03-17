import { Link } from 'react-router-dom';
import PageTemplate from '../../components/layout/PageTemplate';

const Terms = () => {
  return (
    <PageTemplate title="Terms of Service">
      <div className="space-y-8 text-neutral-600">
        <p className="text-xl leading-relaxed italic">Last updated: 27 February 2025</p>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">
            By using the Skillance app or website, you agree to be bound by these Terms of Service.
            If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">2. Description of Service</h2>
          <p className="leading-relaxed">
            Skillance is a two-sided platform. Customers can browse, search, book, and pay for services.
            Freelancers can create profiles, set availability, accept bookings, and receive payments. The
            platform includes in-app messaging and reviews.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">3. Account and Use Requirements</h2>
          <p className="leading-relaxed">
            You must use the platform lawfully, provide accurate registration information, keep your
            credentials secure, and not interfere with the platform or other users. You may not share
            contact details to bypass the platform before completing a booking.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">4. Booking and Payments</h2>
          <p className="leading-relaxed">
            Payments are processed via WalletDoc. Skillance may charge fees for use of the platform.
            Cancellation and refunds are governed by our{' '}
            <Link to="/refund-policy" className="text-black underline hover:no-underline">
              Refund Policy
            </Link>
            . All prices are displayed in ZAR (South African Rand).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">5. Freelancer Responsibilities</h2>
          <p className="leading-relaxed">
            Freelancers must maintain accurate profiles, deliver services as described, conduct themselves
            professionally, comply with South African law, and complete identity verification when required.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">6. Independent Contractors</h2>
          <p className="leading-relaxed">
            Freelancers are independent contractors, not employees of Skillance. Skillance does not control
            how services are delivered. We do not withhold PAYE, UIF, or tax on behalf of freelancers.
            Freelancers are responsible for their own tax and legal compliance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">7. User-Generated Content</h2>
          <p className="leading-relaxed">
            By posting content, you grant Skillance a licence to use it for operating the platform. Reviews
            must be honest and may not be defamatory, offensive, or illegal. We may remove content that
            violates these terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">8. Dispute Resolution</h2>
          <p className="leading-relaxed">
            We encourage users to try to resolve disputes directly first. For mediation assistance, contact{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline hover:no-underline">
              services@skillance.co.za
            </a>
            . Skillance may facilitate resolution but is not obliged to do so. Where appropriate, disputes
            may be resolved by arbitration under South African law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">9. Account Suspension and Termination</h2>
          <p className="leading-relaxed">
            We may suspend or terminate your account for breach of these terms, fraud, abuse, or misconduct.
            We may remove profiles, withhold payouts, or take other action as necessary. You may appeal by
            contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">10. Limitation of Liability</h2>
          <p className="leading-relaxed">
            To the fullest extent permitted by law, Skillance is not liable for indirect or consequential
            damages, disputes between users, or freelancer conduct outside the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">11. Governing Law</h2>
          <p className="leading-relaxed">
            These terms are governed by South African law. Any disputes shall be subject to the courts of
            South Africa.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">12. Modifications</h2>
          <p className="leading-relaxed">
            We reserve the right to change these terms. Continued use of the platform after changes
            constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">13. Contact</h2>
          <p className="leading-relaxed">
            For enquiries, contact us at{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline hover:no-underline">
              services@skillance.co.za
            </a>{' '}
            or visit{' '}
            <a href="https://skillance.co.za" target="_blank" rel="noopener noreferrer" className="text-black underline hover:no-underline">
              https://skillance.co.za
            </a>
            .
          </p>
        </section>
      </div>
    </PageTemplate>
  );
};

export default Terms;
