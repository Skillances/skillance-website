/**
 * Beyond website/commercial terms shown on marketing copy.
 * Confirm placeholders before production (see also beyondLegal.ts).
 */
export const BEYOND_COMMERCIAL = {
  hourlyRateExVatZar: 500,
  vatPercent: 15,
  paymentSplit: '50% to start and 50% at launch',
  revisionRounds: 2,
  hostingSummary: 'Hosting on Cloudflare Pages costs you R0 from us',
  emailMoveExVatZar: 750,
  /** Working days from build start — fill before publish. */
  turnaroundWorkingDays: '[X]',
  /** What we ask from the client during build — fill before publish. */
  clientInputsList: '[logo, photos, domain access, and any logins we need]',
  /** Care plan names/prices — fill before publish. */
  carePlanSummary: '[plan names and prices]',
  /** When false, subscription line is omitted until confirmed. */
  subscriptionOfferConfirmed: false,
} as const;

export function beyondFixedPriceLine(): string {
  const { hourlyRateExVatZar, vatPercent } = BEYOND_COMMERCIAL;
  return `fixed tiers at R${hourlyRateExVatZar}/hour ex VAT + ${vatPercent}% VAT`;
}

export function beyondSubscriptionLine(): string | null {
  if (!BEYOND_COMMERCIAL.subscriptionOfferConfirmed) {
    return 'A subscription payment option may be available on some tiers — we confirm that in your quote.';
  }
  return 'A subscription payment option is available on some tiers — we confirm that in your quote.';
}
