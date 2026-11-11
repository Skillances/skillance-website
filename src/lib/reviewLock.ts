/**
 * Website side of M6 / P0-08 (support/review-lock-acceptance.md).
 *
 * Draft only. Merge waits for Markus via Skillance HQ. Open decisions D1–D8
 * stay open: the numbers below are the proposed defaults, not a confirmation.
 *
 * Clock (T5), so the companion backend PR can match it:
 * - The dispute window is the booking's `disputeWindowEndsAt`. This module never
 *   invents 24h or 48h (D3).
 * - No dispute: the review clock starts at `disputeWindowEndsAt`, and only once
 *   that instant is in the past. A missing timestamp fails closed.
 * - Open dispute (`open`, `under_review`, `pending`, `in_review`): the review
 *   stays held (`in_dispute_window`) even after `disputeWindowEndsAt`.
 * - Resolved dispute (`resolved`, `resolved_payout`, `resolved_refund`, `closed`):
 *   the clock starts at `dispute.resolvedAt`, including when that is earlier
 *   than `disputeWindowEndsAt`. A resolved dispute with no timestamp fails closed.
 * - The review window is `REVIEW_WINDOW_DAYS` × 24 hours after that start
 *   (proposed 14, D1). Not calendar-day rounding.
 * - Provider reply window is `PROVIDER_REPLY_WINDOW_DAYS` × 24 hours after
 *   `publishedAt` (proposed 30). No `publishedAt` means no reply form.
 *
 * Backend contract this client already speaks, and that the API PR must implement:
 *
 * 1. `POST /public/reviews` creates nothing. 401, 403, or 410. The website no
 *    longer calls it. Unauthenticated and unbooked posts must not create a
 *    pending or published review.
 * 2. `GET /bookings/:id/feedback-status` adds:
 *    `eligible` (boolean), `eligibleCode` (AC-A7 or null), `eligibleReason`,
 *    `reviewEligibleAt`, `reviewWindowEndsAt`, `reviewWindowDays`.
 *    `eligible: true` only for the booking party, after the clock above, inside
 *    the window, and only once for that side. Sign-in alone is not enough.
 *    Suggested HTTP codes on the write routes: 403 plus `eligibleCode`,
 *    409 `already_reviewed`, 401 when signed out.
 * 3. `POST /bookings/:id/rate-freelancer` and `POST /bookings/:id/review-text`
 *    accept `{ rating }` and `{ comment }` only. Reject client `role`, `name`,
 *    and `location`. New rows are `pending` and stay off public profiles,
 *    homepage, testimonials, and averages until approve.
 * 4. `POST /bookings/:id/rate-customer` stays a private star rating. No public
 *    written review from the provider (D4, two-way written reviews off).
 * 5. `GET /freelancers/:id/reviews`, `GET /public/reviews`, and
 *    `GET /public/testimonials` omit pending, hidden, rejected, and the three
 *    AC-E ids. Published booking reviews include `moderationStatus: "published"`,
 *    `publishedAt`, and a public name (`publicName` or first name + last initial),
 *    never `customer.fullName` as the display string. Replies include
 *    `{ comment, status }` and are public only when `status` is `published`.
 * 6. `GET /public/stats` `avgRating` counts published verified booking reviews
 *    only. Send `ratingBasis: "published_verified_booking_reviews"` and
 *    `verifiedReviewCount`. The website hides the average while D5 is unset
 *    (`MIN_VERIFIED_REVIEWS_FOR_PUBLIC_AVERAGE === null`).
 * 7. Admin: `GET /admin/booking-reviews?status=pending|published|hidden|rejected`,
 *    `PUT /admin/booking-reviews/:id/approve`, existing hide and restore,
 *    `GET /admin/booking-reviews/:id/moderation-log` with
 *    `{ id, reviewId, bookingId, actor, action, createdAt }`.
 *    Actions: approve, hide, restore, redact. No star or meaning edits.
 *    Hide is a soft hide (`deletedAt` or `hidden`). Do not hard-delete.
 * 8. `PUT /admin/website-reviews/:id` may store `deletionReason`. `DELETE` must
 *    refuse the three AC-E ids. This client never calls DELETE for those ids.
 * 9. `POST /freelancers/:freelancerId/reviews/:reviewId/reply` with `{ comment }`:
 *    one reply, published reviews only, inside the reply window, stored pending.
 *    A second reply is rejected.
 * 10. `POST /freelancers/:freelancerId/reviews/:reviewId/report` with
 *    `{ reason, evidence? }`. No silent delete. There is no appeal endpoint.
 * 11. Review and feedback POSTs are rate-limited per account and per IP (429).
 *    Any future public feedback POST also needs a Turnstile or hCaptcha token.
 *    With neither site key set, the client fails closed.
 *
 * The three AC-E rows stay in the database and in `/admin/website-reviews`.
 * They are not customer reviews on the homepage, testimonials, or averages.
 */

export const PRE_LAUNCH_WEBSITE_REVIEW_IDS = [
  '89bcddfc-c76e-46fb-9ca5-2e1c562bca80',
  '25b8f523-aeab-4d30-97e3-22c95b5c2848',
  'e8b9d01f-c316-46be-8394-2656647075d3',
] as const;

/** Proposed review window (D1). Not confirmed by Markus. */
export const REVIEW_WINDOW_DAYS = 14;

/** Proposed provider reply window (AC-F). Not confirmed by Markus. */
export const PROVIDER_REPLY_WINDOW_DAYS = 30;

/**
 * D5 is open. `null` hides every public average. Do not replace this with a
 * guessed minimum.
 */
export const MIN_VERIFIED_REVIEWS_FOR_PUBLIC_AVERAGE: number | null = null;

export const PUBLISHED_VERIFIED_BOOKING_RATING_BASIS = 'published_verified_booking_reviews';

export const REVIEW_INELIGIBLE_CODES = [
  'no_booking',
  'not_complete',
  'in_dispute_window',
  'window_expired',
  'already_reviewed',
  'not_a_party',
  'account_not_eligible',
] as const;

export type ReviewIneligibleCode = (typeof REVIEW_INELIGIBLE_CODES)[number];

export const SUPPORT_EMAIL = 'support@skillance.co.za';

export const VERIFIED_CUSTOMER_LABEL = 'Verified customer';

export const VERIFIED_BOOKING_LABEL = 'Verified booking';

export const REVIEW_PENDING_ACK = 'Thanks, your review will appear once checked.';

export const RATING_PENDING_ACK = 'Thanks, your rating will appear once checked.';

export const PRIVATE_CUSTOMER_RATING_ACK = 'Thanks. This rating is not published as a review.';

export const REPLY_PENDING_ACK = 'Thanks, your reply will appear once checked.';

export const REVIEW_APPEAL_NOTE = `Either side can appeal a moderation decision once, in writing to ${SUPPORT_EMAIL}, within 14 days. This screen does not send that appeal.`;

export const INELIGIBLE_COPY: Record<ReviewIneligibleCode, string> = {
  no_booking: 'You can leave a review after a completed booking. Signing in on its own is not enough.',
  not_complete: 'This booking is not complete yet, so a review is not open.',
  in_dispute_window: 'A review is held until the dispute window has closed, or until an open dispute is resolved.',
  window_expired: 'The review window for this booking has closed.',
  already_reviewed: 'You have already reviewed this booking.',
  not_a_party: 'Only the people on this booking can leave feedback for it.',
  account_not_eligible: 'This account cannot leave a public review for this booking.',
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const PUBLISHED_STATUSES = new Set(['published', 'approved', 'visible']);
const HELD_STATUSES = new Set(['pending', 'hidden', 'rejected', 'deleted', 'draft']);
const OPEN_DISPUTE = new Set(['open', 'under_review', 'pending', 'in_review']);
const RESOLVED_DISPUTE = new Set(['resolved', 'resolved_payout', 'resolved_refund', 'closed']);
const CANCELLED = new Set(['cancelled', 'canceled', 'no_show', 'noshow']);

export function normalizeToken(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

export function parseInstant(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addDayWindows(start: Date, days: number): Date {
  return new Date(start.getTime() + days * MS_PER_DAY);
}

export function parseIneligibleCode(value: string | null | undefined): ReviewIneligibleCode | null {
  const token = normalizeToken(value);
  return (REVIEW_INELIGIBLE_CODES as readonly string[]).includes(token) ? (token as ReviewIneligibleCode) : null;
}

export function ineligibleCopy(code: string | null | undefined): string | null {
  const parsed = parseIneligibleCode(code);
  return parsed ? INELIGIBLE_COPY[parsed] : null;
}

export type ReviewEligibility = {
  eligible: boolean;
  code: ReviewIneligibleCode | null;
  message: string;
  reviewEligibleAt: string | null;
  reviewWindowEndsAt: string | null;
};

export type ReviewEligibilityInput = {
  booking?: {
    status?: string | null;
    disputeWindowEndsAt?: string | null;
    isTest?: boolean | null;
    test?: boolean | null;
  } | null;
  dispute?: {
    status?: string | null;
    resolvedAt?: string | null;
  } | null;
  now?: Date;
  isParty: boolean;
  isStaffAccount?: boolean;
  alreadyReviewed?: boolean;
  windowDays?: number;
  /** Prefer the API clock when feedback-status sends one. */
  reviewEligibleAt?: string | null;
};

function blocked(
  code: ReviewIneligibleCode,
  reviewEligibleAt: string | null = null,
  reviewWindowEndsAt: string | null = null,
  message?: string,
): ReviewEligibility {
  return {
    eligible: false,
    code,
    message: message ?? INELIGIBLE_COPY[code],
    reviewEligibleAt,
    reviewWindowEndsAt,
  };
}

export function evaluateBookingReviewEligibility(input: ReviewEligibilityInput): ReviewEligibility {
  const now = input.now ?? new Date();
  const windowDays = input.windowDays ?? REVIEW_WINDOW_DAYS;
  const booking = input.booking ?? null;

  if (!booking) return blocked('no_booking');
  if (!input.isParty) return blocked('not_a_party');
  if (input.isStaffAccount || booking.isTest === true || booking.test === true) return blocked('account_not_eligible');

  const status = normalizeToken(booking.status);
  if (CANCELLED.has(status)) return blocked('account_not_eligible');
  if (status !== 'completed') return blocked('not_complete');
  if (input.alreadyReviewed) return blocked('already_reviewed');

  const disputeStatus = normalizeToken(input.dispute?.status);
  if (OPEN_DISPUTE.has(disputeStatus)) return blocked('in_dispute_window');

  let start: Date | null = null;
  if (input.reviewEligibleAt) {
    start = parseInstant(input.reviewEligibleAt);
    if (!start) return blocked('in_dispute_window');
  } else if (RESOLVED_DISPUTE.has(disputeStatus)) {
    start = parseInstant(input.dispute?.resolvedAt);
    if (!start) {
      return blocked(
        'in_dispute_window',
        null,
        null,
        'This review stays held until the dispute resolution time is known. The review window starts then.',
      );
    }
  } else {
    const windowEnds = parseInstant(booking.disputeWindowEndsAt);
    if (!windowEnds || windowEnds.getTime() > now.getTime()) return blocked('in_dispute_window');
    start = windowEnds;
  }

  if (start.getTime() > now.getTime()) return blocked('in_dispute_window', start.toISOString(), null);

  const end = addDayWindows(start, windowDays);
  if (now.getTime() > end.getTime()) return blocked('window_expired', start.toISOString(), end.toISOString());

  return {
    eligible: true,
    code: null,
    message: '',
    reviewEligibleAt: start.toISOString(),
    reviewWindowEndsAt: end.toISOString(),
  };
}

export function mergeFeedbackEligibility(
  local: ReviewEligibility,
  api?: {
    eligible?: boolean;
    eligibleCode?: string | null;
    eligibleReason?: string | null;
  } | null,
): ReviewEligibility {
  if (!api || api.eligible !== true) {
    const code = parseIneligibleCode(api?.eligibleCode) ?? local.code;
    const message =
      (code ? INELIGIBLE_COPY[code] : null) ||
      api?.eligibleReason?.trim() ||
      local.message ||
      'A review is not open for this booking yet.';
    return { ...local, eligible: false, code, message };
  }
  if (!local.eligible) return local;
  return local;
}

export type PublicReviewCustomer = {
  publicName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  profilePhotoUrl?: string | null;
};

/** First name + last initial, or "Verified customer". Never the full name. */
export function publicReviewerName(customer?: PublicReviewCustomer | null): string {
  const full = customer?.fullName?.trim() ?? '';
  const explicit = customer?.publicName?.trim() ?? '';
  if (explicit && explicit.toLowerCase() !== full.toLowerCase() && (!full || !explicit.toLowerCase().includes(full.toLowerCase()))) {
    return explicit;
  }

  const first = customer?.firstName?.trim();
  const last = customer?.lastName?.trim();
  if (first) {
    if (!last) return first;
    return `${first} ${last.charAt(0).toUpperCase()}.`;
  }

  if (!full) return VERIFIED_CUSTOMER_LABEL;
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0] ?? VERIFIED_CUSTOMER_LABEL;
  const initial = parts[parts.length - 1]?.charAt(0).toUpperCase();
  return initial ? `${parts[0]} ${initial}.` : VERIFIED_CUSTOMER_LABEL;
}

export function isPreLaunchWebsiteReview(id: string | null | undefined): boolean {
  return Boolean(id && (PRE_LAUNCH_WEBSITE_REVIEW_IDS as readonly string[]).includes(id));
}

export type PublicReviewShape = {
  id?: string | null;
  moderationStatus?: string | null;
  status?: string | null;
  isAnonymous?: boolean | null;
  location?: string | null;
  source?: string | null;
};

/** True only for a published verified booking review that may be shown publicly. */
export function isPublicBookingReview(review: PublicReviewShape): boolean {
  if (!review.id || isPreLaunchWebsiteReview(review.id)) return false;
  if (review.isAnonymous === true) return false;
  if (typeof review.location === 'string' && review.location.trim()) return false;
  const source = normalizeToken(review.source);
  if (source === 'website' || source === 'testimonial' || source === 'public_form') return false;
  const status = normalizeToken(review.moderationStatus ?? review.status);
  if (!status) return true;
  if (HELD_STATUSES.has(status)) return false;
  return PUBLISHED_STATUSES.has(status);
}

export function selectPublicBookingReviews<T extends PublicReviewShape>(reviews: readonly T[]): T[] {
  return reviews.filter(isPublicBookingReview);
}

export function canShowPublicAverage(input: {
  rating?: number | null;
  count?: number | null;
  ratingBasis?: string | null;
  verifiedReviewCount?: number | null;
  /** Defaults to the open D5 constant, which hides the average. */
  minimum?: number | null;
}): boolean {
  const minimum = input.minimum === undefined ? MIN_VERIFIED_REVIEWS_FOR_PUBLIC_AVERAGE : input.minimum;
  if (minimum == null || !Number.isFinite(minimum) || minimum < 1) return false;
  if (input.ratingBasis !== PUBLISHED_VERIFIED_BOOKING_RATING_BASIS) return false;
  const verified = input.verifiedReviewCount;
  if (typeof verified !== 'number' || !Number.isFinite(verified) || verified < minimum) return false;
  if (typeof input.rating !== 'number' || !Number.isFinite(input.rating) || input.rating <= 0) return false;
  if (typeof input.count === 'number' && Number.isFinite(input.count) && input.count !== verified) return false;
  return true;
}

export type BookingReviewQueue = 'pending' | 'published' | 'hidden' | 'rejected';

export function bookingReviewQueueStatus(row: {
  moderationStatus?: string | null;
  status?: string | null;
  deletedAt?: string | null;
}): BookingReviewQueue {
  if (row.deletedAt) return 'hidden';
  const status = normalizeToken(row.moderationStatus ?? row.status);
  if (status === 'pending' || status === 'draft') return 'pending';
  if (status === 'hidden' || status === 'deleted') return 'hidden';
  if (status === 'rejected') return 'rejected';
  return 'published';
}

export function websiteReviewHardDeleteAllowed(id: string): boolean {
  return !isPreLaunchWebsiteReview(id);
}

/** Unfeature is allowed. Newly featuring a pre-launch row is not. */
export function websiteReviewFeatureToggleAllowed(id: string, currentlyFeatured: boolean): boolean {
  if (currentlyFeatured) return true;
  return !isPreLaunchWebsiteReview(id);
}

export type ProviderReplyState = {
  showForm: boolean;
  publicReply: string | null;
  providerPendingReply: string | null;
  closedMessage: string | null;
};

export function providerReplyState(input: {
  isProvider: boolean;
  moderationStatus?: string | null;
  status?: string | null;
  publishedAt?: string | null;
  reply?: { comment?: string | null; status?: string | null } | null;
  now?: Date;
  windowDays?: number;
}): ProviderReplyState {
  const now = input.now ?? new Date();
  const windowDays = input.windowDays ?? PROVIDER_REPLY_WINDOW_DAYS;
  const replyStatus = normalizeToken(input.reply?.status) || (input.reply?.comment ? 'pending' : '');
  const publicReply =
    input.reply?.comment && (replyStatus === 'published' || replyStatus === 'approved') ? input.reply.comment : null;
  const providerPendingReply = input.isProvider && input.reply?.comment && !publicReply ? input.reply.comment : null;

  const status = normalizeToken(input.moderationStatus ?? input.status);
  const published = !status || PUBLISHED_STATUSES.has(status);
  if (!input.isProvider || HELD_STATUSES.has(status) || !published) {
    return { showForm: false, publicReply, providerPendingReply, closedMessage: null };
  }
  if (input.reply?.comment) {
    return {
      showForm: false,
      publicReply,
      providerPendingReply,
      closedMessage: 'You have already replied to this review.',
    };
  }
  const publishedAt = parseInstant(input.publishedAt);
  if (!publishedAt) return { showForm: false, publicReply, providerPendingReply, closedMessage: null };
  const end = addDayWindows(publishedAt, windowDays);
  if (now.getTime() > end.getTime()) {
    return {
      showForm: false,
      publicReply,
      providerPendingReply,
      closedMessage: 'The reply window for this review has closed.',
    };
  }
  return { showForm: true, publicReply, providerPendingReply, closedMessage: null };
}

/** Customer written review body. Role, name, and location are not accepted. */
export function customerReviewTextBody(comment: string): { comment: string } {
  return { comment: comment.trim() };
}

export function customerRatingBody(rating: number): { rating: number } {
  return { rating };
}

export function providerReplyBody(comment: string): { comment: string } {
  return { comment: comment.trim() };
}
