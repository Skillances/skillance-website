import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { WAITLIST_CONSENT_API_ENABLED } from '@/lib/featureFlags';
import { useFormRateLimit } from '@/hooks/useFormRateLimit';
import { toast } from 'sonner';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { revealFromTo } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const LAUNCH_NOTICE = "We'll email you when Skillance launches in your area.";
const POPIA_NOTICE =
  'Skillance (Rimitso Management Services (Pty) Ltd) collects your email address and the area you enter. We use them to send that launch email and, only if you tick the second box, occasional product updates and offers. You can opt out at any time using the unsubscribe link in any email, or by emailing support@skillance.co.za.';
const NOTICE_VERSION = 'waitlist-v1';
const CONSENT_LABEL =
  'I agree to Skillance using my email and area to email me when it launches in my area.';
const MARKETING_LABEL = 'Also send me occasional product updates and offers.';

const CTA = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [consent, setConsent] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alreadyOnWaitlist, setAlreadyOnWaitlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { canSubmit, secondsRemaining, startCooldown, startCooldownFromRetryAfter } = useFormRateLimit(60_000);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealFromTo('.cta-content', '.cta-content', reducedMotion);
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !area.trim() || !consent || !canSubmit) return;

    setIsLoading(true);
    setError('');
    setAlreadyOnWaitlist(false);

    try {
      const liveFields = { email, source: 'homepage-cta' as const };
      const res = await post(
        ApiPaths.public.notify,
        WAITLIST_CONSENT_API_ENABLED
          ? {
              ...liveFields,
              area: area.trim(),
              consent: true,
              marketingOptIn,
              noticeVersion: NOTICE_VERSION,
              consentNotice: POPIA_NOTICE,
              consentCheckbox: CONSENT_LABEL,
              marketingCheckbox: MARKETING_LABEL,
              consentAt: new Date().toISOString(),
              userAgent: navigator.userAgent,
            }
          : liveFields,
      );
      if (res?.data?.alreadySubscribed) {
        setAlreadyOnWaitlist(true);
        setError('This email is already on the waitlist.');
      } else {
        setIsSubmitted(true);
      }
      startCooldown();
    } catch (caught) {
      const err = caught as { statusCode?: number; retryAfter?: number; message?: string } | null | undefined;
      if (err?.statusCode === 429 || err?.retryAfter) {
        const msg = err?.message || 'Too many attempts. Please try again later.';
        setError(msg);
        toast.error(msg);
        if (err?.retryAfter) startCooldownFromRetryAfter(err.retryAfter);
        else startCooldown();
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const submitBlocked = isLoading || !canSubmit || !consent || !area.trim();

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
            Be the first to{' '}
            <span className="italic">know.</span>
          </h2>

          <p className="text-lg text-neutral-600 max-w-xl mx-auto mb-12">
            Be the first to know when Skillance opens in your area.
          </p>

          {!isSubmitted ? (
            <div className="max-w-md mx-auto mb-12 text-left">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); setAlreadyOnWaitlist(false); }}
                  placeholder="Enter your email"
                  aria-label="Email address"
                  className="w-full px-6 py-4 bg-white rounded-full text-black placeholder-neutral-400 border border-neutral-200 focus:border-black focus:outline-none transition-colors"
                  required
                  disabled={isLoading || !canSubmit}
                />
                <input
                  type="text"
                  value={area}
                  onChange={(e) => { setArea(e.target.value); setError(''); }}
                  placeholder="Your suburb or town"
                  aria-label="Your suburb or town"
                  className="w-full px-6 py-4 bg-white rounded-full text-black placeholder-neutral-400 border border-neutral-200 focus:border-black focus:outline-none transition-colors"
                  required
                  disabled={isLoading || !canSubmit}
                />

                <p className="text-sm text-neutral-600 leading-relaxed px-2">
                  {LAUNCH_NOTICE} {POPIA_NOTICE}{' '}
                  <Link to="/privacy-policy" className="underline underline-offset-4 text-black">
                    Privacy Policy
                  </Link>
                  .
                </p>

                <label className="flex items-start gap-3 px-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 shrink-0 accent-black"
                  />
                  <span>{CONSENT_LABEL}</span>
                </label>

                <label className="flex items-start gap-3 px-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-black"
                  />
                  <span>{MARKETING_LABEL}</span>
                </label>

                <button
                  type="submit"
                  disabled={submitBlocked}
                  className="px-8 py-4 bg-black text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : !canSubmit ? `Try again in ${secondsRemaining}s` : 'Notify Me'}
                </button>
              </form>
              {error && (
                <p className={`text-sm mt-3 text-center ${alreadyOnWaitlist ? 'text-amber-600' : 'text-red-500'}`}>
                  {error}
                </p>
              )}
            </div>
          ) : (
            <div className="max-w-md mx-auto mb-12 py-4">
              <p className="text-lg text-neutral-600">
                Thanks! We&apos;ll email you when Skillance launches in your area.
              </p>
            </div>
          )}

          <p className="text-sm text-neutral-500">
            The Skillance app for iOS and Android is coming soon.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
