import React, { useCallback, useEffect, useState } from 'react';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import PageHeader from '@/components/admin/PageHeader';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ADMIN_QUEUE_HINT_EVENT } from '@/lib/adminQueueEvents';

interface RoleApplicationRow {
  id: string;
  userId: string;
  targetRole: string;
  status: string;
  reason: string | null;
  decidedAt: string | null;
  createdAt: string;
  draftSummary?: {
    categoryCount: number;
    locationCount: number;
    hasFullIdPackage: boolean;
  } | null;
  user?: {
    id: string;
    email: string;
    fullName: string;
    primaryRole: string;
  };
}

const AdminRoleApplications: React.FC = () => {
  const [rows, setRows] = useState<RoleApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const q =
        statusFilter === 'all' ? '' : `?status=${encodeURIComponent(statusFilter)}`;
      const res = await get(`${ApiPaths.admin.roleApplications}${q}`);
      if (res.success) setRows(res.data);
    } catch {
      toast.error('Failed to load role applications');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onHint = () => {
      void load();
    };
    window.addEventListener(ADMIN_QUEUE_HINT_EVENT, onHint);
    return () => window.removeEventListener(ADMIN_QUEUE_HINT_EVENT, onHint);
  }, [load]);

  const approve = async (id: string) => {
    try {
      const res = await post(ApiPaths.admin.roleApplicationApprove(id), {});
      if (res.success) {
        toast.success('Application approved');
        void load();
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Approve failed';
      toast.error(msg);
    }
  };

  const reject = async (id: string) => {
    const reason = window.prompt('Rejection reason (optional)') ?? undefined;
    try {
      const res = await post(ApiPaths.admin.roleApplicationReject(id), { reason: reason || undefined });
      if (res.success) {
        toast.success('Application rejected');
        void load();
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Reject failed';
      toast.error(msg);
    }
  };

  const columns: Column<RoleApplicationRow>[] = [
    {
      key: 'user',
      header: 'User',
      render: (r) => (
        <div>
          <div className="text-sm font-medium text-black dark:text-white">{r.user?.fullName ?? r.userId}</div>
          <div className="text-xs text-neutral-500">{r.user?.email}</div>
        </div>
      ),
    },
    {
      key: 'targetRole',
      header: 'Target role',
      render: (r) => <span className="text-sm capitalize">{r.targetRole}</span>,
    },
    {
      key: 'draftSummary',
      header: 'Apply summary',
      render: (r) =>
        r.targetRole === 'freelancer' && r.draftSummary ? (
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            {r.draftSummary.categoryCount} categories, {r.draftSummary.locationCount} locations
            {r.draftSummary.hasFullIdPackage ? ', ID attached' : ''}
          </span>
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <span className="text-sm uppercase text-neutral-600 dark:text-neutral-400">{r.status}</span>,
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (r) => (
        <span className="text-xs text-neutral-500">
          {new Date(r.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) =>
        r.status === 'pending' ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                void approve(r.id);
              }}
            >
              Approve
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                void reject(r.id);
              }}
            >
              Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Role applications"
        description="Users requesting an additional customer or freelancer profile"
      />
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['pending', 'Pending'],
            ['approved', 'Approved'],
            ['rejected', 'Rejected'],
            ['all', 'All'],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            type="button"
            variant={statusFilter === value ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => setStatusFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={loading}
        emptyTitle="No applications"
        emptyDescription="Try another status filter"
      />
    </div>
  );
};

export default AdminRoleApplications;
