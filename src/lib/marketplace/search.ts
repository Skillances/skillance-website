import { useSyncExternalStore } from 'react';
import { post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

/** One row from `POST /freelancers/search` `data.freelancers` (also close to `GET /favorites` rows). */
export type FreelancerSummary = {
  id: string;
  userId?: string;
  fullName?: string;
  tag?: string | null;
  profilePhotoUrl?: string | null;
  bio?: string | null;
  categoryIds?: string[];
  hourlyRate?: number | string | null;
  categoryRates?: { categoryId: string; hourlyRate: number | string; bookingPricingMode?: string }[];
  rating?: number | null;
  totalReviews?: number | null;
  isVerified?: boolean;
  idVerificationStatus?: string;
  policeClearanceStatus?: string;
  serviceLocations?: { city?: string | null; label?: string | null; isPrimary?: boolean }[];
  /** Kilometres; only when the search sent both location and maxDistance. */
  distance?: number | null;
};

export type SearchBody = {
  query: string;
  location?: { latitude: number; longitude: number };
  filters?: {
    categoryIds?: string[];
    minRating?: number;
    priceRange?: { min: number; max: number };
    maxDistance?: number;
  };
  pagination?: { limit?: number; offset?: number };
  sortBy?: 'relevance' | 'distance' | 'rating' | 'price';
};

export type SearchPage = {
  freelancers: FreelancerSummary[];
  total: number;
  hasMore: boolean;
  offset: number;
};

export const SEARCH_PAGE_SIZE = 20;

/** Calls the search API. A blank query is sent as a single space (the API trims it to "browse"). */
export async function searchFreelancers(body: SearchBody): Promise<SearchPage> {
  const res = await post(ApiPaths.marketplace.searchFreelancers, {
    ...body,
    query: body.query.trim() ? body.query.trim().slice(0, 200) : ' ',
  });
  const data = (res?.data ?? {}) as { freelancers?: FreelancerSummary[]; pagination?: { total?: number; hasMore?: boolean } };
  return {
    freelancers: Array.isArray(data.freelancers) ? data.freelancers : [],
    total: data.pagination?.total ?? 0,
    hasMore: data.pagination?.hasMore === true,
    offset: body.pagination?.offset ?? 0,
  };
}

export function isIdVerified(f: { isVerified?: boolean; idVerificationStatus?: string }): boolean {
  return f.isVerified === true || f.idVerificationStatus === 'verified';
}

/* ------------------------------------------------ Browser location (opt-in) */

export type BrowserLocation =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'granted'; latitude: number; longitude: number }
  | { status: 'denied'; message: string };

let current: BrowserLocation = { status: 'idle' };
const listeners = new Set<() => void>();

function set(next: BrowserLocation) {
  current = next;
  listeners.forEach((l) => l());
}

/**
 * Asks for the browser position only when the user taps a "near you" control. Kept in memory for the
 * tab session; never stored or put in the URL. Denial falls back to searching without a location.
 */
export function requestBrowserLocation(): void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    set({ status: 'denied', message: 'Your browser does not share location.' });
    return;
  }
  set({ status: 'locating' });
  navigator.geolocation.getCurrentPosition(
    (pos) => set({ status: 'granted', latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
    (err) =>
      set({
        status: 'denied',
        message:
          err.code === err.PERMISSION_DENIED
            ? 'Location is off, so results are not sorted by distance.'
            : 'We could not find your location. Showing results without distance.',
      }),
    { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
  );
}

export function clearBrowserLocation(): void {
  set({ status: 'idle' });
}

export function useBrowserLocation(): BrowserLocation {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => current,
  );
}
