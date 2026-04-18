import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '@/lib/api';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Activity,
  RefreshCw,
  Database,
  ScrollText,
  ShieldAlert,
  LayoutDashboard,
} from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { type Column } from '@/components/admin/DataTable';

type TimeRangeKey = '24h' | '7d' | '30d';

type MetricsSnapshot = {
  disclaimer: string;
  window_ms: number;
  http: {
    request_count: number;
    avg_duration_ms: number;
    by_status_class: Record<string, number>;
  };
  prisma: {
    tracked_model_action_keys: number;
    total_queries_since_process_start: number;
  };
};

type HistoryByTime = {
  bucketStart: string;
  requestCount: number;
  avgDurationMs: number;
  byStatusClass: Record<string, number>;
};

type TopRoute = {
  routeTemplate: string;
  requestCount: number;
  avgDurationMs: number;
};

function rangeForKey(key: TimeRangeKey): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to);
  if (key === '24h') from.setHours(from.getHours() - 24);
  else if (key === '7d') from.setDate(from.getDate() - 7);
  else from.setDate(from.getDate() - 30);
  return { from, to };
}

function bucketLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const routeColumns: Column<TopRoute>[] = [
  {
    key: 'routeTemplate',
    header: 'Route',
    render: (r) => (
      <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-[320px] block">
        {r.routeTemplate}
      </span>
    ),
  },
  {
    key: 'requestCount',
    header: 'Requests',
    render: (r) => (
      <span className="tabular-nums text-sm">{r.requestCount.toLocaleString()}</span>
    ),
  },
  {
    key: 'avgDurationMs',
    header: 'Avg ms',
    render: (r) => (
      <span className="tabular-nums text-sm text-neutral-500">{r.avgDurationMs}</span>
    ),
  },
];

const AdminObservability: React.FC = () => {
  const [rangeKey, setRangeKey] = useState<TimeRangeKey>('24h');
  const [snapshot, setSnapshot] = useState<MetricsSnapshot | null>(null);
  const [history, setHistory] = useState<{ byTime: HistoryByTime[]; topRoutes: TopRoute[] } | null>(
    null,
  );
  const [querySummary, setQuerySummary] = useState<{
    totalQueries?: number;
    slowQueries?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (opts?: { quiet?: boolean }) => {
    const { from, to } = rangeForKey(rangeKey);
    const qs = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;
    try {
      if (!opts?.quiet) setLoading(true);
      else setRefreshing(true);
      const [snapRes, histRes, qmRes] = await Promise.all([
        get('/admin/metrics/snapshot'),
        get(`/admin/metrics/history?${qs}`),
        get('/admin/query-metrics?source=database&summary=true&hours=24').catch(() => null),
      ]);
      if (snapRes.success && snapRes.data) setSnapshot(snapRes.data as MetricsSnapshot);
      if (histRes.success && histRes.data) {
        setHistory(histRes.data as { byTime: HistoryByTime[]; topRoutes: TopRoute[] });
      }
      if (qmRes?.success && qmRes.data?.database?.summary) {
        setQuerySummary({
          totalQueries: qmRes.data.database.summary.totalQueries,
          slowQueries: qmRes.data.database.summary.slowQueries,
        });
      } else {
        setQuerySummary(null);
      }
    } catch {
      toast.error('Failed to load observability data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [rangeKey]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    const id = setInterval(() => {
      void fetchData({ quiet: true });
    }, 45000);
    return () => clearInterval(id);
  }, [fetchData]);

  const chartData =
    history?.byTime.map((b) => ({
      name: bucketLabel(b.bucketStart),
      requests: b.requestCount,
      avgMs: b.avgDurationMs,
    })) ?? [];

  const statusEntries = snapshot
    ? Object.entries(snapshot.http.by_status_class).sort(([a], [b]) => a.localeCompare(b))
    : [];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <PageHeader
          title="Observability"
          description="HTTP traffic aggregates (persisted) and live snapshot. No response bodies stored."
        />
        <div className="flex items-center gap-3">
          <Select
            value={rangeKey}
            onValueChange={(v) => setRangeKey(v as TimeRangeKey)}
          >
            <SelectTrigger className="w-[160px] rounded-full border-neutral-200 dark:border-neutral-600">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={refreshing}
            onClick={() => void fetchData()}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {snapshot?.disclaimer && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-3xl">
          {snapshot.disclaimer}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !snapshot ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-28 rounded-2xl bg-neutral-100 dark:bg-neutral-800"
              />
            ))}
          </>
        ) : (
          <>
            <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-neutral-500 flex items-center gap-2">
                  <Activity className="h-4 w-4" /> HTTP (rolling window)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {snapshot?.http.request_count?.toLocaleString() ?? '0'}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Requests in snapshot window</p>
              </CardContent>
            </Card>
            <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Avg latency (snapshot)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {snapshot?.http.avg_duration_ms ?? 0} ms
                </p>
              </CardContent>
            </Card>
            <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Prisma (process)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {snapshot?.prisma.total_queries_since_process_start?.toLocaleString() ?? '0'}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Queries since process start</p>
              </CardContent>
            </Card>
            <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  DB queries (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {querySummary?.totalQueries?.toLocaleString() ?? '—'}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Slow: {querySummary?.slowQueries?.toLocaleString() ?? '—'}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {statusEntries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {statusEntries.map(([k, v]) => (
            <span
              key={k}
              className="text-xs px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tabular-nums"
            >
              {k}: {v.toLocaleString()}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              Request volume by bucket
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {loading && chartData.length === 0 ? (
              <Skeleton className="h-full w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            ) : chartData.length === 0 ? (
              <p className="text-sm text-neutral-500">No HTTP aggregate data in this range yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="currentColor" className="text-neutral-400" />
                  <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-neutral-400" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid var(--border, #e5e5e5)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    name="Requests"
                    stroke="#737373"
                    fill="currentColor"
                    className="text-neutral-400 dark:text-neutral-600"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              Average duration by bucket
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {loading && chartData.length === 0 ? (
              <Skeleton className="h-full w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            ) : chartData.length === 0 ? (
              <p className="text-sm text-neutral-500">No data.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="currentColor" className="text-neutral-400" />
                  <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-neutral-400" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid var(--border, #e5e5e5)',
                    }}
                  />
                  <Bar dataKey="avgMs" name="Avg ms" fill="currentColor" className="text-neutral-500 dark:text-neutral-500" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-4 tracking-wide uppercase">
          Top routes ({rangeKey})
        </h2>
        <DataTable
          columns={routeColumns}
          data={history?.topRoutes ?? []}
          isLoading={loading}
          emptyTitle="No route data"
          emptyDescription="Traffic will appear after buckets are recorded and flushed to the database."
        />
      </div>

      <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
            Related admin tools
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link to="/admin/system">
              <Database className="h-4 w-4 mr-2" />
              System &amp; slow queries
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link to="/admin/security">
              <ShieldAlert className="h-4 w-4 mr-2" />
              Security
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link to="/admin/audit-logs">
              <ScrollText className="h-4 w-4 mr-2" />
              Audit logs
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link to="/admin/dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminObservability;
