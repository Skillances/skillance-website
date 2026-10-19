type BeyondEventName = 'beyond_view' | 'beyond_enquiry_click';

/**
 * Pushes a custom event onto the existing GTM dataLayer.
 * Does not load a new tracker. Consent Mode in index.html still gates tags.
 */
export function trackBeyond(event: BeyondEventName, params: Record<string, string>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
