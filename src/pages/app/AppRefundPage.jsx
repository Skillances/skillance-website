import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'

const AppRefundPage = () => {
  return (
    <Section>
      <div className="container mx-auto container-padding max-w-4xl">
        <AnimatedSection animation="fadeInUp">
          <h1
            style={{ fontFamily: 'var(--font-family-poppins)' }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Refund Policy
          </h1>
          <p className="text-text-secondary mb-8">
            Last updated: 27 February 2025
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp">
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                1. Cancellation Windows
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                When you cancel a booking, the following applies based on how far in advance you cancel:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li><strong>More than 24 hours before:</strong> Full refund (or full release of payment hold)</li>
                <li><strong>12–24 hours before:</strong> 50% refund (50% goes to the freelancer as a cancellation fee)</li>
                <li><strong>Less than 12 hours before:</strong> No refund (full amount goes to the freelancer as a cancellation fee)</li>
              </ul>
              <p className="text-text-secondary leading-relaxed mt-4">
                These windows give both parties clear expectations and protect freelancers from last-minute cancellations.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                2. Fault-Based Refunds
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li><strong>Freelancer no-show or late cancellation:</strong> Full refund to the customer</li>
                <li><strong>Customer no-show:</strong> No refund; the freelancer receives the full amount (or cancellation fee where applicable)</li>
                <li><strong>Mutual cancellation:</strong> Follows the time-based rules in section 1</li>
                <li><strong>Service not delivered or materially different:</strong> Refund based on severity (full or partial, as determined by Skillance support)</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                3. Disputed Quality
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                When there is disagreement about the service received:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>We encourage customers and freelancers to resolve issues directly first</li>
                <li>If unresolved, contact us at services@skillance.co.za for mediation</li>
                <li>We may offer a partial refund (e.g. 25–75%) or goodwill credit depending on the circumstances</li>
                <li>We keep records of disputes to address repeat issues</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                4. Platform Fee
              </h2>
              <p className="text-text-secondary leading-relaxed">
                On full refunds, Skillance does not keep a platform fee. On partial refunds, our platform fee is proportional (e.g. if 50% is refunded, we keep 50% of our fee). This keeps us neutral and avoids incentivising disputes.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                5. Processing Time
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Refunds are typically processed within 3–5 business days. The time for funds to appear in your account may vary depending on your bank or payment method.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                6. Contact
              </h2>
              <p className="text-text-secondary leading-relaxed">
                For refund requests or questions about this policy, contact us at:
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                <strong>Email:</strong> services@skillance.co.za<br />
                <strong>Website:</strong> https://skillance.co.za
              </p>
            </section>
          </div>
        </AnimatedSection>
      </div>
    </Section>
  )
}

export default AppRefundPage
