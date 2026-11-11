import { canShowPublicAverage, PUBLISHED_VERIFIED_BOOKING_RATING_BASIS } from '@/lib/reviewLock';

export interface PublicStat {
  value: number;
  suffix: string;
  label: string;
}

export function parseFiniteNumber(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function parseUsersCount(data: Record<string, unknown>): number | null {
  const n = parseFiniteNumber(data.usersCount);
  if (n === null) return null;
  return Math.max(0, Math.floor(n));
}

/**
 * Numbers that `/public/stats` actually returned. Missing fields are omitted.
 * `avgRating` is included only when the payload says it is from published
 * verified booking reviews and D5's minimum is set. There is no 1K+, 4.8,
 * or "100% verified" fallback.
 */
export function statsFromPayload(data: unknown): PublicStat[] {
  if (!data || typeof data !== 'object') return [];
  const record = data as Record<string, unknown>;
  const next: PublicStat[] = [];

  const users = parseUsersCount(record);
  if (users !== null) {
    next.push({ value: users, suffix: '', label: 'people on Skillance' });
  }

  const verified = parseFiniteNumber(record.verifiedPercent);
  if (verified !== null) {
    next.push({
      value: verified,
      suffix: '%',
      label: 'of providers verified',
    });
  }

  const bookings = parseFiniteNumber(record.bookingsCount);
  if (bookings !== null) {
    next.push({
      value: Math.max(0, Math.floor(bookings)),
      suffix: '',
      label: 'bookings',
    });
  }

  const rating = parseFiniteNumber(record.avgRating);
  const verifiedReviewCount = parseFiniteNumber(record.verifiedReviewCount);
  const basis =
    typeof record.ratingBasis === 'string'
      ? record.ratingBasis
      : typeof record.avgRatingBasis === 'string'
        ? record.avgRatingBasis
        : null;
  if (
    rating !== null &&
    canShowPublicAverage({
      rating,
      count: verifiedReviewCount,
      ratingBasis: basis,
      verifiedReviewCount,
    })
  ) {
    next.push({
      value: rating,
      suffix: '',
      label: 'average rating from verified booking reviews',
    });
  }

  return next;
}

export function formatPublicStat(stat: PublicStat, animated: number): string {
  if (stat.suffix === '%') return `${animated}${stat.suffix}`;
  if (!Number.isInteger(stat.value)) return animated.toFixed(1);
  return Math.round(animated).toLocaleString('en-ZA');
}

export { PUBLISHED_VERIFIED_BOOKING_RATING_BASIS };
