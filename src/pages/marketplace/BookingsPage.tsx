import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import BookingRow from '@/components/marketplace/BookingRow';
import {
  MkAnimatedList,
  MkEmpty,
  MkErrorState,
  MkLinkButton,
  MkListSkeleton,
  MkPageHeader,
  MkSegmented,
  MkSwap,
} from '@/components/marketplace/ui';
import { apiErrorMessage } from '@/lib/marketplace/apiHelpers';
import { bookingGroup, type BookingGroup } from '@/lib/marketplace/bookingStatus';
import { bookingKeys, fetchCustomerBookings, fetchFreelancerBookings, type Booking } from '@/lib/marketplace/bookings';
import { useCategories } from '@/lib/marketplace/categories';
import { activeView } from '@/lib/marketplace/session';

const TABS: { value: BookingGroup; label: string; tone?: 'upcoming' | 'progress' | 'neutral' }[] = [
  { value: 'pending', label: 'Pending', tone: 'neutral' },
  { value: 'confirmed', label: 'Upcoming', tone: 'upcoming' },
  { value: 'inProgress', label: 'In progress', tone: 'progress' },
  { value: 'completed', label: 'Completed', tone: 'neutral' },
  { value: 'cancelled', label: 'Cancelled' },
];

const EMPTY: Record<BookingGroup, { title: string; body: string }> = {
  pending: { title: 'No pending requests', body: 'Requests waiting for the freelancer to accept show here.' },
  confirmed: { title: 'Nothing upcoming', body: 'Accepted bookings show here until the session starts.' },
  inProgress: { title: 'No sessions in progress', body: 'A session moves here when it starts at its scheduled time.' },
  completed: { title: 'No completed bookings', body: 'Finished sessions show here, where you can leave a review.' },
  cancelled: { title: 'No cancelled bookings', body: 'Cancelled and declined bookings show here.' },
};

export default function BookingsPage() {
  const { user } = useAuth();
  const role = activeView(user);
  const freelancerId = user?.freelancerId ?? null;
  const categories = useCategories();
  const [tab, setTab] = useState<BookingGroup>('confirmed');

  const q = useQuery({
    queryKey: role === 'freelancer' ? bookingKeys.freelancer(freelancerId ?? '') : bookingKeys.customer,
    enabled: role === 'customer' || !!freelancerId,
    queryFn: () => (role === 'freelancer' ? fetchFreelancerBookings(freelancerId!) : fetchCustomerBookings()),
  });

  const grouped = useMemo(() => {
    const out: Record<BookingGroup, Booking[]> = {
      pending: [],
      confirmed: [],
      inProgress: [],
      completed: [],
      cancelled: [],
    };
    for (const b of q.data?.items ?? []) out[bookingGroup(b.status)].push(b);
    return out;
  }, [q.data]);

  const items = grouped[tab];
  const state = role === 'freelancer' && !freelancerId ? 'no-profile' : q.isPending ? 'loading' : q.isError ? 'error' : items.length === 0 ? 'empty' : 'list';

  return (
    <>
      <MkPageHeader title="Bookings" subtitle={role === 'freelancer' ? 'Sessions customers booked with you.' : 'Sessions you booked.'} />
      <div className="mb-5">
        <MkSegmented<BookingGroup>
          label="Booking status"
          value={tab}
          onChange={setTab}
          options={TABS.map((t) => ({ value: t.value, label: t.label, count: grouped[t.value].length, countTone: t.tone }))}
        />
      </div>
      <MkSwap id={`${state}-${tab}`}>
        {state === 'no-profile' && (
          <MkEmpty title="No freelancer profile yet" body="Your freelancer application must be approved before you can take bookings." />
        )}
        {state === 'loading' && <MkListSkeleton rows={4} />}
        {state === 'error' && (
          <MkErrorState message={apiErrorMessage(q.error, 'Bookings could not be loaded.')} onRetry={() => void q.refetch()} retrying={q.isRefetching} />
        )}
        {state === 'empty' && (
          <MkEmpty
            icon={<CalendarCheck className="h-6 w-6" aria-hidden="true" />}
            title={EMPTY[tab].title}
            body={EMPTY[tab].body}
            action={role === 'customer' && tab !== 'cancelled' ? <MkLinkButton to="/search">Find a freelancer</MkLinkButton> : undefined}
          />
        )}
        {state === 'list' && (
          <MkAnimatedList
            items={items}
            getKey={(b) => b.id}
            className="space-y-3"
            render={(b) => <BookingRow booking={b} role={role} categories={categories.data} />}
          />
        )}
      </MkSwap>
    </>
  );
}
