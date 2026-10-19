/* Google Consent Mode defaults (POPIA) — must run before GTM */
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'granted',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500,
});
try {
  var raw = localStorage.getItem('skillance-cookie-consent');
  if (raw) {
    var o = JSON.parse(raw);
    /* Keep in sync with COOKIE_POLICY_VERSION in src/constants/cookieConsent.ts */
    if (!o.policyVersion || o.policyVersion !== '2') {
      /* Outdated or missing version: do not pre-grant non-essential consent */
    } else if (o.decision === 'accepted_all') {
      gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        personalization_storage: 'granted',
      });
    } else if (o.decision === 'essential_only') {
      gtag('consent', 'update', {
        analytics_storage: o.analytics ? 'granted' : 'denied',
        ad_storage: o.marketing ? 'granted' : 'denied',
        ad_user_data: o.marketing ? 'granted' : 'denied',
        ad_personalization: o.marketing ? 'granted' : 'denied',
        personalization_storage: o.marketing ? 'granted' : 'denied',
      });
    } else if (o.decision === 'rejected_non_essential') {
      gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        personalization_storage: 'denied',
      });
    }
  }
} catch (e) {}
