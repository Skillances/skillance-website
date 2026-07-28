import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/context/AuthContext';
import type { BookingSummary } from '@/types/product';
import { formatBookingStatus, bookingTabForStatus, type BookingTabKey } from '@/lib/bookingStatus';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const JOB_TABS: Array<{ key: BookingTabKey | 'past'; label: string }> = [
  { key: 'pending', label: 'Pending' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'inProgress', label: 'In progress' },
  { key: 'past', label: 'Past' },
];

function jobTabForBooking(status: string): BookingTabKey | 'past' {
  const tab = bookingTabForStatus(status);
  if (tab === 'rejected') return 'completed';
  return tab;
}

export default function FreelancerJobsPage() {
  const { user } = useAuth();
  const freelancerId = user?.freelancerId ?? '';
  const [activeTab, setActiveTab] = useState<BookingTabKey | 'past'>('pending');

  const { data: jobs = [], isPending } = useQuery({
    queryKey: queryKeys.freelancers.jobs(freelancerId),
    queryFn: async () => {
      const res = await get(ApiPaths.freelancers.bookings(freelancerId));
      const data = res?.data?.bookings ?? res?.data ?? [];
      return Array.isArray(data) ? (data as BookingSummary[]) : [];
    },
    enabled: Boolean(freelancerId),
  });

  const grouped = useMemo(() => {
    const buckets: Record<BookingTabKey | 'past', BookingSummary[]> = {
      pending: [],
      upcoming: [],
      inProgress: [],
      completed: [],
      rejected: [],
      past: [],
    };
    for (const job of jobs) {
      const tab = jobTabForBooking(job.status);
      if (tab === 'completed' || tab === 'rejected') {
        buckets.past.push(job);
      } else {
        buckets[tab].push(job);
      }
    }
    return buckets;
  }, [jobs]);

  const visible = grouped[activeTab];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Jobs</h1>
          <p className="text-sm text-neutral-600 mt-1">Manage incoming and active bookings</p>
        </div>
        <Link
          to="/app/recurring/requests"
          className="text-sm font-medium text-neutral-900 underline underline-offset-2"
        >
          Recurring requests
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {JOB_TABS.map((tab) => {
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
      ) : jobs.length === 0 ? (
        <p className="text-neutral-500 text-sm">No jobs yet.</p>
      ) : visible.length === 0 ? (
        <p className="text-neutral-500 text-sm">No jobs in this tab.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((job) => (
            <Link
              key={job.id}
              to={`/app/bookings/${job.id}`}
              className="block rounded-2xl border border-neutral-200 bg-white p-4 hover:border-neutral-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{job.customerName ?? job.categoryName ?? job.category}</p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {job.scheduledDate} at {job.scheduledTime?.slice(0, 5)}
                  </p>
                  {job.categoryName ? (
                    <p className="text-xs text-neutral-400 mt-1">{job.categoryName}</p>
                  ) : null}
                </div>
                <Badge>{formatBookingStatus(job.status)}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
