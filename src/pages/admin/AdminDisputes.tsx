import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { apiErrorMessage } from '@/lib/marketplace/apiHelpers';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface Dispute {
  id: string;
  bookingId: string;
  raisedBy?: string;
  reason?: string | null;
  evidence?: unknown;
  status: string;
  resolution?: string | null;
  createdAt: string;
  booking?: { id: string; category?: string; totalPrice?: number | string | null; scheduledDate?: string };
  customer?: { id: string; user?: { fullName?: string } };
}

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Resolved', value: 'resolved' },
];

const fieldClass =
  'w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 text-sm focus:border-black dark:focus:border-neutral-500 focus:outline-none transition-colors text-black dark:text-white';

const tone = (s: string) => (/resolv|closed/i.test(s) ? 'success' : 'warning');

function evidenceLines(e: unknown): string[] {
  if (!e) return [];
  if (typeof e === 'string') return [e];
  if (Array.isArray(e)) return e.map((x) => (typeof x === 'string' ? x : JSON.stringify(x)));
  return [JSON.stringify(e, null, 2)];
}

const AdminDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('open');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [outcome, setOutcome] = useState<'payout' | 'refund'>('payout');
  const [resolution, setResolution] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const qs = statusFilter !== 'all' ? `?status=${encodeURIComponent(statusFilter)}` : '';
      const res = await get(`${ApiPaths.admin.disputes}${qs}`);
      if (res.success) setDisputes(res.data.disputes ?? []);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load disputes'));
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const open = (d: Dispute) => {
    setSelected(d);
    setOutcome('payout');
    setResolution(d.resolution ?? '');
  };

  const isOpen = selected ? !/resolv|closed/i.test(selected.status) : false;

  const resolve = async () => {
    if (!selected) return;
    if (resolution.trim().length < 3) {
      toast.error('Write a resolution of at least 3 characters');
      return;
    }
    setSaving(true);
    try {
      await post(ApiPaths.marketplace.disputeResolve(selected.id), { resolution: resolution.trim(), outcome });
      toast.success('Decision recorded. No money was moved.');
      setSelected(null);
      void load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not record the decision'));
    } finally {
      setSaving(false);
    }
  };

  const filters: FilterConfig[] = [
    { key: 'status', placeholder: 'Status', value: statusFilter, onChange: setStatusFilter, options: STATUS_OPTIONS },
  ];

  const columns: Column<Dispute>[] = [
    { key: 'status', header: 'Status', render: (d) => <StatusBadge status={tone(d.status)} label={d.status} /> },
    {
      key: 'booking',
      header: 'Booking',
      render: (d) => (
        <div>
          <Link to={`/admin/bookings/${d.bookingId}`} className="font-medium underline-offset-2 hover:underline" onClick={(e) => e.stopPropagation()}>
            {d.booking?.category ?? 'Booking'}
          </Link>
          <p className="text-xs text-neutral-500">{d.booking?.scheduledDate ? new Date(d.booking.scheduledDate).toLocaleDateString('en-ZA') : ''}</p>
        </div>
      ),
    },
    { key: 'customer', header: 'Customer', render: (d) => <span className="text-neutral-500">{d.customer?.user?.fullName ?? 'Unknown'}</span> },
    { key: 'reason', header: 'Reason', render: (d) => <span className="truncate max-w-[220px] block">{d.reason ?? ''}</span> },
    {
      key: 'createdAt',
      header: 'Raised',
      render: (d) => <span className="text-neutral-400 text-xs tabular-nums">{new Date(d.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Disputes" description="Booking disputes raised by customers. Resolving records a decision only." />
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        Resolving a dispute records your decision and notes. It does not move any money. Payments are not live yet, so payouts and refunds are not processed.
      </div>
      <SearchFilter searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search..." filters={filters} />
      <DataTable
        columns={columns}
        data={disputes.filter((r) => !search.trim() || JSON.stringify(r).toLowerCase().includes(search.trim().toLowerCase()))}
        isLoading={isLoading}
        emptyTitle="No disputes"
        emptyDescription="Disputes raised on bookings will appear here"
        onRowClick={open}
      />

      <ConfirmDialog
        open={!!selected}
        onOpenChange={(v) => !v && !saving && setSelected(null)}
        title="Dispute"
        description={selected ? `Raised ${new Date(selected.createdAt).toLocaleString('en-ZA')}` : ''}
        confirmLabel={isOpen ? 'Record decision' : 'Close'}
        isLoading={saving}
        onConfirm={() => (isOpen ? void resolve() : setSelected(null))}
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Reason</p>
              <p className="whitespace-pre-wrap">{selected.reason || 'No reason given.'}</p>
            </div>
            {evidenceLines(selected.evidence).length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Evidence</p>
                <ul className="space-y-1 text-neutral-600 dark:text-neutral-300 break-words">
                  {evidenceLines(selected.evidence).map((line, i) => (
                    <li key={i} className="whitespace-pre-wrap">{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {isOpen ? (
              <>
                <div>
                  <label htmlFor="dispute-outcome" className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1 block">
                    Outcome
                  </label>
                  <select id="dispute-outcome" value={outcome} onChange={(e) => setOutcome(e.target.value as 'payout' | 'refund')} className={fieldClass}>
                    <option value="payout">In favour of the freelancer (payout)</option>
                    <option value="refund">In favour of the customer (refund)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="dispute-resolution" className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1 block">
                    Resolution notes
                  </label>
                  <textarea id="dispute-resolution" rows={4} value={resolution} onChange={(e) => setResolution(e.target.value)} className={`${fieldClass} resize-none`} placeholder="Explain the decision..." />
                </div>
                <p className="text-xs text-neutral-500">This records a decision only. No money is moved.</p>
              </>
            ) : (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Resolution</p>
                <p className="whitespace-pre-wrap">{selected.resolution || 'Resolved.'}</p>
              </div>
            )}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};

export default AdminDisputes;
