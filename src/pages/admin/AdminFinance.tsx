import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { get } from '@/lib/api';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAdminTheme } from '@/context/AdminThemeContext';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Banknote,
  CalendarCheck,
  Link2,
  Package,
  PiggyBank,
  Wallet,
} from 'lucide-react';

type SummaryPeriod = 'all' | '30d' | '90d' | 'ytd';

type ChartRangeDays = 30 | 90 | 180;

type FinanceGranularity = 'day' | 'week' | 'month';

interface AdminFinanceSummary {
  currency: 'ZAR';
  period: { allTime: true } | { start: string | null; end: string | null };
  bookings: {
    completedCount: number;
    grossCompletedValue: number;
    platformCommission: number;
    bookingsWithCommissionRecorded: number;
    freelancerPayoutTotal: number;
  };
  connectionFees: {
    paidCount: number;
    totalAmount: number;
  };
  digitalProductSales: {
    paidCount: number;
    grossAmount: number;
  };
  platformRevenue: {
    fromBookingsCommission: number;
    fromConnectionFees: number;
    totalKnown: number;
  };
  notes: {
    profit: string;
    digitalProducts: string;
    bookings: string;
  };
}

interface FinanceTimeseriesRow {
  periodStart: string;
  completedBookingsCount: number;
  grossBookingValue: number;
  platformCommission: number;
}

interface TimeseriesPayload {
  granularity: string;
  start: string;
  end: string;
  series: FinanceTimeseriesRow[];
}

const zar = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatZar(n: number): string {
  return zar.format(n);
}

function summaryQueryForPeriod(period: SummaryPeriod): string {
  if (period === 'all') return '';
  const end = new Date();
  let start = new Date(end);
  if (period === '30d') {
    start.setUTCDate(start.getUTCDate() - 30);
  } else if (period === '90d') {
    start.setUTCDate(start.getUTCDate() - 90);
  } else {
    start = new Date(Date.UTC(end.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
  }
  start.setUTCHours(0, 0, 0, 0);
  const params = new URLSearchParams({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  });
  return `?${params.toString()}`;
}

function chartQuery(rangeDays: ChartRangeDays, granularity: FinanceGranularity): string {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - rangeDays);
  start.setUTCHours(0, 0, 0, 0);
  const params = new URLSearchParams({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    granularity,
  });
  return `?${params.toString()}`;
}

function isAllTimePeriod(p: AdminFinanceSummary['period']): p is { allTime: true } {
  return 'allTime' in p && p.allTime === true;
}

function periodLabel(summary: AdminFinanceSummary | null): string {
  if (!summary) return '';
  const p = summary.period;
  if (isAllTimePeriod(p)) return 'All time';
  const s = p.start ? new Date(p.start).toLocaleDateString('en-ZA', { dateStyle: 'medium' }) : '';
  const e = p.end ? new Date(p.end).toLocaleDateString('en-ZA', { dateStyle: 'medium' }) : '';
  if (s && e) return `${s} – ${e}`;
  return s || e || 'Selected range';
}

const AdminFinance: React.FC = () => {
  const { isDark } = useAdminTheme();
  const [summaryPeriod, setSummaryPeriod] = useState<SummaryPeriod>('90d');
  const [chartRange, setChartRange] = useState<ChartRangeDays>(90);
  const [granularity, setGranularity] = useState<FinanceGranularity>('day');
  const [summary, setSummary] = useState<AdminFinanceSummary | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const axisColor = isDark ? '#a3a3a3' : '#a3a3a3';
  const gridColor = isDark ? '#404040' : '#f0f0f0';
  const gmvStroke = isDark ? '#a78bfa' : '#7c3aed';
  const commStroke = isDark ? '#34d399' : '#059669';

  const tooltipStyle = useMemo(
    () => ({
      contentStyle: {
        backgroundColor: isDark ? '#262626' : '#fff',
        border: isDark ? '1px solid #404040' : '1px solid #e5e5e5',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '10px 14px',
        color: isDark ? '#fff' : undefined,
      },
      itemStyle: {
        fontSize: '12px',
        fontWeight: 500,
        padding: '2px 0',
        color: isDark ? '#f5f5f5' : undefined,
      },
      labelStyle: {
        marginBottom: '6px',
        color: '#a3a3a3',
        fontSize: '10px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
      },
    }),
    [isDark],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const sumQ = summaryQueryForPeriod(summaryPeriod);
      const tsQ = chartQuery(chartRange, granularity);
      const [sumRes, tsRes] = await Promise.all([
        get(`/admin/finance/summary${sumQ}`),
        get(`/admin/finance/timeseries${tsQ}`),
      ]);

      if (sumRes.success && sumRes.data) {
        setSummary(sumRes.data as AdminFinanceSummary);
      } else {
        setSummary(null);
        toast.error('Could not load finance summary');
      }

      if (tsRes.success && tsRes.data) {
        setTimeseries(tsRes.data as TimeseriesPayload);
      } else {
        setTimeseries(null);
        toast.error('Could not load finance timeseries');
      }
    } catch {
      setSummary(null);
      setTimeseries(null);
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  }, [summaryPeriod, chartRange, granularity]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const chartData = useMemo(() => {
    if (!timeseries?.series?.length) return [];
    return timeseries.series.map((row) => {
      const d = new Date(row.periodStart);
      const name =
        granularity === 'month'
          ? d.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })
          : granularity === 'week'
            ? `W${getWeekNumber(d)} ${d.getUTCFullYear()}`
            : d.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
      return {
        name,
        grossBookingValue: row.grossBookingValue,
        platformCommission: row.platformCommission,
        completedBookingsCount: row.completedBookingsCount,
      };
    });
  }, [timeseries, granularity]);

  const showInitialSkeleton = loading && summary === null && timeseries === null;

  if (showInitialSkeleton) {
    return (
      <div className="space-y-10">
        <PageHeader title="Finance" description="Bookings, connection fees, and digital product revenue" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
      </div>
    );
  }

  return (
    <div className={`space-y-10 transition-opacity ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
      <PageHeader title="Finance" description="Bookings, connection fees, and digital product revenue (ZAR)">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={summaryPeriod} onValueChange={(v) => setSummaryPeriod(v as SummaryPeriod)}>
            <SelectTrigger className="w-[160px] bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-200 rounded-full">
              <SelectValue placeholder="Summary period" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 rounded-xl">
              <SelectItem value="all">Summary: All time</SelectItem>
              <SelectItem value="30d">Summary: Last 30 days</SelectItem>
              <SelectItem value="90d">Summary: Last 90 days</SelectItem>
              <SelectItem value="ytd">Summary: Year to date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      {summary && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-6">
          Summary period: <span className="text-neutral-800 dark:text-neutral-200">{periodLabel(summary)}</span>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Completed booking GMV"
          value={summary ? formatZar(summary.bookings.grossCompletedValue) : '—'}
          sub={`${summary?.bookings.completedCount ?? 0} completed`}
          icon={CalendarCheck}
        />
        <MetricCard
          title="Platform commission (bookings)"
          value={summary ? formatZar(summary.bookings.platformCommission) : '—'}
          sub={`${summary?.bookings.bookingsWithCommissionRecorded ?? 0} with commission recorded`}
          icon={PiggyBank}
        />
        <MetricCard
          title="Freelancer payouts (completed)"
          value={summary ? formatZar(summary.bookings.freelancerPayoutTotal) : '—'}
          sub="Sum on completed bookings"
          icon={Wallet}
        />
        <MetricCard
          title="Connection fees (paid)"
          value={summary ? formatZar(summary.connectionFees.totalAmount) : '—'}
          sub={`${summary?.connectionFees.paidCount ?? 0} payments`}
          icon={Link2}
        />
        <MetricCard
          title="Digital products (gross)"
          value={summary ? formatZar(summary.digitalProductSales.grossAmount) : '—'}
          sub={`${summary?.digitalProductSales.paidCount ?? 0} paid purchases`}
          icon={Package}
        />
        <MetricCard
          title="Platform revenue (known)"
          value={summary ? formatZar(summary.platformRevenue.totalKnown) : '—'}
          sub="Commission + connection fees"
          icon={Banknote}
        />
      </div>

      <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">
              Completed bookings over time
            </CardTitle>
            {timeseries && (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                {new Date(timeseries.start).toLocaleDateString('en-ZA', { dateStyle: 'medium' })} –{' '}
                {new Date(timeseries.end).toLocaleDateString('en-ZA', { dateStyle: 'medium' })} ·{' '}
                {timeseries.granularity}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={String(chartRange)} onValueChange={(v) => setChartRange(Number(v) as ChartRangeDays)}>
              <SelectTrigger className="w-[140px] bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 rounded-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-neutral-800 rounded-xl">
                <SelectItem value="30">Chart: 30 days</SelectItem>
                <SelectItem value="90">Chart: 90 days</SelectItem>
                <SelectItem value="180">Chart: 180 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={granularity} onValueChange={(v) => setGranularity(v as FinanceGranularity)}>
              <SelectTrigger className="w-[130px] bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 rounded-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-neutral-800 rounded-xl">
                <SelectItem value="day">By day</SelectItem>
                <SelectItem value="week">By week</SelectItem>
                <SelectItem value="month">By month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[320px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gmvFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={gmvStroke} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={gmvStroke} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="commFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={commStroke} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={commStroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke={axisColor}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      new Intl.NumberFormat('en-ZA', {
                        notation: 'compact',
                        compactDisplay: 'short',
                        maximumFractionDigits: 1,
                      }).format(Number(v))
                    }
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value, name) => {
                      const n = typeof value === 'number' ? value : Number(value);
                      const label = name === 'grossBookingValue' ? 'GMV' : 'Platform commission';
                      return [formatZar(Number.isFinite(n) ? n : 0), label];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', color: isDark ? '#d4d4d4' : '#737373' }}
                    formatter={(value) => (value === 'grossBookingValue' ? 'GMV' : 'Platform commission')}
                  />
                  <Area
                    type="monotone"
                    dataKey="grossBookingValue"
                    name="grossBookingValue"
                    stroke={gmvStroke}
                    strokeWidth={2}
                    fill="url(#gmvFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="platformCommission"
                    name="platformCommission"
                    stroke={commStroke}
                    strokeWidth={2}
                    fill="url(#commFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-400 text-sm">
                No booking data in this range
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {summary?.notes && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-900/40 px-5 py-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <p className="font-medium text-neutral-800 dark:text-neutral-200">Notes</p>
          <p>{summary.notes.profit}</p>
          <p>{summary.notes.digitalProducts}</p>
          <p>{summary.notes.bookings}</p>
        </div>
      )}
    </div>
  );
};

function getWeekNumber(d: Date): number {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - y.getTime()) / 86400000 + 1) / 7);
}

function MetricCard({
  title,
  value,
  sub,
  icon: Icon,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}) {
  return (
    <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 tracking-[0.2em] uppercase">
            {title}
          </p>
          <Icon size={18} className="text-neutral-400 dark:text-neutral-500 shrink-0" strokeWidth={1.5} />
        </div>
        <p className="text-xl font-semibold text-black dark:text-white tabular-nums tracking-tight">{value}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

export default AdminFinance;
