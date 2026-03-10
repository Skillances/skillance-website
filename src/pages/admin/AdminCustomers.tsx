import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '@/lib/api';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { toast } from 'sonner';

interface CustomerItem { id: string; email: string; fullName: string; tag: string; phoneNumber: string | null; profilePhotoUrl: string | null; isAdmin: boolean; createdAt: string; }

const AdminCustomers: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchCustomers = useCallback(async () => {
    try { setIsLoading(true); const params = new URLSearchParams(); params.set('page', String(page)); params.set('limit', String(pageSize)); params.set('sortBy', 'createdAt'); params.set('sortOrder', 'desc'); if (search) params.set('search', search); const res = await get(`/admin/customers?${params.toString()}`); if (res.success) { setCustomers(res.data.customers); setTotal(res.data.pagination.total); } } catch { toast.error('Failed to load customers'); } finally { setIsLoading(false); }
  }, [page, pageSize, search]);

  useEffect(() => { const debounce = setTimeout(() => fetchCustomers(), search ? 400 : 0); return () => clearTimeout(debounce); }, [fetchCustomers]);

  const columns: Column<CustomerItem>[] = [
    { key: 'fullName', header: 'Name', render: (c) => (
      <div className="flex items-center gap-3">
        {c.profilePhotoUrl ? (
          <img src={c.profilePhotoUrl} alt={c.fullName ? `Photo of ${c.fullName}` : 'Profile photo'} className="w-8 h-8 rounded-full object-cover shrink-0 bg-neutral-100 dark:bg-neutral-700" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-xs font-semibold text-black dark:text-white shrink-0">{c.fullName?.charAt(0) || '?'}</div>
        )}
        <div className="min-w-0"><p className="text-black dark:text-white font-medium text-sm truncate">{c.fullName}</p><p className="text-neutral-400 dark:text-neutral-500 text-xs truncate">@{c.tag}</p></div>
      </div>
    )},
    { key: 'email', header: 'Email', render: (c) => <span className="text-neutral-500">{c.email}</span> },
    { key: 'phoneNumber', header: 'Phone', render: (c) => <span className="text-neutral-500">{c.phoneNumber || '--'}</span> },
    { key: 'createdAt', header: 'Joined', render: (c) => <span className="text-neutral-400 text-xs">{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  ];

  return (
    <div className="space-y-10">
      <PageHeader title="Customers" description="Manage platform customers" />
      <SearchFilter searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search by name, email, or tag..." />
      <DataTable columns={columns} data={customers} isLoading={isLoading} emptyTitle="No customers found" emptyDescription="Try adjusting your search" onRowClick={(c) => navigate(`/admin/customers/${c.id}`)} page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  );
};

export default AdminCustomers;
