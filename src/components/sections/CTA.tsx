import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CTA = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-content',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.cta-content',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <section
      id="cta"
      ref={sectionRef}
      className="py-32 lg:py-40 bg-neutral-50"
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="cta-content text-center">
          <p className="text-sm uppercase tracking-widest text-neutral-500 mb-6">
            Coming Soon
          </p>
          
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-black leading-[1.1] mb-6">
            Ready to find your{' '}
            <span className="italic">perfect match?</span>
          </h2>

          <p className="text-lg text-neutral-600 max-w-xl mx-auto mb-12">
            Join thousands who've discovered trusted local experts through Skillance. 
            Be the first to know when we launch.
          </p>

          {!isSubmitted ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-12"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-white rounded-full text-black placeholder-neutral-400 border border-neutral-200 focus:border-black focus:outline-none transition-colors"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-black text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                Notify Me
              </button>
            </form>
          ) : (
            <div className="max-w-md mx-auto mb-12 py-4">
              <p className="text-lg text-neutral-600">
                Thanks! We'll be in touch soon.
              </p>
            </div>
          )}

          <p className="text-sm text-neutral-400 mb-8">
            Available for iOS and Android
          </p>

          {/* App Store Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] opacity-70">GET IT ON</div>
                <div className="text-sm font-medium">Google Play</div>
              </div>
            </button>

            <button className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.37 12.36,4.26 13,3.5Z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] opacity-70">Download on</div>
                <div className="text-sm font-medium">App Store</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
