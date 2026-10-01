import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { unwrap } from '@/lib/marketplace/apiHelpers';
import type { MarketplaceUser } from '@/lib/marketplace/session';
import { money } from '@/lib/marketplace/pricing';
import { formatZar } from '@/lib/marketplace/theme';

/** Booking as returned by the bookings API. `sessionPin` may be present on detail; never render it. */
export type Booking = {
  id: string;
  customerId?: string;
  freelancerId?: string;
  category?: string;
  pricingMode?: 'hourly' | 'invoice' | string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  totalPrice?: number | string | null;
  status: string;
  address?: string | null;
  notes?: string | null;
  paymentStatus?: string | null;
  platformCommission?: number | string | null;
  freelancerPayout?: number | string | null;
  createdAt?: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  bookingGroupId?: string | null;
  pinVerificationStatus?: string | null;
  pinWindowStartAt?: string | null;
  pinWindowEndAt?: string | null;
  pinVerifiedAt?: string | null;
  disputeRequired?: boolean;
  disputeWindowEndsAt?: string | null;
  customer?: {
    id?: string;
    userId?: string;
    fullName?: string;
    profilePhotoUrl?: string | null;
    customerProfileId?: string;
    user?: { id?: string; fullName?: string; profilePhotoUrl?: string | null };
  };
  freelancer?: { id?: string; userId?: string; user?: { id?: string; fullName?: string; profilePhotoUrl?: string | null } };
  cancellationMatrix?: { code?: string } | null;
};

export type BookingList = { items: Booking[]; total: number; hasMore: boolean };

function toList(res: unknown): BookingList {
  const data = unwrap<unknown>(res);
  const items = Array.isArray(data) ? (data as Booking[]) : [];
  const pagination = (res as { pagination?: { total?: number; hasMore?: boolean } } | null)?.pagination;
  return { items, total: pagination?.total ?? items.length, hasMore: pagination?.hasMore === true };
}

/** Customer bookings (`GET /bookings/my?view=customer`), newest first. */
export async function fetchCustomerBookings(limit = 200): Promise<BookingList> {
  return toList(await get(`${ApiPaths.marketplace.myBookings}?view=customer&limit=${limit}`));
}

/** Freelancer jobs (`GET /freelancers/:id/bookings`), oldest first. */
export async function fetchFreelancerBookings(freelancerId: string, limit = 200): Promise<BookingList> {
  return toList(await get(`${ApiPaths.marketplace.freelancerBookings(freelancerId)}?limit=${limit}`));
}

export async function fetchBooking(id: string): Promise<Booking> {
  return unwrap<Booking>(await get(ApiPaths.marketplace.booking(id)));
}

/** Which side of [b] the signed-in user is on. */
export function roleInBooking(b: Booking, user: MarketplaceUser | null): 'customer' | 'freelancer' | null {
  if (!user) return null;
  if (b.freelancer?.userId === user.id || (user.freelancerId && b.freelancerId === user.freelancerId)) return 'freelancer';
  if (
    b.customer?.id === user.id ||
    b.customer?.userId === user.id ||
    (user.customerId && (b.customerId === user.customerId || b.customer?.customerProfileId === user.customerId))
  )
    return 'customer';
  return null;
}

/** The person on the other side: the freelancer for a customer, the customer for a freelancer. */
export function otherParty(b: Booking, role: 'customer' | 'freelancer' | null): { name: string; photo: string | null } {
  if (role === 'freelancer') {
    const c = b.customer;
    return { name: c?.fullName || c?.user?.fullName || 'Customer', photo: c?.profilePhotoUrl ?? c?.user?.profilePhotoUrl ?? null };
  }
  const f = b.freelancer?.user;
  return { name: f?.fullName || 'Freelancer', photo: f?.profilePhotoUrl ?? null };
}

export const bookingKeys = {
  all: ['marketplace', 'bookings'] as const,
  customer: ['marketplace', 'bookings', 'customer'] as const,
  freelancer: (id: string) => ['marketplace', 'bookings', 'freelancer', id] as const,
  detail: (id: string) => ['marketplace', 'bookings', 'detail', id] as const,
};

/** Total label: the app shows "On invoice" for invoice-priced bookings, otherwise the API total. */
export function bookingTotalLabel(b: Booking): string {
  if (b.pricingMode === 'invoice') return 'On invoice';
  const n = money(b.totalPrice);
  return n == null ? '' : formatZar(n);
}
