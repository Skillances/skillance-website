import PageTemplate from '../../components/layout/PageTemplate';

const HelpCenter = () => {
  return (
    <PageTemplate title="Help Center">
      <div className="space-y-12">
        <section>
          <h2 className="text-3xl font-serif text-black mb-6">Getting Started</h2>
          <p className="text-neutral-600 text-lg leading-relaxed">
            Welcome to Skillance. Our platform is designed to connect you with top-tier professionals seamlessly. 
            Whether you're looking for a service or offering one, we're here to help you every step of the way.
          </p>
        </section>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 border border-neutral-100 bg-neutral-50 rounded-2xl">
            <h3 className="text-xl font-serif text-black mb-4">For Customers</h3>
            <ul className="space-y-3 text-neutral-600">
              <li>• How to find professionals</li>
              <li>• Booking and payments</li>
              <li>• Managing your projects</li>
              <li>• Leaving reviews</li>
            </ul>
          </div>
          <div className="p-8 border border-neutral-100 bg-neutral-50 rounded-2xl">
            <h3 className="text-xl font-serif text-black mb-4">For Professionals</h3>
            <ul className="space-y-3 text-neutral-600">
              <li>• Creating your profile</li>
              <li>• Setting your rates</li>
              <li>• Managing bookings</li>
              <li>• Getting paid</li>
            </ul>
          </div>
        </div>

        <section className="bg-black text-white p-12 rounded-3xl text-center">
          <h2 className="text-3xl font-serif mb-6 italic text-white">Still need help?</h2>
          <p className="text-neutral-400 text-lg mb-8">Our support team is available 24/7 to assist you with any questions.</p>
          <button className="px-8 py-4 bg-white text-black font-medium transition-transform hover:scale-105">
            Contact Support
          </button>
        </section>
      </div>
    </PageTemplate>
  );
};

export default HelpCenter;
