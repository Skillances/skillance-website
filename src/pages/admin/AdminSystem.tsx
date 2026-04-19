import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { post } from '@/lib/api';
import { Wrench, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/admin/PageHeader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { toast } from 'sonner';

const AdminSystem: React.FC = () => {
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{ cleaned: number; errors: number } | null>(null);

  const handleCleanup = async () => {
    try {
      setCleanupLoading(true);
      const res = await post('/admin/cleanup/past-availability', {});
      if (res.success && res.data) {
        setCleanupResult(res.data as { cleaned: number; errors: number });
        toast.success(`Cleanup complete: ${(res.data as { cleaned: number }).cleaned} records cleaned`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Cleanup failed');
    } finally {
      setCleanupLoading(false);
      setCleanupOpen(false);
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        title="System"
        description="Maintenance tasks. Database query performance lives under Observability."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
          <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6">
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2.5 tracking-wide uppercase">
              <Wrench className="h-4 w-4 text-neutral-400 dark:text-neutral-500" /> Availability cleanup
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5 leading-relaxed">
              Deletes past rows in <span className="font-mono text-xs">availability_slots</span> (dates before today).
              This does not remove bookings. The action cannot be undone.
            </p>
            {cleanupResult && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Last cleanup: {cleanupResult.cleaned} records removed, {cleanupResult.errors} errors
                </p>
              </div>
            )}
            <Button
              type="button"
              onClick={() => setCleanupOpen(true)}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full"
            >
              <Wrench className="mr-2 h-4 w-4" /> Run cleanup
            </Button>
          </CardContent>
        </Card>

        <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
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
            <Button variant="outline" size="sm" className="rounded-full border-neutral-200 dark:border-neutral-600" asChild>
              <Link to="/admin/observability?tab=database">Open database tab</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={cleanupOpen}
        onOpenChange={setCleanupOpen}
        title="Run availability cleanup"
        description="This permanently deletes all availability slot rows with a date before today. Bookings are not affected."
        confirmLabel="Run cleanup"
        isLoading={cleanupLoading}
        onConfirm={handleCleanup}
      />
    </div>
  );
};

export default AdminSystem;
