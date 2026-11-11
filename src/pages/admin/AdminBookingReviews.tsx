import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { get, put } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { Star, ListChecks, EyeOff, RotateCcw, CheckCircle, ScrollText } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  PRE_LAUNCH_WEBSITE_REVIEW_IDS,
  REVIEW_APPEAL_NOTE,
  bookingReviewQueueStatus,
  type BookingReviewQueue,
} from '@/lib/reviewLock';

interface BookingReviewRow {
  id: string;
  bookingId: string;
  comment: string;
  createdAt: string;
  deletedAt: string | null;
  rating: number | null;
  moderationStatus?: string | null;
  status?: string | null;
  customer: { id: string; fullName: string | null; email: string | null };
  freelancer: { id: string; user: { fullName: string | null; email: string | null } };
}

interface ModerationLogEntry {
  id?: string;
  reviewId?: string;
  bookingId?: string;
  actor?: string | { fullName?: string | null; email?: string | null };
  action?: string;
  createdAt?: string;
}

type QueueFilter = BookingReviewQueue | 'all';

const QUEUE_OPTIONS: { label: string; value: QueueFilter }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Published', value: 'published' },
  { label: 'Hidden', value: 'hidden' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' },
];

function actorLabel(actor: ModerationLogEntry['actor']): string {
  if (!actor) return 'Unknown';
  if (typeof actor === 'string') return actor;
  return actor.fullName || actor.email || 'Unknown';
}

const AdminBookingReviews: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<BookingReviewRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [queue, setQueue] = useState<QueueFilter>('pending');
  const [search, setSearch] = useState('');
  const searchDebounced = useDebouncedValue(search, 300);
  const [freelancerIdFilter, setFreelancerIdFilter] = useState('');
  const freelancerIdDebounced = useDebouncedValue(freelancerIdFilter, 400);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionId, setActionId] = useState<string | null>(null);
  const [logFor, setLogFor] = useState<BookingReviewRow | null>(null);
  const [logEntries, setLogEntries] = useState<ModerationLogEntry[] | null>(null);
  const [logNote, setLogNote] = useState<string | null>(null);
  const pageSize = 20;

  const fetchReviews = useCallback(async () => {
    const buildParams = (withStatus: boolean) => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(pageSize));
      if (queue === 'hidden' || queue === 'all') params.set('includeDeleted', 'true');
      if (withStatus && queue !== 'all') params.set('status', queue);
      const fid = freelancerIdDebounced.trim();
      if (fid) params.set('freelancerId', fid);
      return params;
    };

    try {
      setIsLoading(true);
      let res = await get(`${ApiPaths.admin.bookingReviews}?${buildParams(true).toString()}`);
      if (!res.success && queue !== 'all') {
        res = await get(`${ApiPaths.admin.bookingReviews}?${buildParams(false).toString()}`);
      }
      if (res.success) {
        setReviews(res.data.reviews ?? []);
        setTotal(res.data.total ?? 0);
      }
    } catch {
      if (queue !== 'all') {
        try {
          const res = await get(`${ApiPaths.admin.bookingReviews}?${buildParams(false).toString()}`);
          if (res.success) {
            setReviews(res.data.reviews ?? []);
            setTotal(res.data.total ?? 0);
            return;
          }
        } catch {
          // The status filter is part of the backend contract. Fall through to the error toast.
        }
      }
      toast.error('Failed to load booking reviews');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, queue, freelancerIdDebounced]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const runAction = async (id: string, kind: 'approve' | 'hide' | 'restore') => {
    const path =
      kind === 'approve'
        ? ApiPaths.admin.bookingReviewApprove(id)
        : kind === 'hide'
          ? ApiPaths.admin.bookingReviewHide(id)
          : ApiPaths.admin.bookingReviewRestore(id);
    const success =
      kind === 'approve' ? 'Review approved. It can now appear publicly.' : kind === 'hide' ? 'Review hidden' : 'Review restored';
    try {
      setActionId(id);
      await put(path, {});
      toast.success(success);
      fetchReviews();
    } catch {
      toast.error(
        kind === 'approve'
          ? 'Could not approve this review. The approve route is part of the booking-review contract.'
          : `Failed to ${kind} review`,
      );
    } finally {
      setActionId(null);
    }
  };

  const openLog = async (row: BookingReviewRow) => {
    setLogFor(row);
    setLogEntries(null);
    setLogNote(null);
    try {
      const res = await get(ApiPaths.admin.bookingReviewModerationLog(row.id));
      const data = res.data as { entries?: ModerationLogEntry[]; logs?: ModerationLogEntry[] } | ModerationLogEntry[] | undefined;
      const entries = Array.isArray(data) ? data : (data?.entries ?? data?.logs ?? []);
      setLogEntries(entries);
      if (entries.length === 0) setLogNote('No moderation rows yet. Approve, hide, and restore are written by the API.');
    } catch {
      setLogEntries([]);
      setLogNote('The moderation log is not available from the API yet. Approve, hide, and restore still send the action for the backend to record.');
    }
  };

  const renderStars = (rating: number | null) => {
    const r = rating != null && !Number.isNaN(Number(rating)) ? Math.round(Number(rating)) : 0;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`h-3.5 w-3.5 ${s <= r ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-600 dark:text-neutral-600'}`}
          />
        ))}
      </div>
    );
  };

  const queuedRows = useMemo(() => {
    const rows = queue === 'all' ? reviews : reviews.filter((row) => bookingReviewQueueStatus(row) === queue);
    const q = searchDebounced.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const cust = `${r.customer?.fullName ?? ''} ${r.customer?.email ?? ''}`.toLowerCase();
      const fl = `${r.freelancer?.user?.fullName ?? ''} ${r.freelancer?.user?.email ?? ''}`.toLowerCase();
      return (
        (r.comment ?? '').toLowerCase().includes(q) ||
        cust.includes(q) ||
        fl.includes(q) ||
        r.bookingId.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });
  }, [reviews, searchDebounced, queue]);

  const filters: FilterConfig[] = [
    {
      key: 'queue',
      placeholder: 'Queue',
      value: queue,
      onChange: (v) => {
        setQueue(v as QueueFilter);
        setPage(1);
      },
      options: QUEUE_OPTIONS,
    },
  ];

  const columns: Column<BookingReviewRow>[] = [
    {
      key: 'status',
      header: 'Queue',
      render: (r) => {
        const state = bookingReviewQueueStatus(r);
        const tone = state === 'published' ? 'verified' : state === 'pending' ? 'pending' : state === 'rejected' ? 'rejected' : 'warning';
        return <StatusBadge status={tone} label={state} />;
      },
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => (
        <div>
          <span className="font-medium text-black dark:text-white">{r.customer?.fullName || '—'}</span>
          <p className="text-[10px] text-neutral-400 truncate max-w-[180px]">{r.customer?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'freelancer',
      header: 'Freelancer',
      render: (r) => (
        <div>
          <span className="font-medium text-black dark:text-white">{r.freelancer?.user?.fullName || '—'}</span>
          <p className="text-[10px] text-neutral-400 truncate max-w-[180px]">{r.freelancer?.user?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (r) => renderStars(r.rating),
    },
    {
      key: 'comment',
      header: 'Review',
      className: 'max-w-[260px]',
      render: (r) => (
        <p className="text-neutral-500 dark:text-neutral-400 text-xs line-clamp-2">{r.comment || '—'}</p>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (r) => (
        <span className="text-neutral-400 text-xs tabular-nums">
          {new Date(r.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => {
        const state = bookingReviewQueueStatus(r);
        return (
          <div className="flex items-center gap-1">
            {state === 'pending' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 text-emerald-600"
                disabled={actionId === r.id}
                onClick={(e) => {
                  e.stopPropagation();
                  void runAction(r.id, 'approve');
                }}
                title="Approve and publish"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Approve
              </Button>
            )}
            {state !== 'hidden' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 text-neutral-500 hover:text-red-600"
                disabled={actionId === r.id}
                onClick={(e) => {
                  e.stopPropagation();
                  void runAction(r.id, 'hide');
                }}
                title="Hide review"
              >
                <EyeOff className="h-3.5 w-3.5" />
                Hide
              </Button>
            )}
            {state === 'hidden' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 text-neutral-500 hover:text-emerald-600"
                disabled={actionId === r.id}
                onClick={(e) => {
                  e.stopPropagation();
                  void runAction(r.id, 'restore');
                }}
                title="Restore review"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 text-neutral-500"
              onClick={(e) => {
                e.stopPropagation();
                void openLog(r);
              }}
              title="Moderation log"
            >
              <ScrollText className="h-3.5 w-3.5" />
              Log
            </Button>
          </div>
        );
      },
    },
  ];

  const pendingOnPage = reviews.filter((row) => bookingReviewQueueStatus(row) === 'pending').length;

  return (
    <div>
      <PageHeader
        title="Booking reviews"
        description="Pending reviews stay off public profiles until you approve them. Hide keeps the row. Nothing here is hard-deleted, and star ratings are not edited."
      />

      <p className="mb-6 max-w-3xl text-sm text-neutral-500 dark:text-neutral-400">
        Website testimonials are not in this queue and do not count as verified booking reviews. Pre-launch website review ids stay on Website reviews, not here:
        {' '}
        {PRE_LAUNCH_WEBSITE_REVIEW_IDS.join(', ')}. {REVIEW_APPEAL_NOTE}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatsCard title="Matching reviews" value={total} icon={ListChecks} />
        <StatsCard title="Pending on this page" value={pendingOnPage} icon={ScrollText} />
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter loaded page: comment, names, ids..."
        secondSearchValue={freelancerIdFilter}
        onSecondSearchChange={(v) => {
          setFreelancerIdFilter(v);
          setPage(1);
        }}
        secondSearchPlaceholder="Freelancer ID (optional filter)..."
        filters={filters}
      />

      <DataTable
        columns={columns}
        data={queuedRows}
        isLoading={isLoading}
        emptyTitle="No booking reviews in this queue"
        emptyDescription="Pending reviews appear here after a customer submits one. Publishing waits for an explicit approve."
        onRowClick={(r) => navigate(`/admin/freelancers/${r.freelancer.id}`)}
        getRowClassName={(r) => (bookingReviewQueueStatus(r) === 'hidden' ? 'opacity-70' : undefined)}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />

      <Dialog open={Boolean(logFor)} onOpenChange={(open) => !open && setLogFor(null)}>
        <DialogContent className="bg-white dark:bg-neutral-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Moderation log</DialogTitle>
            <DialogDescription>
              Review {logFor?.id}. Booking {logFor?.bookingId}. Messages to the customer or provider are not sent from here.
            </DialogDescription>
          </DialogHeader>
          {logNote && <p className="text-sm text-neutral-500">{logNote}</p>}
          <ul className="space-y-2 text-sm">
            {(logEntries ?? []).map((entry, index) => (
              <li key={entry.id ?? `${entry.action}-${index}`} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
                <p className="font-medium capitalize">{entry.action || 'action'}</p>
                <p className="text-neutral-500">{actorLabel(entry.actor)}</p>
                <p className="text-xs text-neutral-400">{entry.createdAt ? new Date(entry.createdAt).toLocaleString('en-ZA') : ''}</p>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookingReviews;
