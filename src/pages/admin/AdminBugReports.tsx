import React, { useState, useEffect, useCallback } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { get, put, del } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { Bug, MailOpen, Trash2, X, Wrench, CheckCircle } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface BugReport {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  platform: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

const statusMap: Record<string, string> = {
  new: 'warning',
  read: 'info',
  in_progress: 'info',
  resolved: 'success',
  archived: 'customer',
};

const AdminBugReports: React.FC = () => {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const searchDebounced = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<BugReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const pageSize = 20;

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(pageSize));
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await get(`${ApiPaths.admin.bugReports}?${params.toString()}`);
      if (res.success) {
        setReports(res.data.reports);
        setTotal(res.data.pagination.total);
      }
    } catch {
      toast.error('Failed to load bug reports');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await put(ApiPaths.admin.bugReport(id), { status });
      toast.success(`Marked as ${status}`);
      void fetchReports();
      if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, status } : null));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    try {
      await put(ApiPaths.admin.bugReport(selected.id), { adminNotes });
      toast.success('Bug report notes saved');
      void fetchReports();
    } catch {
      toast.error('Failed to save notes');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await del(ApiPaths.admin.bugReport(id));
      toast.success('Bug report deleted');
      if (selected?.id === id) setSelected(null);
      void fetchReports();
    } catch {
      toast.error('Failed to delete bug report');
    }
  };

  const openReport = async (row: BugReport) => {
    setSelected(row);
    setAdminNotes(row.adminNotes || '');
    if (row.status === 'new') {
      await handleStatusChange(row.id, 'read');
    }
  };

  const filters: FilterConfig[] = [
    {
      key: 'status',
      placeholder: 'Status',
      value: statusFilter,
      onChange: (v) => {
        setStatusFilter(v);
        setPage(1);
      },
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'New', value: 'new' },
        { label: 'Read', value: 'read' },
        { label: 'In progress', value: 'in_progress' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Archived', value: 'archived' },
      ],
    },
  ];

  const columns: Column<BugReport>[] = [
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge status={statusMap[row.status] || 'info'} label={row.status.replace('_', ' ')} />
      ),
    },
    {
      key: 'platform',
      header: 'Platform',
      render: (row) => (
        <span className="text-neutral-500 text-xs font-mono">{row.platform}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <span className="font-medium text-black dark:text-white">{row.name}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => <span className="text-neutral-500">{row.email}</span>,
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (row) => (
        <span className="truncate max-w-[180px] block">{row.subject}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => (
        <span className="text-neutral-400 text-xs tabular-nums">
          {new Date(row.createdAt).toLocaleDateString('en-ZA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-neutral-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              void handleDelete(row.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const newCount = reports.filter((r) => r.status === 'new').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  return (
    <div>
      <PageHeader
        title={<>Bug <span className="italic">Reports</span></>}
        description="Issues submitted from the mobile app (separate from website contact messages)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Total reports" value={total} icon={Bug} />
        <StatsCard title="New" value={newCount} icon={MailOpen} />
        <StatsCard title="Resolved (this page)" value={resolvedCount} icon={CheckCircle} />
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, subject..."
        filters={filters}
      />

      <DataTable
        columns={columns}
        data={reports.filter(
          (r) =>
            !searchDebounced ||
            r.name.toLowerCase().includes(searchDebounced.toLowerCase()) ||
            r.email.toLowerCase().includes(searchDebounced.toLowerCase()) ||
            r.subject.toLowerCase().includes(searchDebounced.toLowerCase()) ||
            r.message.toLowerCase().includes(searchDebounced.toLowerCase())
        )}
        isLoading={isLoading}
        emptyTitle="No bug reports yet"
        emptyDescription="Submissions from the app bug report form will appear here"
        onRowClick={(row) => void openReport(row)}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/30"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-lg bg-white dark:bg-neutral-900 h-full overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="font-serif text-xl text-black dark:text-white">Bug report</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge
                    status={statusMap[selected.status] || 'info'}
                    label={selected.status.replace('_', ' ')}
                  />
                  <span className="text-xs text-neutral-400 font-mono">{selected.platform}</span>
                  <span className="text-xs text-neutral-400">
                    {new Date(selected.createdAt).toLocaleString('en-ZA')}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">From</p>
                    <p className="text-black dark:text-white font-medium">{selected.name}</p>
                    <p className="text-neutral-500 text-sm">{selected.email}</p>
                  </div>
                  {selected.userId ? (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">User ID</p>
                      <p className="text-neutral-600 dark:text-neutral-400 text-xs font-mono break-all">
                        {selected.userId}
                      </p>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Subject</p>
                    <p className="text-black dark:text-white">{selected.subject}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Details</p>
                    <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {selected.message}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleStatusChange(selected.id, 'in_progress')}
                    className="rounded-lg text-xs"
                  >
                    <Wrench className="h-3 w-3 mr-1" /> In progress
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleStatusChange(selected.id, 'resolved')}
                    className="rounded-lg text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Resolved
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleStatusChange(selected.id, 'archived')}
                    className="rounded-lg text-xs"
                  >
                    Archive
                  </Button>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Admin notes</p>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 text-sm focus:border-black dark:focus:border-neutral-500 focus:outline-none transition-colors resize-none text-black dark:text-white"
                    placeholder="Internal triage notes..."
                  />
                  <Button size="sm" onClick={() => void handleSaveNotes()} className="mt-2 rounded-lg text-xs">
                    Save notes
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBugReports;
