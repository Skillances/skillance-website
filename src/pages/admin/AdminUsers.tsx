import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '@/lib/api';
import { Users, UserCheck, ShieldCheck, UserPlus } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { toast } from 'sonner';

interface UserItem {
  id: string;
  email: string;
  fullName: string;
  tag: string;
  phoneNumber: string | null;
  userType: string;
  isAdmin: boolean;
  createdAt: string;
  customerBookingsCount?: number;
  freelancer: {
    id: string;
    isVerified: boolean;
    idVerificationStatus: string;
    rating: number;
    totalReviews: number;
  } | null;
}

function getUserRoles(u: UserItem): { freelancer: boolean; customer: boolean } {
  const hasFreelancerProfile = u.freelancer !== null;
  const hasCustomerActivity =
    (u.customerBookingsCount ?? 0) > 0 || u.userType === 'customer';

  if (hasFreelancerProfile && hasCustomerActivity) {
    return { freelancer: true, customer: true };
  }
  if (hasFreelancerProfile) {
    return { freelancer: true, customer: false };
  }
  return { freelancer: false, customer: true };
}

const UserTypeCell: React.FC<{ user: UserItem }> = ({ user }) => {
  const roles = getUserRoles(user);
  const both = roles.freelancer && roles.customer;

  if (both) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
          Freelancer
        </span>
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
          &amp;
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          Customer
        </span>
      </div>
    );
  }

  const status = roles.freelancer ? 'freelancer' : 'customer';
  return <StatusBadge status={status as any} />;
};

interface UserStats {
  total: number;
  customers: number;
  freelancers: number;
  admins: number;
  newThisMonth: number;
  newThisWeek: number;
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(pageSize));
      params.set('sortBy', sortKey);
      params.set('sortOrder', sortDirection);
      if (search) params.set('search', search);
      // Only `customer` and `freelancer` are understood by the backend. `both`
      // is a virtual filter that narrows the current page client-side since
      // there is no DB column for "acted in both roles".
      if (userTypeFilter === 'customer' || userTypeFilter === 'freelancer') {
        params.set('userType', userTypeFilter);
      }
      if (adminFilter !== 'all') params.set('isAdmin', adminFilter);

      const res = await get(`/admin/users?${params.toString()}`);
      if (res.success) {
        setUsers(res.data.users);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortKey, sortDirection, search, userTypeFilter, adminFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await get('/admin/users/stats');
      if (res.success) setStats(res.data);
    } catch {
      // stats are non-critical
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => {
    const debounce = setTimeout(() => fetchUsers(), search ? 400 : 0);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDirection('desc'); }
    setPage(1);
  };

  const filters: FilterConfig[] = [
    {
      key: 'userType',
      placeholder: 'User Type',
      value: userTypeFilter,
      onChange: (v) => { setUserTypeFilter(v); setPage(1); },
      options: [
        { label: 'All Types', value: 'all' },
        { label: 'Customer (only)', value: 'customer' },
        { label: 'Freelancer (only)', value: 'freelancer' },
        { label: 'Freelancer & Customer', value: 'both' },
      ],
    },
    { key: 'isAdmin', placeholder: 'Admin Status', value: adminFilter, onChange: (v) => { setAdminFilter(v); setPage(1); }, options: [{ label: 'All', value: 'all' }, { label: 'Admins', value: 'true' }, { label: 'Non-Admins', value: 'false' }] },
  ];

  const visibleUsers = users.filter((u) => {
    if (userTypeFilter === 'all') return true;
    const roles = getUserRoles(u);
    if (userTypeFilter === 'both') return roles.freelancer && roles.customer;
    if (userTypeFilter === 'freelancer') return roles.freelancer && !roles.customer;
    if (userTypeFilter === 'customer') return roles.customer && !roles.freelancer;
    return true;
  });

  const columns: Column<UserItem>[] = [
    {
      key: 'fullName', header: 'Name', sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-semibold text-black shrink-0">
            {u.fullName?.charAt(0) || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-black dark:text-white font-medium text-sm truncate">{u.fullName}</p>
            <p className="text-neutral-400 text-xs truncate">@{u.tag}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'Email', sortable: true, render: (u) => <span className="text-neutral-500">{u.email}</span> },
    { key: 'userType', header: 'Type', render: (u) => <UserTypeCell user={u} /> },
    { key: 'isAdmin', header: 'Admin', render: (u) => u.isAdmin ? <StatusBadge status="admin" /> : <span className="text-neutral-300">--</span> },
    { key: 'createdAt', header: 'Joined', sortable: true, render: (u) => <span className="text-neutral-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  ];

  const statsCards = stats ? [
    { title: 'Total Users', value: stats.total.toLocaleString(), change: `+${stats.newThisMonth} this month`, icon: Users, color: '#171717' },
    { title: 'Customers', value: stats.customers.toLocaleString(), icon: UserCheck, color: '#8b5cf6' },
    { title: 'Freelancers', value: stats.freelancers.toLocaleString(), icon: UserPlus, color: '#10b981' },
    { title: 'Admins', value: stats.admins.toLocaleString(), icon: ShieldCheck, color: '#f59e0b' },
  ] : [];

  return (
    <div className="space-y-10">
      <PageHeader title="Users" description="Manage all platform users" />
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}
        </div>
      )}
      <SearchFilter searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search by name, email, or tag..." filters={filters} />
      <DataTable columns={columns} data={visibleUsers} isLoading={isLoading} emptyTitle="No users found" emptyDescription="Try adjusting your search or filters" onRowClick={(u) => navigate(`/admin/users/${u.id}`)} sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  );
};

export default AdminUsers;
