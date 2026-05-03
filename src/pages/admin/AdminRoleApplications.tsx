import React, { useCallback, useEffect, useState } from 'react';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import PageHeader from '@/components/admin/PageHeader';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ADMIN_QUEUE_HINT_EVENT } from '@/lib/adminQueueEvents';

interface FreelancerDraftAdminPreview {
  categories: Array<{ path: string; label: string; hourlyRate: number }>;
  locations: Array<{
    address: string;
    city?: string | null;
    serviceRadius: number;
    serviceDeliveryMode?: string;
    label?: string | null;
  }>;
  bio?: string | null;
  certifications: string[];
  portfolioPhotoCount: number;
  hasFullIdPackage: boolean;
}

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
  draftPreview?: FreelancerDraftAdminPreview | null;
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
  const [detailRow, setDetailRow] = useState<RoleApplicationRow | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

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

  const reject = async (id: string, reason?: string) => {
    try {
      const res = await post(ApiPaths.admin.roleApplicationReject(id), {
        reason: reason?.trim() ? reason.trim() : undefined,
      });
      if (res.success) {
        toast.success('Application rejected');
        setRejectOpen(false);
        setRejectId(null);
        setRejectNotes('');
        void load();
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Reject failed';
      toast.error(msg);
    }
  };

  const openRejectDialog = (id: string) => {
    setRejectId(id);
    setRejectNotes('');
    setRejectOpen(true);
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
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              {r.draftSummary.categoryCount} categories, {r.draftSummary.locationCount} locations
              {r.draftSummary.hasFullIdPackage ? ', ID attached' : ''}
            </span>
            {r.draftPreview && (
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs font-medium text-black underline dark:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailRow(r);
                }}
              >
                View application details
              </Button>
            )}
          </div>
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        ),
    },
    {
      key: 'reason',
      header: 'Notes',
      render: (r) =>
        r.reason ? (
          <span className="max-w-[200px] truncate text-xs text-neutral-600 dark:text-neutral-400" title={r.reason}>
            {r.reason}
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
                openRejectDialog(r.id);
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

      <Dialog open={detailRow != null} onOpenChange={(open) => !open && setDetailRow(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-white text-black sm:max-w-lg dark:bg-neutral-950 dark:text-white">
          <DialogHeader>
            <DialogTitle>Freelancer application</DialogTitle>
            <DialogDescription>
              {detailRow?.user?.fullName ?? 'User'} ({detailRow?.user?.email}) — submitted{' '}
              {detailRow?.createdAt ? new Date(detailRow.createdAt).toLocaleString() : ''}
            </DialogDescription>
          </DialogHeader>
          {detailRow?.draftPreview ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Services (categories)</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-neutral-700 dark:text-neutral-300">
                  {detailRow.draftPreview.categories.map((c) => (
                    <li key={c.path}>
                      <span className="font-medium">{c.label}</span>
                      <span className="text-neutral-500"> — R{c.hourlyRate}/hr</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Service locations</p>
                <ul className="mt-2 space-y-2 text-neutral-700 dark:text-neutral-300">
                  {detailRow.draftPreview.locations.map((loc, i) => (
                    <li key={`${loc.address}-${i}`}>
                      {loc.label ? `${loc.label}: ` : ''}
                      {loc.address}
                      {loc.city ? `, ${loc.city}` : ''}
                      <span className="text-neutral-500">
                        {' '}
                        (radius {loc.serviceRadius} km{loc.serviceDeliveryMode ? `, ${loc.serviceDeliveryMode}` : ''})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {detailRow.draftPreview.bio ? (
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">Bio</p>
                  <p className="mt-1 whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{detailRow.draftPreview.bio}</p>
                </div>
              ) : null}
              {detailRow.draftPreview.certifications.length > 0 ? (
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">Certifications</p>
                  <p className="mt-1 text-neutral-700 dark:text-neutral-300">{detailRow.draftPreview.certifications.join(', ')}</p>
                </div>
              ) : null}
              <p className="text-xs text-neutral-500">
                Portfolio photos: {detailRow.draftPreview.portfolioPhotoCount}. ID package submitted:{' '}
                {detailRow.draftPreview.hasFullIdPackage ? 'Yes' : 'No'}.
              </p>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No structured draft for this row.</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setDetailRow(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={(open) => {
        setRejectOpen(open);
        if (!open) {
          setRejectId(null);
          setRejectNotes('');
        }
      }}>
        <DialogContent className="bg-white text-black sm:max-w-md dark:bg-neutral-950 dark:text-white">
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>
              Optional message for the applicant (shown in the app when they refresh role applications). Keep it professional.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason for rejection</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Incomplete profile, categories not supported in your region..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={4}
              className="resize-y"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setRejectOpen(false);
                setRejectId(null);
                setRejectNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-full"
              onClick={() => {
                if (rejectId) void reject(rejectId, rejectNotes);
              }}
            >
              Reject application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRoleApplications;
