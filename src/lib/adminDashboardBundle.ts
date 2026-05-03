import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

export type TimeframeKey = '24h' | '7d' | '30d' | '90d';

export function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  const weekMatch = dateStr.match(/^(\d{4})-W(\d{2})$/);
  if (weekMatch) return `W${weekMatch[2]}`;
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr + '-01');
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getTimeframeParams(key: TimeframeKey): {
  startDate: string;
  endDate: string;
  interval: 'daily' | 'weekly' | 'monthly';
} {
  const now = new Date();
  const endDate = now.toISOString().slice(0, 10);
  let startDate: string;
  let interval: 'daily' | 'weekly' | 'monthly' = 'daily';
  if (key === '24h') {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    startDate = d.toISOString().slice(0, 10);
  } else if (key === '7d') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    startDate = d.toISOString().slice(0, 10);
  } else if (key === '30d') {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    startDate = d.toISOString().slice(0, 10);
  } else {
    const d = new Date(now);
    d.setDate(d.getDate() - 90);
    startDate = d.toISOString().slice(0, 10);
    interval = 'weekly';
  }
  return { startDate, endDate, interval };
}

export type GrowthRow = { name?: string; date?: string; users: number; freelancers: number };

export type DashboardActivity = {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
};

export type AdminDashboardBundle = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dashboardData: any | null;
  growthData: GrowthRow[];
  activities: DashboardActivity[];
  websiteMetrics: { unreadMessages: number; subscribers: number; pendingReviews: number };
};

export async function fetchAdminDashboardBundle(timeframe: TimeframeKey): Promise<AdminDashboardBundle> {
  const { startDate, endDate, interval } = getTimeframeParams(timeframe);
  const query = `startDate=${startDate}&endDate=${endDate}&interval=${interval}`;

  const [dashboardRes, userGrowthRes, freelancerGrowthRes, securityRes, messagesRes, subscribersRes, reviewsRes] =
    await Promise.all([
      get(ApiPaths.admin.dashboard),
      get(`${ApiPaths.admin.analyticsUserGrowth}?${query}`),
      get(`${ApiPaths.admin.analyticsFreelancerGrowth}?${query}`),
      get(`${ApiPaths.admin.securityEvents}?limit=10&orderBy=createdAt&orderDirection=desc`).catch(() => null),
      get(`${ApiPaths.admin.contactMessages}?status=new&limit=1`).catch(() => null),
      get(`${ApiPaths.admin.notifySubscribers}?limit=1`).catch(() => null),
      get(`${ApiPaths.admin.websiteReviews}?status=pending&limit=1`).catch(() => null),
    ]);

  let dashboardData: AdminDashboardBundle['dashboardData'] = null;
  if (dashboardRes.success && dashboardRes.data) {
    dashboardData = dashboardRes.data;
  }

  let growthData: GrowthRow[] = [];
  if (userGrowthRes?.success && freelancerGrowthRes?.success) {
    const userSeries = userGrowthRes.data?.series ?? userGrowthRes.data?.data?.series ?? [];
    const freelancerSeries = freelancerGrowthRes.data?.series ?? freelancerGrowthRes.data?.data?.series ?? [];
    const dateMap = new Map<
      string,
      { name: string; date: string; users: number; freelancers: number | undefined }
    >();

    userSeries.forEach((item: { date: string; cumulative: number }) => {
      const name = formatDateLabel(item.date);
      if (!dateMap.has(item.date)) dateMap.set(item.date, { name, date: item.date, users: 0, freelancers: 0 });
      const row = dateMap.get(item.date)!;
      row.users = item.cumulative;
    });

    freelancerSeries.forEach((item: { date: string; cumulative: number }) => {
      const name = formatDateLabel(item.date);
      if (!dateMap.has(item.date)) dateMap.set(item.date, { name, date: item.date, users: 0, freelancers: 0 });
      const row = dateMap.get(item.date)!;
      row.freelancers = item.cumulative;
    });

    const sortKey = (d: { date: string }) => {
      const m = d.date.match(/^(\d{4})-W(\d{2})$/);
      if (m) return parseInt(m[1], 10) * 100 + parseInt(m[2], 10);
      const t = new Date(d.date).getTime();
      return isNaN(t) ? 0 : t;
    };

    growthData = Array.from(dateMap.values())
      .map((r) => ({
        name: r.name,
        date: r.date,
        users: r.users,
        freelancers: r.freelancers ?? 0,
      }))
      .sort((a, b) => sortKey(a) - sortKey(b))
      .slice(-30);

    if (growthData.length === 0) {
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        growthData.push({
          name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: 0,
          freelancers: 0,
        });
      }
    }
  }

  let activities: DashboardActivity[] = [];
  if (securityRes?.success && securityRes.data?.events) {
    activities = securityRes.data.events.slice(0, 8).map((evt: Record<string, unknown>) => {
      const eventType = String(evt.eventType ?? '');
      return {
        id: String(evt.id),
        type:
          evt.eventType === 'exploit_attempt' || evt.eventType === 'honeypot'
            ? 'security'
            : evt.eventType === 'rate_limited'
              ? 'login'
              : 'security',
        title: eventType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        description: `${String(evt.method ?? '')} ${String(evt.path ?? '')} - ${String(evt.reason ?? '')}`,
        timestamp: String(evt.createdAt ?? ''),
      };
    });
  }

  const websiteMetrics = {
    unreadMessages: messagesRes?.success ? messagesRes.data?.pagination?.total ?? 0 : 0,
    subscribers: subscribersRes?.success ? subscribersRes.data?.pagination?.total ?? 0 : 0,
    pendingReviews: reviewsRes?.success ? reviewsRes.data?.pagination?.total ?? 0 : 0,
  };

  return { dashboardData, growthData, activities, websiteMetrics };
}
