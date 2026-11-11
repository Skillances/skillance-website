import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookingReviewItems, type FreelancerReviewRecord } from './FreelancerReviews';
import { PRE_LAUNCH_WEBSITE_REVIEW_IDS } from '@/lib/reviewLock';

const published: FreelancerReviewRecord = {
  id: 'review-1',
  rating: 5,
  comment: 'On time and careful.',
  createdAt: '2026-11-01T08:00:00.000Z',
  publishedAt: '2026-11-02T08:00:00.000Z',
  moderationStatus: 'published',
  customer: { fullName: 'Thandi Nkosi', profilePhotoUrl: null },
};

describe('BookingReviewItems', () => {
  it('shows a verified booking label and a shortened name', () => {
    render(
      <BookingReviewItems
        reviews={[published]}
        isProvider={false}
        now={new Date('2026-11-11T10:00:00.000Z')}
        onSubmitReply={vi.fn()}
        onSubmitReport={vi.fn()}
      />,
    );
    expect(screen.getByText('Thandi N.')).toBeInTheDocument();
    expect(screen.queryByText('Thandi Nkosi')).toBeNull();
    expect(screen.getByText('Verified booking')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reply' })).toBeNull();
    expect(screen.queryByRole('button', { name: /appeal/i })).toBeNull();
  });

  it('offers the provider one reply on a published review and hides pending replies from the public', () => {
    const { rerender } = render(
      <BookingReviewItems
        reviews={[published]}
        isProvider
        now={new Date('2026-11-11T10:00:00.000Z')}
        onSubmitReply={vi.fn()}
        onSubmitReport={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Reply' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Report this review' })).toBeInTheDocument();

    rerender(
      <BookingReviewItems
        reviews={[{ ...published, reply: { comment: 'Thank you', status: 'pending' } }]}
        isProvider={false}
        now={new Date('2026-11-11T10:00:00.000Z')}
        onSubmitReply={vi.fn()}
        onSubmitReport={vi.fn()}
      />,
    );
    expect(screen.queryByText('Thank you')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reply' })).toBeNull();
  });

  it('does not render a pre-launch website review that was passed in by mistake', () => {
    render(
      <BookingReviewItems
        reviews={[
          {
            ...published,
            id: PRE_LAUNCH_WEBSITE_REVIEW_IDS[0],
            customer: { fullName: 'Anonymous' },
            comment: 'I was approached my Skillance representatives',
          },
        ]}
        isProvider={false}
        onSubmitReply={vi.fn()}
        onSubmitReport={vi.fn()}
      />,
    );
    expect(screen.queryByText(/I was approached/)).toBeNull();
    expect(screen.getByText('No verified booking reviews yet.')).toBeInTheDocument();
  });
});
