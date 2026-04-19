import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertTriangle,
  Clock,
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

type SlowQuery = {
  key: string;
  duration: number;
  model: string | null;
  action: string;
  createdAt: string;
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

const queryColumns: Column<SlowQuery>[] = [
  {
    key: 'key',
    header: 'Query',
    render: (q) => (
      <span className="font-mono text-xs text-neutral-600 truncate max-w-[300px] block">{q.key}</span>
    ),
  },
  {
    key: 'model',
    header: 'Model',
    render: (q) => <span className="text-neutral-500 text-xs">{q.model || '--'}</span>,
  },
  {
    key: 'action',
    header: 'Action',
    render: (q) => <span className="text-neutral-500 text-xs">{q.action}</span>,
  },
  {
    key: 'duration',
    header: 'Duration',
    render: (q) => (
      <span
        className={`text-xs font-mono ${
          q.duration > 500 ? 'text-red-600' : q.duration > 200 ? 'text-amber-600' : 'text-neutral-600'
        }`}
      >
        {q.duration}ms
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Time',
    render: (q) => (
      <span className="text-neutral-400 text-xs">
        {q.createdAt ? new Date(q.createdAt).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}
      </span>
    ),
  },
];

const CRITICAL_ACTIONS = [
  { label: 'Booking create conflict (409)', value: 'critical_flow_booking_create_conflict' },
  { label: 'Booking accept race (concurrent)', value: 'critical_flow_booking_accept_race' },
  { label: 'Booking accept conflict', value: 'critical_flow_booking_accept_conflict' },
];

type CriticalLogRow = {
  id: string;
  action: string;
  createdAt: string;
  actorId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  resource?: string | null;
  resourceId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown> | null;
};

function criticalBadge(action: string): { label: string; cls: string } {
  const match = CRITICAL_ACTIONS.find((a) => a.value === action);
  const label = match?.label ?? action;
  const cls =
    action === 'critical_flow_booking_accept_race'
      ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
      : action === 'critical_flow_booking_accept_conflict'
        ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100'
        : 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200';
  return { label, cls };
}

const criticalColumns: Column<CriticalLogRow>[] = [
  {
    key: 'createdAt',
    header: 'Time',
    render: (r) => (
      <div className="min-w-[150px]">
        <p className="text-sm text-black dark:text-white">{new Date(r.createdAt).toLocaleString()}</p>
        <p className="text-xs text-neutral-400 font-mono">{new Date(r.createdAt).toISOString()}</p>
      </div>
    ),
  },
  {
    key: 'action',
    header: 'Flow',
    render: (r) => {
      const { label, cls } = criticalBadge(r.action);
      return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`} title={r.action}>
          {label}
        </span>
      );
    },
  },
  {
    key: 'actor',
    header: 'Actor',
    render: (r) =>
      r.actorId ? (
        <Link to={`/admin/users/${r.actorId}`} className="text-sm hover:underline">
          <p className="text-black dark:text-white font-medium">{r.actorName || 'Unknown'}</p>
          {r.actorEmail && (
            <p className="text-xs text-neutral-500 truncate max-w-[220px]">{r.actorEmail}</p>
          )}
        </Link>
      ) : (
        <span className="text-xs text-neutral-400">system</span>
      ),
  },
  {
    key: 'resource',
    header: 'Resource',
    render: (r) => (
      <div className="min-w-[150px]">
        <p className="text-xs text-neutral-500 uppercase tracking-wide">{r.resource || '—'}</p>
        {r.resourceId && (
          <p className="text-xs font-mono text-neutral-600 dark:text-neutral-300 truncate max-w-[200px]">
            {r.resourceId}
          </p>
        )}
      </div>
    ),
  },
  {
    key: 'metadata',
    header: 'Details',
    render: (r) => {
      if (!r.metadata || Object.keys(r.metadata).length === 0) {
        return <span className="text-xs text-neutral-400">—</span>;
      }
      const pairs = Object.entries(r.metadata).slice(0, 4);
      return (
        <div className="flex flex-wrap gap-1 max-w-[320px]">
          {pairs.map(([k, v]) => (
            <span
              key={k}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              title={`${k}: ${String(v)}`}
            >
              {k}: {String(v).slice(0, 24)}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    key: 'view',
    header: '',
    render: (r) => (
      <Link
        to={`/admin/audit-logs?action=${encodeURIComponent(r.action)}`}
        className="text-xs text-neutral-500 hover:text-black dark:hover:text-white underline"
      >
        View all
      </Link>
    ),
  },
];

const AdminObservability: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'database' || searchParams.get('tab') === 'critical' ? searchParams.get('tab')! : 'traffic';

  const setTab = (v: string) => {
    const next = new URLSearchParams(searchParams);
    if (v === 'traffic') next.delete('tab');
    else next.set('tab', v);
    setSearchParams(next, { replace: true });
  };

  const [rangeKey, setRangeKey] = useState<TimeRangeKey>('24h');
  const [snapshot, setSnapshot] = useState<MetricsSnapshot | null>(null);
  const [history, setHistory] = useState<{ byTime: HistoryByTime[]; topRoutes: TopRoute[] } | null>(
    null,
  );
  const [queryMetrics, setQueryMetrics] = useState<{
    summary: { totalQueries?: number; slowQueries?: number; slowestQueries?: SlowQuery[] };
    threshold?: number;
  } | null>(null);
  const [criticalPreview, setCriticalPreview] = useState<{ logs: unknown[]; loading: boolean }>({
    logs: [],
    loading: false,
  });
  const [criticalActionFilter, setCriticalActionFilter] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(
    async (opts?: { quiet?: boolean }) => {
      const { from, to } = rangeForKey(rangeKey);
      const qs = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;
      try {
        if (!opts?.quiet) setLoading(true);
        else setRefreshing(true);
        const [snapRes, histRes, qmRes] = await Promise.all([
          get(ApiPaths.admin.metricsSnapshot),
          get(`${ApiPaths.admin.metricsHistory}?${qs}`),
          get(`${ApiPaths.admin.queryMetrics}?source=both&summary=true&hours=24`).catch(() => null),
        ]);
        if (snapRes.success && snapRes.data) setSnapshot(snapRes.data as MetricsSnapshot);
        if (histRes.success && histRes.data) {
          setHistory(histRes.data as { byTime: HistoryByTime[]; topRoutes: TopRoute[] });
        }
        if (qmRes?.success && qmRes.data?.database?.summary) {
          const dbSummary = qmRes.data.database.summary;
          setQueryMetrics({
            summary: {
              totalQueries: dbSummary.totalQueries,
              slowQueries: dbSummary.slowQueries,
              slowestQueries: dbSummary.slowestQueries || [],
            },
            threshold: qmRes.data.threshold,
          });
        } else {
          setQueryMetrics(null);
        }
      } catch {
        toast.error('Failed to load observability data');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [rangeKey],
  );

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    const id = setInterval(() => {
      void fetchData({ quiet: true });
    }, 45000);
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    if (tab !== 'critical') return;
    let cancelled = false;
    (async () => {
      setCriticalPreview((p) => ({ ...p, loading: true }));
      try {
        const results = await Promise.all(
          CRITICAL_ACTIONS.map((a) =>
            get(`${ApiPaths.admin.auditLogs}?action=${encodeURIComponent(a.value)}&limit=15&offset=0`).catch(() => ({
              success: false,
            })),
          ),
        );
        if (cancelled) return;
        const merged: unknown[] = [];
        for (const r of results) {
          if (r.success && r.data?.logs) merged.push(...r.data.logs);
        }
        merged.sort((a, b) => {
          const ta = new Date((a as { createdAt: string }).createdAt).getTime();
          const tb = new Date((b as { createdAt: string }).createdAt).getTime();
          return tb - ta;
        });
        setCriticalPreview({ logs: merged.slice(0, 40), loading: false });
      } catch {
        if (!cancelled) setCriticalPreview({ logs: [], loading: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const chartData =
    history?.byTime.map((b) => ({
      name: bucketLabel(b.bucketStart),
      requests: b.requestCount,
      avgMs: b.avgDurationMs,
    })) ?? [];

  const statusEntries = snapshot
    ? Object.entries(snapshot.http.by_status_class).sort(([a], [b]) => a.localeCompare(b))
    : [];

  const slowQueries = queryMetrics?.summary.slowestQueries ?? [];
  const dbSummary = queryMetrics?.summary;

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <PageHeader
          title="Observability"
          description="Traffic, database query health, and MVP critical-flow signals. No response bodies stored."
        />
        <div className="flex items-center gap-3">
          <Select value={rangeKey} onValueChange={(v) => setRangeKey(v as TimeRangeKey)}>
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

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
          <TabsTrigger value="traffic" className="rounded-lg px-4">
            Traffic &amp; API
          </TabsTrigger>
          <TabsTrigger value="database" className="rounded-lg px-4">
            Database
          </TabsTrigger>
          <TabsTrigger value="critical" className="rounded-lg px-4">
            Critical flows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-10 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && !snapshot ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
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
                    <p className="text-2xl font-semibold tabular-nums">{snapshot?.http.avg_duration_ms ?? 0} ms</p>
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
                      <Bar
                        dataKey="avgMs"
                        name="Avg ms"
                        fill="currentColor"
                        className="text-neutral-500 dark:text-neutral-500"
                        radius={[4, 4, 0, 0]}
                      />
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
        </TabsContent>

        <TabsContent value="database" className="space-y-8 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-neutral-500 flex items-center gap-2">
                  <Database className="h-4 w-4" /> DB queries (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading && !dbSummary ? (
                  <Skeleton className="h-16 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                ) : dbSummary ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Total</span>
                      <span className="font-medium tabular-nums">{dbSummary.totalQueries?.toLocaleString() ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Slow queries</span>
                      <span className={`font-medium tabular-nums ${(dbSummary.slowQueries ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {dbSummary.slowQueries ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Threshold</span>
                      <span className="text-neutral-600 tabular-nums">{queryMetrics?.threshold ?? 150}ms</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No query metrics.</p>
                )}
              </CardContent>
            </Card>
            <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase text-neutral-500">Note</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Query metrics are sampled from the API process. Use this tab to spot regressions; detailed forensics may
                still need database logs in production.
              </CardContent>
            </Card>
          </div>
          {slowQueries.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-4 flex items-center gap-2 tracking-wide uppercase">
                <Clock className="h-4 w-4 text-amber-500" /> Slowest queries (24h)
              </h2>
              <DataTable
                columns={queryColumns}
                data={slowQueries}
                isLoading={loading}
                emptyTitle="No slow queries"
                emptyDescription="All queries within threshold"
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="critical" className="space-y-6 mt-6">
          <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> MVP critical flows
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <p>
                Events such as <strong>double booking attempts</strong> (slot conflict) and{' '}
                <strong>concurrent accept</strong> (two accept requests for the same pending booking) are written to{' '}
                <strong>audit logs</strong> with dedicated actions. The most recent events are shown below - tap a
                chip to narrow down to a single flow.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={criticalActionFilter === null ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setCriticalActionFilter(null)}
                >
                  All ({(criticalPreview.logs as { action: string }[]).length})
                </Button>
                {CRITICAL_ACTIONS.map((a) => {
                  const count = (criticalPreview.logs as { action: string }[]).filter(
                    (r) => r.action === a.value,
                  ).length;
                  const active = criticalActionFilter === a.value;
                  return (
                    <Button
                      key={a.value}
                      variant={active ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setCriticalActionFilter(active ? null : a.value)}
                      title={a.value}
                    >
                      {a.label} ({count})
                    </Button>
                  );
                })}
                <div className="flex-1" />
                <Button variant="ghost" size="sm" className="rounded-full" asChild>
                  <Link
                    to={
                      criticalActionFilter
                        ? `/admin/audit-logs?action=${encodeURIComponent(criticalActionFilter)}`
                        : '/admin/audit-logs'
                    }
                  >
                    Full audit logs
                    <ScrollText className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-sm font-medium text-neutral-500 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Recent critical-flow events
              {criticalActionFilter && (
                <span className="text-xs font-normal text-neutral-400">
                  - filtered: {CRITICAL_ACTIONS.find((a) => a.value === criticalActionFilter)?.label}
                </span>
              )}
            </h3>
            {criticalPreview.loading ? (
              <Skeleton className="h-40 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            ) : (
              <DataTable
                columns={criticalColumns}
                data={
                  (criticalPreview.logs as CriticalLogRow[]).filter((r) =>
                    criticalActionFilter ? r.action === criticalActionFilter : true,
                  )
                }
                isLoading={criticalPreview.loading}
                emptyTitle={
                  criticalActionFilter
                    ? 'No events for this flow'
                    : 'No critical-flow audit rows yet'
                }
                emptyDescription={
                  criticalActionFilter
                    ? 'Try "All" or another flow chip above.'
                    : 'Rows appear when a slot conflict or concurrent accept is detected.'
                }
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Related admin tools</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link to="/admin/system">
              <Database className="h-4 w-4 mr-2" />
              System maintenance
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
