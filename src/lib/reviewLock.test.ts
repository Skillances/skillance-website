import { describe, expect, it } from 'vitest';
import { authorizePublicFeedbackPost } from './publicFeedbackCaptcha';
import { statsFromPayload } from './publicStats';
import {
  MIN_VERIFIED_REVIEWS_FOR_PUBLIC_AVERAGE,
  PRE_LAUNCH_WEBSITE_REVIEW_IDS,
  PROVIDER_REPLY_WINDOW_DAYS,
  REVIEW_PENDING_ACK,
  REVIEW_WINDOW_DAYS,
  bookingReviewQueueStatus,
  canShowPublicAverage,
  customerReviewTextBody,
  evaluateBookingReviewEligibility,
  isPublicBookingReview,
  mergeFeedbackEligibility,
  providerReplyState,
  publicReviewerName,
  selectPublicBookingReviews,
  websiteReviewFeatureToggleAllowed,
  websiteReviewHardDeleteAllowed,
  type ReviewEligibility,
  type ReviewEligibilityInput,
} from './reviewLock';

const NOW = new Date('2026-11-11T10:00:00.000Z');
const DAY = 24 * 60 * 60 * 1000;

function booking(overrides: Record<string, unknown> = {}) {
  return {
    status: 'completed',
    disputeWindowEndsAt: new Date(NOW.getTime() - DAY).toISOString(),
    ...overrides,
  };
}

function eligibility(overrides: Partial<ReviewEligibilityInput> = {}): ReviewEligibility {
  return evaluateBookingReviewEligibility({
    booking: booking(),
    now: NOW,
    isParty: true,
    ...overrides,
  });
}

describe('review eligibility', () => {
  it('rejects a signed-in user with no booking', () => {
    const result = eligibility({ booking: null });
    expect(result.eligible).toBe(false);
    expect(result.code).toBe('no_booking');
  });

  it('rejects a booking that is not complete', () => {
    expect(eligibility({ booking: booking({ status: 'confirmed' }) }).code).toBe('not_complete');
    expect(eligibility({ booking: booking({ status: 'in_progress' }) }).code).toBe('not_complete');
  });

  it('holds a review while disputeWindowEndsAt is still in the future', () => {
    const result = eligibility({
      booking: booking({ disputeWindowEndsAt: new Date(NOW.getTime() + 60_000).toISOString() }),
    });
    expect(result.code).toBe('in_dispute_window');
    expect(result.eligible).toBe(false);
  });

  it('does not invent a 24h or 48h window when disputeWindowEndsAt is missing', () => {
    const result = eligibility({ booking: booking({ disputeWindowEndsAt: null }) });
    expect(result.code).toBe('in_dispute_window');
    expect(result.reviewEligibleAt).toBeNull();
  });

  it('holds a review while a dispute is open, even after the dispute window', () => {
    const result = eligibility({ dispute: { status: 'open' } });
    expect(result.code).toBe('in_dispute_window');
  });

  it('starts the review window at dispute resolution, then applies the configured day count', () => {
    const resolvedAt = new Date(NOW.getTime() - 2 * DAY).toISOString();
    const result = eligibility({
      booking: booking({ disputeWindowEndsAt: new Date(NOW.getTime() + DAY).toISOString() }),
      dispute: { status: 'resolved_refund', resolvedAt },
    });
    expect(result.eligible).toBe(true);
    expect(result.reviewEligibleAt).toBe(new Date(resolvedAt).toISOString());
    expect(result.reviewWindowEndsAt).toBe(new Date(new Date(resolvedAt).getTime() + REVIEW_WINDOW_DAYS * DAY).toISOString());
  });

  it('keeps a resolved dispute held when the resolution time is missing', () => {
    const result = eligibility({ dispute: { status: 'closed', resolvedAt: null } });
    expect(result.eligible).toBe(false);
    expect(result.code).toBe('in_dispute_window');
  });

  it('accepts the booking customer inside the window after the dispute window closes', () => {
    const result = eligibility();
    expect(result.eligible).toBe(true);
    expect(result.code).toBeNull();
    const start = new Date(NOW.getTime() - DAY);
    expect(result.reviewWindowEndsAt).toBe(new Date(start.getTime() + REVIEW_WINDOW_DAYS * DAY).toISOString());
  });

  it('rejects a second review from the same party', () => {
    expect(eligibility({ alreadyReviewed: true }).code).toBe('already_reviewed');
  });

  it('rejects a submit after the configured review window', () => {
    const ends = new Date(NOW.getTime() - (REVIEW_WINDOW_DAYS + 1) * DAY).toISOString();
    expect(eligibility({ booking: booking({ disputeWindowEndsAt: ends }) }).code).toBe('window_expired');
  });

  it('uses the proposed 14-day config rather than a scattered literal', () => {
    expect(REVIEW_WINDOW_DAYS).toBe(14);
  });

  it('rejects someone who is not a party, and staff, test, cancelled, and no-show accounts', () => {
    expect(eligibility({ isParty: false }).code).toBe('not_a_party');
    expect(eligibility({ isStaffAccount: true }).code).toBe('account_not_eligible');
    expect(eligibility({ booking: booking({ isTest: true }) }).code).toBe('account_not_eligible');
    expect(eligibility({ booking: booking({ status: 'cancelled' }) }).code).toBe('account_not_eligible');
    expect(eligibility({ booking: booking({ status: 'no_show' }) }).code).toBe('account_not_eligible');
  });

  it('lets a stricter API rejection override a local pass', () => {
    const local = eligibility();
    const merged = mergeFeedbackEligibility(local, { eligible: false, eligibleCode: 'window_expired' });
    expect(merged.eligible).toBe(false);
    expect(merged.code).toBe('window_expired');
  });

  it('does not treat a completed-only API pass as eligible during the dispute window', () => {
    const local = eligibility({
      booking: booking({ disputeWindowEndsAt: new Date(NOW.getTime() + DAY).toISOString() }),
    });
    const merged = mergeFeedbackEligibility(local, { eligible: true });
    expect(merged.eligible).toBe(false);
    expect(merged.code).toBe('in_dispute_window');
  });

  it('fails closed when feedback-status omits eligible', () => {
    const merged = mergeFeedbackEligibility(eligibility(), {});
    expect(merged.eligible).toBe(false);
  });
});

describe('public display', () => {
  it('never uses the full name as the public reviewer name', () => {
    expect(publicReviewerName({ fullName: 'Thandi Nkosi' })).toBe('Thandi N.');
    expect(publicReviewerName({ firstName: 'Thandi', lastName: 'Nkosi' })).toBe('Thandi N.');
    expect(publicReviewerName({ publicName: 'Thandi Nkosi', fullName: 'Thandi Nkosi' })).toBe('Thandi N.');
    expect(publicReviewerName({ publicName: 'Thandi N.' })).toBe('Thandi N.');
    expect(publicReviewerName(null)).toBe('Verified customer');
    expect(publicReviewerName({ fullName: 'Thandi Nkosi' })).not.toContain('Nkosi');
  });

  it('drops pending reviews, website reviews, and the three pre-launch ids', () => {
    const rows = [
      { id: 'published-1', moderationStatus: 'published', comment: 'Real booking' },
      { id: 'pending-1', moderationStatus: 'pending', comment: 'Waiting' },
      { id: 'hidden-1', moderationStatus: 'hidden' },
      { id: PRE_LAUNCH_WEBSITE_REVIEW_IDS[0], moderationStatus: 'approved' },
      { id: 'anon', isAnonymous: true, moderationStatus: 'published' },
      { id: 'suburb', location: 'Centurion', moderationStatus: 'published' },
      { id: 'legacy-booking' },
    ];
    expect(selectPublicBookingReviews(rows).map((row) => row.id)).toEqual(['published-1', 'legacy-booking']);
    expect(isPublicBookingReview({ id: PRE_LAUNCH_WEBSITE_REVIEW_IDS[1], status: 'approved' })).toBe(false);
  });

  it('hides averages until the basis is verified booking reviews and D5 is set', () => {
    expect(MIN_VERIFIED_REVIEWS_FOR_PUBLIC_AVERAGE).toBeNull();
    expect(
      canShowPublicAverage({
        rating: 4.8,
        verifiedReviewCount: 3,
        ratingBasis: 'published_verified_booking_reviews',
      }),
    ).toBe(false);
    expect(
      canShowPublicAverage({
        rating: 4.8,
        verifiedReviewCount: 3,
        ratingBasis: 'published_verified_booking_reviews',
        minimum: 10,
      }),
    ).toBe(false);
    expect(
      canShowPublicAverage({
        rating: 4.2,
        count: 12,
        verifiedReviewCount: 12,
        ratingBasis: 'published_verified_booking_reviews',
        minimum: 10,
      }),
    ).toBe(true);
  });

  it('does not build a public stat from a bare 4.8 or from a failed payload', () => {
    expect(statsFromPayload(null)).toEqual([]);
    expect(statsFromPayload({ avgRating: 4.8, bookingsCount: 4, usersCount: 8 })).toEqual([
      { value: 8, suffix: '', label: 'people on Skillance' },
      { value: 4, suffix: '', label: 'bookings' },
    ]);
    const labels = statsFromPayload({
      avgRating: 4.8,
      verifiedReviewCount: 3,
      ratingBasis: 'website_reviews',
      bookingsCount: 1000,
    }).map((stat) => stat.label);
    expect(labels).not.toContain('average rating from verified booking reviews');
  });

  it('stores a written review without a client role, name, or location', () => {
    expect(customerReviewTextBody('  Helpful session.  ')).toEqual({ comment: 'Helpful session.' });
    expect(customerReviewTextBody('Fine')).not.toHaveProperty('name');
    expect(customerReviewTextBody('Fine')).not.toHaveProperty('role');
    expect(customerReviewTextBody('Fine')).not.toHaveProperty('location');
    expect(REVIEW_PENDING_ACK).toMatch(/once checked/i);
    expect(REVIEW_PENDING_ACK).not.toMatch(/posted/i);
  });
});

describe('moderation and replies', () => {
  it('maps booking reviews into pending, published, and hidden', () => {
    expect(bookingReviewQueueStatus({ moderationStatus: 'pending' })).toBe('pending');
    expect(bookingReviewQueueStatus({ moderationStatus: 'published' })).toBe('published');
    expect(bookingReviewQueueStatus({ deletedAt: '2026-11-01T00:00:00.000Z' })).toBe('hidden');
    expect(bookingReviewQueueStatus({})).toBe('published');
    expect(bookingReviewQueueStatus({ moderationStatus: 'rejected' })).toBe('rejected');
  });

  it('refuses to hard-delete or newly feature the three pre-launch reviews', () => {
    for (const id of PRE_LAUNCH_WEBSITE_REVIEW_IDS) {
      expect(websiteReviewHardDeleteAllowed(id)).toBe(false);
      expect(websiteReviewFeatureToggleAllowed(id, false)).toBe(false);
      expect(websiteReviewFeatureToggleAllowed(id, true)).toBe(true);
    }
    expect(websiteReviewHardDeleteAllowed('someone-else')).toBe(true);
  });

  it('allows one provider reply on a published review inside 30 days', () => {
    const publishedAt = new Date(NOW.getTime() - DAY).toISOString();
    const open = providerReplyState({
      isProvider: true,
      moderationStatus: 'published',
      publishedAt,
      now: NOW,
    });
    expect(open.showForm).toBe(true);
    expect(PROVIDER_REPLY_WINDOW_DAYS).toBe(30);

    const second = providerReplyState({
      isProvider: true,
      moderationStatus: 'published',
      publishedAt,
      now: NOW,
      reply: { comment: 'Thank you', status: 'pending' },
    });
    expect(second.showForm).toBe(false);
    expect(second.publicReply).toBeNull();
    expect(second.providerPendingReply).toBe('Thank you');

    const pendingReview = providerReplyState({
      isProvider: true,
      moderationStatus: 'pending',
      publishedAt,
      now: NOW,
    });
    expect(pendingReview.showForm).toBe(false);

    const expired = providerReplyState({
      isProvider: true,
      moderationStatus: 'published',
      publishedAt: new Date(NOW.getTime() - (PROVIDER_REPLY_WINDOW_DAYS + 1) * DAY).toISOString(),
      now: NOW,
    });
    expect(expired.showForm).toBe(false);
    expect(expired.closedMessage).toMatch(/closed/i);
  });

  it('shows a reply publicly only after it is published', () => {
    const state = providerReplyState({
      isProvider: false,
      moderationStatus: 'published',
      publishedAt: NOW.toISOString(),
      reply: { comment: 'Glad it helped', status: 'published' },
      now: NOW,
    });
    expect(state.publicReply).toBe('Glad it helped');
    expect(state.showForm).toBe(false);
  });
});

describe('public feedback captcha', () => {
  it('fails closed without a site key or without a token', () => {
    expect(authorizePublicFeedbackPost('token', {}).allowed).toBe(false);
    expect(authorizePublicFeedbackPost('', { VITE_TURNSTILE_SITE_KEY: 'site-key' }).reason).toBe('missing_token');
    expect(authorizePublicFeedbackPost('token', { VITE_HCAPTCHA_SITE_KEY: 'site-key' })).toMatchObject({
      allowed: true,
      provider: 'hcaptcha',
    });
    expect(authorizePublicFeedbackPost('token', { VITE_TURNSTILE_SITE_KEY: 'turnstile', VITE_HCAPTCHA_SITE_KEY: 'h' }).provider).toBe(
      'turnstile',
    );
  });
});

