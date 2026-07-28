import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import type { BookingSummary } from '@/types/product';
import { BOOKING_TABS, groupBookingsByTab, formatBookingStatus, type BookingTabKey } from '@/lib/bookingStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const s = status.toLowerCase();
  if (s === 'confirmed' || s === 'completed') return 'default';
  if (s === 'cancelled' || s === 'declined' || s === 'rejected') return 'destructive';
  return 'secondary';
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingTabKey>('pending');

  const { data: bookings = [], isPending } = useQuery({
    queryKey: queryKeys.bookings.my(),
    queryFn: async () => {
      const res = await get(ApiPaths.bookings.my);
      const data = res?.data?.bookings ?? res?.data ?? [];
      return Array.isArray(data) ? (data as BookingSummary[]) : [];
    },
  });

  const grouped = useMemo(() => groupBookingsByTab(bookings), [bookings]);
  const visible = grouped[activeTab];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">My bookings</h1>
          <p className="text-sm text-neutral-600 mt-1">Track and manage your service bookings</p>
        </div>
        <Link
          to="/app/recurring"
          className="text-sm font-medium text-neutral-900 underline underline-offset-2"
        >
          Recurring bookings
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {BOOKING_TABS.map((tab) => {
          const count = grouped[tab.key].length;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-sm border transition-colors',
                activeTab === tab.key
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400',
              )}
            >
              {tab.label}
              {count > 0 ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {isPending ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-neutral-200">
          <p className="text-neutral-600">No bookings yet.</p>
          <Link to="/app/search" className="text-sm font-medium text-neutral-900 underline mt-2 inline-block">
            Find a freelancer
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-10 rounded-2xl border border-dashed border-neutral-200">
          <p className="text-neutral-500 text-sm">No bookings in this tab.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((b) => (
            <Link
              key={b.id}
              to={`/app/bookings/${b.id}`}
              className="block rounded-2xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-neutral-900">
                    {b.freelancerName ?? b.categoryName ?? b.category}
                  </p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {b.scheduledDate} at {b.scheduledTime?.slice(0, 5)} ({b.durationMinutes} min)
                  </p>
                  {b.categoryName && b.freelancerName ? (
                    <p className="text-xs text-neutral-400 mt-1">{b.categoryName}</p>
                  ) : null}
                  {b.address ? <p className="text-xs text-neutral-400 mt-1">{b.address}</p> : null}
                  {b.pricingMode === 'invoice' ? (
                    <p className="text-xs text-neutral-500 mt-1">Custom quote</p>
                  ) : b.totalPrice != null ? (
                    <p className="text-xs text-neutral-500 mt-1">R{b.totalPrice.toFixed(0)}</p>
                  ) : null}
                </div>
                <Badge variant={statusVariant(b.status)}>{formatBookingStatus(b.status)}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
