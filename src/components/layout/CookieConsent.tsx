import { useState, useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { Switch } from '@/components/ui/switch';
import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_POLICY_VERSION,
  applyConsentToGtag,
  type CookieConsentDecision,
  type StoredCookieConsent,
} from '@/constants/cookieConsent';

function readStoredConsent(): StoredCookieConsent | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as StoredCookieConsent;
    if (!o.policyVersion || !o.decision) return null;
    if (o.policyVersion !== COOKIE_POLICY_VERSION) return null;
    return o;
  } catch {
    return null;
  }
}

function persistConsent(
  decision: CookieConsentDecision,
  analytics: boolean,
  marketing: boolean
): StoredCookieConsent {
  const payload: StoredCookieConsent = {
    policyVersion: COOKIE_POLICY_VERSION,
    decision,
    analytics,
    marketing,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
  applyConsentToGtag(decision, analytics, marketing);
  void post(ApiPaths.public.cookieConsent, {
    policyVersion: COOKIE_POLICY_VERSION,
    decision,
    analytics,
    marketing,
  }).catch(() => {});
  return payload;
}

const panelMotion = {
  initial: { y: 24, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 16, opacity: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

const CookieConsent = () => {
  const titleId = useId();
  const descId = useId();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'banner' | 'settings'>('banner');
  const [analyticsOn, setAnalyticsOn] = useState(false);
  const [marketingOn, setMarketingOn] = useState(false);

  useEffect(() => {
    const existing = readStoredConsent();
    if (!existing) {
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }
    applyConsentToGtag(existing.decision, existing.analytics, existing.marketing);
    return undefined;
  }, []);

  const closeBanner = useCallback(() => {
    setVisible(false);
    setMode('banner');
  }, []);

  const acceptAll = useCallback(() => {
    persistConsent('accepted_all', true, true);
    closeBanner();
  }, [closeBanner]);

  const rejectNonEssential = useCallback(() => {
    persistConsent('rejected_non_essential', false, false);
    closeBanner();
  }, [closeBanner]);

  const saveCustom = useCallback(() => {
    persistConsent('essential_only', analyticsOn, marketingOn);
    closeBanner();
  }, [analyticsOn, marketingOn, closeBanner]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          {...panelMotion}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 sm:justify-end sm:pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <div
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="pointer-events-auto w-full max-w-[22rem] sm:max-w-[26rem] rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] sm:p-5"
          >
            <header className="mb-3 sm:mb-3.5">
              <h2
                id={titleId}
                className="font-serif text-lg leading-snug text-black italic sm:text-[1.125rem]"
              >
                Cookies & privacy
              </h2>
            </header>

            {mode === 'banner' ? (
              <>
                <p
                  id={descId}
                  className="text-[0.8125rem] leading-relaxed text-neutral-600 sm:text-sm"
                >
                  Essential cookies keep the site working. Analytics and marketing are optional.{' '}
                  <Link
                    to="/cookie-policy"
                    className="font-medium text-black underline decoration-neutral-300 underline-offset-[3px] hover:decoration-neutral-500"
                  >
                    Cookie Policy
                  </Link>
                  .
                </p>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    Accept all
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={rejectNonEssential}
                      className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm font-medium text-black transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
                    >
                      Reject optional
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('settings');
                        setAnalyticsOn(false);
                        setMarketingOn(false);
                      }}
                      className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-medium text-black transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
                    >
                      Customize
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p id={descId} className="text-[0.8125rem] leading-relaxed text-neutral-600 sm:text-sm">
                  Toggle optional cookies. Essential cookies stay on so the platform works.
                </p>

                <ul className="mt-3 divide-y divide-neutral-100 rounded-xl border border-neutral-100">
                  <li className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black">Essential</p>
                      <p className="text-xs text-neutral-500">Required</p>
                    </div>
                    <Switch checked disabled aria-readonly className="data-[state=checked]:bg-neutral-400" />
                  </li>
                  <li className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black">Analytics</p>
                      <p className="text-xs text-neutral-500">Usage insights</p>
                    </div>
                    <Switch
                      checked={analyticsOn}
                      onCheckedChange={setAnalyticsOn}
                      aria-label="Analytics cookies"
                      className="data-[state=checked]:bg-black"
                    />
                  </li>
                  <li className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black">Marketing</p>
                      <p className="text-xs text-neutral-500">Campaign measurement</p>
                    </div>
                    <Switch
                      checked={marketingOn}
                      onCheckedChange={setMarketingOn}
                      aria-label="Marketing cookies"
                      className="data-[state=checked]:bg-black"
                    />
                  </li>
                </ul>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('banner')}
                    className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={saveCustom}
                    className="rounded-xl bg-black px-3 py-2.5 text-sm font-medium text-white transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    Save choices
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
