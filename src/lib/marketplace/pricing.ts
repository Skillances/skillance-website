import { formatZar } from '@/lib/marketplace/theme';

type Rate = { hourlyRate: number | string; bookingPricingMode?: string };

function toNum(v: unknown): number | null {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Listing price label, following the app's profile header: "Custom quote" when every service is
 * invoiced (or there is no rate), "R x/hour" for one rate, "From R x/hour" when hourly rates differ.
 */
export function listingPriceLabel(f: { hourlyRate?: number | string | null; categoryRates?: Rate[] }): string {
  const rates = f.categoryRates ?? [];
  if (rates.length > 0) {
    const hourly = rates
      .filter((r) => (r.bookingPricingMode ?? 'hourly') !== 'invoice')
      .map((r) => toNum(r.hourlyRate))
      .filter((n): n is number => n != null);
    if (hourly.length === 0) return 'Custom quote';
    const min = Math.min(...hourly);
    const distinct = new Set(hourly).size;
    return `${distinct > 1 ? 'From ' : ''}${formatZar(min)}/hour`;
  }
  const single = toNum(f.hourlyRate);
  return single == null ? 'Custom quote' : `${formatZar(single)}/hour`;
}

/** Per-service label: "R x/hour" or "On invoice". */
export function rateLabel(r: Rate): string {
  if (r.bookingPricingMode === 'invoice') return 'On invoice';
  const n = toNum(r.hourlyRate);
  return n == null ? 'On invoice' : `${formatZar(n)}/hour`;
}

/** Number from an API money field (Decimal may arrive as a string). */
export function money(v: unknown): number | null {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : null;
}
