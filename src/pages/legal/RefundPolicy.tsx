import PageTemplate from '../../components/layout/PageTemplate';

const RefundPolicy = () => {
  return (
    <PageTemplate title="Refund Policy">
      <div className="space-y-8 text-neutral-600">
        <p className="text-xl leading-relaxed italic">Last updated: 27 February 2025</p>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">1. Cancellation Windows</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-black">More than 24 hours before:</strong> Full refund (or full release
              of payment hold).
            </li>
            <li>
              <strong className="text-black">12–24 hours before:</strong> 50% refund (50% to freelancer as
              cancellation fee).
            </li>
            <li>
              <strong className="text-black">Less than 12 hours before:</strong> No refund (full amount to
              freelancer).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">2. Fault-Based Refunds</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-black">Freelancer no-show or late cancellation:</strong> Full refund
              to customer.
            </li>
            <li>
              <strong className="text-black">Customer no-show:</strong> No refund; freelancer receives full
              amount.
            </li>
            <li>
              <strong className="text-black">Mutual cancellation:</strong> Time-based rules in section 1
              apply.
            </li>
            <li>
              <strong className="text-black">Service not delivered or materially different:</strong> Full or
              partial refund as determined by Skillance support.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">3. Disputed Quality</h2>
          <p className="leading-relaxed mb-4">
            We encourage users to try to resolve quality disputes directly first. For mediation assistance,
            contact{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline hover:no-underline">
              services@skillance.co.za
            </a>
            . We may offer a partial refund (e.g. 25–75%) or goodwill credit where appropriate. Dispute
            records are kept for our records.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">4. Platform Fee</h2>
          <p className="leading-relaxed">
            There is no platform fee on full refunds. On partial refunds, the platform fee is proportional
            to the amount retained.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">5. Processing Time</h2>
          <p className="leading-relaxed">
            Refunds are typically processed within 3–5 business days. Actual timing may vary depending on
            your bank.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">6. Contact</h2>
          <p className="leading-relaxed">
            For refund enquiries, contact us at{' '}
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

export default RefundPolicy;
