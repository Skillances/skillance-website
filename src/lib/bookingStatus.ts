import type { BookingSummary } from '@/types/product';

export type BookingTabKey = 'pending' | 'upcoming' | 'inProgress' | 'completed' | 'rejected';

export const BOOKING_TABS: Array<{ key: BookingTabKey; label: string }> = [
  { key: 'pending', label: 'Pending' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'inProgress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Declined / cancelled' },
];

function normalizeStatus(status: string): string {
  return status.toLowerCase().replace(/_/g, '');
}

export function bookingTabForStatus(status: string): BookingTabKey {
  const s = normalizeStatus(status);
  if (s === 'pending') return 'pending';
  if (s === 'rejected') return 'rejected';
  if (s === 'cancelled' || s === 'declined') return 'rejected';
  if (s === 'inprogress') return 'inProgress';
  if (s === 'confirmed') return 'upcoming';
  if (s === 'completed') return 'completed';
  return 'pending';
}

export function groupBookingsByTab(bookings: BookingSummary[]): Record<BookingTabKey, BookingSummary[]> {
  const groups: Record<BookingTabKey, BookingSummary[]> = {
    pending: [],
    upcoming: [],
    inProgress: [],
    completed: [],
    rejected: [],
  };
  for (const booking of bookings) {
    groups[bookingTabForStatus(booking.status)].push(booking);
  }
  return groups;
}

export function formatBookingStatus(status: string): string {
  const s = normalizeStatus(status);
  switch (s) {
    case 'inprogress':
      return 'In progress';
    case 'confirmed':
      return 'Confirmed';
    case 'pending':
      return 'Pending';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'declined':
    case 'rejected':
      return 'Declined';
    default:
      return status;
  }
}
