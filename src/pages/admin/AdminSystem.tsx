import React, { useState, useEffect } from 'react';
import { get, post } from '@/lib/api';
import { Wrench, Database, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/admin/PageHeader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface SlowQuery { key: string; duration: number; model: string | null; action: string; createdAt: string; }

const AdminSystem: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);

  const fetchMetrics = async () => { try { setMetricsLoading(true); const res = await get('/admin/query-metrics?source=both&summary=true&hours=24'); if (res.success) setMetrics(res.data); } catch { toast.error('Failed to load metrics'); } finally { setMetricsLoading(false); } };
  useEffect(() => { fetchMetrics(); }, []);

  const handleCleanup = async () => { try { setCleanupLoading(true); const res = await post('/admin/cleanup/past-availability', {}); if (res.success) { setCleanupResult(res.data); toast.success(`Cleanup complete: ${res.data.cleaned} records cleaned`); } } catch (err: any) { toast.error(err?.message || 'Cleanup failed'); } finally { setCleanupLoading(false); setCleanupOpen(false); } };

  const dbSummary = metrics?.database?.summary;
  const slowQueries: SlowQuery[] = dbSummary?.slowestQueries || [];

  const queryColumns: Column<SlowQuery>[] = [
    { key: 'key', header: 'Query', render: (q) => <span className="font-mono text-xs text-neutral-600 truncate max-w-[300px] block">{q.key}</span> },
    { key: 'model', header: 'Model', render: (q) => <span className="text-neutral-500 text-xs">{q.model || '--'}</span> },
    { key: 'action', header: 'Action', render: (q) => <span className="text-neutral-500 text-xs">{q.action}</span> },
    { key: 'duration', header: 'Duration', render: (q) => <span className={`text-xs font-mono ${q.duration > 500 ? 'text-red-600' : q.duration > 200 ? 'text-amber-600' : 'text-neutral-600'}`}>{q.duration}ms</span> },
    { key: 'createdAt', header: 'Time', render: (q) => <span className="text-neutral-400 text-xs">{q.createdAt ? new Date(q.createdAt).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}</span> },
  ];

  return (
    <div className="space-y-10">
      <PageHeader title="System" description="System maintenance and monitoring" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
          <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6">
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2.5 tracking-wide uppercase">
              <Wrench className="h-4 w-4 text-neutral-400 dark:text-neutral-500" /> Availability Cleanup
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5 leading-relaxed">Remove past availability slots from all freelancer profiles. This helps keep the database clean and improves query performance.</p>
            {cleanupResult && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                <p className="text-xs text-emerald-700 dark:text-emerald-400">Last cleanup: {cleanupResult.cleaned} records cleaned, {cleanupResult.errors} errors</p>
              </div>
            )}
            <Button onClick={() => setCleanupOpen(true)} className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full"><Wrench className="mr-2 h-4 w-4" /> Run Cleanup</Button>
          </CardContent>
        </Card>

        <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
          <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6">
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2.5 tracking-wide uppercase">
              <Database className="h-4 w-4 text-violet-500 dark:text-violet-400" /> Query Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {metricsLoading ? (
              <div className="space-y-3"><Skeleton className="h-4 w-40 bg-neutral-100 dark:bg-neutral-700 rounded" /><Skeleton className="h-4 w-32 bg-neutral-100 dark:bg-neutral-700 rounded" /></div>
            ) : dbSummary ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-sm text-neutral-500 dark:text-neutral-400">Total Queries (24h)</span><span className="text-sm text-black dark:text-white font-medium tabular-nums">{dbSummary.totalQueries?.toLocaleString() || 0}</span></div>
                <div className="flex justify-between items-center"><span className="text-sm text-neutral-500 dark:text-neutral-400">Slow Queries</span><span className={`text-sm font-medium tabular-nums ${dbSummary.slowQueries > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{dbSummary.slowQueries || 0}</span></div>
                <div className="flex justify-between items-center"><span className="text-sm text-neutral-500 dark:text-neutral-400">Threshold</span><span className="text-sm text-neutral-600 dark:text-neutral-400 tabular-nums">{metrics.threshold || 150}ms</span></div>
                <Button variant="outline" size="sm" onClick={fetchMetrics} className="mt-1 border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-500 rounded-full">Refresh Metrics</Button>
              </div>
            ) : (
              <p className="text-sm text-neutral-400 dark:text-neutral-500">No metrics data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {slowQueries.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-5 flex items-center gap-2 tracking-wide uppercase"><Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" /> Slowest Queries (24h)</h2>
          <DataTable columns={queryColumns} data={slowQueries} isLoading={metricsLoading} emptyTitle="No slow queries" emptyDescription="All queries are performing within threshold" />
        </div>
      )}
      <ConfirmDialog open={cleanupOpen} onOpenChange={setCleanupOpen} title="Run Availability Cleanup" description="This will remove all past availability slots from freelancer profiles. This action cannot be undone." confirmLabel="Run Cleanup" isLoading={cleanupLoading} onConfirm={handleCleanup} />
    </div>
  );
};

export default AdminSystem;
