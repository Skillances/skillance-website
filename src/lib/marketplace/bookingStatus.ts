/**
 * Booking status helpers. Status strings come from the API
 * (`pending | confirmed | inProgress | completed | cancelled | rejected`); every check lowercases first.
 * Business rules (cancel windows, refunds, PIN windows) stay on the API. These only decide which
 * controls to offer; the API message is shown when it says no.
 */
import type { MkTone } from '@/components/marketplace/ui';

const s = (status: string | null | undefined) => String(status ?? '').toLowerCase();

export function canCustomerCancel(status: string): boolean {
  const v = s(status);
  return v !== 'cancelled' && v !== 'completed' && v !== 'rejected';
}

export function canFreelancerAccept(status: string): boolean {
  return s(status) === 'pending';
}

export function canFreelancerDecline(status: string): boolean {
  return s(status) === 'pending';
}

export function isActiveSession(status: string): boolean {
  const v = s(status);
  return v === 'confirmed' || v === 'inprogress' || v === 'in_progress';
}

export function isInProgress(status: string): boolean {
  const v = s(status);
  return v === 'inprogress' || v === 'in_progress';
}

export type BookingGroup = 'pending' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled';

/** List grouping (customer bookings, freelancer jobs). Rejected sits with cancelled. */
export function bookingGroup(status: string): BookingGroup {
  const v = s(status);
  if (v === 'pending') return 'pending';
  if (v === 'confirmed') return 'confirmed';
  if (v === 'inprogress' || v === 'in_progress') return 'inProgress';
  if (v === 'completed') return 'completed';
  return 'cancelled';
}

export function statusLabel(status: string): string {
  const v = s(status);
  switch (v) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Upcoming';
    case 'inprogress':
    case 'in_progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'rejected':
      return 'Declined';
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  }
}

export function statusTone(status: string): MkTone {
  const v = s(status);
  if (v === 'pending') return 'warning';
  if (v === 'confirmed') return 'upcoming';
  if (v === 'inprogress' || v === 'in_progress') return 'progress';
  if (v === 'completed') return 'success';
  if (v === 'cancelled' || v === 'rejected') return 'error';
  return 'neutral';
}
