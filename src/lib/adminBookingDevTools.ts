import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

export interface BookingDevToolsStatus {
  enabled: boolean;
}

export async function fetchBookingDevToolsStatus(): Promise<BookingDevToolsStatus> {
  const res = await get(ApiPaths.admin.bookingDevToolsStatus);
  const enabled = Boolean((res as { data?: { enabled?: boolean } }).data?.enabled);
  return { enabled };
}

export interface AdvanceBookingSessionForDevResponse {
  bookingId: string;
  status: string;
  sessionPin: string;
  pinWindowStartAt: string;
  pinWindowEndAt: string;
}

export async function advanceBookingSessionForDev(
  bookingId: string,
): Promise<AdvanceBookingSessionForDevResponse> {
  const res = await post(ApiPaths.admin.bookingAdvanceSessionDev(bookingId), {});
  const data = (res as { data?: AdvanceBookingSessionForDevResponse }).data;
  if (!data?.bookingId || !data.sessionPin) {
    throw new Error('Invalid advance-session response');
  }
  return data;
}

export interface AdvanceCompletedBookingForDevResponse {
  bookingId: string;
  status: string;
  completedAt: string;
  feedbackDeadlineIso: string;
  removedFreelancerRating: boolean;
  removedCustomerRating: boolean;
  removedFreelancerTextReview: boolean;
}

export async function advanceCompletedBookingForDev(
  bookingId: string,
): Promise<AdvanceCompletedBookingForDevResponse> {
  const res = await post(ApiPaths.admin.bookingAdvanceCompletedDev(bookingId), {});
  const data = (res as { data?: AdvanceCompletedBookingForDevResponse }).data;
  if (!data?.bookingId || !data.feedbackDeadlineIso) {
    throw new Error('Invalid advance-completed response');
  }
  return data;
}

/** Normalizes booking status from the API (e.g. `IN_PROGRESS` -> `inprogress`). */
export function normalizeBookingStatusKey(status: string | undefined): string {
  return (status ?? '').toLowerCase().replace(/_/g, '');
}

/**
 * Dev-only advance moves a **confirmed** booking to in-progress with PIN window open.
 * Hidden once the booking is already in session (or terminal states).
 */
export function bookingDevAdvanceAllowedForStatus(status: string | undefined): boolean {
  return normalizeBookingStatusKey(status) === 'confirmed';
}

/**
 * Dev-only: reset feedback window and remove per-booking ratings / written review for testing.
 */
export function bookingDevAdvanceCompletedAllowedForStatus(status: string | undefined): boolean {
  return normalizeBookingStatusKey(status) === 'completed';
}
