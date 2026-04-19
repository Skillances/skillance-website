import { Link } from 'react-router-dom';
import PageTemplate from '../../components/layout/PageTemplate';

const RefundPolicy = () => {
  return (
    <PageTemplate title="Refund Policy" animateSections>
      <div className="space-y-10 text-neutral-600">
        <div className="space-y-3">
          <p className="text-xl leading-relaxed italic text-black/80">Last updated: 19 April 2026</p>
          <p className="text-sm leading-relaxed text-neutral-500">
            This Refund Policy forms part of our{' '}
            <Link to="/terms" className="text-black underline underline-offset-4 hover:no-underline">Terms of Service</Link>{' '}
            and applies to bookings made through Skillance, operated by{' '}
            <strong className="text-black">RIMITSO MANAGEMENT SERVICES (PTY) LTD</strong>. All amounts are in South African
            Rand (ZAR) and inclusive of VAT where applicable.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">1. How the money flow works</h2>
          <p className="leading-relaxed">
            Skillance is a commission-based marketplace. Customer payments are processed by our third-party payment provider
            (currently WalletDoc) and held in <strong className="text-black">escrow</strong> until a booking completes and
            the <strong className="text-black">24-hour dispute window</strong> has passed without a valid dispute. Freelancer
            payouts are <em>booking total minus the platform commission</em> (up to 10% unless a different rate is agreed).
          </p>
          <p className="leading-relaxed">
            Bookings use one of two pricing modes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-black">Hourly:</strong> the full session amount is paid up front and held in escrow.
            </li>
            <li>
              <strong className="text-black">Invoice:</strong> the customer pays a{' '}
              <strong className="text-black">non-refundable R50 connection fee</strong> to unlock chat, then pays the
              Freelancer&apos;s invoice total if they accept it. The invoice total is held in escrow like an hourly booking.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">2. Customer-initiated cancellation windows</h2>
          <p className="leading-relaxed">These time windows are measured against the scheduled session start time.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-black">More than 24 hours before:</strong> full refund of the booking total (or full
              release of the escrow hold back to the customer).
            </li>
            <li>
              <strong className="text-black">12–24 hours before:</strong> 50% refund of the booking total; 50% is paid to the
              Freelancer as a cancellation fee.
            </li>
            <li>
              <strong className="text-black">Less than 12 hours before:</strong> no refund; the full booking total is paid to
              the Freelancer.
            </li>
          </ul>
          <p className="leading-relaxed text-sm text-neutral-500">
            The R50 connection fee (invoice path) is not refundable in any cancellation window, as it covers the
            introduction and the unlocking of chat.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">3. Fault-based outcomes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-black">Freelancer no-show or late cancellation:</strong> full refund to the customer of
              the booking total. Where pattern behaviour is detected, the Freelancer may face account action.
            </li>
            <li>
              <strong className="text-black">Customer no-show:</strong> no refund; the Freelancer receives the full booking
              total.
            </li>
            <li>
              <strong className="text-black">PIN not entered (session not proven):</strong> escrow is frozen pending review;
              based on evidence (including PIN logs, message history, and any dispute) we allocate funds either to the
              customer (as a refund) or to the Freelancer.
            </li>
            <li>
              <strong className="text-black">Mutual cancellation:</strong> the time-based rules in section 2 apply unless the
              parties request a specific split and we agree it is fair in the circumstances.
            </li>
            <li>
              <strong className="text-black">Service not delivered or materially different from what was agreed:</strong> we
              may order a full or partial refund under sections 4 and 5.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">4. Disputes and the 24-hour dispute window</h2>
          <p className="leading-relaxed">
            After a session is marked complete, the customer has a 24-hour window to raise a dispute through the in-app flow
            (or, where PIN was not entered, the escrow is held pending review regardless of the window). During the window
            escrow remains held. Outside the window, undisputed payouts are released to the Freelancer automatically.
          </p>
          <p className="leading-relaxed">
            To open a dispute, use the in-app dispute option on the booking, or email{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline underline-offset-4 hover:no-underline">services@skillance.co.za</a>{' '}
            with the booking ID and a clear description. Please include reasonable evidence (photos, screenshots, receipts,
            chat references, timings) where possible.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">5. Disputed quality outcomes</h2>
          <p className="leading-relaxed">
            We encourage parties to try to resolve disputes directly. Where we need to decide, we review the evidence and may:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>uphold the booking and release payment to the Freelancer;</li>
            <li>order a partial refund (commonly in ranges of approximately 25%, 50%, or 75%) proportionate to the shortfall;</li>
            <li>order a full refund where the service was not delivered or materially differed from what was agreed;</li>
            <li>offer platform credit as a goodwill remedy where appropriate.</li>
          </ul>
          <p className="leading-relaxed text-sm text-neutral-500">
            Dispute records, messages, timestamps, and decisions are retained for audit and compliance purposes. Our decision
            is made in good faith based on the information available and is without prejudice to either party&apos;s statutory
            rights (see section 9).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">6. Platform commission on refunds</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-black">Full refund to customer:</strong> no platform commission is charged on the refunded booking.</li>
            <li><strong className="text-black">Partial refund:</strong> platform commission is calculated proportionally on the amount retained by the Freelancer, not on the refunded portion.</li>
            <li><strong className="text-black">Connection fee:</strong> as stated above, the R50 connection fee on invoice-path bookings is not refundable.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">7. Payment method, currency, and VAT</h2>
          <p className="leading-relaxed">
            Refunds are returned to the original payment method where the payment provider supports this. Amounts are in ZAR.
            Where the booking total was inclusive of VAT, the refund is inclusive of VAT on the refunded portion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">8. Processing time</h2>
          <p className="leading-relaxed">
            Once approved, refunds are typically initiated within 3–5 South African business days. The time it takes for
            funds to reflect in your account depends on your bank or card issuer and may take several additional days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">9. Consumer Protection Act, ECTA, and related rights</h2>
          <p className="leading-relaxed">
            Nothing in this policy limits rights a customer may have under the Consumer Protection Act 68 of 2008
            (&quot;CPA&quot;), the Electronic Communications and Transactions Act 25 of 2002 (&quot;ECTA&quot;), or any other
            applicable South African law that cannot be excluded. Where the CPA applies, customers may have additional rights
            in respect of cancellation of advance reservations on reasonable notice and implied warranties on services, which
            we will honour. ECTA cooling-off rights do not apply to most on-demand services, but we will apply them where
            the law requires.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">10. App store payments</h2>
          <p className="leading-relaxed">
            Skillance bookings and the R50 connection fee are processed through our payment provider, not through Apple or
            Google in-app purchases. If you ever pay Skillance via an app store payment flow (for example, promotional
            credits), the applicable store&apos;s refund policy will also apply to that store-level charge.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">11. Fraud, chargebacks, and abuse</h2>
          <p className="leading-relaxed">
            Refund and dispute processes may be refused or reversed where we have reasonable grounds to suspect fraud,
            chargeback abuse, collusion, or attempts to avoid platform fees. We may withhold payouts, freeze escrow, suspend
            accounts, and cooperate with payment providers and law enforcement as appropriate.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">12. Contact</h2>
          <p className="leading-relaxed">
            For refund and dispute enquiries:{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline underline-offset-4 hover:no-underline">
              services@skillance.co.za
            </a>{' '}
            or WhatsApp{' '}
            <a
              href="https://wa.me/27648728174"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black underline underline-offset-4 hover:no-underline"
            >
              +27 64 872 8174
            </a>
            .
          </p>
          <p className="leading-relaxed text-sm text-neutral-500">
            This page is published for transparency and is not legal advice. If you need advice tailored to your
            circumstances, consult a qualified attorney.
          </p>
        </section>
      </div>
    </PageTemplate>
  );
};

export default RefundPolicy;
