import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import PageHeader from '@/components/admin/PageHeader';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { formatUtcCalendarDate } from '@/lib/bookingScheduleDisplay';

type LedgerBucketFilter = 'all' | 'paid_out' | 'in_dispute' | 'needs_payout' | 'refund_due';

type LedgerBucketDerived = LedgerBucketFilter | 'other';

interface PayoutLedgerItem {
  bookingId: string;
  bookingStatus: string;
  paymentStatus: string | null;
  escrowStatus: string | null;
  payoutReleasedAt: string | null;
  bucket: LedgerBucketDerived;
  amounts: {
    currency: 'ZAR';
    gross: number;
    platformCommission: number;
    freelancerPayout: number;
  };
  freelancer: {
    id: string;
    displayName: string | null;
    email: string | null;
  };
  customer: {
    id: string;
    displayName: string | null;
    email: string | null;
  };
  dispute: {
    id: string;
    status: string;
    createdAt: string;
    resolvedAt: string | null;
  } | null;
  walletdoc: {
    payoutSyncStatus: string | null;
    freelancerPayoutReferenceId: string | null;
  };
  scheduledDate: string;
  completedAt: string | null;
  cancelledAt: string | null;
  updatedAt: string;
}

interface PayoutLedgerPayload {
  bucket: LedgerBucketFilter;
  total: number;
  limit: number;
  offset: number;
  items: PayoutLedgerItem[];
  notes: {
    dateFilter: string;
    walletdoc: string;
  };
}

type DatePreset = 'all' | '90d' | '30d';

const zar = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatZar(n: number): string {
  return zar.format(n);
}

function payoutBucketUiLabel(bucket: LedgerBucketDerived): string {
  switch (bucket) {
    case 'paid_out':
      return 'Paid out';
    case 'in_dispute':
      return 'In dispute';
    case 'needs_payout':
      return 'Needs payout';
    case 'refund_due':
      return 'Refund due';
    default:
      return 'Other';
  }
}

function payoutBucketTone(
  bucket: LedgerBucketDerived,
): 'success' | 'warning' | 'info' | 'error' | 'pending' {
  switch (bucket) {
    case 'paid_out':
      return 'success';
    case 'in_dispute':
      return 'warning';
    case 'needs_payout':
      return 'info';
    case 'refund_due':
      return 'error';
    default:
      return 'pending';
  }
}

function ledgerQuery(opts: {
  bucket: LedgerBucketFilter;
  page: number;
  pageSize: number;
  preset: DatePreset;
}): string {
  const params = new URLSearchParams();
  params.set('bucket', opts.bucket === 'all' ? 'all' : opts.bucket);
  params.set('limit', String(opts.pageSize));
  params.set('offset', String((opts.page - 1) * opts.pageSize));
  if (opts.preset !== 'all') {
    const end = new Date();
    const start = new Date(end);
    const days = opts.preset === '30d' ? 30 : 90;
    start.setUTCDate(start.getUTCDate() - days);
    start.setUTCHours(0, 0, 0, 0);
    params.set('startDate', start.toISOString());
    params.set('endDate', end.toISOString());
  }
  return `?${params.toString()}`;
}

function formatTs(iso: string | null | undefined): string {
  if (!iso) return '--';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleString('en-ZA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatReference(ref: string | null | undefined): string {
  if (!ref?.trim()) return '--';
  const t = ref.trim();
  return t.length > 14 ? `${t.slice(0, 12)}…` : t;
}

const PAGE_SIZE = 25;

const AdminFinancePayoutLedger: React.FC = () => {
  const navigate = useNavigate();
  const [bucket, setBucket] = useState<LedgerBucketFilter>('all');
  const [preset, setPreset] = useState<DatePreset>('90d');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<PayoutLedgerPayload | null>(null);

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const qs = ledgerQuery({
        bucket,
        page,
        pageSize: PAGE_SIZE,
        preset,
      });
      const res = await get(`${ApiPaths.admin.financePayoutLedger}${qs}`);
      if (res.success && res.data) {
        setPayload(res.data as PayoutLedgerPayload);
      } else {
        setPayload(null);
        toast.error('Could not load payout ledger');
      }
    } catch {
      setPayload(null);
      toast.error('Could not load payout ledger');
    } finally {
      setLoading(false);
    }
  }, [bucket, page, preset]);

  useEffect(() => {
    void fetchLedger();
  }, [fetchLedger]);

  const columns = useMemo<Column<PayoutLedgerItem>[]>(
    () => [
      {
        key: 'bucket',
        header: 'Payout status',
        render: (row) => (
          <span className="flex flex-col gap-1">
            <StatusBadge status={payoutBucketTone(row.bucket)} label={payoutBucketUiLabel(row.bucket)} />
            <span className="text-[10px] uppercase tracking-wide text-neutral-400">
              Booking: {row.bookingStatus}
            </span>
          </span>
        ),
      },
      {
        key: 'booking',
        header: 'Booking',
        render: (row) => (
          <div className="space-y-0.5 font-mono text-xs">
            <div className="text-neutral-900 dark:text-neutral-100">{row.bookingId.slice(0, 8)}...</div>
            <div className="text-neutral-500 text-[11px]">{formatUtcCalendarDate(row.scheduledDate)} scheduled</div>
          </div>
        ),
      },
      {
        key: 'freelancer',
        header: 'Freelancer',
        render: (row) => (
          <div>
            <div className="text-neutral-900 dark:text-neutral-100 font-medium">
              {row.freelancer.displayName || 'Unknown'}
            </div>
            {row.freelancer.email && (
              <div className="text-[11px] text-neutral-500 truncate max-w-[200px]" title={row.freelancer.email}>
                {row.freelancer.email}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'amounts',
        header: 'Freelancer / platform',
        render: (row) => (
          <div className="text-xs space-y-0.5">
            <div>
              Freelancer:&nbsp;<span className="font-semibold">{formatZar(row.amounts.freelancerPayout)}</span>
            </div>
            <div className="text-neutral-500">Platform: {formatZar(row.amounts.platformCommission)}</div>
            <div className="text-neutral-400">GMV {formatZar(row.amounts.gross)}</div>
          </div>
        ),
      },
      {
        key: 'escrow',
        header: 'Escrow',
        render: (row) => (
          <div className="text-xs space-y-0.5">
            <div>{row.escrowStatus ?? '--'}</div>
            <div className="text-neutral-500">Pay: {row.paymentStatus ?? '--'}</div>
            {row.dispute != null ? (
              <div className="text-amber-600 dark:text-amber-400">Dispute {row.dispute.status}</div>
            ) : null}
          </div>
        ),
      },
      {
        key: 'walletdoc',
        header: 'Walletdoc',
        render: (row) => (
          <div className="text-xs space-y-0.5 max-w-[160px]">
            <div>
              Sync:&nbsp;
              <span className="text-neutral-500">
                {row.walletdoc.payoutSyncStatus ?? 'Not linked'}
              </span>
            </div>
            <div className="text-neutral-500 truncate" title={row.walletdoc.freelancerPayoutReferenceId ?? ''}>
              Ref: {formatReference(row.walletdoc.freelancerPayoutReferenceId)}
            </div>
          </div>
        ),
      },
      {
        key: 'dates',
        header: 'Timeline',
        render: (row) => (
          <div className="text-[11px] text-neutral-500 space-y-0.5">
            <div>Completed {formatTs(row.completedAt)}</div>
            <div>Cancelled {formatTs(row.cancelledAt)}</div>
            <div>Payout {formatTs(row.payoutReleasedAt)}</div>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/admin/finance"
          className="inline-flex items-center gap-2 text-sm font-medium mb-4 text-violet-700 dark:text-violet-300 hover:underline hover:text-violet-900 dark:hover:text-violet-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Finance summary
        </Link>
        <PageHeader
          title="Payout queue"
          description="Per-booking payout, dispute, and refund-due rows (ZAR). Filter by reconciliation status; Walletdoc sync is reserved for a future integration."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={bucket}
              onValueChange={(v) => {
                setPage(1);
                setBucket(v as LedgerBucketFilter);
              }}
            >
              <SelectTrigger className="w-[200px] bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-200 rounded-full">
                <SelectValue placeholder="Bucket" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 rounded-xl">
                <SelectItem value="all">All queues</SelectItem>
                <SelectItem value="needs_payout">Needs payout</SelectItem>
                <SelectItem value="in_dispute">In dispute</SelectItem>
                <SelectItem value="paid_out">Paid out</SelectItem>
                <SelectItem value="refund_due">Refund due</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={preset}
              onValueChange={(v) => {
                setPage(1);
                setPreset(v as DatePreset);
              }}
            >
              <SelectTrigger className="w-[180px] bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-200 rounded-full">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 rounded-xl">
                <SelectItem value="all">Updated: All time</SelectItem>
                <SelectItem value="90d">Updated: Last 90 days</SelectItem>
                <SelectItem value="30d">Updated: Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PageHeader>
      </div>

      {payload?.notes?.dateFilter != null ? (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{payload.notes.dateFilter}</p>
      ) : null}

      <DataTable<PayoutLedgerItem>
        columns={columns}
        data={payload?.items ?? []}
        isLoading={loading}
        emptyTitle="No ledger rows"
        emptyDescription="Try another bucket or widen the updated-date range."
        onRowClick={(row) => navigate(`/admin/bookings/${row.bookingId}`)}
        page={page}
        pageSize={PAGE_SIZE}
        total={payload?.total ?? 0}
        onPageChange={(next) => setPage(next)}
      />
    </div>
  );
};

export default AdminFinancePayoutLedger;
