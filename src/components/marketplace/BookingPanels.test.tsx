import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Booking } from '@/lib/marketplace/bookings';
import { INELIGIBLE_COPY, REVIEW_PENDING_ACK } from '@/lib/reviewLock';

const { get, post } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ get, post }));
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', isAdmin: false, fullName: 'Ada Lovelace', email: 'ada@example.com' },
    isAuthenticated: true,
  }),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { FeedbackPanel } from './BookingPanels';

const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();

function booking(disputeWindowEndsAt: string): Booking {
  return {
    id: 'booking-1',
    status: 'completed',
    scheduledDate: '2026-11-01',
    scheduledTime: '10:00',
    durationMinutes: 60,
    disputeWindowEndsAt,
    customer: { id: 'user-1', userId: 'user-1' },
  };
}

function renderPanel(disputeWindowEndsAt: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <FeedbackPanel booking={booking(disputeWindowEndsAt)} role="customer" />
    </QueryClientProvider>,
  );
}

describe('FeedbackPanel', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    get.mockImplementation((url: string) => {
      if (url.includes('feedback-status')) {
        return Promise.resolve({
          data: {
            eligible: true,
            customerStarRatingSubmitted: false,
            customerTextReviewSubmitted: false,
          },
        });
      }
      return Promise.resolve({ data: null });
    });
  });

  it('does not offer a review while the dispute window is still open', async () => {
    renderPanel(future);
    expect(await screen.findByText(INELIGIBLE_COPY.in_dispute_window)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit rating' })).toBeNull();
    expect(post).not.toHaveBeenCalled();
  });

  it('tells the customer the review appears once checked', async () => {
    get.mockImplementation((url: string) => {
      if (url.includes('feedback-status')) {
        return Promise.resolve({
          data: {
            eligible: true,
            customerStarRatingSubmitted: true,
            customerTextReviewSubmitted: true,
          },
        });
      }
      return Promise.resolve({ data: null });
    });
    renderPanel(past);
    expect(await screen.findByText(REVIEW_PENDING_ACK)).toBeInTheDocument();
    expect(screen.queryByText(/review posted/i)).toBeNull();
    expect(screen.getByText(/support@skillance.co.za/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /appeal/i })).toBeNull();
  });

  it('submits stars and text without a name, role, or location', async () => {
    post.mockResolvedValue({ success: true });
    get.mockImplementation((url: string) => {
      if (url.includes('feedback-status')) {
        return Promise.resolve({
          data: {
            eligible: true,
            customerStarRatingSubmitted: true,
            customerTextReviewSubmitted: false,
          },
        });
      }
      return Promise.resolve({ data: null });
    });
    renderPanel(past);
    fireEvent.change(await screen.findByLabelText(/write a review/i), { target: { value: 'Careful work.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit review' }));
    await waitFor(() => expect(post).toHaveBeenCalledWith('/bookings/booking-1/review-text', { comment: 'Careful work.' }));
    const body = post.mock.calls[0][1] as Record<string, unknown>;
    expect(body).not.toHaveProperty('name');
    expect(body).not.toHaveProperty('role');
    expect(body).not.toHaveProperty('location');
  });
});
