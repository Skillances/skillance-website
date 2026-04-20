import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { Briefcase, CheckCircle, Clock, XCircle, BadgeCheck, Shield } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { toast } from 'sonner';

interface FreelancerItem { id: string; isVerified: boolean; idVerificationStatus: string; policeClearanceStatus: string | null; rating: number; totalBookingsCompleted: number; createdAt: string; user: { id: string; email: string; fullName: string; tag: string; phoneNumber: string | null; city: string | null; profilePhotoUrl: string | null; createdAt: string; }; }
interface FreelancerStats { total: number; verified: number; pending: number; rejected: number; averageRating: number; totalBookingsCompleted: number; }

const AdminFreelancers: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryIdFilter = searchParams.get('categoryId')?.trim() || '';
  const [freelancers, setFreelancers] = useState<FreelancerItem[]>([]);
  const [stats, setStats] = useState<FreelancerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const searchDebounced = useDebouncedValue(search, 400);
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchFreelancers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('limit', String(pageSize));
      params.set('offset', String((page - 1) * pageSize));
      params.set('sortBy', sortKey);
      params.set('sortOrder', sortDirection);
      if (verificationFilter !== 'all') params.set('idVerificationStatus', verificationFilter);
      if (searchDebounced.trim()) params.set('search', searchDebounced.trim());
      if (categoryIdFilter) params.set('categoryId', categoryIdFilter);
      const res = await get(`${ApiPaths.admin.freelancers}?${params.toString()}`);
      if (res.success) {
        setFreelancers(res.data.freelancers);
        setTotal(res.data.total);
      }
    } catch {
      toast.error('Failed to load freelancers');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortKey, sortDirection, verificationFilter, searchDebounced, categoryIdFilter]);

  const fetchStats = useCallback(async () => { try { const res = await get(ApiPaths.admin.freelancersStats); if (res.success) setStats(res.data); } catch {} }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchFreelancers(); }, [fetchFreelancers]);

  const handleSort = (key: string) => { if (sortKey === key) setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc')); else { setSortKey(key); setSortDirection('desc'); } setPage(1); };

  const filters: FilterConfig[] = [{ key: 'idVerificationStatus', placeholder: 'Verification Status', value: verificationFilter, onChange: (v) => { setVerificationFilter(v); setPage(1); }, options: [{ label: 'All Statuses', value: 'all' }, { label: 'Verified', value: 'verified' }, { label: 'Unverified', value: 'unverified' }, { label: 'Pending', value: 'pending' }, { label: 'Rejected', value: 'rejected' }] }];

  const columns: Column<FreelancerItem>[] = [
    { key: 'fullName', header: 'Freelancer', sortable: true, render: (f) => (
      <div className="flex items-center gap-3">
        {f.user.profilePhotoUrl ? (
          <img src={f.user.profilePhotoUrl} alt={f.user.fullName ? `Photo of ${f.user.fullName}` : 'Profile photo'} className="w-8 h-8 rounded-full object-cover shrink-0 bg-neutral-100 dark:bg-neutral-700" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-xs font-semibold text-black dark:text-white shrink-0">{f.user.fullName?.charAt(0) || '?'}</div>
        )}
        <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
          <p className="text-black dark:text-white font-medium text-sm truncate">{f.user.fullName}</p>
          {f.idVerificationStatus === 'verified' && (
            <span className="flex items-center justify-center rounded-full bg-emerald-500 text-white p-0.5 shrink-0" title="ID verified">
              <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          )}
          {f.policeClearanceStatus === 'verified' && (
            <span className="flex items-center justify-center rounded-full bg-blue-500 text-white p-0.5 shrink-0" title="Police clearance verified">
              <Shield className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          )}
          <p className="text-neutral-400 dark:text-neutral-500 text-xs truncate w-full">{f.user.email}</p>
        </div>
      </div>
    )},
    { key: 'idVerificationStatus', header: 'ID Verification', render: (f) => <StatusBadge status={(f.idVerificationStatus || 'not_submitted') as any} /> },
    { key: 'policeClearanceStatus', header: 'Police Clearance', render: (f) => <StatusBadge status={(f.policeClearanceStatus || 'not_submitted') as any} /> },
    { key: 'rating', header: 'Rating', sortable: true, render: (f) => <span className="text-neutral-600 dark:text-neutral-400">{f.rating ? `${Number(f.rating).toFixed(1)}` : '--'}</span> },
    { key: 'createdAt', header: 'Joined', sortable: true, render: (f) => <span className="text-neutral-400 dark:text-neutral-500 text-xs">{new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  ];

  const statsCards = stats ? [
    { title: 'Total Freelancers', value: stats.total.toLocaleString(), icon: Briefcase, color: '#8b5cf6' },
    { title: 'Verified', value: stats.verified.toLocaleString(), icon: CheckCircle, color: '#10b981' },
    { title: 'Pending', value: stats.pending.toLocaleString(), icon: Clock, color: '#f59e0b' },
    { title: 'Rejected', value: stats.rejected.toLocaleString(), icon: XCircle, color: '#ef4444' },
  ] : [];

  return (
    <div className="space-y-10">
      <PageHeader title="Freelancers" description="Manage all freelancer profiles and verifications" />
      {categoryIdFilter && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Filtered by category: <span className="font-mono">{categoryIdFilter}</span>
        </p>
      )}
      {stats && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{statsCards.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}</div>}
      <SearchFilter searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search freelancers..." filters={filters} />
      <DataTable columns={columns} data={freelancers} isLoading={isLoading} emptyTitle="No freelancers found" emptyDescription="Try adjusting your filters" onRowClick={(f) => navigate(`/admin/freelancers/${f.id}`)} sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  );
};

export default AdminFreelancers;
