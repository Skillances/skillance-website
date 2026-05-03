import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, post, put } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
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
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/admin/PageHeader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import TypedConfirmDialog from '@/components/admin/TypedConfirmDialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type AppClientStatusPayload = {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  globalApiBlock: boolean;
  banner: {
    enabled: boolean;
    message: string;
    style: 'info' | 'warning';
    dismissibleSession: boolean;
  };
};

const DEFAULT_APP_STATUS: AppClientStatusPayload = {
  maintenanceMode: false,
  maintenanceMessage: '',
  globalApiBlock: false,
  banner: {
    enabled: false,
    message: '',
    style: 'info',
    dismissibleSession: true,
  },
};

/** Insert into text fields, then edit dates/times before saving. */
const MAINTENANCE_MESSAGE_TEMPLATES: readonly { label: string; text: string }[] = [
  {
    label: 'Upgrade ~30 min',
    text: 'We are upgrading Skillance. Please try again in about 30 minutes.',
  },
  {
    label: 'Scheduled window',
    text:
      'Scheduled maintenance is in progress. We expect to be back within an hour. Thank you for your patience.',
  },
  {
    label: 'Temporarily unavailable',
    text: 'Skillance is temporarily unavailable while we resolve an issue. Please try again soon.',
  },
];

const BANNER_MESSAGE_TEMPLATES: readonly { label: string; text: string }[] = [
  {
    label: 'Tonight (edit time)',
    text:
      'We will have scheduled maintenance tonight at 00:00 SAST. Please finish important actions before then.',
  },
  {
    label: 'Reminder',
    text:
      'Reminder: maintenance is coming up. We will share exact times here. You can keep using the app for now.',
  },
  {
    label: 'Minor slowdown',
    text:
      'You may notice slower responses for a short while while we improve the service. Thank you for your patience.',
  },
];

const AdminSystem: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [confirmTask, setConfirmTask] = useState<MaintenanceTask | null>(null);
  const [appStatus, setAppStatus] = useState<AppClientStatusPayload>(DEFAULT_APP_STATUS);
  const [appStatusLoading, setAppStatusLoading] = useState(true);
  const [savingAppStatus, setSavingAppStatus] = useState(false);

  const loadAppStatus = useCallback(async () => {
    setAppStatusLoading(true);
    try {
      const res = await get(ApiPaths.admin.appClientStatus);
      if (res.success && res.data) {
        const d = res.data as AppClientStatusPayload;
        setAppStatus({
          ...DEFAULT_APP_STATUS,
          ...d,
          globalApiBlock: d.globalApiBlock === true,
          banner: { ...DEFAULT_APP_STATUS.banner, ...d.banner },
        });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load app status');
    } finally {
      setAppStatusLoading(false);
    }
  }, []);

  const saveAppStatus = useCallback(async () => {
    setSavingAppStatus(true);
    try {
      const res = await put(ApiPaths.admin.appClientStatus, appStatus);
      if (res.success) {
        toast.success('Mobile app status saved');
        await loadAppStatus();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save app status');
    } finally {
      setSavingAppStatus(false);
    }
  }, [appStatus, loadAppStatus]);

  const loadTasks = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await get(ApiPaths.admin.maintenanceTasks);
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
    void loadAppStatus();
  }, [loadTasks, loadAppStatus]);

  const runTask = useCallback(
    async (task: MaintenanceTask) => {
      setRunningTaskId(task.id);
      try {
        const res = await post(ApiPaths.admin.maintenanceRun(task.id), {});
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
          onClick={() => {
            void loadTasks(true);
            void loadAppStatus();
          }}
          disabled={refreshing || loading}
        >
          {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </PageHeader>

      <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6">
          <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2.5 tracking-wide uppercase">
            <Smartphone className="h-4 w-4 text-sky-500 dark:text-sky-400" /> Mobile app (iOS / Android)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {appStatusLoading ? (
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading app status...
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                In-app banner and full-screen maintenance for all users. The app refreshes this every few minutes and
                when returning from the background (short server cache).
              </p>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-neutral-800 dark:text-neutral-100">Block public API (HTTP 503)</Label>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xl">
                    Rejects most API calls with a maintenance code so clients can show offline or skeleton UI. Sign-in,
                    admin routes, and health checks still work. Turn off here to restore traffic (no redeploy).
                  </p>
                </div>
                <Switch
                  checked={appStatus.globalApiBlock}
                  onCheckedChange={(v) => setAppStatus((s) => ({ ...s, globalApiBlock: v }))}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-neutral-800 dark:text-neutral-100">Maintenance mode</Label>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xl">
                    Blocks the app with a message (users cannot continue until you turn this off).
                  </p>
                </div>
                <Switch
                  checked={appStatus.maintenanceMode}
                  onCheckedChange={(v) => setAppStatus((s) => ({ ...s, maintenanceMode: v }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Message (maintenance)</Label>
                <p className="text-xs text-neutral-500">Quick templates (click to insert, then edit).</p>
                <div className="flex flex-wrap gap-2">
                  {MAINTENANCE_MESSAGE_TEMPLATES.map((t) => (
                    <Button
                      key={t.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-full border-neutral-200 dark:border-neutral-600 text-xs font-normal"
                      onClick={() => setAppStatus((s) => ({ ...s, maintenanceMessage: t.text }))}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
                <Textarea
                  value={appStatus.maintenanceMessage}
                  onChange={(e) =>
                    setAppStatus((s) => ({ ...s, maintenanceMessage: e.target.value }))
                  }
                  placeholder="We are upgrading Skillance. Please try again in 30 minutes."
                  rows={3}
                  className="resize-y min-h-[80px]"
                />
              </div>

              <div className="border-t border-neutral-100 dark:border-neutral-700 pt-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="text-neutral-800 dark:text-neutral-100">Banner</Label>
                    <p className="text-xs text-neutral-500 mt-1 max-w-xl">
                      Banner at the top of the app. Users can still browse unless maintenance mode is on.
                    </p>
                  </div>
                  <Switch
                    checked={appStatus.banner.enabled}
                    onCheckedChange={(v) =>
                      setAppStatus((s) => ({ ...s, banner: { ...s.banner, enabled: v } }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Banner text</Label>
                  <p className="text-xs text-neutral-500">Quick templates (click to insert, then edit).</p>
                  <div className="flex flex-wrap gap-2">
                    {BANNER_MESSAGE_TEMPLATES.map((t) => (
                      <Button
                        key={t.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-full border-neutral-200 dark:border-neutral-600 text-xs font-normal"
                        onClick={() =>
                          setAppStatus((s) => ({
                            ...s,
                            banner: { ...s.banner, message: t.text },
                          }))
                        }
                      >
                        {t.label}
                      </Button>
                    ))}
                  </div>
                  <Textarea
                    value={appStatus.banner.message}
                    onChange={(e) =>
                      setAppStatus((s) => ({
                        ...s,
                        banner: { ...s.banner, message: e.target.value },
                      }))
                    }
                    placeholder="Scheduled maintenance tonight 22:00 SAST."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Banner style</Label>
                    <Select
                      value={appStatus.banner.style}
                      onValueChange={(value: 'info' | 'warning') =>
                        setAppStatus((s) => ({
                          ...s,
                          banner: { ...s.banner, style: value },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info (blue)</SelectItem>
                        <SelectItem value="warning">Warning (orange)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-6 md:pt-8">
                    <div>
                      <Label className="text-neutral-800 dark:text-neutral-100">Dismissible</Label>
                      <p className="text-xs text-neutral-500 mt-1">User can dismiss for this session.</p>
                    </div>
                    <Switch
                      checked={appStatus.banner.dismissibleSession}
                      onCheckedChange={(v) =>
                        setAppStatus((s) => ({
                          ...s,
                          banner: { ...s.banner, dismissibleSession: v },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full border-neutral-200 dark:border-neutral-600"
                  onClick={() => void loadAppStatus()}
                  disabled={appStatusLoading || savingAppStatus}
                >
                  Reset from server
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="rounded-full"
                  onClick={() => void saveAppStatus()}
                  disabled={savingAppStatus || appStatusLoading}
                >
                  {savingAppStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save app status
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
