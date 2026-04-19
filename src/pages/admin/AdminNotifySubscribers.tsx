import React, { useState, useEffect, useCallback } from 'react';
import { get, del } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { Bell, Download, Trash2, Users } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Subscriber {
  id: string;
  email: string;
  source: string;
  status: string;
  createdAt: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

const AdminNotifySubscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchSubscribers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(pageSize));
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await get(`${ApiPaths.admin.notifySubscribers}?${params.toString()}`);
      if (res.success) {
        setSubscribers(res.data.subscribers);
        setTotal(res.data.pagination.total);
      }
    } catch {
      toast.error('Failed to load subscribers');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleDelete = async (id: string) => {
    try {
      await del(ApiPaths.admin.notifySubscriber(id));
      toast.success('Subscriber removed');
      fetchSubscribers();
    } catch {
      toast.error('Failed to remove subscriber');
    }
  };

  const handleExport = () => {
    const token = localStorage.getItem('accessToken');
    const url = `${API_BASE_URL}${ApiPaths.admin.notifySubscribersExport}`;
    const link = document.createElement('a');
    link.href = url;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'include',
    })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        link.download = 'notify-subscribers.csv';
        link.click();
        window.URL.revokeObjectURL(blobUrl);
        toast.success('CSV exported');
      })
      .catch(() => toast.error('Export failed'));
  };

  const filters: FilterConfig[] = [
    {
      key: 'status',
      placeholder: 'Status',
      value: statusFilter,
      onChange: (v) => { setStatusFilter(v); setPage(1); },
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
      ],
    },
  ];

  const columns: Column<Subscriber>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (sub) => (
        <span className="font-medium text-black dark:text-white">{sub.email}</span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (sub) => (
        <span className="text-neutral-500 text-xs uppercase tracking-wider">{sub.source}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (sub) => (
        <StatusBadge status={sub.status === 'active' ? 'active' : 'warning'} label={sub.status} />
      ),
    },
    {
      key: 'createdAt',
      header: 'Signed Up',
      render: (sub) => (
        <span className="text-neutral-400 text-xs tabular-nums">
          {new Date(sub.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (sub) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-neutral-400 hover:text-red-500"
          onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={<>Notify <span className="italic">Subscribers</span></>}
        description="People who signed up for launch notifications"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="rounded-lg text-xs gap-1.5"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatsCard title="Total Subscribers" value={total} icon={Users} />
        <StatsCard title="Active" value={subscribers.filter((s) => s.status === 'active').length} icon={Bell} />
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by email..."
        filters={filters}
      />

      <DataTable
        columns={columns}
        data={subscribers.filter((s) =>
          !search || s.email.toLowerCase().includes(search.toLowerCase())
        )}
        isLoading={isLoading}
        emptyTitle="No subscribers yet"
        emptyDescription="'Notify Me' signups will appear here"
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AdminNotifySubscribers;
