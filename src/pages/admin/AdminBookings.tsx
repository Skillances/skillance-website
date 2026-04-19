import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, UserRound, Briefcase, Filter } from 'lucide-react';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { toast } from 'sonner';

interface BookingUser {
  id: string;
  fullName: string;
  tag?: string;
  profilePhotoUrl?: string | null;
}

interface BookingItem {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledTime?: string | null;
  createdAt: string;
  totalAmount?: number | null;
  totalPrice?: number | null;
  address?: string | null;
  customer?: BookingUser | null;
  freelancer?: {
    id: string;
    user?: BookingUser | null;
  } | null;
}

interface BookingStats {
  total?: number;
  pending?: number;
  confirmed?: number;
  completed?: number;
  cancelled?: number;
}

const bookingStatusToneMap: Record<string, string> = {
  pending: 'pending',
  confirmed: 'info',
  inProgress: 'info',
  completed: 'success',
  cancelled: 'error',
  rejected: 'rejected',
};

const formatDateTime = (input?: string | null) => {
  if (!input) return '--';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatMoney = (amount?: number | null) => {
  if (typeof amount !== 'number') return '--';
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 2,
  }).format(amount);
};

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [freelancerFilter, setFreelancerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('scheduledDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const [clientOptions, setClientOptions] = useState<Array<{ label: string; value: string }>>([{ label: 'All Clients', value: 'all' }]);
  const [freelancerOptions, setFreelancerOptions] = useState<Array<{ label: string; value: string }>>([{ label: 'All Freelancers', value: 'all' }]);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(pageSize));
      params.set('sortBy', sortKey);
      params.set('sortOrder', sortDirection);
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (clientFilter !== 'all') params.set('clientId', clientFilter);
      if (freelancerFilter !== 'all') params.set('freelancerId', freelancerFilter);

      const res = await get(`${ApiPaths.admin.bookings}?${params.toString()}`);
      if (res.success) {
        const incoming = (res.data.bookings ?? []) as BookingItem[];
        setBookings(incoming);
        setTotal(res.data.pagination?.total ?? res.data.total ?? incoming.length);

        const uniqueClients = new Map<string, string>();
        const uniqueFreelancers = new Map<string, string>();

        for (const booking of incoming) {
          if (booking.customer?.id) {
            uniqueClients.set(
              booking.customer.id,
              booking.customer.fullName || booking.customer.tag || 'Unknown client',
            );
          }
          if (booking.freelancer?.id) {
            uniqueFreelancers.set(
              booking.freelancer.id,
              booking.freelancer.user?.fullName || booking.freelancer.user?.tag || 'Unknown freelancer',
            );
          }
        }

        setClientOptions((prev) => {
          const base = [{ label: 'All Clients', value: 'all' }];
          const next = Array.from(uniqueClients.entries()).map(([value, label]) => ({ value, label }));
          return next.length > 0 ? [...base, ...next] : prev;
        });

        setFreelancerOptions((prev) => {
          const base = [{ label: 'All Freelancers', value: 'all' }];
          const next = Array.from(uniqueFreelancers.entries()).map(([value, label]) => ({ value, label }));
          return next.length > 0 ? [...base, ...next] : prev;
        });
      }
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortKey, sortDirection, search, statusFilter, clientFilter, freelancerFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await get(ApiPaths.admin.bookingsStats);
      if (res.success) setStats(res.data as BookingStats);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchBookings(), search ? 400 : 0);
    return () => clearTimeout(debounce);
  }, [fetchBookings, search]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
    setPage(1);
  };

  const filters: FilterConfig[] = [
    {
      key: 'status',
      placeholder: 'Booking Status',
      value: statusFilter,
      onChange: (value) => {
        setStatusFilter(value);
        setPage(1);
      },
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'In Progress', value: 'inProgress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      key: 'clientId',
      placeholder: 'Client',
      value: clientFilter,
      onChange: (value) => {
        setClientFilter(value);
        setPage(1);
      },
      options: clientOptions,
    },
    {
      key: 'freelancerId',
      placeholder: 'Freelancer',
      value: freelancerFilter,
      onChange: (value) => {
        setFreelancerFilter(value);
        setPage(1);
      },
      options: freelancerOptions,
    },
  ];

  const columns: Column<BookingItem>[] = useMemo(() => [
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (booking) => (
        <StatusBadge
          status={bookingStatusToneMap[booking.status] || 'info'}
          label={booking.status || 'unknown'}
        />
      ),
    },
    {
      key: 'scheduledDate',
      header: 'Scheduled Date',
      sortable: true,
      render: (booking) => (
        <span className="text-neutral-500 dark:text-neutral-400 text-xs">
          {formatDateTime(booking.scheduledDate)}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Client',
      render: (booking) => (
        <div className="min-w-0">
          <p className="text-black dark:text-white font-medium text-sm truncate">
            {booking.customer?.fullName || '--'}
          </p>
          <p className="text-neutral-400 dark:text-neutral-500 text-xs truncate">
            {booking.customer?.tag ? `@${booking.customer.tag}` : '--'}
          </p>
        </div>
      ),
    },
    {
      key: 'freelancer',
      header: 'Freelancer',
      render: (booking) => (
        <span className="text-neutral-600 dark:text-neutral-300 text-sm">
          {booking.freelancer?.user?.fullName || '--'}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      sortable: true,
      render: (booking) => (
        <span className="text-neutral-600 dark:text-neutral-300 text-sm">
          {formatMoney(booking.totalAmount ?? booking.totalPrice)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (booking) => (
        <span className="text-neutral-500 dark:text-neutral-400 text-xs">
          {formatDateTime(booking.createdAt)}
        </span>
      ),
    },
  ], []);

  const statsCards = stats ? [
    { title: 'Total Bookings', value: String(stats.total ?? 0), icon: CalendarDays, color: '#171717' },
    { title: 'Pending', value: String(stats.pending ?? 0), icon: Filter, color: '#f59e0b' },
    { title: 'Confirmed', value: String(stats.confirmed ?? 0), icon: UserRound, color: '#3b82f6' },
    { title: 'Completed', value: String(stats.completed ?? 0), icon: Briefcase, color: '#10b981' },
  ] : [];

  return (
    <div className="space-y-10">
      <PageHeader
        title="Booking"
        description="View and manage all system bookings with filter, sorting, and pagination controls."
      />

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <StatsCard key={stat.title} {...stat} index={index} />
          ))}
        </div>
      )}

      <SearchFilter
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by booking ID, client, or freelancer..."
        filters={filters}
      />

      <DataTable
        columns={columns}
        data={bookings}
        isLoading={isLoading}
        emptyTitle="No bookings found"
        emptyDescription="Try adjusting your date sort or filters."
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AdminBookings;
