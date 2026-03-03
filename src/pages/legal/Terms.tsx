import PageTemplate from '../../components/layout/PageTemplate';

const Terms = () => {
  return (
    <PageTemplate title="Terms of Service">
      <div className="space-y-8 text-neutral-600">
        <p className="text-xl leading-relaxed italic">Last updated: March 2024</p>
        
        <section>
          <h2 className="text-2xl font-serif text-black mb-4">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">
            By accessing or using Skillance, you agree to be bound by these Terms of Service 
            and all terms incorporated by reference. If you do not agree to all of these terms, 
            do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">2. User Accounts</h2>
          <p className="leading-relaxed">
            You must be at least 18 years of age to create an account. You are responsible for 
            maintaining the security of your account and for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">3. Prohibited Conduct</h2>
          <p className="leading-relaxed">
            You agree not to violate any laws, contracts, intellectual property or other third-party 
            rights or commit a tort, and that you are solely responsible for your conduct while 
            on our Services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">4. Limitation of Liability</h2>
          <p className="leading-relaxed">
            To the fullest extent permitted by applicable law, Skillance will not be liable for any 
            indirect, incidental, special, consequential or punitive damages.
          </p>
        </section>
      </div>
    </PageTemplate>
  );
};

export default Terms;
