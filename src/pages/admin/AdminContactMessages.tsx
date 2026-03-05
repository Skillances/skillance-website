import React, { useState, useEffect, useCallback } from 'react';
import { get, put, del } from '@/lib/api';
import { Mail, MailOpen, Reply, Archive, Trash2, X } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

const statusMap: Record<string, string> = {
  new: 'warning',
  read: 'info',
  replied: 'success',
  archived: 'customer',
};

const AdminContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const pageSize = 20;

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(pageSize));
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await get(`/admin/contact-messages?${params.toString()}`);
      if (res.success) {
        setMessages(res.data.messages);
        setTotal(res.data.pagination.total);
      }
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await put(`/admin/contact-messages/${id}`, { status });
      toast.success(`Marked as ${status}`);
      fetchMessages();
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    try {
      await put(`/admin/contact-messages/${selected.id}`, { adminNotes });
      toast.success('Notes saved');
      fetchMessages();
    } catch {
      toast.error('Failed to save notes');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await del(`/admin/contact-messages/${id}`);
      toast.success('Message deleted');
      if (selected?.id === id) setSelected(null);
      fetchMessages();
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const openMessage = async (msg: ContactMessage) => {
    setSelected(msg);
    setAdminNotes(msg.adminNotes || '');
    if (msg.status === 'new') {
      await handleStatusChange(msg.id, 'read');
    }
  };

  const filters: FilterConfig[] = [
    {
      key: 'status',
      placeholder: 'Status',
      value: statusFilter,
      onChange: (v) => { setStatusFilter(v); setPage(1); },
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'New', value: 'new' },
        { label: 'Read', value: 'read' },
        { label: 'Replied', value: 'replied' },
        { label: 'Archived', value: 'archived' },
      ],
    },
  ];

  const columns: Column<ContactMessage>[] = [
    {
      key: 'status',
      header: 'Status',
      render: (msg) => (
        <StatusBadge status={statusMap[msg.status] || 'info'} label={msg.status} />
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (msg) => (
        <span className="font-medium text-black dark:text-white">{msg.name}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (msg) => <span className="text-neutral-500">{msg.email}</span>,
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (msg) => <span className="truncate max-w-[200px] block">{msg.subject}</span>,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (msg) => (
        <span className="text-neutral-400 text-xs tabular-nums">
          {new Date(msg.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (msg) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-neutral-400 hover:text-red-500"
            onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const newCount = messages.filter((m) => m.status === 'new').length;

  return (
    <div>
      <PageHeader
        title={<>Contact <span className="italic">Messages</span></>}
        description="Manage messages from the Get in Touch form"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Total Messages" value={total} icon={Mail} />
        <StatsCard title="Unread" value={newCount} icon={MailOpen} />
        <StatsCard title="Replied" value={messages.filter((m) => m.status === 'replied').length} icon={Reply} />
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search messages..."
        filters={filters}
      />

      <DataTable
        columns={columns}
        data={messages.filter((m) =>
          !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase()) ||
          m.subject.toLowerCase().includes(search.toLowerCase())
        )}
        isLoading={isLoading}
        emptyTitle="No messages yet"
        emptyDescription="Contact form submissions will appear here"
        onRowClick={openMessage}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />

      {/* Detail slide-over */}
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
                <h2 className="font-serif text-xl text-black dark:text-white">Message Detail</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <StatusBadge status={statusMap[selected.status] || 'info'} label={selected.status} />
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
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Subject</p>
                    <p className="text-black dark:text-white">{selected.subject}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Message</p>
                    <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {selected.message}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(selected.id, 'replied')}
                    className="rounded-lg text-xs"
                  >
                    <Reply className="h-3 w-3 mr-1" /> Mark Replied
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(selected.id, 'archived')}
                    className="rounded-lg text-xs"
                  >
                    <Archive className="h-3 w-3 mr-1" /> Archive
                  </Button>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Admin Notes</p>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 text-sm focus:border-black dark:focus:border-neutral-500 focus:outline-none transition-colors resize-none text-black dark:text-white"
                    placeholder="Internal notes about this message..."
                  />
                  <Button size="sm" onClick={handleSaveNotes} className="mt-2 rounded-lg text-xs">
                    Save Notes
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

export default AdminContactMessages;
