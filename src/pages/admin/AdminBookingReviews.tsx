import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, put } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { Star, ListChecks, EyeOff, RotateCcw } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BookingReviewRow {
  id: string;
  bookingId: string;
  comment: string;
  createdAt: string;
  deletedAt: string | null;
  rating: number | null;
  customer: { id: string; fullName: string | null; email: string | null };
  freelancer: { id: string; user: { fullName: string | null; email: string | null } };
}

const AdminBookingReviews: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<BookingReviewRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibility, setVisibility] = useState<'visible' | 'all'>('visible');
  const [search, setSearch] = useState('');
  const [freelancerIdFilter, setFreelancerIdFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionId, setActionId] = useState<string | null>(null);
  const pageSize = 20;

  const includeDeleted = visibility === 'all';

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(pageSize));
      if (includeDeleted) params.set('includeDeleted', 'true');
      const fid = freelancerIdFilter.trim();
      if (fid) params.set('freelancerId', fid);

      const res = await get(`${ApiPaths.admin.bookingReviews}?${params.toString()}`);
      if (res.success) {
        setReviews(res.data.reviews ?? []);
        setTotal(res.data.total ?? 0);
      }
    } catch {
      toast.error('Failed to load booking reviews');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, includeDeleted, freelancerIdFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const runHide = async (id: string) => {
    try {
      setActionId(id);
      await put(ApiPaths.admin.bookingReviewHide(id), {});
      toast.success('Review hidden');
      fetchReviews();
    } catch {
      toast.error('Failed to hide review');
    } finally {
      setActionId(null);
    }
  };

  const runRestore = async (id: string) => {
    try {
      setActionId(id);
      await put(ApiPaths.admin.bookingReviewRestore(id), {});
      toast.success('Review restored');
      fetchReviews();
    } catch {
      toast.error('Failed to restore review');
    } finally {
      setActionId(null);
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

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((r) => {
      const cust = `${r.customer?.fullName ?? ''} ${r.customer?.email ?? ''}`.toLowerCase();
      const fl = `${r.freelancer?.user?.fullName ?? ''} ${r.freelancer?.user?.email ?? ''}`.toLowerCase();
      return (
        r.comment.toLowerCase().includes(q) ||
        cust.includes(q) ||
        fl.includes(q) ||
        r.bookingId.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });
  }, [reviews, search]);

  const filters: FilterConfig[] = [
    {
      key: 'visibility',
      placeholder: 'Visibility',
      value: visibility,
      onChange: (v) => {
        setVisibility(v as 'visible' | 'all');
        setPage(1);
      },
      options: [
        { label: 'Visible only', value: 'visible' },
        { label: 'Include hidden', value: 'all' },
      ],
    },
  ];

  const hiddenOnPage = useMemo(() => reviews.filter((r) => r.deletedAt).length, [reviews]);

  const columns: Column<BookingReviewRow>[] = [
    {
      key: 'status',
      header: 'Status',
      render: (r) =>
        r.deletedAt ? (
          <StatusBadge status="warning" label="Hidden" />
        ) : (
          <StatusBadge status="verified" label="Visible" />
        ),
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
      render: (r) => (
        <div className="flex items-center gap-1">
          {!r.deletedAt ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 text-neutral-500 hover:text-red-600"
              disabled={actionId === r.id}
              onClick={(e) => {
                e.stopPropagation();
                runHide(r.id);
              }}
              title="Hide review"
            >
              <EyeOff className="h-3.5 w-3.5" />
              Hide
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 text-neutral-500 hover:text-emerald-600"
              disabled={actionId === r.id}
              onClick={(e) => {
                e.stopPropagation();
                runRestore(r.id);
              }}
              title="Restore review"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restore
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={<>Booking <span className="italic">Reviews</span></>}
        description="Customer reviews left on completed bookings. Hiding soft-deletes a review so it no longer appears publicly; restore brings it back."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatsCard title="Matching reviews" value={total} icon={ListChecks} />
        <StatsCard
          title="Hidden on this page"
          value={includeDeleted ? hiddenOnPage : '—'}
          icon={EyeOff}
        />
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
        data={filteredRows}
        isLoading={isLoading}
        emptyTitle="No booking reviews"
        emptyDescription="Reviews from completed bookings will appear here"
        onRowClick={(r) => navigate(`/admin/freelancers/${r.freelancer.id}`)}
        getRowClassName={(r) => (r.deletedAt ? 'opacity-70' : undefined)}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AdminBookingReviews;
