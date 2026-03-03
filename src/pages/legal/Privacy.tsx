import PageTemplate from '../../components/layout/PageTemplate';

const Privacy = () => {
  return (
    <PageTemplate title="Privacy Policy">
      <div className="space-y-8 text-neutral-600">
        <p className="text-xl leading-relaxed italic">Last updated: March 2024</p>
        
        <section>
          <h2 className="text-2xl font-serif text-black mb-4">1. Information We Collect</h2>
          <p className="leading-relaxed">
            We collect information you provide directly to us, such as when you create or modify your account, 
            request services, contact customer support, or otherwise communicate with us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">2. How We Use Your Information</h2>
          <p className="leading-relaxed">
            We use the information we collect to provide, maintain, and improve our services, 
            to develop new ones, and to protect Skillance and our users.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">3. Sharing of Information</h2>
          <p className="leading-relaxed">
            We do not share your personal information with companies, organizations, or individuals 
            outside of Skillance except in the following cases: with your consent, for external processing, 
            or for legal reasons.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">4. Security</h2>
          <p className="leading-relaxed">
            We work hard to protect Skillance and our users from unauthorized access to or unauthorized 
            alteration, disclosure, or destruction of information we hold.
          </p>
        </section>
      </div>
    </PageTemplate>
  );
};

export default Privacy;
