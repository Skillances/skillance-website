/**
 * Client pause for connection fees and digital-product purchases.
 * The website does not call those payment routes, so it stays safe on the
 * current API (which may still accept them) and on the API that returns
 * 410 CONNECTION_FEE_PAUSED / 503 for sales.
 */
import { apiErrorCode } from '@/lib/marketplace/apiHelpers';

/** Shown wherever a connection fee or digital-product purchase would have been. */
export const PAYMENTS_COMING_SOON = 'Coming soon with secure escrow payments.';

type PausedPaymentError = {
  statusCode: number;
  code: string;
  message: string;
};

/** POST bodies for these routes are refused in the client before any request is sent. */
export function pausedPaymentError(endpoint: string): PausedPaymentError | null {
  const path = (endpoint.startsWith('/') ? endpoint : `/${endpoint}`).split('?')[0];
  if (/^\/bookings\/[^/]+\/connection-fee(\/confirm)?$/.test(path)) {
    return { statusCode: 410, code: 'CONNECTION_FEE_PAUSED', message: PAYMENTS_COMING_SOON };
  }
  if (/^\/products\/[^/]+\/purchase$/.test(path)) {
    return { statusCode: 503, code: 'SALES_PAUSED', message: PAYMENTS_COMING_SOON };
  }
  return null;
}

export function apiStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const body = err as { statusCode?: unknown; status?: unknown };
  if (typeof body.statusCode === 'number') return body.statusCode;
  if (typeof body.status === 'number') return body.status;
  return undefined;
}

/** 410 from a connection-fee route, including the current API if it ever sends that code. */
export function isConnectionFeePaused(err: unknown): boolean {
  return apiStatus(err) === 410 || apiErrorCode(err) === 'CONNECTION_FEE_PAUSED';
}

/** Purchase route is unavailable (503 while sales are off, or the client pause). */
export function isSalesUnavailable(err: unknown): boolean {
  if (apiStatus(err) === 503) return true;
  const code = apiErrorCode(err);
  return code === 'SALES_PAUSED' || code === 'SALES_DISABLED' || code === 'PRODUCT_SALES_DISABLED';
}

/** Dispute and invoice reads by booking return 403 when the caller is not a party. */
export function isNotAParty(err: unknown): boolean {
  return apiStatus(err) === 403;
}

export function paymentsPausedMessage(err: unknown): string | null {
  if (isConnectionFeePaused(err) || isSalesUnavailable(err)) return PAYMENTS_COMING_SOON;
  return null;
}

/** True when a purchase row must not be described as paid. */
export function isPendingPurchase(row: { paymentStatus?: string | null; purchaseStatus?: string | null; status?: string | null }): boolean {
  const status = String(row.paymentStatus ?? row.purchaseStatus ?? row.status ?? '').toLowerCase();
  return status === 'pending' || status === 'unpaid' || status === 'processing' || status === 'created';
}

/**
 * Drops `payoutReferenceId` so freelancer updates never send it and public
 * payloads never keep it for display. Other payout fields are left alone.
 */
export function omitPayoutReferenceId<T>(value: T): T {
  return stripPayoutReferenceId(value) as T;
}

function stripPayoutReferenceId(value: unknown): unknown {
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const stripped = stripPayoutReferenceId(item);
      if (stripped !== item) changed = true;
      return stripped;
    });
    return changed ? next : value;
  }
  if (!value || typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;
  let changed = false;
  const next: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(record)) {
    if (key === 'payoutReferenceId') {
      changed = true;
      continue;
    }
    const stripped = stripPayoutReferenceId(child);
    if (stripped !== child) changed = true;
    next[key] = stripped;
  }
  return changed ? next : value;
}

/** Freelancer profile updates are `PUT /freelancers/:id` with no extra segment. */
export function isFreelancerProfileWrite(endpoint: string): boolean {
  const path = (endpoint.startsWith('/') ? endpoint : `/${endpoint}`).split('?')[0];
  return /^\/freelancers\/[^/]+$/.test(path);
}
