import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

function totalFromPaginated(res: { success?: boolean; data?: { pagination?: { total?: number } } } | null): number {
  if (!res?.success || !res.data?.pagination) return 0;
  return typeof res.data.pagination.total === 'number' ? res.data.pagination.total : 0;
}

function totalFromFreelancerList(
  res: { success?: boolean; data?: { total?: number } } | null,
): number {
  if (!res?.success || res.data == null) return 0;
  return typeof res.data.total === 'number' ? res.data.total : 0;
}

function arrayLen(res: { success?: boolean; data?: unknown } | null): number {
  if (!res?.success) return 0;
  if (Array.isArray(res.data)) return res.data.length;
  return 0;
}

async function loadPendingMap(): Promise<Record<string, number>> {
  const [
    idV,
    clearance,
    categoryLimits,
    certifications,
    digitalProducts,
    roleApps,
    website,
    contact,
    bookingStats,
  ] = await Promise.all([
    get(`${ApiPaths.admin.freelancersPendingVerification}?status=pending&limit=1&offset=0`).catch(() => null),
    get(
      `${ApiPaths.admin.freelancers}?idVerificationStatus=all&policeClearanceStatus=pending&limit=1&offset=0`,
    ).catch(() => null),
    get(`${ApiPaths.admin.freelancerCategoryLimitRequests}?status=pending`).catch(() => null),
    get(ApiPaths.admin.freelancerCertificationsPending).catch(() => null),
    get(ApiPaths.admin.digitalProductsPending).catch(() => null),
    get(`${ApiPaths.admin.roleApplications}?status=pending`).catch(() => null),
    get(`${ApiPaths.admin.websiteReviews}?status=pending&page=1&limit=1`).catch(() => null),
    get(`${ApiPaths.admin.contactMessages}?status=new&page=1&limit=1`).catch(() => null),
    get(ApiPaths.admin.bookingsStats).catch(() => null),
  ]);

  const idCount = totalFromFreelancerList(idV);
  const clearanceCount = totalFromFreelancerList(clearance);
  const websiteTotal = totalFromPaginated(website);
  const contactTotal = totalFromPaginated(contact);
  const bookingPending =
    bookingStats?.success && bookingStats.data && typeof bookingStats.data.pending === 'number'
      ? bookingStats.data.pending
      : 0;

  return {
    '/admin/verifications': idCount + clearanceCount,
    '/admin/category-limit-requests': arrayLen(categoryLimits),
    '/admin/certification-reviews': arrayLen(certifications),
    '/admin/digital-product-reviews': arrayLen(digitalProducts),
    '/admin/role-applications': arrayLen(roleApps),
    '/admin/website-reviews': websiteTotal,
    '/admin/contact-messages': contactTotal,
    '/admin/bookings': bookingPending,
  };
}

type Options = { refreshKey?: number };

/**
 * Fetches pending / attention-needed counts for admin sidebar pills.
 * Refetches on admin route change, on refreshKey bump, and every 2 minutes.
 */
export function useAdminNavPendingBadges(options: Options = {}) {
  const { refreshKey = 0 } = options;
  const location = useLocation();
  const [counts, setCounts] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    try {
      setCounts(await loadPendingMap());
    } catch {
      setCounts({});
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, location.pathname, refreshKey]);

  useEffect(() => {
    const t = window.setInterval(() => void load(), 120_000);
    return () => window.clearInterval(t);
  }, [load]);

  const getCount = useCallback((path: string) => counts[path] ?? 0, [counts]);

  return { counts, getCount, refresh: load };
}
