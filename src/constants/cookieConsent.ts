/**
 * Bump when cookie / privacy policy text materially changes.
 * Must match: backend `COOKIE_POLICY_VERSION_LATEST`, and the policy version check in `index.html` (inline GTM consent bootstrap).
 */
export const COOKIE_POLICY_VERSION = '2';

export const COOKIE_CONSENT_STORAGE_KEY = 'skillance-cookie-consent';

export type CookieConsentDecision = 'accepted_all' | 'rejected_non_essential' | 'essential_only';

export interface StoredCookieConsent {
  policyVersion: string;
  decision: CookieConsentDecision;
  analytics: boolean;
  marketing: boolean;
  savedAt: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function applyConsentToGtag(decision: CookieConsentDecision, analytics: boolean, marketing: boolean) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  if (decision === 'accepted_all') {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      personalization_storage: 'granted',
    });
    return;
  }
  if (decision === 'rejected_non_essential') {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      personalization_storage: 'denied',
    });
    return;
  }
  window.gtag('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
    personalization_storage: marketing ? 'granted' : 'denied',
  });
}
