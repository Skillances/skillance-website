import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, post } from '@/lib/api';
import {
  Wrench,
  Activity,
  MessageSquare,
  Calendar,
  ShieldCheck,
  Gauge,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/admin/PageHeader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import TypedConfirmDialog from '@/components/admin/TypedConfirmDialog';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

type MaintenanceCategory =
  | 'bookings_chat'
  | 'availability'
  | 'observability'
  | 'security'
  | 'calendar';

interface MaintenanceTaskResult {
  summary: string;
  counts: Record<string, number>;
  durationMs: number;
}

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  destructive: boolean;
  impact: string;
  lastRunAt: string | null;
  lastResult: MaintenanceTaskResult | null;
  lastActorId: string | null;
}

const CATEGORY_META: Record<
  MaintenanceCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; accent: string }
> = {
  bookings_chat: {
    label: 'Bookings & chat',
    icon: MessageSquare,
    accent: 'text-violet-500 dark:text-violet-400',
  },
  availability: {
    label: 'Availability',
    icon: Wrench,
    accent: 'text-emerald-500 dark:text-emerald-400',
  },
  calendar: {
    label: 'Calendar sync',
    icon: Calendar,
    accent: 'text-sky-500 dark:text-sky-400',
  },
  observability: {
    label: 'Observability',
    icon: Gauge,
    accent: 'text-amber-500 dark:text-amber-400',
  },
  security: {
    label: 'Security',
    icon: ShieldCheck,
    accent: 'text-rose-500 dark:text-rose-400',
  },
};

const CATEGORY_ORDER: MaintenanceCategory[] = [
  'bookings_chat',
  'availability',
  'calendar',
  'observability',
  'security',
];

const AdminSystem: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [confirmTask, setConfirmTask] = useState<MaintenanceTask | null>(null);

  const loadTasks = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await get('/admin/maintenance/tasks');
      if (res.success && res.data) {
        const data = res.data as { tasks: MaintenanceTask[] };
        setTasks(data.tasks ?? []);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load maintenance tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const runTask = useCallback(
    async (task: MaintenanceTask) => {
      setRunningTaskId(task.id);
      try {
        const res = await post(`/admin/maintenance/run/${encodeURIComponent(task.id)}`, {});
        if (res.success && res.data) {
          const result = res.data as MaintenanceTaskResult;
          toast.success(`${task.title}: ${result.summary}`);
        } else {
          toast.success(`${task.title} completed`);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : `${task.title} failed`);
      } finally {
        setRunningTaskId(null);
        setConfirmTask(null);
        await loadTasks(true);
      }
    },
    [loadTasks]
  );

  const grouped = useMemo(() => {
    const byCategory = new Map<MaintenanceCategory, MaintenanceTask[]>();
    for (const task of tasks) {
      const bucket = byCategory.get(task.category) ?? [];
      bucket.push(task);
      byCategory.set(task.category, bucket);
    }
    return CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((c) => ({
      category: c,
      tasks: byCategory.get(c) ?? [],
    }));
  }, [tasks]);

  return (
    <div className="space-y-10">
      <PageHeader
        title="System"
        description="Maintenance tasks. Run-on-demand cleanups and reconciliations. Every run is written to audit logs."
      >
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-neutral-200 dark:border-neutral-600"
          onClick={() => loadTasks(true)}
          disabled={refreshing || loading}
        >
          {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </PageHeader>

      {loading && tasks.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-neutral-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading maintenance tasks...
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(({ category, tasks: categoryTasks }) => {
            const meta = CATEGORY_META[category];
            const Icon = meta.icon;
            return (
              <section key={category} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${meta.accent}`} />
                  <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">
                    {meta.label}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isRunning={runningTaskId === task.id}
                      onRun={() => setConfirmTask(task)}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Activity className="h-4 w-4 text-violet-500 dark:text-violet-400" />
              <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">
                Related
              </h2>
            </div>
            <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6">
                <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2.5 tracking-wide uppercase">
                  <Activity className="h-4 w-4 text-violet-500 dark:text-violet-400" /> Observability
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Slow queries, Prisma summaries, traffic charts, and MVP critical-flow audit shortcuts are on the
                  Observability page.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-neutral-200 dark:border-neutral-600"
                  asChild
                >
                  <Link to="/admin/observability?tab=database">Open database tab</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      )}

      {confirmTask && !confirmTask.destructive && (
        <ConfirmDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setConfirmTask(null);
          }}
          title={confirmTask.title}
          description={confirmTask.description}
          confirmLabel="Run"
          isLoading={runningTaskId === confirmTask.id}
          onConfirm={() => void runTask(confirmTask)}
        />
      )}

      {confirmTask && confirmTask.destructive && (
        <TypedConfirmDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setConfirmTask(null);
          }}
          title={confirmTask.title}
          description={confirmTask.description}
          impact={confirmTask.impact}
          confirmPhrase={confirmTask.id}
          confirmLabel="Run cleanup"
          isLoading={runningTaskId === confirmTask.id}
          onConfirm={() => void runTask(confirmTask)}
        />
      )}
    </div>
  );
};

interface TaskCardProps {
  task: MaintenanceTask;
  isRunning: boolean;
  onRun: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isRunning, onRun }) => {
  const lastRunLabel = task.lastRunAt
    ? `${formatDistanceToNow(new Date(task.lastRunAt))} ago`
    : null;

  return (
    <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col">
      <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm font-medium text-black dark:text-neutral-100">
            {task.title}
          </CardTitle>
          {task.destructive && (
            <Badge
              variant="outline"
              className="border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 text-[10px] font-medium tracking-wide uppercase rounded-full"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Destructive
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-1">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-2">
          {task.description}
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 italic mb-5">{task.impact}</p>

        {task.lastResult && lastRunLabel && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                Last run {lastRunLabel} &middot; {task.lastResult.durationMs}ms
              </p>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">{task.lastResult.summary}</p>
            {Object.keys(task.lastResult.counts).length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {Object.entries(task.lastResult.counts).map(([k, v]) => (
                  <span
                    key={k}
                    className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400"
                  >
                    {k}: <span className="font-semibold">{v}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {!task.lastResult && lastRunLabel && (
          <div className="mb-5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-700">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Last attempted {lastRunLabel}
            </p>
          </div>
        )}

        <div className="mt-auto">
          <Button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className={
              task.destructive
                ? 'bg-red-600 text-white hover:bg-red-700 rounded-full'
                : 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full'
            }
          >
            {isRunning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wrench className="mr-2 h-4 w-4" />
            )}
            {task.destructive ? 'Run cleanup' : 'Run task'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSystem;
