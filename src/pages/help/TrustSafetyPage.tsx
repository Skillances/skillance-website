import PageTemplate from '../../components/layout/PageTemplate';
import TrustSafety from '../../components/sections/TrustSafety';

const TrustSafetyPage = () => {
  return (
    <div className="bg-neutral-900 min-h-screen overflow-hidden text-white">
      <PageTemplate title="Trust & Safety" dark>
        <div className="space-y-12">
          <p className="text-xl text-neutral-400 italic">
            Your safety and trust are the foundation of Skillance. We work tirelessly to ensure a secure environment for everyone.
          </p>
          <div className="-mt-32">
            <TrustSafety />
          </div>
          
          <section className="bg-neutral-800/30 p-12 rounded-3xl border border-neutral-800">
            <h2 className="text-3xl font-serif text-white mb-6">Our Commitment</h2>
            <div className="grid md:grid-cols-2 gap-8 text-neutral-400">
              <div>
                <h3 className="text-white font-medium mb-2 font-serif text-xl">Secure Payments</h3>
                <p>We use industry-leading encryption to protect your financial data and hold payments until work is complete.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2 font-serif text-xl">Data Protection</h3>
                <p>Your personal information is never sold and is handled with the highest level of privacy and care.</p>
              </div>
            </div>
          </section>
        </div>
      </PageTemplate>
    </div>
  );
};

export default TrustSafetyPage;
