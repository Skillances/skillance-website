import type { BookingSummary } from '@/types/product';

export interface DashboardEarnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  allTime: number;
  weeklyTrend?: Array<{ date: string; amount: number }>;
  monthlyComparison?: {
    current: number;
    previous: number;
    change: number;
  };
}

export interface DashboardBookings {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  thisWeek: number;
  today: number;
}

export interface DashboardMetrics {
  responseRate: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  averageResponseTime: number;
  averageBookingValue: number;
}

export interface DashboardActivityItem {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  actionUrl?: string;
}

export interface FreelancerDashboardStats {
  earnings: DashboardEarnings;
  bookings: DashboardBookings;
  metrics: DashboardMetrics;
  upcomingBookings: BookingSummary[];
  recentActivity: DashboardActivityItem[];
}

export interface EarningsTrendPoint {
  date: string;
  amount: number;
}

export function parseDashboardStats(raw: unknown): FreelancerDashboardStats | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  const earnings = data.earnings as DashboardEarnings | undefined;
  const bookings = data.bookings as DashboardBookings | undefined;
  const metrics = data.metrics as DashboardMetrics | undefined;
  if (!earnings || !bookings || !metrics) return null;
  return {
    earnings,
    bookings,
    metrics,
    upcomingBookings: Array.isArray(data.upcomingBookings)
      ? (data.upcomingBookings as BookingSummary[])
      : [],
    recentActivity: Array.isArray(data.recentActivity)
      ? (data.recentActivity as DashboardActivityItem[])
      : [],
  };
}

export function parseEarningsTrend(raw: unknown): EarningsTrendPoint[] {
  if (Array.isArray(raw)) {
    return raw as EarningsTrendPoint[];
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const nested = obj.trend ?? obj.series ?? obj.weeklyTrend;
    if (Array.isArray(nested)) {
      return nested as EarningsTrendPoint[];
    }
  }
  return [];
}
