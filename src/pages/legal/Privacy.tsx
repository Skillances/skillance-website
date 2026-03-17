import PageTemplate from '../../components/layout/PageTemplate';

const Privacy = () => {
  return (
    <PageTemplate title="Privacy Policy">
      <div className="space-y-8 text-neutral-600">
        <p className="text-xl leading-relaxed italic">Last updated: 27 February 2025</p>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">1. Introduction</h2>
          <p className="leading-relaxed">
            Skillance is a marketplace for tutoring and home services. This policy explains how we collect,
            use, and protect your personal information in accordance with the Protection of Personal
            Information Act (POPIA) and other applicable South African law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">2. Information We Collect</h2>
          <p className="leading-relaxed mb-4">
            We collect the following categories of information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-black">Account:</strong> Name, email, phone number, profile photo.
            </li>
            <li>
              <strong className="text-black">Freelancer profile:</strong> Bio, skills, rates, certifications,
              portfolio, age, gender, service locations.
            </li>
            <li>
              <strong className="text-black">Identity verification:</strong> ID or passport, document photos,
              selfie, police clearance.
            </li>
            <li>
              <strong className="text-black">Payment:</strong> Processed via WalletDoc; we do not store full
              card details.
            </li>
            <li>
              <strong className="text-black">Booking history:</strong> Records of bookings and transactions.
            </li>
            <li>
              <strong className="text-black">Messaging:</strong> In-app messages between users.
            </li>
            <li>
              <strong className="text-black">Reviews:</strong> Ratings and reviews you submit.
            </li>
            <li>
              <strong className="text-black">Location:</strong> City and approximate coordinates; precise
              location only when proximity search is enabled.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">3. How We Use Your Information</h2>
          <p className="leading-relaxed">
            We use your information to operate the platform, process bookings and payments, enable messaging,
            conduct identity verification, power maps and location features, send notifications, perform
            analytics, and comply with legal obligations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">4. Third-Party Services</h2>
          <p className="leading-relaxed">
            We use third-party services including Firebase (Google), Mapbox, Soketi/Pusher, and WalletDoc.
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">5. Information Sharing</h2>
          <p className="leading-relaxed">
            We do not sell your data. We may share information with freelancers or customers as needed for
            bookings, with service providers under appropriate agreements, to fulfil legal obligations, and
            for safety purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">6. Data Security and Retention</h2>
          <p className="leading-relaxed mb-4">
            We implement technical and organisational measures to protect your data. Our retention practices
            are as follows:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account and profile data: Retained while active and for a limited period after deletion.</li>
            <li>Bookings and reviews: Retained as needed for the platform.</li>
            <li>Chat messages: Retained for moderation purposes (e.g. 90 days).</li>
            <li>Security logs: Retained for approximately 90 days.</li>
            <li>Performance metrics: Retained for approximately 30 days.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">7. Data Breach Notification</h2>
          <p className="leading-relaxed">
            In the event of a data breach, we will notify affected users and the Information Regulator as
            required by POPIA.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">8. Your Rights (POPIA)</h2>
          <p className="leading-relaxed">
            Under POPIA, you have the right to access your personal information, request correction,
            request deletion (subject to our retention obligations), object to or withdraw consent for
            processing, and lodge a complaint with the Information Regulator.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">9. Contact</h2>
          <p className="leading-relaxed">
            For privacy-related enquiries, contact us at{' '}
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

export default Privacy;
