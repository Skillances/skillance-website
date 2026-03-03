import PageTemplate from '../../components/layout/PageTemplate';
import FAQ from '../../components/sections/FAQ';

const FAQPage = () => {
  return (
    <div className="bg-neutral-900 min-h-screen overflow-hidden">
      <PageTemplate title="Frequently Asked Questions" dark>
        <div>
          <p className="text-xl text-neutral-400 mb-12 italic">
            Find answers to common questions about our platform, services, and policies.
          </p>
          <div className="-mt-32"> {/* Pull up FAQ component which has internal padding */}
            <FAQ />
          </div>
        </div>
      </PageTemplate>
    </div>
  );
};

export default FAQPage;
