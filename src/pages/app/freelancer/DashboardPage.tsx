import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/categoryDisplay';
import { parseDashboardStats } from '@/lib/freelancerDashboard';
import { formatBookingStatus } from '@/lib/bookingStatus';
import { Skeleton } from '@/components/ui/skeleton';

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}% vs last month`;
}

export default function FreelancerDashboardPage() {
  const { user } = useAuth();
  const freelancerId = user?.freelancerId ?? '';

  const { data: stats, isPending, isError } = useQuery({
    queryKey: queryKeys.freelancers.dashboardStats(freelancerId),
    queryFn: async () => {
      const res = await get(ApiPaths.freelancers.dashboardStats(freelancerId));
      return parseDashboardStats(res?.data ?? res);
    },
    enabled: Boolean(freelancerId),
  });

  if (!freelancerId) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Freelancer profile not found.</p>
        <Link to="/app/profile" className="text-sm underline mt-2 inline-block">
          Go to profile
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Could not load dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-600 mt-1">Your business at a glance</p>
      </div>

      {isPending || !stats ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'This month', value: formatCurrency(stats.earnings.thisMonth) },
              { label: 'This week', value: formatCurrency(stats.earnings.thisWeek) },
              { label: 'Pending jobs', value: String(stats.bookings.pending) },
              {
                label: 'Rating',
                value:
                  stats.metrics.totalReviews > 0
                    ? `${stats.metrics.averageRating.toFixed(1)} (${stats.metrics.totalReviews})`
                    : stats.metrics.averageRating > 0
                      ? stats.metrics.averageRating.toFixed(1)
                      : '—',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-xs text-neutral-500">{item.label}</p>
                <p className="text-xl font-semibold mt-1 text-neutral-900">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-900">Today</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Earnings</span>
                  <span className="font-medium">{formatCurrency(stats.earnings.today)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Bookings</span>
                  <span className="font-medium">{stats.bookings.today}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Confirmed upcoming</span>
                  <span className="font-medium">{stats.bookings.confirmed}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-900">Performance</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Response rate</span>
                  <span className="font-medium">{Math.round(stats.metrics.responseRate)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Completion rate</span>
                  <span className="font-medium">{Math.round(stats.metrics.completionRate)}%</span>
                </div>
                {stats.earnings.monthlyComparison ? (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Monthly trend</span>
                    <span className="font-medium">
                      {formatChange(stats.earnings.monthlyComparison.change)}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-sm font-semibold text-neutral-900">Upcoming bookings</h2>
              <Link to="/app/freelancer/jobs" className="text-xs text-neutral-600 underline">
                View all jobs
              </Link>
            </div>
            {stats.upcomingBookings.length === 0 ? (
              <p className="text-sm text-neutral-500">No upcoming bookings.</p>
            ) : (
              <div className="space-y-2">
                {stats.upcomingBookings.slice(0, 5).map((booking) => (
                  <Link
                    key={booking.id}
                    to={`/app/bookings/${booking.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 px-3 py-2 hover:border-neutral-300"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {booking.customerName ?? booking.categoryName ?? 'Booking'}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {String(booking.scheduledDate).slice(0, 10)} at{' '}
                        {booking.scheduledTime?.slice?.(0, 5) ?? booking.scheduledTime}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-500 shrink-0">
                      {formatBookingStatus(booking.status)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {stats.recentActivity.length > 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-900 mb-3">Recent activity</h2>
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 6).map((item, index) => (
                  <div key={`${item.type}-${item.timestamp}-${index}`} className="text-sm">
                    <p className="font-medium text-neutral-900">{item.title}</p>
                    <p className="text-neutral-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
