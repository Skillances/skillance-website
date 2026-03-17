import PageTemplate from '../../components/layout/PageTemplate';

const CookiePolicy = () => {
  return (
    <PageTemplate title="Cookie Policy" animateSections>
      <div className="space-y-8 text-neutral-600">
        <p className="text-xl leading-relaxed italic">Last updated: March 2024</p>
        
        <section>
          <h2 className="text-2xl font-serif text-black mb-4">What Are Cookies?</h2>
          <p className="leading-relaxed">
            Cookies are small text files that are stored on your device when you visit a website. 
            They are widely used to make websites work or work more efficiently, as well as to 
            provide information to the owners of the site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">How We Use Cookies</h2>
          <p className="leading-relaxed">
            We use cookies for several reasons, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Essential cookies: Required for the operation of our services.</li>
            <li>Analytical/performance cookies: Allow us to recognize and count visitors.</li>
            <li>Functionality cookies: Used to recognize you when you return to our service.</li>
            <li>Targeting cookies: Record your visit to our service and the links you have followed.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-black mb-4">Managing Cookies</h2>
          <p className="leading-relaxed">
            Most web browsers allow some control of most cookies through the browser settings. 
            To find out more about cookies, including how to see what cookies have been set, 
            visit www.aboutcookies.org.
          </p>
        </section>
      </div>
    </PageTemplate>
  );
};

export default CookiePolicy;
