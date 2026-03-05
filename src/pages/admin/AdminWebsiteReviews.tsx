import React, { useState, useEffect, useCallback } from 'react';
import { get, put, del } from '@/lib/api';
import { Star, CheckCircle, XCircle, Trash2, Clock } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WebsiteReview {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  location: string;
  status: string;
  createdAt: string;
}

const AdminWebsiteReviews: React.FC = () => {
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(pageSize));
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await get(`/admin/website-reviews?${params.toString()}`);
      if (res.success) {
        setReviews(res.data.reviews);
        setTotal(res.data.pagination.total);
      }
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (id: string) => {
    try {
      await put(`/admin/website-reviews/${id}`, { status: 'approved' });
      toast.success('Review approved');
      fetchReviews();
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await put(`/admin/website-reviews/${id}`, { status: 'rejected' });
      toast.success('Review rejected');
      fetchReviews();
    } catch {
      toast.error('Failed to reject');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await del(`/admin/website-reviews/${id}`);
      toast.success('Review deleted');
      fetchReviews();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-600 dark:text-neutral-600'}`}
        />
      ))}
    </div>
  );

  const filters: FilterConfig[] = [
    {
      key: 'status',
      placeholder: 'Status',
      value: statusFilter,
      onChange: (v) => { setStatusFilter(v); setPage(1); },
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
  ];

  const columns: Column<WebsiteReview>[] = [
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status as any} label={r.status} />,
    },
    {
      key: 'name',
      header: 'Name',
      render: (r) => (
        <div>
          <span className="font-medium text-black dark:text-white">
            {r.isAnonymous ? 'Anonymous' : r.name}
          </span>
          <p className="text-[10px] text-neutral-400 capitalize">{r.role}</p>
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
      className: 'max-w-[250px]',
      render: (r) => (
        <p className="text-neutral-500 dark:text-neutral-400 text-xs line-clamp-2">{r.comment}</p>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (r) => <span className="text-neutral-400 text-xs">{r.location}</span>,
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
          {r.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-emerald-500 hover:text-emerald-700"
                onClick={(e) => { e.stopPropagation(); handleApprove(r.id); }}
                title="Approve"
              >
                <CheckCircle className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                onClick={(e) => { e.stopPropagation(); handleReject(r.id); }}
                title="Reject"
              >
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-neutral-400 hover:text-red-500"
            onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;

  return (
    <div>
      <PageHeader
        title={<>Website <span className="italic">Reviews</span></>}
        description="Manage reviews submitted through the public website"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Total Reviews" value={total} icon={Star} />
        <StatsCard title="Pending Approval" value={pendingCount} icon={Clock} />
        <StatsCard title="Approved" value={approvedCount} icon={CheckCircle} />
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search reviews..."
        filters={filters}
      />

      <DataTable
        columns={columns}
        data={reviews.filter((r) =>
          !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.comment.toLowerCase().includes(search.toLowerCase()) ||
          r.location.toLowerCase().includes(search.toLowerCase())
        )}
        isLoading={isLoading}
        emptyTitle="No reviews yet"
        emptyDescription="Website reviews will appear here once submitted"
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AdminWebsiteReviews;
