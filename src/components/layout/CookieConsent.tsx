import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';
import { post } from '@/lib/api';
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
  void post('/public/cookie-consent', {
    policyVersion: COOKIE_POLICY_VERSION,
    decision,
    analytics,
    marketing,
  }).catch(() => {});
  return payload;
}

const CookieConsent = () => {
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
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[60]"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-neutral-200 p-6 rounded-3xl shadow-2xl shadow-black/5">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                <Cookie className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl text-black italic mb-2">Cookies & privacy</h3>
                {mode === 'banner' ? (
                  <>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                      We use essential cookies to run the site. Analytics and marketing cookies are optional and only run
                      with your choice. Read our{' '}
                      <Link to="/cookie-policy" className="text-black underline underline-offset-4 decoration-neutral-300">
                        Cookie Policy
                      </Link>
                      .
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                      <button
                        type="button"
                        onClick={acceptAll}
                        className="flex-1 px-6 py-3 bg-black text-white text-sm font-medium rounded-xl transition-transform active:scale-95"
                      >
                        Accept all
                      </button>
                      <button
                        type="button"
                        onClick={rejectNonEssential}
                        className="px-6 py-3 bg-neutral-100 text-black text-sm font-medium rounded-xl transition-colors hover:bg-neutral-200"
                      >
                        Reject non-essential
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('settings');
                          setAnalyticsOn(false);
                          setMarketingOn(false);
                        }}
                        className="px-6 py-3 border border-neutral-200 text-black text-sm font-medium rounded-xl hover:bg-neutral-50"
                      >
                        Customize
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                      Choose optional cookies. Essential cookies stay on so the platform works.
                    </p>
                    <label className="flex items-center justify-between gap-3 py-2 border-b border-neutral-100">
                      <span className="text-sm text-black">Analytics</span>
                      <input
                        type="checkbox"
                        checked={analyticsOn}
                        onChange={(e) => setAnalyticsOn(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 py-2 mb-4">
                      <span className="text-sm text-black">Marketing</span>
                      <input
                        type="checkbox"
                        checked={marketingOn}
                        onChange={(e) => setMarketingOn(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMode('banner')}
                        className="flex-1 px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-xl"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={saveCustom}
                        className="flex-1 px-4 py-2 text-sm bg-black text-white rounded-xl"
                      >
                        Save choices
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
