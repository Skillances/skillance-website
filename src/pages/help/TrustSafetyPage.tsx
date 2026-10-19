import PageTemplate from '../../components/layout/PageTemplate';
import TrustSafety from '../../components/sections/TrustSafety';

const TrustSafetyPage = () => {
  return (
    <div className="bg-neutral-900 min-h-screen overflow-hidden text-white">
      <PageTemplate title="Trust & Safety" dark>
        <div className="space-y-12">
          <p className="text-xl text-neutral-400 italic">
            Here&apos;s exactly what we check, and what we don&apos;t.
          </p>
          <div className="-mt-32">
            <TrustSafety />
          </div>
          
          <section className="bg-neutral-800/30 p-12 rounded-3xl border border-neutral-800">
            <h2 className="text-3xl font-serif text-white mb-6">Our Commitment</h2>
            <div className="grid md:grid-cols-2 gap-8 text-neutral-400">
              <div>
                <h3 className="text-white font-medium mb-2 font-serif text-xl">Payments</h3>
                <p>Payments aren&apos;t live yet. We&apos;ll explain exactly how paying works before bookings open.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2 font-serif text-xl">Your information</h3>
                <p>Read our Privacy Policy to see how we handle your personal information. Support hours are Mon-Fri 09:00-17:00.</p>
              </div>
            </div>
          </section>
        </div>
      </PageTemplate>
    </div>
  );
};

export default TrustSafetyPage;
