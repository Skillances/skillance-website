import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/categoryDisplay';
import { parseDashboardStats, parseEarningsTrend } from '@/lib/freelancerDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function FreelancerEarningsPage() {
  const { user } = useAuth();
  const freelancerId = user?.freelancerId ?? '';
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const { data: stats, isPending: statsLoading } = useQuery({
    queryKey: queryKeys.freelancers.dashboardStats(freelancerId),
    queryFn: async () => {
      const res = await get(ApiPaths.freelancers.dashboardStats(freelancerId));
      return parseDashboardStats(res?.data ?? res);
    },
    enabled: Boolean(freelancerId),
  });

  const { data: trend = [], isPending: trendLoading } = useQuery({
    queryKey: queryKeys.freelancers.dashboardEarnings(freelancerId, period),
    queryFn: async () => {
      const params = new URLSearchParams({ period, count: '8' });
      const res = await get(`${ApiPaths.freelancers.dashboardEarningsTrend(freelancerId)}?${params}`);
      return parseEarningsTrend(res?.data ?? res);
    },
    enabled: Boolean(freelancerId),
  });

  const isPending = statsLoading || trendLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Earnings</h1>
        <p className="text-sm text-neutral-600 mt-1">Track your income over time</p>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Today', value: stats.earnings.today },
            { label: 'This week', value: stats.earnings.thisWeek },
            { label: 'This month', value: stats.earnings.thisMonth },
            { label: 'All time', value: stats.earnings.allTime },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-neutral-200 bg-white p-4">
              <p className="text-xs text-neutral-500">{item.label}</p>
              <p className="text-lg font-semibold mt-1">{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          variant={period === 'weekly' ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => setPeriod('weekly')}
        >
          Weekly
        </Button>
        <Button
          type="button"
          variant={period === 'monthly' ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => setPeriod('monthly')}
        >
          Monthly
        </Button>
      </div>

      {isPending ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : trend.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-neutral-500 text-sm">
          No earnings data yet. Complete jobs to see your history here.
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Period</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {trend.map((row, i) => (
                <tr key={row.date ?? i}>
                  <td className="px-4 py-3">{row.date ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.amount ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
