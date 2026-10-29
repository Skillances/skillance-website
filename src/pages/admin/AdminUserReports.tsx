import React, { useCallback, useEffect, useState } from 'react';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';
import { get, patch } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { apiErrorMessage } from '@/lib/marketplace/apiHelpers';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

type ReportStatus = 'open' | 'reviewing' | 'actioned' | 'dismissed';

interface Person {
  id: string;
  fullName?: string;
  email?: string;
  isBanned?: boolean;
}

interface UserReport {
  id: string;
  reason: string;
  details?: string | null;
  status: ReportStatus;
  adminNotes?: string | null;
  createdAt: string;
  reporter?: Person;
  reported?: Person;
}

const STATUSES: { value: ReportStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'actioned', label: 'Actioned' },
  { value: 'dismissed', label: 'Dismissed' },
];

const statusTone: Record<ReportStatus, string> = {
  open: 'warning',
  reviewing: 'info',
  actioned: 'success',
  dismissed: 'customer',
};

const fieldClass =
  'w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 text-sm focus:border-black dark:focus:border-neutral-500 focus:outline-none transition-colors text-black dark:text-white';

const label = (s: string) => s.replace(/_/g, ' ');

const AdminUserReports: React.FC = () => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<UserReport | null>(null);
  const [status, setStatus] = useState<ReportStatus>('open');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const pageSize = 20;

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ limit: String(pageSize), offset: String((page - 1) * pageSize) });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await get(`${ApiPaths.admin.userReports}?${params.toString()}`);
      if (res.success) {
        setReports(res.data.reports ?? []);
        setTotal(res.data.total ?? 0);
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load user reports'));
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const open = (row: UserReport) => {
    setSelected(row);
    setStatus(row.status);
    setNotes(row.adminNotes ?? '');
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await patch(ApiPaths.admin.userReport(selected.id), { status, adminNotes: notes.trim() || undefined });
      toast.success('Report updated');
      setSelected(null);
      void load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to update report'));
    } finally {
      setSaving(false);
    }
  };

  const filters: FilterConfig[] = [
    {
      key: 'status',
      placeholder: 'Status',
      value: statusFilter,
      onChange: (v) => {
        setStatusFilter(v);
        setPage(1);
      },
      options: [{ label: 'All Statuses', value: 'all' }, ...STATUSES.map((s) => ({ label: s.label, value: s.value }))],
    },
  ];

  const columns: Column<UserReport>[] = [
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={statusTone[r.status] || 'info'} label={r.status} /> },
    { key: 'reason', header: 'Reason', render: (r) => <span className="capitalize">{label(r.reason)}</span> },
    {
      key: 'reported',
      header: 'Reported user',
      render: (r) => (
        <div>
          <span className="font-medium text-black dark:text-white">{r.reported?.fullName ?? 'Unknown'}</span>
          {r.reported?.isBanned && <span className="ml-2 text-xs text-red-600">banned</span>}
          <p className="text-xs text-neutral-500">{r.reported?.email}</p>
        </div>
      ),
    },
    {
      key: 'reporter',
      header: 'Reporter',
      render: (r) => <span className="text-neutral-500">{r.reporter?.fullName ?? r.reporter?.email ?? 'Unknown'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (r) => <span className="text-neutral-400 text-xs tabular-nums">{new Date(r.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="User reports" description="Reports filed by customers and freelancers about other users" />
      <SearchFilter searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search..." filters={filters} />
      <DataTable
        columns={columns}
        data={reports.filter((r) => !search.trim() || JSON.stringify(r).toLowerCase().includes(search.trim().toLowerCase()))}
        isLoading={isLoading}
        emptyTitle="No user reports"
        emptyDescription="Reports submitted from profiles and chats will appear here"
        onRowClick={open}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!selected}
        onOpenChange={(v) => !v && !saving && setSelected(null)}
        title="User report"
        description={selected ? `${label(selected.reason)} reported on ${new Date(selected.createdAt).toLocaleString('en-ZA')}` : ''}
        confirmLabel="Save"
        isLoading={saving}
        onConfirm={() => void save()}
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Reporter</p>
                <p className="font-medium">{selected.reporter?.fullName}</p>
                <p className="text-neutral-500 break-all">{selected.reporter?.email}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Reported user</p>
                <p className="font-medium">{selected.reported?.fullName}</p>
                <p className="text-neutral-500 break-all">{selected.reported?.email}</p>
                {selected.reported?.isBanned && <p className="text-red-600 text-xs">Currently banned</p>}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Details</p>
              <p className="whitespace-pre-wrap text-neutral-600 dark:text-neutral-300">{selected.details?.trim() || 'No details given.'}</p>
            </div>
            <div>
              <label htmlFor="report-status" className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1 block">
                Status
              </label>
              <select id="report-status" value={status} onChange={(e) => setStatus(e.target.value as ReportStatus)} className={fieldClass}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="report-notes" className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1 block">
                Admin notes
              </label>
              <textarea id="report-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${fieldClass} resize-none`} placeholder="Internal notes..." />
            </div>
            <p className="text-xs text-neutral-400 flex items-center gap-1">
              <Flag className="h-3 w-3" /> Banning a user is done from the user page. This only updates the report.
            </p>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};

export default AdminUserReports;
